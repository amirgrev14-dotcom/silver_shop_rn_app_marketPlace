import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      type?: "access" | "refresh";
    };

    user: {
      id: string;
      email: string;
      type?: "access" | "refresh";
    }
  }
}