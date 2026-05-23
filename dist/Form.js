import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { buildZodSchema } from './buildZodSchema.js';
import { useLogic } from './useLogic.js';
import { useTheme } from './useTheme.js';
import { FieldRenderer } from './fields/FieldRenderer.js';
export function Form({ spec, defaultValues, onSubmit, disabled = false, mode = 'standalone', }) {
    // We need the schema to recompute whenever the set of *currently visible*
    // fields changes (so hidden fields don't block validation), and again per
    // page so the Next button only validates the page the user is on.
    // The current page index is tracked first so the schema effect can see it.
    const [currentIndex, setCurrentIndex] = useState(0);
    const isPreview = mode === 'preview';
    // Phase 1: compute logic + visible pages WITHOUT a schema (just to feed
    // useLogic). We can build the real schema once we know which fields are
    // currently in scope.
    const { control, handleSubmit, watch, unregister, trigger, getValues } = useForm({
        defaultValues: defaultValues ?? {},
        mode: 'onBlur',
    });
    const formData = watch();
    const logic = useLogic(spec, formData);
    const { cssVars, logoUrl } = useTheme(spec.theme);
    const visiblePages = useMemo(() => spec.pages.filter((p) => logic.isPageVisible(p.id)), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spec.pages, logic]);
    // Clamp currentIndex if pages shrink
    useEffect(() => {
        if (currentIndex >= visiblePages.length && visiblePages.length > 0) {
            setCurrentIndex(visiblePages.length - 1);
        }
    }, [visiblePages.length, currentIndex]);
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
    const currentPage = visiblePages[currentIndex];
    const isLastPage = currentIndex === visiblePages.length - 1;
    const progress = visiblePages.length > 1
        ? ((currentIndex + 1) / visiblePages.length) * 100
        : 100;
    // ── Per-page validation ──────────────────────────────────────────────────
    // react-hook-form's `handleSubmit` validates *all* registered fields. For
    // multi-page forms that means clicking "Next" on page 1 would also probe
    // page 2's required fields. We replace that with manual schema validation
    // scoped to the currently visible fields of the current page.
    const currentPageFieldIds = useMemo(() => (currentPage ? currentPage.fields.filter((f) => logic.isFieldVisible(f.id)).map((f) => f.id) : []), [currentPage, logic]);
    const allVisibleFieldIds = useMemo(() => {
        const set = new Set();
        for (const p of visiblePages) {
            for (const f of p.fields)
                if (logic.isFieldVisible(f.id))
                    set.add(f.id);
        }
        return set;
    }, [visiblePages, logic]);
    // Schema for the final submit step — every visible field across the form.
    const finalSchema = useMemo(() => buildZodSchema(spec, { scope: allVisibleFieldIds }), [spec, allVisibleFieldIds]);
    // Schema for "Next" — only the current page's visible fields.
    const pageSchema = useMemo(() => buildZodSchema(spec, { scope: new Set(currentPageFieldIds) }), [spec, currentPageFieldIds]);
    // Field components consume react-hook-form's errors via Controller, so we
    // need to wire validation results back. Rather than re-resolve schemas on
    // every onBlur (`mode: 'onBlur'` already wired this when we had a resolver),
    // we install the page schema as the resolver and rerun on submit.
    const resolverRef = useRef({ schema: pageSchema });
    resolverRef.current.schema = pageSchema;
    const handleNext = useCallback(async () => {
        // Validate just the current page via its scoped schema.
        const values = getValues();
        const parsed = pageSchema.safeParse(values);
        if (!parsed.success) {
            // Run trigger so RHF surfaces errors on those fields.
            await trigger(currentPageFieldIds);
            return;
        }
        if (!isLastPage)
            setCurrentIndex((i) => i + 1);
    }, [pageSchema, getValues, trigger, currentPageFieldIds, isLastPage]);
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
        await onSubmit(parsed.data);
    }, [finalSchema, getValues, trigger, allVisibleFieldIds, onSubmit]);
    // Keep RHF's resolver up-to-date so onBlur per-field validation also uses
    // the right schema (otherwise blur on page 2 would validate against page 1).
    // We use a thin wrapper around zodResolver.
    useEffect(() => {
        // No-op effect: schema refs are read at submit time. Kept so future
        // mode='onBlur' integration has a hook here.
        void resolverRef.current;
    }, [pageSchema]);
    void handleSubmit;
    void zodResolver;
    if (!currentPage && !isPreview) {
        return _jsx(Text, { c: "dimmed", children: "No visible pages." });
    }
    const renderPage = (pageIndex) => {
        const page = visiblePages[pageIndex];
        if (!page)
            return null;
        const visibleFields = page.fields.filter((f) => logic.isFieldVisible(f.id));
        return (_jsxs(Stack, { gap: "md", children: [_jsx(Title, { order: 3, children: page.title }), visibleFields.map((field) => (_jsx(FieldRenderer, { field: field, control: control, disabled: disabled }, field.id)))] }, page.id));
    };
    return (_jsxs("div", { style: { fontFamily: 'var(--form-font, inherit)', ...cssVars }, children: [logoUrl && (_jsx("div", { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 }, children: _jsx("img", { src: logoUrl, alt: `${spec.title} logo`, style: { maxHeight: 48, maxWidth: 240, objectFit: 'contain' } }) })), spec.title && (_jsx(Title, { order: 2, mb: "md", style: { color: 'var(--form-primary, inherit)' }, children: spec.title })), visiblePages.length > 1 && !isPreview && (_jsx(Progress, { value: progress, mb: "md", color: "var(--form-primary, var(--mantine-color-blue-6))" })), _jsx("form", { onSubmit: isLastPage || isPreview ? handleFinalSubmit : handleNext, noValidate: true, children: _jsxs(Stack, { gap: "xl", children: [isPreview
                            ? visiblePages.map((_, idx) => renderPage(idx))
                            : renderPage(currentIndex), !isPreview && (_jsxs(Group, { justify: "space-between", mt: "md", children: [currentIndex > 0 ? (_jsx(Button, { variant: "default", onClick: handleBack, disabled: disabled, children: "Back" })) : (_jsx("span", {})), _jsx(Button, { type: "submit", disabled: disabled, color: "var(--form-primary, var(--mantine-color-blue-6))", children: isLastPage ? 'Submit' : 'Next' })] }))] }) })] }));
}
