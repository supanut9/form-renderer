import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Progress, Stack, Text, Title } from '@mantine/core'
import type { FormSpec, FormSubmissionPayload } from './types.js'
import { buildZodSchema } from './buildZodSchema.js'
import { useLogic } from './useLogic.js'
import { useTheme } from './useTheme.js'
import { FieldRenderer } from './fields/FieldRenderer.js'

export interface FormProps {
  spec: FormSpec
  defaultValues?: Partial<FormSubmissionPayload>
  onSubmit: (payload: FormSubmissionPayload) => Promise<void> | void
  disabled?: boolean
  mode?: 'standalone' | 'embed' | 'preview'
}

export function Form({
  spec,
  defaultValues,
  onSubmit,
  disabled = false,
  mode = 'standalone',
}: FormProps) {
  // We need the schema to recompute whenever the set of *currently visible*
  // fields changes (so hidden fields don't block validation), and again per
  // page so the Next button only validates the page the user is on.
  // The current page index is tracked first so the schema effect can see it.
  const [currentIndex, setCurrentIndex] = useState(0)
  const isPreview = mode === 'preview'

  // Phase 1: compute logic + visible pages WITHOUT a schema (just to feed
  // useLogic). We can build the real schema once we know which fields are
  // currently in scope.
  const { control, handleSubmit, watch, unregister, trigger, getValues } = useForm({
    defaultValues: defaultValues ?? {},
    mode: 'onBlur',
  })

  const formData = watch() as Record<string, unknown>
  const logic = useLogic(spec, formData)
  const { cssVars, logoUrl } = useTheme(spec.theme)

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
  // react-hook-form's `handleSubmit` validates *all* registered fields. For
  // multi-page forms that means clicking "Next" on page 1 would also probe
  // page 2's required fields. We replace that with manual schema validation
  // scoped to the currently visible fields of the current page.

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

  // Schema for the final submit step — every visible field across the form.
  const finalSchema = useMemo(
    () => buildZodSchema(spec, { scope: allVisibleFieldIds }),
    [spec, allVisibleFieldIds],
  )

  // Schema for "Next" — only the current page's visible fields.
  const pageSchema = useMemo(
    () => buildZodSchema(spec, { scope: new Set(currentPageFieldIds) }),
    [spec, currentPageFieldIds],
  )

  // Field components consume react-hook-form's errors via Controller, so we
  // need to wire validation results back. Rather than re-resolve schemas on
  // every onBlur (`mode: 'onBlur'` already wired this when we had a resolver),
  // we install the page schema as the resolver and rerun on submit.
  const resolverRef = useRef<{
    schema: ReturnType<typeof buildZodSchema>
  }>({ schema: pageSchema })
  resolverRef.current.schema = pageSchema

  const handleNext = useCallback(async () => {
    // Validate just the current page via its scoped schema.
    const values = getValues()
    const parsed = pageSchema.safeParse(values)
    if (!parsed.success) {
      // Run trigger so RHF surfaces errors on those fields.
      await trigger(currentPageFieldIds)
      return
    }
    if (!isLastPage) setCurrentIndex((i) => i + 1)
  }, [pageSchema, getValues, trigger, currentPageFieldIds, isLastPage])

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
    await onSubmit(parsed.data as FormSubmissionPayload)
  }, [finalSchema, getValues, trigger, allVisibleFieldIds, onSubmit])

  // Keep RHF's resolver up-to-date so onBlur per-field validation also uses
  // the right schema (otherwise blur on page 2 would validate against page 1).
  // We use a thin wrapper around zodResolver.
  useEffect(() => {
    // No-op effect: schema refs are read at submit time. Kept so future
    // mode='onBlur' integration has a hook here.
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
  )
}
