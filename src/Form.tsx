import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Progress, Stack, Text, Title } from '@mantine/core'
import type { FormSpec, FormSubmissionPayload } from './types.js'
import { buildZodSchema } from './buildZodSchema.js'
import { useLogic } from './useLogic.js'
import { useTheme } from './useTheme.js'
import { FieldRenderer } from './fields/FieldRenderer.js'
import { computeCalculations } from './calc.js'
import type { CalcResults } from './calc.js'
import { computeScore } from './scoring.js'
import type { ScoreResult } from './scoring.js'
import { evaluatePageExitActions } from './actions.js'
import { FormLogicProvider } from './FormLogicContext.js'

export interface FormProps {
  spec: FormSpec
  defaultValues?: Partial<FormSubmissionPayload>
  onSubmit: (payload: FormSubmissionPayload) => Promise<void> | void
  /**
   * Called with the filtered payload that contains only fields belonging
   * to pages the user actually visited. Useful for server-side validation
   * that should reject skipped-page fields.
   */
  onSpecPayload?: (payload: FormSubmissionPayload) => void
  disabled?: boolean
  mode?: 'standalone' | 'embed' | 'preview'
}

export function Form({
  spec,
  defaultValues,
  onSubmit,
  onSpecPayload,
  disabled = false,
  mode = 'standalone',
}: FormProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isPreview = mode === 'preview'

  const { control, handleSubmit, watch, unregister, trigger, getValues } = useForm({
    defaultValues: defaultValues ?? {},
    mode: 'onBlur',
  })

  const formData = watch() as Record<string, unknown>
  const logic = useLogic(spec, formData)
  const { cssVars, logoUrl } = useTheme(spec.theme)

  // ── Visited pages tracking ───────────────────────────────────────────────
  // We track page ids that the user has actually reached so we can filter
  // the submission payload and pass it to onSpecPayload.
  const [visitedPageIds, setVisitedPageIds] = useState<Set<string>>(() => {
    const firstPageId = spec.pages[0]?.id
    return firstPageId ? new Set([firstPageId]) : new Set()
  })

  // ── Calculations (debounced ~50 ms) ──────────────────────────────────────
  const [calcResults, setCalcResults] = useState<CalcResults>({})
  const calcDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!spec.calculations || spec.calculations.length === 0) {
      setCalcResults({})
      return
    }
    if (calcDebounceRef.current) clearTimeout(calcDebounceRef.current)
    calcDebounceRef.current = setTimeout(() => {
      computeCalculations(spec, formData).then((results) => {
        setCalcResults(results)
      }).catch(() => {
        // HF load failure is non-fatal; leave stale results
      })
    }, 50)
    return () => {
      if (calcDebounceRef.current) clearTimeout(calcDebounceRef.current)
    }
    // Stringify formData to detect value changes; spec.version catches spec edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.id, spec.version, JSON.stringify(formData)])

  // ── Score ────────────────────────────────────────────────────────────────
  const scoreResult = useMemo<ScoreResult>(
    () => computeScore(spec, formData, calcResults),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spec.id, spec.version, JSON.stringify(formData), calcResults],
  )

  // ── Logic context value for child consumers ──────────────────────────────
  const logicContextValue = useMemo(
    () => ({ calcResults, scoreResult }),
    [calcResults, scoreResult],
  )

  // ── Visible pages ────────────────────────────────────────────────────────
  const visiblePages = useMemo(
    () => spec.pages.filter((p) => logic.isPageVisible(p.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spec.pages, logic],
  )

  // Clamp currentIndex if pages shrink
  useEffect(() => {
    if (currentIndex >= visiblePages.length && visiblePages.length > 0) {
      setCurrentIndex(visiblePages.length - 1)
    }
  }, [visiblePages.length, currentIndex])

  // Unregister hidden field values so they don't appear in the payload.
  useEffect(() => {
    for (const page of spec.pages) {
      for (const field of page.fields) {
        if (!logic.isFieldVisible(field.id)) {
          unregister(field.id)
        }
      }
    }
  }, [logic, spec.pages, unregister])

  const currentPage = visiblePages[currentIndex]
  const isLastPage = currentIndex === visiblePages.length - 1
  const progress =
    visiblePages.length > 1
      ? ((currentIndex + 1) / visiblePages.length) * 100
      : 100

  // ── Per-page validation ──────────────────────────────────────────────────
  const currentPageFieldIds = useMemo(
    () => (currentPage ? currentPage.fields.filter((f) => logic.isFieldVisible(f.id)).map((f) => f.id) : []),
    [currentPage, logic],
  )

  const allVisibleFieldIds = useMemo(() => {
    const set = new Set<string>()
    for (const p of visiblePages) {
      for (const f of p.fields) if (logic.isFieldVisible(f.id)) set.add(f.id)
    }
    return set
  }, [visiblePages, logic])

  const finalSchema = useMemo(
    () => buildZodSchema(spec, { scope: allVisibleFieldIds }),
    [spec, allVisibleFieldIds],
  )

  const pageSchema = useMemo(
    () => buildZodSchema(spec, { scope: new Set(currentPageFieldIds) }),
    [spec, currentPageFieldIds],
  )

  const resolverRef = useRef<{
    schema: ReturnType<typeof buildZodSchema>
  }>({ schema: pageSchema })
  resolverRef.current.schema = pageSchema

  // ── Navigation helpers ───────────────────────────────────────────────────

  /**
   * Resolves the next index in `visiblePages` for a given page id.
   * Falls back to currentIndex + 1 if the target page is not found (e.g. it
   * was hidden by show_if after the jump was computed).
   */
  const resolveTargetIndex = useCallback(
    (targetPageId: string): number => {
      if (targetPageId === '__submit__') return visiblePages.length // past last page → triggers submit guard
      const idx = visiblePages.findIndex((p) => p.id === targetPageId)
      return idx >= 0 ? idx : Math.min(currentIndex + 1, visiblePages.length - 1)
    },
    [visiblePages, currentIndex],
  )

  const handleNext = useCallback(async () => {
    const values = getValues()
    const parsed = pageSchema.safeParse(values)
    if (!parsed.success) {
      await trigger(currentPageFieldIds)
      return
    }

    if (isLastPage) return // handled by handleFinalSubmit

    // Evaluate page-exit actions
    const fromPageId = currentPage?.id
    if (fromPageId) {
      const actionResult = evaluatePageExitActions(
        spec,
        fromPageId,
        values as Record<string, unknown>,
        calcResults,
        scoreResult,
      )

      // Mark visited pages — target and everything in between (excluding skipped)
      const nextIdx = resolveTargetIndex(actionResult.nextPageId)
      const newVisited = new Set(visitedPageIds)
      // Walk forward through visiblePages from current+1 to nextIdx (inclusive)
      for (let i = currentIndex + 1; i <= nextIdx && i < visiblePages.length; i++) {
        const pid = visiblePages[i].id
        if (!actionResult.skipped.includes(pid)) {
          newVisited.add(pid)
        }
      }
      setVisitedPageIds(newVisited)
      setCurrentIndex(nextIdx)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [
    pageSchema,
    getValues,
    trigger,
    currentPageFieldIds,
    isLastPage,
    currentPage,
    spec,
    calcResults,
    scoreResult,
    resolveTargetIndex,
    visitedPageIds,
    currentIndex,
    visiblePages,
  ])

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const handleFinalSubmit = useCallback(async () => {
    const values = getValues()
    const parsed = finalSchema.safeParse(values)
    if (!parsed.success) {
      await trigger(Array.from(allVisibleFieldIds))
      return
    }

    // Build field-id sets for visited pages only
    const visitedFieldIds = new Set<string>()
    for (const page of spec.pages) {
      if (visitedPageIds.has(page.id)) {
        for (const field of page.fields) {
          visitedFieldIds.add(field.id)
        }
      }
    }

    // Full payload for onSubmit
    const fullPayload = parsed.data as FormSubmissionPayload

    // Filtered payload for onSpecPayload (visited pages only)
    const filteredPayload: FormSubmissionPayload = Object.fromEntries(
      Object.entries(fullPayload).filter(([k]) => visitedFieldIds.has(k)),
    )

    onSpecPayload?.(filteredPayload)
    await onSubmit(filteredPayload)
  }, [
    finalSchema,
    getValues,
    trigger,
    allVisibleFieldIds,
    onSubmit,
    onSpecPayload,
    spec.pages,
    visitedPageIds,
  ])

  useEffect(() => {
    void resolverRef.current
  }, [pageSchema])
  void handleSubmit
  void zodResolver

  if (!currentPage && !isPreview) {
    return <Text c="dimmed">No visible pages.</Text>
  }

  const renderPage = (pageIndex: number) => {
    const page = visiblePages[pageIndex]
    if (!page) return null
    const visibleFields = page.fields.filter((f) => logic.isFieldVisible(f.id))

    return (
      <Stack key={page.id} gap="md">
        <Title order={3}>{page.title}</Title>
        {visibleFields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            control={control}
            disabled={disabled}
          />
        ))}
      </Stack>
    )
  }

  return (
    <FormLogicProvider value={logicContextValue}>
      <div style={{ fontFamily: 'var(--form-font, inherit)', ...cssVars }}>
        {logoUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={`${spec.title} logo`}
              style={{ maxHeight: 48, maxWidth: 240, objectFit: 'contain' }}
            />
          </div>
        )}
        {spec.title && (
          <Title order={2} mb="md" style={{ color: 'var(--form-primary, inherit)' }}>
            {spec.title}
          </Title>
        )}
        {visiblePages.length > 1 && !isPreview && (
          <Progress value={progress} mb="md" color="var(--form-primary, var(--mantine-color-blue-6))" />
        )}

        <form
          onSubmit={isLastPage || isPreview ? handleFinalSubmit : handleNext}
          noValidate
        >
          <Stack gap="xl">
            {isPreview
              ? visiblePages.map((_, idx) => renderPage(idx))
              : renderPage(currentIndex)}

            {!isPreview && (
              <Group justify="space-between" mt="md">
                {currentIndex > 0 ? (
                  <Button variant="default" onClick={handleBack} disabled={disabled}>
                    Back
                  </Button>
                ) : (
                  <span />
                )}

                <Button
                  type="submit"
                  disabled={disabled}
                  color="var(--form-primary, var(--mantine-color-blue-6))"
                >
                  {isLastPage ? 'Submit' : 'Next'}
                </Button>
              </Group>
            )}
          </Stack>
        </form>
      </div>
    </FormLogicProvider>
  )
}
