import type { FastifyInstance } from "fastify/types/instance.js";
import { EmailVerifyController } from "./controller.js";
import { EmailVerifyService } from "./service.js";
import { TokenEmailVerifyService } from "./token.js";
import { ResendEmail } from "../../../common/resend.js";

export function createEmailVerificationModule(fastify: FastifyInstance) {
    const tokenService = new TokenEmailVerifyService(fastify);
    const resendEmailVerificationDTO = new ResendEmail();
    const verifyEmailService = new EmailVerifyService(tokenService, resendEmailVerificationDTO);
    const verifyEmailController = new EmailVerifyController(verifyEmailService);

    return {
        verifyEmailController,
        tokenService,
        verifyEmailService
    };
}