import { useQuery } from "@tanstack/react-query";

import {
  mapCategoryToBackend,
  type BackendCategory,
} from "@/features/products/schemas/categories.schema";
import { fetchFeed } from "@/features/products/services/products-service";

export interface CategoryTotal {
  category: BackendCategory;
  total: number;
}

/**
 * Item totals per category, shared via one cached query.
 * Names go to the backend as-is (backend enum mirrors the app grid).
 */
export function useCategoryCounts(uiCategories: string[]) {
  const backendCats = uiCategories
    .map(mapCategoryToBackend)
    .filter((cat, index, all) => all.indexOf(cat) === index);

  return useQuery({
    queryKey: ["products", "counts"],
    queryFn: async (): Promise<CategoryTotal[]> =>
      Promise.all(
        backendCats.map(async (category) => {
          const feed = await fetchFeed({ category, limit: 1 });
          return { category, total: feed.total };
        }),
      ),
    staleTime: 30_000,
  });
}

/**
 * Total for a UI category.
 * null = unknown yet (loading/error) → callers show everything.
 */
export function countForUiCategory(
  totals: CategoryTotal[] | undefined,
  uiCategory: string,
): number | null {
  if (!totals) return null;
  const backend = mapCategoryToBackend(uiCategory);
  return totals.find((t) => t.category === backend)?.total ?? 0;
}
