import { jsx as _jsx } from "react/jsx-runtime";
/**
 * paymentField.tsx — Payment block integration point for form-renderer.
 *
 * form-renderer must NOT depend on @stripe/stripe-js or @stripe/react-stripe-js.
 * Instead we export a React context so a host application (e.g. form-web) can
 * inject its own Stripe-using component. The renderer consumes that component
 * via the context; if no component is provided, a neutral placeholder is shown.
 *
 * Contract (context-injection pattern):
 *   Host wraps <Form> with:
 *     <PaymentBlockHostInjectionContext.Provider value={YourStripeComponent}>
 *   The renderer calls that component with PaymentBlockComponentProps.
 */
import { createContext, useContext } from 'react';
// ── The injection context ─────────────────────────────────────────────────────
/**
 * Provide a React component type via this context before rendering <Form>.
 * The component will be instantiated with PaymentBlockComponentProps whenever
 * the form spec has payment.required_for_submit === true.
 *
 * If no component is provided (null default), <PaymentField> renders a
 * plain placeholder <div data-form-payment-slot> so developers can see the
 * slot in dev/preview without a Stripe implementation.
 */
export const PaymentBlockHostInjectionContext = createContext(null);
/**
 * <PaymentField> is placed by Form.tsx on the synthetic payment page.
 * It reads the injected component from context and renders it, or falls back
 * to a plain placeholder when running in a Stripe-free context (e.g. preview).
 */
export function PaymentField(props) {
    const InjectedComponent = useContext(PaymentBlockHostInjectionContext);
    if (!InjectedComponent) {
        return (_jsx("div", { "data-form-payment-slot": "true", style: {
                padding: '24px 16px',
                borderRadius: 8,
                border: '2px dashed var(--mantine-color-gray-4, #ced4da)',
                textAlign: 'center',
                color: 'var(--mantine-color-dimmed, #868e96)',
                fontSize: 14,
            }, children: "Payment block (no Stripe provider configured)" }));
    }
    return _jsx(InjectedComponent, { ...props });
}
