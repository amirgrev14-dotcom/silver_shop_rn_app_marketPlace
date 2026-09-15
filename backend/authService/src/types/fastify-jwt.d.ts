import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      type?: "access" | "refresh";
      name?: string;
      role?: string;
    };

    user: {
      id: string;
      email: string;
      type?: "access" | "refresh";
      name?: string;
      role?: string;
    }
  }
}