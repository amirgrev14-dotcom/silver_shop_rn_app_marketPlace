import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, X } from "lucide-react-native";
import { useState } from "react";
import {Modal, Pressable, ScrollView, View} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { EdgeFade } from "@/components/ui/edge-fade";
import { ScreenHeader } from "@/components/ui/screen-header";
import { BETA_SELL_CATEGORY_NAMES } from "@/features/marketplace/beta-categories";
import { createProduct, publishProduct } from "@/features/products/services/products-service";
import { sellFormSchema, type SellFormData } from "@/features/products/schemas/product.schema";
import { showToast } from "@/stores/toast-store";

const MAX_PHOTOS = 6;
const MAX_DESCRIPTION = 500;

export function SellTab(): React.JSX.Element {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),

    defaultValues: {
      photos: [],
      title: "",
      category: "",
      price: "",
      description: "",
    },
  });

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const queryClient = useQueryClient();

  const photos = watch("photos");

  // Fixed grid of 6 slots: added photos fill slots, the rest stay "+".
  // The grid never changes size — 6 slots, 3 per row.
  const plusSlots = Math.max(0, MAX_PHOTOS - photos.length);

  const pickPhotos = async () => {
    if (isPicking || photos.length >= MAX_PHOTOS) return;
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast("Gallery access is required to add photos.", "error");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - photos.length,
        quality: 0.8,
      });
      // user launched the picker and did not cancel
      if (!result.canceled) {
        const fresh = result.assets
          .map((a) => a.uri)
          .filter((uri) => !photos.includes(uri))
          .slice(0, MAX_PHOTOS - photos.length);
        if (fresh.length > 0) {
          setValue("photos", [...photos, ...fresh], { shouldValidate: true });
        }
      }
    } finally {
      setIsPicking(false);
    }
  };

  const removePhoto = (uri: string) => {
    setValue(
      "photos",
      photos.filter((u) => u !== uri),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: SellFormData) => {
    if (isPublishing) return;
    const amount = Number(data.price.replace(",", "."));
    setIsPublishing(true);
    try {
      // Real backend call: uploads photos, maps the category, creates
      // the product as DRAFT and immediately publishes it (ACTIVE)
      // so it appears in the marketplace feed.
      const created = await createProduct({
        title: data.title,
        price: amount,
        description: data.description.trim() || undefined,
        images: data.photos,
        categories: [data.category],
      });
      await publishProduct(created.id);
      // Refresh the Home feed so the new item appears right away.
      await queryClient.invalidateQueries({ queryKey: ["products", "feed"] });
      reset();
      showToast("Published! Your item is live in the feed.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Publish failed", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F8FB]">
      {/* Header */}
      <ScreenHeader
        title="Sell an Item"
        titleAlign="left"
        className="bg-surface px-5 pb-3 pt-4"
        left={<CircleIconButton icon={X} accessibilityLabel="Close" />}
      />

      <View className="relative flex-1">
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photos */}
        <View className="gap-1">
          <AppText className="text-sm font-semibold text-text-primary">Photos</AppText>
          <AppText className="text-sm text-text-secondary">Add up to 6 photos</AppText>
          <View className="mt-2 flex-row flex-wrap gap-2.5">
            {photos.map((uri) => (
              <View
                key={uri}
                className="h-[104px] w-[31%] overflow-hidden rounded-[14px] border border-border bg-white"
              >
                <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  onPress={() => removePhoto(uri)}
                  className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-text-primary/70 active:opacity-70"
                >
                  <AppIcon icon={X} size={14} color="white" />
                </Pressable>
              </View>
            ))}
            {Array.from({ length: plusSlots }).map((_, i) => (
              <Pressable
                key={`plus-${i}`}
                accessibilityRole="button"
                accessibilityLabel={i === 0 && photos.length === 0 ? "Add first photo" : "Add photo"}
                onPress={pickPhotos}
                disabled={isPicking}
                className="h-[104px] w-[31%] items-center justify-center rounded-[14px] border border-dashed border-border bg-white active:opacity-70"
              >
                <AppIcon icon={Plus} size={26} color="muted" />
              </Pressable>
            ))}
          </View>
          {errors.photos?.message ? (
            <AppText className="text-sm text-error">{errors.photos.message}</AppText>
          ) : null}
        </View>

        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              label="Title"
              placeholder="e.g. 925 Silver Ring"
              maxLength={120}
              error={errors.title?.message}
            />
          )}
        />

        {/* Category */}
        <Controller
          control={control}
          name="category"
          render={({ field: { value } }) => (
            <View className="gap-2">
              <AppText className="text-sm font-medium text-text-primary">Category</AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setCategoryOpen(true)}
                className="h-[52px] flex-row items-center justify-between rounded-[14px] border border-border bg-white px-4 active:opacity-70"
              >
                <AppText className={`text-base ${value ? "text-text-primary" : "text-text-muted"}`}>
                  {value || "Select category"}
                </AppText>
                <AppIcon icon={ChevronDown} size={20} color="muted" />
              </Pressable>
              {errors.category?.message ? (
                <AppText className="text-sm text-error">{errors.category.message}</AppText>
              ) : null}
            </View>
          )}
        />

        {/* Price */}
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              label="Price"
              placeholder="$ 0.00"
              keyboardType="decimal-pad"
              error={errors.price?.message}
            />
          )}
        />

        {/* Description */}
        <View className="gap-2">
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                value={value}
                onBlur={onBlur}
                onChangeText={(t) => onChange(t.slice(0, MAX_DESCRIPTION))}
                label="Description"
                placeholder="Describe your item..."
                multiline
                numberOfLines={4}
                maxLength={MAX_DESCRIPTION}
                inputStyle={{ minHeight: 96, textAlignVertical: "top" }}
                error={errors.description?.message}
              />
            )}
          />
          <AppText className="text-right text-xs text-text-muted">
            {watch("description").length}/{MAX_DESCRIPTION}
          </AppText>
        </View>

        <AppButton onPress={handleSubmit(onSubmit)} loading={isPublishing}>
          Publish Listing
        </AppButton>
      </ScrollView>
      <EdgeFade />
      </View>

      {/* Category picker */}
      <Modal visible={categoryOpen} transparent animationType="fade" onRequestClose={() => setCategoryOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setCategoryOpen(false)}>
          <View className="mt-auto rounded-t-[24px] bg-white p-5 pb-8">
            <AppText className="mb-3 text-lg font-bold text-text-primary">Select category</AppText>
            {BETA_SELL_CATEGORY_NAMES.map((name) => (
              <Pressable
                key={name}
                accessibilityRole="button"
                onPress={() => {
                  setValue("category", name, { shouldValidate: true });
                  setCategoryOpen(false);
                }}
                className="flex-row items-center justify-between rounded-[12px] px-3 py-3.5 active:bg-silver-light"
              >
                <AppText className={`text-base ${watch("category") === name ? "font-bold text-primary" : "text-text-primary"}`}>
                  {name}
                </AppText>
                {watch("category") === name ? <AppIcon icon={ChevronDown} size={18} color="primary" /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
