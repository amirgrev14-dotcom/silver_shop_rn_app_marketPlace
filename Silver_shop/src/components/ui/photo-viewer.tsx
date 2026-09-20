import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { useRef, useState } from "react";
import {FlatList, Modal, Pressable, View, useWindowDimensions, type ImageSourcePropType, type NativeScrollEvent, type NativeSyntheticEvent, } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { CircleIconButton } from "./circle-icon-button";
import { LoadingImage } from "./loading-image";

interface PhotoViewerProps {
  visible: boolean;
  images: ImageSourcePropType[];
  initialIndex?: number;
  onClose: () => void;
}

/** Full-screen photo viewer with swipe paging and a counter. */
export function PhotoViewer({ visible, images, initialIndex = 0, onClose }: PhotoViewerProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<ImageSourcePropType>>(null);

  const goTo = (index: number) => {
    setActiveIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / screenWidth));
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black">
        <View className="flex-row items-center justify-between px-5 pb-2 pt-12">
          <AppText className="text-base font-semibold text-white">
            {Math.min(activeIndex + 1, images.length)} / {images.length}
          </AppText>
          <CircleIconButton
            icon={X}
            accessibilityLabel="Close viewer"
            onPress={onClose}
            bordered={false}
          />
        </View>
        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={(_, index) => `viewer-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(initialIndex, images.length - 1)}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => (
            <View style={{ width: screenWidth }} className="flex-1 items-center justify-center px-4">
              <LoadingImage
                source={item}
                style={{ width: screenWidth - 32, height: screenWidth - 32, borderRadius: 20 }}
                contentFit="contain"
              />
            </View>
          )}
        />
        {/* Thumbnails */}
        <View className="flex-row items-center justify-center gap-2 px-5 pb-10">
          {images.map((source, index) => (
            <Pressable
              key={`thumb-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Photo ${index + 1}`}
              onPress={() => goTo(index)}
              className={`h-12 w-12 overflow-hidden rounded-[10px] border-2 ${
                index === activeIndex ? "border-white" : "border-transparent opacity-60"
              }`}
            >
              <Image
                source={source}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}
