// errors handler
import { AppError, HttpStatus } from "../../common/AppError.js";
// schemas
import { type LoginDto, type RegisterDto } from "./schema.js";
// services
import type { TokenService } from "./token.js";

// packages.json
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

export class AuthService {

  private createTokens(user: {id: string, email: string}) {
    const accessToken = this.tokenService.signAccessToken(user);
    const refreshToken = this.tokenService.signRefreshToken(user);

    return {
      accessToken,
      refreshToken
    }
  }

  constructor(private readonly tokenService: TokenService) {}

  async register(data: RegisterDto) {

    const existingUser = await prisma.user.findUnique({
      where: {email: data.email},
    });
    
    if (existingUser) {
      throw new AppError(HttpStatus.CONFLICT, "User already exists")
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword
      }
    });

    // Access and refresh tokens
    const tokens = this.createTokens({
      id: user.id,
      email: user.email
    })

    const { password, ...safeUser} = user;

    return {
      user: safeUser,
      ...tokens
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    })

    if(!user) {
      // for more security, we can use the same error message for both cases (user not found and invalid password)
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid credentials email or password")
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if(!isPasswordValid) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid credentials email or password")
    }

   const tokens = this.createTokens({
    id: user.id,
    email: user.email
   })
   
    const { password, ...safeUser} = user;

    return {
      user: safeUser,
      ...tokens,
    };
  }

  async me(userId: string) {
    
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },

      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if(!user) {
      throw new AppError(HttpStatus.NOT_FOUND, "User not found")
    }

    return user
  }

  
async refresh(refreshToken: string) {

  // verify refresh token and get payload id, email
  const payload = this.tokenService.verifyRefreshToken(refreshToken)

  // generate new access token and return refresh token
  const accessToken = this.tokenService.signAccessToken({
    id: payload.id,
    email: payload.email
  })

  return {
    accessToken,
  }
}
}

