import { AppError, HttpStatus } from "../../common/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateProductDto, ProductQueryDto, UpdateProductDto } from "./schema.js";

function toProductJson(product: any) {
  const { ...rest } = product;
  return {
    ...rest,
    // Decimal serializes as string in JSON — the agreed contract is number.
    price: Number(product.price),
  };
}

export class ProductService {
  async create(sellerId: string, sellerName: string, data: CreateProductDto) {
    const product = await prisma.product.create({
      data: {
        title: data.title,
        price: data.price,
        ...(data.description !== undefined ? { description: data.description } : {}),
        images: data.images,
        categories: [...data.categories],
        sellerId,
        sellerName,
      },
    });

    return toProductJson(product);
  }

  async feed(query: ProductQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: any = { status: query.status };
    if (query.sellerId) where.sellerId = query.sellerId;
    if (query.category) where.categories = { has: query.category };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      items: items.map(toProductJson),
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError(HttpStatus.NOT_FOUND, "Product not found");
    }

    return toProductJson(product);
  }

  /** Owner-only (SUPER_ADMIN bypasses). Returns void or throws. */
  async assertOwnership(id: string, userId: string, isSuperAdmin: boolean) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError(HttpStatus.NOT_FOUND, "Product not found");
    }

    if (!isSuperAdmin && product.sellerId !== userId) {
      throw new AppError(HttpStatus.FORBIDDEN, "Not your product");
    }
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
        ...(data.categories !== undefined ? { categories: [...data.categories] } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });

    return toProductJson(product);
  }

  async remove(id: string) {
    await prisma.product.delete({ where: { id } });
    return { message: "Product deleted" };
  }
}
