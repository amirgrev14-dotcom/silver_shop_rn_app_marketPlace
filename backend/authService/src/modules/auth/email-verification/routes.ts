import type { FastifyPluginAsync } from "fastify";
import { createEmailVerificationModule } from "./index.js";

export const emailVerificationRoutes: FastifyPluginAsync = async (fastify) => {
  const { verifyEmailController } = createEmailVerificationModule(fastify);

  fastify.post("/send", async (request, reply) => verifyEmailController.sendLetter(request, reply));
  fastify.get<{ Params: { token: string; id: string }; Querystring: Record<string, string> }>(
    "/check/:token/:id",
    async (request, reply) => verifyEmailController.checkVerify(request as any, reply)
  );
  fastify.delete("/:id", async (request, reply) => verifyEmailController.deleteVerify(request, reply));
};