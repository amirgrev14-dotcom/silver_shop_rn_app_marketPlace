import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../../utils/validate.js";
import { tokenUser } from "../../middleware/auth.middleware.js";
import { OrdersService } from "./service.js";
import { createOrderSchema } from "./schema.js";

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  createOrder = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = validate(createOrderSchema, request.body);
    const user = tokenUser(request);
    const order = await this.ordersService.createOrder(user.id, data);
    return reply.code(201).send({ success: true, data: order });
  };
}
