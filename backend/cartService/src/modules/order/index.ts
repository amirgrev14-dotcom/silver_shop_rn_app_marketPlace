import { OrdersService } from "./service.js";
import { OrdersController } from "./controller.js";

export function createOrdersModule() {
  const ordersService = new OrdersService();
  const ordersController = new OrdersController(ordersService);
  return { ordersService, ordersController };
}
