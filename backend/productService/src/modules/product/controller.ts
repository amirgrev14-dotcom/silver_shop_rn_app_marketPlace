import type { FastifyReply, FastifyRequest } from "fastify";
import { validate } from "../../utils/validate.js";
import { tokenUser } from "../../middleware/auth.middleware.js";
import { ProductService } from "./service.js";
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from "./schema.js";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = validate(createProductSchema, request.body);
    const user = tokenUser(request);
    const product = await this.productService.create(
      user.id,
      user.name ?? "Silver seller",
      data
    );
    return reply.code(201).send({ success: true, data: product });
  };

  feed = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = validate(productQuerySchema, request.query);
    const result = await this.productService.feed(query);
    return reply.send({ success: true, data: result });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const product = await this.productService.getById(id);
    return reply.send({ success: true, data: product });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = validate(updateProductSchema, request.body);
    const user = tokenUser(request);
    await this.productService.assertOwnership(
      id,
      user.id,
      user.role === "SUPER_ADMIN"
    );
    const product = await this.productService.update(id, data);
    return reply.send({ success: true, data: product });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = tokenUser(request);
    await this.productService.assertOwnership(
      id,
      user.id,
      user.role === "SUPER_ADMIN"
    );
    const result = await this.productService.remove(id);
    return reply.send({ success: true, ...result, data: null });
  };
}
