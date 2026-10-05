import { CartService } from "./service.js";
import { CartController } from "./controller.js";

export function createCartModule() {
  const cartService = new CartService();
  const cartController = new CartController(cartService);
  return { cartService, cartController };
}
