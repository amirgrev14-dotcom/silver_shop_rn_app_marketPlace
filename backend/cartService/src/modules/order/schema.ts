import zod from "zod";

const orderLineSchema = zod.object({
  productId: zod.string().uuid(),
  sellerId: zod.string().min(1),
  sellerName: zod.string().min(1).max(120),
  name: zod.string().min(1).max(120),
  image: zod.string().url(),
  price: zod.number().positive().max(99999999.99),
  quantity: zod.number().int().min(1).max(99),
});

export const createOrderSchema = zod.object({
  paymentId: zod.string().min(1).max(120),
  currency: zod.string().length(3).default("USD"),
  lines: zod.array(orderLineSchema).min(1).max(100),
  subtotal: zod.number().nonnegative().max(99999999.99),
  shipping: zod.number().nonnegative().max(99999999.99),
  total: zod.number().positive().max(99999999.99),
});

export type CreateOrderDto = zod.infer<typeof createOrderSchema>;
