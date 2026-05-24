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
import React from 'react';
export interface PaymentBlockComponentProps {
    /** The public form slug — used to call POST /v1/public/forms/:slug/payment-intent */
    formSlug: string;
    /** ISO 4217 lowercase currency code (e.g. "usd") */
    currency: string;
    /** Amount in the currency's smallest unit (e.g. cents for USD) */
    amountMinor: number;
    /** Called once Stripe payment is confirmed; passes the payment_intent_id */
    onPaymentReady: (paymentIntentId: string) => void;
    /** Called when an irrecoverable error occurs */
    onError: (msg: string) => void;
    /** Optional base URL override for form-api calls (defaults to '/api/proxy') */
    apiBaseUrl?: string;
}
/**
 * Provide a React component type via this context before rendering <Form>.
 * The component will be instantiated with PaymentBlockComponentProps whenever
 * the form spec has payment.required_for_submit === true.
 *
 * If no component is provided (null default), <PaymentField> renders a
 * plain placeholder <div data-form-payment-slot> so developers can see the
 * slot in dev/preview without a Stripe implementation.
 */
export declare const PaymentBlockHostInjectionContext: React.Context<React.ComponentType<PaymentBlockComponentProps> | null>;
export interface PaymentFieldProps extends PaymentBlockComponentProps {
    /** Internal: called by Form.tsx to render the injected component or placeholder */
    children?: never;
}
/**
 * <PaymentField> is placed by Form.tsx on the synthetic payment page.
 * It reads the injected component from context and renders it, or falls back
 * to a plain placeholder when running in a Stripe-free context (e.g. preview).
 */
export declare function PaymentField(props: PaymentFieldProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=paymentField.d.ts.map