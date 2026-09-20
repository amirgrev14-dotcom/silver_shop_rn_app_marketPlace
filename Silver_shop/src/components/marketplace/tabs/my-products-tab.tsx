import {ScrollView} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ScreenHeader } from "@/components/ui/screen-header";

interface MyProductsTabProps {
  onAdd: () => void;
}

/** Seller's own listings. Real products (API) plug into the empty state. */
export function MyProductsTab({ onAdd }: MyProductsTabProps): React.JSX.Element {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="My products" titleAlign="left" accentFirstLetter />

      <EmptyStateCard
        title="No products yet"
        description="Add your first silver piece — buyers will see it on the marketplace."
      />

      <AppButton onPress={onAdd}>Add product</AppButton>
    </ScrollView>
  );
}
