import { AppError, HttpStatus } from "../../common/AppError.js";
import { prisma } from "../../lib/prisma.js";

function toCartJson(cart: any) {
  return {
    ...cart,
    items: cart.items.map((i: any) => ({ ...i, price: Number(i.price) })),
  };
}

export class CartService {
  private async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: { items: true } });
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return toCartJson(cart);
  }

  async addItem(userId: string, data: any) {
    const cart = await this.getOrCreateCart(userId);
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: data.productId } },
    });
    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (data.quantity ?? 1) },
      });
      return { ...updated, price: Number(updated.price) };
    }
    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        sellerId: data.sellerId,
        sellerName: data.sellerName,
        sellerAvatar: data.sellerAvatar,
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price,
        quantity: data.quantity ?? 1,
      },
    });
    return { ...item, price: Number(item.price) };
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new AppError(HttpStatus.NOT_FOUND, "Item not found");
    const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return { ...updated, price: Number(updated.price) };
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return { message: "Removed" };
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: "Cleared" };
  }
}
