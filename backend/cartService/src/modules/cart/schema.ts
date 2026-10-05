import zod from "zod";

export const addItemSchema = zod.object({
  productId: zod.string().uuid(),
  sellerId: zod.string().min(1),
  sellerName: zod.string().min(1).max(120),
  sellerAvatar: zod.string().url().optional(),
  name: zod.string().min(1).max(120),
  description: zod.string().max(500).optional(),
  image: zod.string().url(),
  price: zod.number().positive().max(99999999.99),
  quantity: zod.number().int().min(1).max(99).default(1),
});

export type AddItemDto = zod.infer<typeof addItemSchema>;

export const updateQuantitySchema = zod.object({
  quantity: zod.number().int().min(1).max(99),
});

export type UpdateQuantityDto = zod.infer<typeof updateQuantitySchema>;
