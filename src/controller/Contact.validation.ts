import { z } from 'zod';

export const ContactValidation = z.object({
    email: z.string().email().nullable().optional(),
    phoneNumber: z.string().min(10).max(10).nullable().optional(),
}).refine(data => {
    if (!data.email && !data.phoneNumber) {
        return false;
    }
    return true;
}, {
    message: 'Either email or phoneNumber must be provided',
});