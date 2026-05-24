import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { buildZodSchema } from './buildZodSchema.js';
import { useLogic } from './useLogic.js';
import { useTheme } from './useTheme.js';
import { FieldRenderer } from './fields/FieldRenderer.js';
import { computeCalculations } from './calc.js';
import { computeScore } from './scoring.js';
import { evaluatePageExitActions } from './actions.js';
import { FormLogicProvider } from './FormLogicContext.js';
import { PaymentField } from './paymentField.js';
export function Form({ spec, defaultValues, onSubmit, onSpecPayload, disabled = false, mode = 'standalone', apiBaseUrl, }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const isPreview = mode === 'preview';
    // ── Payment state ────────────────────────────────────────────────────────
    const hasPayment = spec.payment?.required_for_submit === true && spec.payment.mode === 'fixed';
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [paymentError, setPaymentError] = useState(null);
    // Warn (non-fatal) when a non-fixed payment mode is requested — the renderer
    // only handles 'fixed' in this release (L9 scope mirrors L8 scope).
    useEffect(() => {
        if (spec.payment?.required_for_submit === true && spec.payment.mode !== 'fixed') {
            console.warn(`[form-renderer] payment.mode="${spec.payment.mode}" is not yet supported; ` +
                'only "fixed" is handled in this release. Payment page will be skipped.');
        }
        // Warn once per spec version change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spec.id, spec.version]);
    const { control, handleSubmit, watch, unregister, trigger, getValues } = useForm({
        defaultValues: defaultValues ?? {},
        mode: 'onBlur',
    });
    const formData = watch();
    const logic = useLogic(spec, formData);
    const { cssVars, logoUrl } = useTheme(spec.theme);
    // ── Visited pages tracking ───────────────────────────────────────────────
    // We track page ids that the user has actually reached so we can filter
    // the submission payload and pass it to onSpecPayload.
    const [visitedPageIds, setVisitedPageIds] = useState(() => {
        const firstPageId = spec.pages[0]?.id;
        return firstPageId ? new Set([firstPageId]) : new Set();
    });
    // ── Calculations (debounced ~50 ms) ──────────────────────────────────────
    const [calcResults, setCalcResults] = useState({});
    const calcDebounceRef = useRef(null);
    useEffect(() => {
        if (!spec.calculations || spec.calculations.length === 0) {
            setCalcResults({});
            return;
        }
        if (calcDebounceRef.current)
            clearTimeout(calcDebounceRef.current);
        calcDebounceRef.current = setTimeout(() => {
            computeCalculations(spec, formData).then((results) => {
                setCalcResults(results);
            }).catch(() => {
                // HF load failure is non-fatal; leave stale results
            });
        }, 50);
        return () => {
            if (calcDebounceRef.current)
                clearTimeout(calcDebounceRef.current);
        };
        // Stringify formData to detect value changes; spec.version catches spec edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spec.id, spec.version, JSON.stringify(formData)]);
    // ── Score ────────────────────────────────────────────────────────────────
    const scoreResult = useMemo(() => computeScore(spec, formData, calcResults), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spec.id, spec.version, JSON.stringify(formData), calcResults]);
    // ── Logic context value for child consumers ──────────────────────────────
    const logicContextValue = useMemo(() => ({ calcResults, scoreResult }), [calcResults, scoreResult]);
    // ── Visible pages ────────────────────────────────────────────────────────
    const visiblePages = useMemo(() => spec.pages.filter((p) => logic.isPageVisible(p.id)), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spec.pages, logic]);
    /**
     * Total "virtual" page count includes the synthetic payment page when payment
     * is required. This is used for progress and navigation guards only.
     * Index `visiblePages.length` (one past the last real page) is the payment page.
     */
    const totalPageCount = hasPayment ? visiblePages.length + 1 : visiblePages.length;
    const isOnPaymentPage = hasPayment && currentIndex === visiblePages.length;
    // Clamp currentIndex if pages shrink
    useEffect(() => {
        if (currentIndex >= totalPageCount && totalPageCount > 0) {
            setCurrentIndex(totalPageCount - 1);
        }
    }, [totalPageCount, currentIndex]);
    // Unregister hidden field values so they don't appear in the payload.
    useEffect(() => {
        for (const page of spec.pages) {
            for (const field of page.fields) {
                if (!logic.isFieldVisible(field.id)) {
                    unregister(field.id);
                }
            }
        }
    }, [logic, spec.pages, unregister]);
    const currentPage = visiblePages[currentIndex]; // undefined when on payment page
    const isLastPage = currentIndex === totalPageCount - 1;
    const progress = totalPageCount > 1
        ? ((currentIndex + 1) / totalPageCount) * 100
        : 100;
    // ── Per-page validation ──────────────────────────────────────────────────
    const currentPageFieldIds = useMemo(() => currentPage
        ? currentPage.fields.filter((f) => logic.isFieldVisible(f.id)).map((f) => f.id)
        : [], // empty on payment page
    [currentPage, logic]);
    const allVisibleFieldIds = useMemo(() => {
        const set = new Set();
        for (const p of visiblePages) {
            for (const f of p.fields)
                if (logic.isFieldVisible(f.id))
                    set.add(f.id);
        }
        return set;
    }, [visiblePages, logic]);
    const finalSchema = useMemo(() => buildZodSchema(spec, { scope: allVisibleFieldIds }), [spec, allVisibleFieldIds]);
    const pageSchema = useMemo(() => buildZodSchema(spec, { scope: new Set(currentPageFieldIds) }), [spec, currentPageFieldIds]);
    const resolverRef = useRef({ schema: pageSchema });
    resolverRef.current.schema = pageSchema;
    // ── Navigation helpers ───────────────────────────────────────────────────
    /**
     * Resolves the next index in `visiblePages` for a given page id.
     * Falls back to currentIndex + 1 if the target page is not found (e.g. it
     * was hidden by show_if after the jump was computed).
     */
    const resolveTargetIndex = useCallback((targetPageId) => {
        if (targetPageId === '__submit__')
            return visiblePages.length; // past last page → triggers submit guard
        const idx = visiblePages.findIndex((p) => p.id === targetPageId);
        return idx >= 0 ? idx : Math.min(currentIndex + 1, visiblePages.length - 1);
    }, [visiblePages, currentIndex]);
    const handleNext = useCallback(async () => {
        // On the payment page there are no form fields to validate; Next is not shown
        // (Submit button is shown instead), so this should not be reachable.
        if (isOnPaymentPage)
            return;
        const values = getValues();
        const parsed = pageSchema.safeParse(values);
        if (!parsed.success) {
            await trigger(currentPageFieldIds);
            return;
        }
        if (isLastPage)
            return; // handled by handleFinalSubmit
        // Evaluate page-exit actions
        const fromPageId = currentPage?.id;
        if (fromPageId) {
            const actionResult = evaluatePageExitActions(spec, fromPageId, values, calcResults, scoreResult);
            // Mark visited pages — target and everything in between (excluding skipped)
            const nextIdx = resolveTargetIndex(actionResult.nextPageId);
            const newVisited = new Set(visitedPageIds);
            // Walk forward through visiblePages from current+1 to nextIdx (inclusive)
            for (let i = currentIndex + 1; i <= nextIdx && i < visiblePages.length; i++) {
                const pid = visiblePages[i].id;
                if (!actionResult.skipped.includes(pid)) {
                    newVisited.add(pid);
                }
            }
            setVisitedPageIds(newVisited);
            setCurrentIndex(nextIdx);
        }
        else {
            setCurrentIndex((i) => i + 1);
        }
    }, [
        pageSchema,
        getValues,
        trigger,
        currentPageFieldIds,
        isLastPage,
        isOnPaymentPage,
        currentPage,
        spec,
        calcResults,
        scoreResult,
        resolveTargetIndex,
        visitedPageIds,
        currentIndex,
        visiblePages,
    ]);
    const handleBack = () => {
        if (currentIndex > 0)
            setCurrentIndex((i) => i - 1);
    };
    const handleFinalSubmit = useCallback(async () => {
        const values = getValues();
        const parsed = finalSchema.safeParse(values);
        if (!parsed.success) {
            await trigger(Array.from(allVisibleFieldIds));
            return;
        }
        // Build field-id sets for visited pages only
        const visitedFieldIds = new Set();
        for (const page of spec.pages) {
            if (visitedPageIds.has(page.id)) {
                for (const field of page.fields) {
                    visitedFieldIds.add(field.id);
                }
            }
        }
        // Full payload for onSubmit
        const fullPayload = parsed.data;
        // Filtered payload for onSpecPayload (visited pages only)
        const filteredPayload = Object.fromEntries(Object.entries(fullPayload).filter(([k]) => visitedFieldIds.has(k)));
        // Attach payment_intent_id when payment was collected
        if (hasPayment && paymentIntentId) {
            filteredPayload['payment_intent_id'] = paymentIntentId;
        }
        onSpecPayload?.(filteredPayload);
        await onSubmit(filteredPayload);
    }, [
        finalSchema,
        getValues,
        trigger,
        allVisibleFieldIds,
        onSubmit,
        onSpecPayload,
        spec.pages,
        visitedPageIds,
        hasPayment,
        paymentIntentId,
    ]);
    useEffect(() => {
        void resolverRef.current;
    }, [pageSchema]);
    void handleSubmit;
    void zodResolver;
    if (!currentPage && !isPreview && !isOnPaymentPage) {
        return _jsx(Text, { c: "dimmed", children: "No visible pages." });
    }
    const renderPage = (pageIndex) => {
        const page = visiblePages[pageIndex];
        if (!page)
            return null;
        const visibleFields = page.fields.filter((f) => logic.isFieldVisible(f.id));
        return (_jsxs(Stack, { gap: "md", children: [_jsx(Title, { order: 3, children: page.title }), visibleFields.map((field) => (_jsx(FieldRenderer, { field: field, control: control, disabled: disabled }, field.id)))] }, page.id));
    };
    // Is the Submit button blocked? On the payment page, require paymentIntentId.
    const submitBlocked = isOnPaymentPage && !paymentIntentId;
    return (_jsx(FormLogicProvider, { value: logicContextValue, children: _jsxs("div", { style: { fontFamily: 'var(--form-font, inherit)', ...cssVars }, children: [logoUrl && (_jsx("div", { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 }, children: _jsx("img", { src: logoUrl, alt: `${spec.title} logo`, style: { maxHeight: 48, maxWidth: 240, objectFit: 'contain' } }) })), spec.title && (_jsx(Title, { order: 2, mb: "md", style: { color: 'var(--form-primary, inherit)' }, children: spec.title })), totalPageCount > 1 && !isPreview && (_jsx(Progress, { value: progress, mb: "md", color: "var(--form-primary, var(--mantine-color-blue-6))" })), _jsx("form", { onSubmit: isLastPage || isPreview ? handleFinalSubmit : handleNext, noValidate: true, children: _jsxs(Stack, { gap: "xl", children: [isPreview ? (_jsxs(_Fragment, { children: [visiblePages.map((_, idx) => renderPage(idx)), hasPayment && spec.payment && (_jsx(PaymentField, { formSlug: spec.id, currency: spec.payment.currency, amountMinor: spec.payment.amount_minor ?? 0, onPaymentReady: setPaymentIntentId, onError: setPaymentError, apiBaseUrl: apiBaseUrl }))] })) : isOnPaymentPage && spec.payment ? (_jsxs(Stack, { gap: "md", children: [_jsx(Title, { order: 3, children: "Payment" }), paymentError && (_jsx(Text, { c: "red", size: "sm", children: paymentError })), _jsx(PaymentField, { formSlug: spec.id, currency: spec.payment.currency, amountMinor: spec.payment.amount_minor ?? 0, onPaymentReady: (id) => {
                                            setPaymentIntentId(id);
                                            setPaymentError(null);
                                        }, onError: setPaymentError, apiBaseUrl: apiBaseUrl })] })) : (renderPage(currentIndex)), !isPreview && (_jsxs(Group, { justify: "space-between", mt: "md", children: [currentIndex > 0 ? (_jsx(Button, { variant: "default", onClick: handleBack, disabled: disabled, children: "Back" })) : (_jsx("span", {})), _jsx(Button, { type: "submit", disabled: disabled || submitBlocked, color: "var(--form-primary, var(--mantine-color-blue-6))", children: isLastPage ? 'Submit' : 'Next' })] }))] }) })] }) }));
}
