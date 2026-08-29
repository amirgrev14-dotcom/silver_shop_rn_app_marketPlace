import type { FastifyReply, FastifyRequest} from "fastify"
import  { type LoginDto, loginSchema, type RegisterDto, registerSchema } from "./schema.js";
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
    
console.log("REGISTER")
  const data = validate(registerSchema, request.body)
  // result because (user, token) is returned from service


  console.log("AUTH SERVICe", this.authService)
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

refresh = async (request: FastifyRequest, reply: FastifyReply) => {

  const refreshToken = request.cookies.refreshToken

   if(!refreshToken) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized")
    }

  const result = await this.authService.refresh(refreshToken)

  reply.send({
    success: true,
    data: result,
  })
}
}

