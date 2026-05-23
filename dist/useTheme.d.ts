import type { FormTheme } from './types.js';
export interface ThemeResult {
    /** Spread onto the outermost container <div style={cssVars}>. */
    cssVars: React.CSSProperties;
    /** Optional brand logo URL (theme.logo_url). Caller renders it. */
    logoUrl: string | null;
    /** Optional font family. Already mapped into cssVars too. */
    fontFamily: string | null;
    /** Optional primary color hex. Already mapped into cssVars too. */
    primaryColor: string | null;
}
/**
 * Maps a FormTheme into CSS custom properties and injects custom_css via a
 * <style> element. Returns cssVars to spread onto the form container div,
 * plus structured fields so callers can render branded chrome (logo, etc.).
 */
export declare function useTheme(theme: FormTheme | undefined): ThemeResult;
//# sourceMappingURL=useTheme.d.ts.map