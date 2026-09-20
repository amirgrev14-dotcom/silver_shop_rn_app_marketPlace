import { httpClient } from '@/services/http-client';
import { environment } from '@/config/environment';
import { toApiMessage } from '@/features/auth/services/auth-service';
import { mapCategoryToBackend } from '@/features/products/schemas/categories.schema';
import type { CreateProductValues, Product, ProductFeed } from '@/features/products/types';

// Absolute URLs ignore httpClient.baseURL but keep its interceptors
// (auth header, logging) — one client for both backend services.
const products = (path: string) => `${environment.productsUrl}${path}`;

async function uploadToCloudinary(localUri: string): Promise<string> {
  const { cloudName, uploadPreset } = environment.cloudinary;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Photo upload is not configured yet. Add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.'
    );
  }
  const form = new FormData();
  form.append('file', {
    uri: localUri,
    name: `photo-${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);
  form.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  const payload = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Photo upload failed');
  }
  return payload.secure_url;
}

/**
 * Uploads local images to Cloudinary and returns remote URLs.
 * Remote http(s) URIs pass through untouched. The backend rejects
 * local file:// URIs, so uploads must succeed before product creation.
 */
export async function uploadImages(localUris: string[]): Promise<string[]> {
  return Promise.all(
    localUris.map((uri) => (uri.startsWith('http') ? uri : uploadToCloudinary(uri)))
  );
}

export async function createProduct(values: CreateProductValues): Promise<Product> {
  try {
    const images = await uploadImages(values.images);
    const response = await httpClient.post(products('/products'), {
      ...values,
      categories: values.categories.map(mapCategoryToBackend),
      images,
    });

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Create failed');
    }

    return response.data.data as Product;
  } catch (error) {
    throw new Error(toApiMessage(error, 'Create failed'));
  }
}

/** Publishing flow: seller moves own DRAFT → ACTIVE so it appears in the feed. */
export async function publishProduct(id: string): Promise<Product> {
  try {
    const response = await httpClient.patch(products(`/products/${id}`), {
      status: 'ACTIVE',
    });

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Publish failed');
    }

    return response.data.data as Product;
  } catch (error) {
    throw new Error(toApiMessage(error, 'Publish failed'));
  }
}

export async function fetchFeed(params?: {
  page?: number;
  limit?: number;
  sellerId?: string;
  category?: string;
}): Promise<ProductFeed> {
  try {
    const response = await httpClient.get(products('/products'), { params });

    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Feed failed');
    }

    return response.data.data as ProductFeed;
  } catch (error) {
    throw new Error(toApiMessage(error, 'Feed failed'));
  }
}
