import zod from "zod";

/** Categories mirror the app's category grid. Server is the source of truth. */
export const PRODUCT_CATEGORIES = [
  "Jewelry",
  "Watches",
  "Coins",
  "Tableware",
  "Decor",
  "Vintage",
  // Marketplace grid subcategories, chosen in the Sell form.
  // Stored as-is so category screens filter exact matches.
  "Rings",
  "Necklaces",
  "Bracelets",
  "Earrings",
  "Anklets",
  "Other Items",
  "Others",
] as const;

const priceSchema = zod
  .number({ message: "Price must be a number" })
  .finite("Price must be finite")
  .positive("Price must be greater than 0")
  .max(99999999.99, "Price is too large");

export const createProductSchema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters").max(120),
  price: priceSchema,
  description: zod.string().max(2000).optional(),
  images: zod
    .array(zod.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required")
    .max(10, "At most 10 images allowed"),
  categories: zod
    .array(zod.enum(PRODUCT_CATEGORIES))
    .min(1, "At least one category is required"),
});

// NOTE: sellerId/sellerName are absent — they come from the verified JWT.
export type CreateProductDto = zod.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  // Publishing flow: seller moves DRAFT → ACTIVE, or archives.
  // SOLD is reserved for the future orders flow.
  status: zod.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export type UpdateProductDto = zod.infer<typeof updateProductSchema>;

export const productQuerySchema = zod.object({
  page: zod.coerce.number().int().min(1).default(1),
  limit: zod.coerce.number().int().min(1).max(50).default(20),
  sellerId: zod.string().uuid().optional(),
  category: zod.enum(PRODUCT_CATEGORIES).optional(),
  status: zod.enum(["ACTIVE", "SOLD"]).default("ACTIVE"),
});

export type ProductQueryDto = zod.infer<typeof productQuerySchema>;

/**
 * Saved-items lookup: comma-separated ids (?ids=a,b,c), up to 100.
 * Lets clients fetch favorites by indexed ids instead of paging
 * the whole catalog and filtering client-side.
 */
export const favoritesQuerySchema = zod.object({
  ids: zod
    .string()
    .min(1, "At least one id is required")
    .transform((raw) =>
      raw
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
    )
    .pipe(zod.array(zod.string().uuid("Each id must be a valid UUID")).min(1).max(100)),
});

export type FavoritesQueryDto = zod.infer<typeof favoritesQuerySchema>;
