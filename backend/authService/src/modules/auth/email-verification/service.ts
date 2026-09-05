// errors handler
import { AppError, HttpStatus } from "../../../common/AppError.js";
// services
import type { TokenEmailVerifyService } from "./token.js";

// packages
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma.js";
import crypto from "crypto";
import { ResendEmail } from "../../../common/resend.js";

export class EmailVerifyService {
  
  constructor(private readonly tokenService: TokenEmailVerifyService, private readonly resendEmailVerificationDTO: ResendEmail) {}

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async createVerification(email: string) {

    console.log(email)

    if(!email) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Email is required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, "User not found");
    }

    if (user.emailVerifiedAt) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Email already verified");
    }

    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    // expires in 15 minutes

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${plainToken}&id=${user.id}`;

    console.log(`[EMAIL VERIFICATION] To: ${email}`);
    console.log(`[EMAIL VERIFICATION] Verification link: ${verificationLink}`);
    console.log(`[EMAIL VERIFICATION] Token: ${plainToken}`);

      const response = await this.resendEmailVerificationDTO.sendVerificationEmail(
        {
          nameCompany: "Silver_MarketPlace",
          email: email,
          html: `<p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`,
          subject: "Email Verification",
          text: `Please verify your email by clicking the link below: ${verificationLink}`,
          domainAddress: `${process.env.SUB_DOMAIN_VERIFY || "verify.rayehjay.com"}`,
        }
      );  
      
      if(response.error) {
        throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, "Error sending verification email, please try again later")
       }
       
    return { message: "Verification email sent" };
  }

  async checkVerify(token: string, userId: string) {

console.log("CHECK VERIFY TOKEN:", token, "USER ID:", userId)

    const verificationRecord = await prisma.emailVerificationToken.findFirst({
      where: { userId },
    });

    console.log("VERIFICATION RECORD:", verificationRecord)

    if (!verificationRecord) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return { success: true, message: "Email already verified", data: { email: user?.email } };
    }

    if (verificationRecord.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: verificationRecord.id } });
      throw new AppError(HttpStatus.BAD_REQUEST, "Verification token expired");
    }

    const tokenHash = this.hashToken(token);
    if (verificationRecord.tokenHash !== tokenHash) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid verification token");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
    });

    await prisma.emailVerificationToken.delete({ where: { id: verificationRecord.id } });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { success: true, message: "Email verified successfully", data: { email: user?.email } };
  }

  async deleteVerify(userId: string) {
    const deleted = await prisma.emailVerificationToken.deleteMany({ where: { userId } });
    return { message: "Verification tokens deleted", count: deleted.count };
  }
}


