import { z } from 'zod';

import { CURRENCY_CODES, DEFAULT_CURRENCY } from '@/features/marketplace/currency';
import { parsePriceInput } from '../lib/price';
import { uiCategorySchema } from './categories.schema';

/**
 * Sell form schema — mirrors the backend createProductSchema
 * (title 3–120, positive price, photo/category required).
 * Local photo URIs are file:// until upload, so they are validated
 * as non-empty strings here, not URLs.
 */
export const sellFormSchema = z.object({
  photos: z
    .array(z.string().min(1))
    .min(1, 'Add at least one photo.')
    .max(6, 'Add up to 6 photos.'),

  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Title must be at most 120 characters.'),

  category: z
    .string()
    .refine(
      (value) => uiCategorySchema.safeParse(value).success,
      'Select a category.'
    ),

  price: z
    .string()
    .trim()
    .min(1, 'Enter a valid price greater than 0.')
    .refine(
      (value) => parsePriceInput(value) !== null,
      'Enter a valid price greater than 0.'
    ),

  description: z
    .string()
    .max(500, 'Description must be at most 500 characters.'),

  currency: z.enum(CURRENCY_CODES).default(DEFAULT_CURRENCY),

  stock: z
    .string()
    .trim()
    .min(1, 'Enter the quantity available.')
    .refine((value) => {
      const amount = Number(value.replace(/[^0-9]/g, ''));
      return Number.isInteger(amount) && amount >= 1 && amount <= 9999;
    }, 'Quantity must be a whole number from 1 to 9999.'),
});

export type SellFormData = z.infer<typeof sellFormSchema>;

/** Form input: `currency` has a default, so on input it may be absent. */
export type SellFormInput = z.input<typeof sellFormSchema>;
