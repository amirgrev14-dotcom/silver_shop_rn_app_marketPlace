import type { FastifyReply, FastifyRequest} from "fastify"
import  { type LoginDto, loginSchema, type RefreshDto, refreshSchema, type RegisterDto, registerSchema } from "./schema.js";
import { validate } from "../../utils/validate.js";
import { AuthService } from "./service.js";
import { AppError, HttpStatus } from "../../common/AppError.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshToken(reply: FastifyReply, refreshToken: string) {
    reply.setCookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      // expires in 7 days
      maxAge: 60 * 60 * 24 * 7 
    });
  }
  


register = async (
  request: FastifyRequest<{Body: RegisterDto;}>, reply: FastifyReply) => {


  console.log("REGISTER DATA", request.body)
  const data = validate(registerSchema, request.body)
  // result because (user, token) is returned from service
  const result = await this.authService.register(data)

  this.setRefreshToken(reply, result.refreshToken)

  reply.send({
    success: true,
    data: {
      ...result,
    },
  })
}
  
login = async (request: FastifyRequest<{Body: LoginDto}>, reply: FastifyReply) => {
  const data = validate(loginSchema, request.body)
  const result = await this.authService.login(data)
  
  this.setRefreshToken(reply, result.refreshToken)

  reply.send({
    success : true,
    data: {
      ...result,
    },
  })
}

me = async (request: FastifyRequest, reply: FastifyReply) => {
  
  const user = await this.authService.me(request.user.id)

  reply.send({
    success: true,
    data: user,
  })
}

refresh = async (request: FastifyRequest<{Body: RefreshDto;}>, reply: FastifyReply) => {

  const body = validate(refreshSchema, request.body ?? {})

  // Web sends the httpOnly cookie; native apps (no cookie jar) send the
  // stored token in the body or as `Authorization: Bearer <refreshToken>`.
  // The service verifies signature + `type: "refresh"`, so an access token
  // can never pass here.
  const header = request.headers.authorization;
  const refreshToken =
    request.cookies.refreshToken ??
    body.refreshToken ??
    (header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined)

   if(!refreshToken) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized")
    }

  const result = await this.authService.refresh(refreshToken)

  this.setRefreshToken(reply, result.refreshToken)

  reply.send({
    success: true,
    data: result,
  })
}

logout = async (request: FastifyRequest, reply: FastifyReply) => {
  reply.clearCookie("refreshToken", {
    path: "/",
  })

  return reply.send({
    success: true,
    message: "Logged out successfully",
    data: null,
  })
}
}

