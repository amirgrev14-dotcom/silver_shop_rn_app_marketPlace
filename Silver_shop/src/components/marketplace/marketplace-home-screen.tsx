import { useEffect, useRef, useState } from "react";
import { Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthEntryScreen } from "@/components/auth/auth-entry-screen";
import { tabsForMode, type MarketTabId } from "@/features/marketplace/types";
import type { Product } from "@/features/products/types";
import { favoritesStorage } from "@/lib/storage/favorites-storage";
import { useAppStore } from "@/stores/app-store";
import { showToast } from "@/stores/toast-store";
import { CartFlowModal } from "@/features/cart/components/CartFlowModal";
import { useCartStore, productToCartItem } from "@/features/cart/store/cart-store";
import type { CartItem } from "@/features/cart/types/cart.types";
import { getTotalItems } from "@/features/cart/utils/cart-utils";
import { MarketTabBar } from "./market-tab-bar";
import { CategoryProductsScreen } from "./category-products-screen";
import { ProductDetailScreen } from "./product-detail-screen";
import { SavedScreen } from "./saved-screen";
import { CategoriesTab } from "./tabs/categories-tab";
import { HomeTab } from "./tabs/home-tab";
import { MessagesTab } from "./tabs/messages-tab";
import { MyProductsTab } from "./tabs/my-products-tab";
import { OrdersTab } from "./tabs/orders-tab";
import { ProfileTab } from "./tabs/profile-tab";
import { SellTab } from "./tabs/sell-tab";

/**
 * Root gate:
 *  - guest     → auth flow (welcome / login / register);
 *  - logged in → SILVER marketplace with a mode-based TabBar:
 *      buyer  → Home / Categories / Messages / Profile (no Sell)
 *      seller → Products / Orders / [Sell] / Messages / Profile
 * The center Sell button renders in seller mode only.
 */
export function MarketplaceHomeScreen(): React.JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthEntryScreen />;
  }

  return <MarketplaceTabs />;
}

function MarketplaceTabs(): React.JSX.Element {
  const mode = useAppStore((s) => s.mode);
  const tabs = tabsForMode(mode);
  const [activeTab, setActiveTab] = useState<MarketTabId>("home");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Favorite ids persist locally (backend has no likes table yet).
  // The save effect skips the first render so it never wipes
  // stored ids before the load resolves.
  const loadedRef = useRef(false);
  useEffect(() => {
    favoritesStorage.load().then((ids) => {
      setFavoriteIds(ids);
      loadedRef.current = true;
    });
  }, []);
  useEffect(() => {
    if (!loadedRef.current) return;
    // Paused while Saved is open — it syncs once on exit instead.
    if (showSaved) return;
    // Debounced: rapid heart taps never block the UI thread.
    const timer = setTimeout(() => favoritesStorage.save(favoriteIds), 400);
    return () => clearTimeout(timer);
  }, [favoriteIds, showSaved]);

  const favorites = new Set(favoriteIds);

  // New Zustand cart — hydrate once at top level.
  const cartItems = useCartStore((s) => s.items);
  const cartTotalItems = getTotalItems(cartItems);
  useEffect(() => {
    useCartStore.getState().hydrate();
  }, []);

  // Stock snapshot — cached locally, no fetch per tap.
  // Loaded lazily on cart open (single batched request); detail reads product.stock directly.
  const addToCart = (product: Product) => {
    const current = useCartStore.getState().items.find((i) => i.productId === product.id)?.quantity ?? 0;
    if (current >= product.stock) {
      showToast(product.stock > 0 ? `Only ${product.stock} available.` : "This item is out of stock.", "error");
      return;
    }
    useCartStore.getState().addItem(productToCartItem(product, 1));
    setStockById((prev) => new Map(prev).set(product.id, product.stock));
  };

  // Seller has no Home — its entry tab is Products.
  const defaultTab: MarketTabId = mode === "seller" ? "products" : "home";

  // If the mode switches to one without the current tab, fall back
  // to the mode entry tab. `sell` is valid via the center button (seller only).
  const effectiveTab =
    activeTab === "sell" || tabs.some((t) => t.id === activeTab)
      ? activeTab
      : defaultTab;

  const toggleFavorite = (product: Product) => {
    setFavoriteIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id].slice(-100)
    );
  };

  const closeCartFlow = () => {
    setShowCart(false);
    flushCart();
  };

  const handleTabPress = (tab: MarketTabId) => {
    setSelectedProduct(null);
    setSelectedCategory(null);
    setShowSaved(false);
    closeCartFlow();
    setActiveTab(tab);
  };

  const handleSellPress = () => {
    setSelectedProduct(null);
    setSelectedCategory(null);
    setShowSaved(false);
    closeCartFlow();
    setActiveTab("sell");
  };

  // Product details open as a native modal above everything:
  // presentation/dismissal runs on the UI thread, so the back
  // arrow feels instant even with heavy gallery content.
  const detailModal = (
    <Modal
      visible={selectedProduct !== null}
      animationType="fade"
      onRequestClose={() => setSelectedProduct(null)}
    >
      {selectedProduct ? (
        <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
          <ProductDetailScreen
            product={selectedProduct}
            isFavorite={favorites.has(selectedProduct.id)}
            onToggleFavorite={() => toggleFavorite(selectedProduct)}
            onBack={() => setSelectedProduct(null)}
            cartQty={cartItems.find((i) => i.productId === selectedProduct.id)?.quantity ?? 0}
            onAddToCart={() => addToCart(selectedProduct)}
            onRemoveFromCart={() => {
              const line = useCartStore.getState().items.find((i) => i.productId === selectedProduct.id);
              if (line) {
                useCartStore.getState().removeItem(line.id);
                showToast(`Removed "${selectedProduct.title}" from the cart.`, "info");
              }
            }}
          />
        </SafeAreaView>
      ) : null}
    </Modal>
  );

  // Saved items as a native fade modal (same as details):
  // instant open/dismiss without remounting the tabs.
  const savedModal = (
    <Modal
      visible={showSaved}
      animationType="fade"
      onRequestClose={() => setShowSaved(false)}
      statusBarTranslucent
    >
      {showSaved ? (
        <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
          <SavedScreen
            productIds={favoriteIds}
            onBack={() => setShowSaved(false)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onProductPress={setSelectedProduct}
            onSyncIds={setFavoriteIds}
          />
        </SafeAreaView>
      ) : null}
    </Modal>
  );

  // ── Cart flow ──────────────────────────────────────────────
  // One native modal (CartFlowModal) switches preview ⇄ full instantly.
  // Stock snapshot is cached here so + buttons check locally, never per tap.
  const [stockById, setStockById] = useState<Map<string, number>>(new Map());
  const [cartFull, setCartFull] = useState(false);

  /** Tap a row in the cart preview → close cart, open product details. */
  const handleCartItemPress = async (item: CartItem) => {
    setShowCart(false);
    try {
      const { fetchFavoriteProducts } = await import("@/features/products/services/products-service");
      const found = (await fetchFavoriteProducts([item.productId])).find((p) => p.id === item.productId);
      if (found) setSelectedProduct(found);
    } catch {
      // Offline — reopen the cart instead of a dead end.
      setShowCart(true);
    }
  };

  /** Single batched write when the cart flow fully closes. */
  const flushCart = () => {
    void useCartStore.getState().flushSync();
  };

  /** Open cart instantly; stock snapshot loads once in the background. */
  const openCart = () => {
    setCartFull(false);
    setShowCart(true);
    const missingIds = useCartStore
      .getState()
      .items.map((line) => line.productId)
      .filter((id) => !stockById.has(id));
    if (missingIds.length === 0) return;
    import("@/features/products/services/products-service")
      .then(({ fetchFavoriteProducts }) => fetchFavoriteProducts(missingIds))
      .then((products) => {
        setStockById((prev) => {
          const next = new Map(prev);
          for (const product of products) next.set(product.id, product.stock);
          return next;
        });
      })
      .catch(() => {
        // Offline — quantity buttons fall back to no cap.
      });
  };

  /** Local stock gate for the + button: true = may increase. */
  const checkStock = (productId: string, nextQty: number): boolean => {
    const line = useCartStore.getState().items.find((i) => i.productId === productId);
    const max = stockById.get(productId) ?? line?.stock ?? Infinity;
    if (nextQty > max) {
      showToast(max > 0 && max !== Infinity ? `Only ${max} available.` : "Out of stock.", "error");
      return false;
    }
    return true;
  };

  const handleCheckout = () => {
    closeCartFlow();
    import("expo-router").then(({ router }) => router.push("/checkout"));
  };

  const cartModal = (
    <CartFlowModal
      visible={showCart}
      full={cartFull}
      stockById={stockById}
      onClose={closeCartFlow}
      onCheckout={handleCheckout}
      onViewCart={() => setCartFull(true)}
      onItemPress={handleCartItemPress}
      onShowSaved={() => {
        closeCartFlow();
        setShowSaved(true);
      }}
      onCheckStock={checkStock}
    />
  );

  // Category listing as a native fade modal (same as details/saved):
  // instant open/dismiss, back goes to the Categories page.
  const categoryModal = (
    <Modal
      visible={selectedCategory !== null}
      animationType="fade"
      onRequestClose={() => {
        setSelectedCategory(null);
        setActiveTab("categories");
      }}
    >
      {selectedCategory ? (
        <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
          <CategoryProductsScreen
            categoryName={selectedCategory}
            onBack={() => {
              setSelectedCategory(null);
              setActiveTab("categories");
            }}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onProductPress={setSelectedProduct}
          />
        </SafeAreaView>
      ) : null}
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* All tabs stay mounted (display:none when inactive) so switching
          is instant — no remount, no refetch, no animation jank. */}
      <View className="flex-1">
        <View style={{ display: effectiveTab === "home" ? "flex" : "none" }} className="flex-1">
          <HomeTab
            onSeeAllCategories={() => setActiveTab("categories")}
            onCategoryPress={setSelectedCategory}
            onShowSaved={() => setShowSaved(true)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onProductPress={setSelectedProduct}
            cartCount={cartTotalItems}
            onCartPress={openCart}
          />
        </View>
        <View style={{ display: effectiveTab === "categories" ? "flex" : "none" }} className="flex-1">
          <CategoriesTab
            onBack={() => handleTabPress("home")}
            onCategoryPress={setSelectedCategory}
          />
        </View>
        {mode === "seller" ? (
          <View style={{ display: effectiveTab === "products" ? "flex" : "none" }} className="flex-1">
            <MyProductsTab onAdd={() => setActiveTab("sell")} />
          </View>
        ) : null}
        <View style={{ display: effectiveTab === "orders" ? "flex" : "none" }} className="flex-1">
          <OrdersTab />
        </View>
        <View style={{ display: effectiveTab === "sell" ? "flex" : "none" }} className="flex-1">
          <SellTab />
        </View>
        <View style={{ display: effectiveTab === "messages" ? "flex" : "none" }} className="flex-1">
          <MessagesTab />
        </View>
        <View style={{ display: effectiveTab === "profile" ? "flex" : "none" }} className="flex-1">
          <ProfileTab onSavedPress={() => setShowSaved(true)} />
        </View>
      </View>
      <MarketTabBar
        tabs={tabs}
        activeTab={effectiveTab}
        isSellActive={effectiveTab === "sell"}
        showSellButton={mode === "seller"}
        onTabPress={handleTabPress}
        onSellPress={handleSellPress}
      />
      {detailModal}
      {savedModal}
      {cartModal}
      {categoryModal}
    </SafeAreaView>
  );
}
