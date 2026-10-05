import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../../utils/validate.js";
import { tokenUser } from "../../middleware/auth.middleware.js";
import { CartService } from "./service.js";
import { addItemSchema, updateQuantitySchema } from "./schema.js";

export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCart = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = tokenUser(request);
    const cart = await this.cartService.getCart(user.id);
    return reply.send({ success: true, data: cart });
  };

  addItem = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = validate(addItemSchema, request.body);
    const user = tokenUser(request);
    const item = await this.cartService.addItem(user.id, data);
    return reply.code(201).send({ success: true, data: item });
  };

  updateQuantity = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = validate(updateQuantitySchema, request.body);
    const user = tokenUser(request);
    const item = await this.cartService.updateQuantity(user.id, id, data.quantity);
    return reply.send({ success: true, data: item });
  };

  removeItem = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = tokenUser(request);
    const res = await this.cartService.removeItem(user.id, id);
    return reply.send({ success: true, ...res, data: null });
  };

  clearCart = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = tokenUser(request);
    const res = await this.cartService.clearCart(user.id);
    return reply.send({ success: true, ...res, data: null });
  };
}
