import { httpClient } from '@/services/http-client';
import { environment } from '@/config/environment';
import { toApiMessage } from '@/features/auth/services/auth-service';
import type { CreateOrderPayload, Order } from './types';

// cartService owns orders (see backend/cartService/src/modules/orders).
// Absolute URL keeps httpClient interceptors (auth header, 401 → logout).
const orders = (path: string) => `${environment.cartUrl}${path}`;

/** Creates a PAID order — the backend re-verifies the payment first. */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const response = await httpClient.post(orders('/orders'), payload);

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Order failed');
    }

    return response.data.data as Order;
  } catch (error) {
    throw new Error(toApiMessage(error, 'Order failed'));
  }
}
