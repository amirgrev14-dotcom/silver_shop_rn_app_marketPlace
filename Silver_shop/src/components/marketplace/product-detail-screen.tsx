import { Image } from "expo-image";
import { ArrowLeft, Share2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Share, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EdgeFade } from "@/components/ui/edge-fade";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { LoadingImage } from "@/components/ui/loading-image";
import { PhotoViewer } from "@/components/ui/photo-viewer";
import { ScreenHeader } from "@/components/ui/screen-header";
import { formatPrice } from "@/features/marketplace/mock-data";
import type { Product } from "@/features/products/types";

const MAX_VISIBLE_THUMBS = 3;

interface ProductDetailScreenProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
}

export function ProductDetailScreen({
  product,
  isFavorite,
  onToggleFavorite,
  onBack,
}: ProductDetailScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  // Real API gallery — every photo cropped to square.
  const gallery = product.images.length > 0 ? product.images : [];
  const [activePhoto, setActivePhoto] = useState(0);
  // UI-only cart state (no backend). Prepared for real cart logic later.
  const [addedToCart, setAddedToCart] = useState(false);
  // Full-screen viewer page (null = closed). Remounts on open via `key`.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const visibleThumbs = gallery.slice(0, MAX_VISIBLE_THUMBS);
  const hiddenCount = gallery.length - visibleThumbs.length;
  const sellerInitial = (product.sellerName || "?").slice(0, 1).toUpperCase();

  // Square photo, capped so it never looks giant. Any shape is cropped via cover.
  const { width: screenWidth } = useWindowDimensions();
  const mainSize = Math.min(screenWidth - 40, 260);

  const priceLabel = formatPrice(product.price, product.currency);

  const handleShare = async () => {
    try {
      await Share.share({
        title: product.title,
        message: `${product.title} — ${formatPrice(product.price, product.currency)}`,
      });
    } catch {
      // Sharing unavailable — stay on the page.
    }
  };

  return (
    <View className="flex-1 bg-[#F8F8FB]">
      <ScreenHeader
        title="Product Detail"
        titleAlign="left"
        accentFirstLetter
        className="bg-surface px-5 py-2"
        left={
          <CircleIconButton
            icon={ArrowLeft}
            accessibilityLabel="Go back"
            onPress={onBack}
            tone="accent"
          />
        }
        right={
          <View className="flex-row items-center gap-2">
            <CircleIconButton icon={Share2} accessibilityLabel="Share" onPress={handleShare} bordered={false} />
            <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
          </View>
        }
      />

      <View className="relative flex-1">
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-6 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery — small centered square, everything cropped to square */}
        <View className="gap-3">
          {gallery.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open fullscreen photo"
              onPress={() => setViewerIndex(activePhoto)}
              className="self-center active:opacity-90"
            >
              <LoadingImage
                source={{ uri: gallery[Math.min(activePhoto, gallery.length - 1)] }}
                style={{ width: mainSize, height: mainSize, borderRadius: 20 }}
              />
            </Pressable>
          ) : (
            <View
              style={{ width: mainSize, height: mainSize, borderRadius: 20 }}
              className="self-center bg-silver-light"
            />
          )}
          {gallery.length > 1 ? (
            <View className="flex-row justify-center gap-2.5">
              {visibleThumbs.map((uri, index) => (
                <Pressable
                  key={`${uri}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Photo ${index + 1}`}
                  onPress={() => setActivePhoto(index)}
                  className={`h-16 w-16 overflow-hidden rounded-[12px] border-2 active:opacity-70 ${
                    index === activePhoto ? "border-primary" : "border-transparent"
                  }`}
                >
                  <LoadingImage
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Pressable>
              ))}
              {hiddenCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${hiddenCount} more photos`}
                  onPress={() => setViewerIndex(MAX_VISIBLE_THUMBS)}
                  className="h-16 w-16 items-center justify-center overflow-hidden rounded-[12px] bg-text-primary active:opacity-70"
                >
                  <Image
                    source={{ uri: gallery[MAX_VISIBLE_THUMBS] }}
                    style={{ width: "100%", height: "100%", position: "absolute", opacity: 0.4 }}
                    contentFit="cover"
                  />
                  <AppText className="text-base font-bold text-white">+{hiddenCount}</AppText>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Title + price row (price ellipsized, never breaks layout) */}
        <View className="gap-1">
          <View className="flex-row items-start justify-between gap-3">
            <AppText className="flex-1 text-2xl font-bold text-text-primary">
              {product.title}
            </AppText>
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              className="max-w-[45%] shrink-0 text-xl font-bold text-text-primary"
            >
              {priceLabel}
            </AppText>
          </View>
          {product.categories[0] ? (
            <AppText className="text-base text-text-secondary">{product.categories[0]}</AppText>
          ) : null}
        </View>

        {/* Seller row */}
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-light">
            <AppText className="text-lg font-bold text-primary">{sellerInitial}</AppText>
          </View>
          <View className="flex-1 gap-0.5">
            <AppText className="text-base font-bold text-text-primary">
              {product.sellerName}
            </AppText>
            <AppText className="text-sm text-text-secondary">Verified seller</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View shop"
            className="active:opacity-70"
          >
            <AppText className="text-sm font-bold text-primary">View Shop</AppText>
          </Pressable>
        </View>

        {/* Description — plain paragraph */}
        <AppText className="text-[15px] leading-6 text-text-secondary">
          {product.description || "No description yet."}
        </AppText>

        {/* Details */}
        <View className="gap-3 rounded-[20px] border border-border bg-white p-5">
          <AppText className="text-lg font-bold text-text-primary">Details</AppText>
          <DetailRow label="Category" value={product.categories[0] ?? "—"} />
          <View className="h-px bg-border-light" />
          <DetailRow label="Item ID" value={product.id.slice(0, 8)} />
        </View>
      </ScrollView>
      <EdgeFade />
      </View>

      {/* Sticky purchase bar — padded above the bottom inset, never overlaps content.
          Huge prices push the buttons under the sum; extreme ones ellipsize. */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="border-t border-border bg-surface px-5 pt-3"
      >
        {priceLabel.length > 10 ? (
          <View className="gap-2.5">
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-xl font-bold text-text-primary"
            >
              {priceLabel}
            </AppText>
            <View className="flex-row gap-3">
              <AppButton
                variant="secondary"
                fullWidth={false}
                className="flex-1"
                onPress={() => setAddedToCart((v) => !v)}
              >
                {addedToCart ? "In Cart ✓" : "Add to Cart"}
              </AppButton>
              <AppButton fullWidth={false} className="flex-1">
                Buy Now
              </AppButton>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              className="shrink-0 text-xl font-bold text-text-primary"
            >
              {priceLabel}
            </AppText>
            <AppButton
              variant="secondary"
              fullWidth={false}
              className="flex-1"
              onPress={() => setAddedToCart((v) => !v)}
            >
              {addedToCart ? "In Cart ✓" : "Add to Cart"}
            </AppButton>
            <AppButton fullWidth={false} className="flex-1">
              Buy Now
            </AppButton>
          </View>
        )}
      </View>

      {/* Fullscreen viewer — remounts on every open for a fresh start page. */}
      <PhotoViewer
        key={viewerIndex ?? "closed"}
        visible={viewerIndex !== null}
        images={gallery.map((uri) => ({ uri }))}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between">
      <AppText className="text-sm text-text-secondary">{label}</AppText>
      <AppText className="text-sm font-semibold text-text-primary">{value}</AppText>
    </View>
  );
}
