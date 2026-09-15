import { ScrollView, Text } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";

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
      <Text className="text-2xl font-bold tracking-tight text-text-primary">
        My products
      </Text>

      <AppCard>
        <Text className="text-base font-semibold text-text-primary">
          No products yet
        </Text>
        <Text className="mt-1 text-sm leading-5 text-text-secondary">
          Add your first silver piece — buyers will see it on the marketplace.
        </Text>
      </AppCard>

      <AppButton onPress={onAdd}>Add product</AppButton>
    </ScrollView>
  );
}
