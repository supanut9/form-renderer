import { useEffect, useMemo } from 'react'
import type { FormTheme } from './types.js'

export interface ThemeResult {
  /** Spread onto the outermost container <div style={cssVars}>. */
  cssVars: React.CSSProperties
  /** Optional brand logo URL (theme.logo_url). Caller renders it. */
  logoUrl: string | null
  /** Optional font family. Already mapped into cssVars too. */
  fontFamily: string | null
  /** Optional primary color hex. Already mapped into cssVars too. */
  primaryColor: string | null
}

/**
 * Maps a FormTheme into CSS custom properties and injects custom_css via a
 * <style> element. Returns cssVars to spread onto the form container div,
 * plus structured fields so callers can render branded chrome (logo, etc.).
 */
export function useTheme(theme: FormTheme | undefined): ThemeResult {
  const cssVars = useMemo((): React.CSSProperties => {
    if (!theme) return {}
    const vars: Record<string, string> = {}
    if (theme.primary_color) vars['--form-primary'] = theme.primary_color
    if (theme.font) vars['--form-font'] = theme.font
    return vars as React.CSSProperties
  }, [theme?.primary_color, theme?.font])

  useEffect(() => {
    if (!theme?.custom_css) return

    const id = 'form-renderer-custom-css'
    let el = document.getElementById(id) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = theme.custom_css

    return () => {
      const existing = document.getElementById(id)
      if (existing) existing.remove()
    }
  }, [theme?.custom_css])

  return {
    cssVars,
    logoUrl: theme?.logo_url ?? null,
    fontFamily: theme?.font ?? null,
    primaryColor: theme?.primary_color ?? null,
  }
}
