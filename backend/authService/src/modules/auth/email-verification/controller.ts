import { validate } from "../../../utils/validate.js";
import { emailVerificationSchema } from "./schema.js";
import { EmailVerifyService } from "./service.js";
import type { FastifyRequest, FastifyReply } from "fastify";

type CheckVerifyQuery = {
  token: string;
  id: string;
};

export class EmailVerifyController {
  constructor(private readonly authService: EmailVerifyService) {}

  async sendLetter(request: FastifyRequest, reply: FastifyReply) {

    const data = validate(emailVerificationSchema, request.body);
    

    const result = await this.authService.createVerification(data.email);
    return reply.send({
      success: true,
      message: result.message,
      data: null
    })
  }

  async checkVerify(request: FastifyRequest<{
    Querystring: CheckVerifyQuery
  }>,
   reply: FastifyReply) {
    const { token, id } = request.params as unknown as CheckVerifyQuery;

    console.log("CHECK VERIFY REQUEST:", { token, id });
    const result = await this.authService.checkVerify(token, id);
    return reply.send({
      success: true,
      message: result.message,
      data: result.data,
    });
  }

  async deleteVerify(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.authService.deleteVerify(id);
    return reply.send(result);
  }
}