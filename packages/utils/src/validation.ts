import { z } from "zod";

export const emailSchema = z.string().email("Email invalide");
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide");

export type EmailInput = z.infer<typeof emailSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
