import { ProductController } from "./controller.js";
import { ProductService } from "./service.js";

export function createProductModule() {
  const productService = new ProductService();
  const productController = new ProductController(productService);

  return { productService, productController };
}
