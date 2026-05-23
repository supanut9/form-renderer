import { useEffect, useMemo } from 'react';
/**
 * Maps a FormTheme into CSS custom properties and injects custom_css via a
 * <style> element. Returns cssVars to spread onto the form container div,
 * plus structured fields so callers can render branded chrome (logo, etc.).
 */
export function useTheme(theme) {
    const cssVars = useMemo(() => {
        if (!theme)
            return {};
        const vars = {};
        if (theme.primary_color)
            vars['--form-primary'] = theme.primary_color;
        if (theme.font)
            vars['--form-font'] = theme.font;
        return vars;
    }, [theme?.primary_color, theme?.font]);
    useEffect(() => {
        if (!theme?.custom_css)
            return;
        const id = 'form-renderer-custom-css';
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('style');
            el.id = id;
            document.head.appendChild(el);
        }
        el.textContent = theme.custom_css;
        return () => {
            const existing = document.getElementById(id);
            if (existing)
                existing.remove();
        };
    }, [theme?.custom_css]);
    return {
        cssVars,
        logoUrl: theme?.logo_url ?? null,
        fontFamily: theme?.font ?? null,
        primaryColor: theme?.primary_color ?? null,
    };
}
