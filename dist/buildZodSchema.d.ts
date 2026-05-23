import { z } from 'zod';
import type { FormSpec } from './types.js';
export interface BuildZodSchemaOptions {
    /**
     * When provided, only these field ids are validated as authoritative.
     * Fields outside the set become `.optional()` so hidden / future-page
     * required fields do not block submission.
     */
    scope?: Set<string>;
}
export declare function buildZodSchema(spec: FormSpec, opts?: BuildZodSchemaOptions): z.ZodObject<Record<string, z.ZodTypeAny>>;
//# sourceMappingURL=buildZodSchema.d.ts.map