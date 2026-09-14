import { ScrollView, Text } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";

export function SellTab(): React.JSX.Element {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold tracking-tight text-text-primary">
        Sell silver
      </Text>

      <AppCard>
        <Text className="text-base font-semibold text-text-primary">
          Create a listing
        </Text>
        <Text className="mt-1 text-sm leading-5 text-text-secondary">
          Add photos, describe your piece, set a price — buyers will find you
          here.
        </Text>
      </AppCard>

      <AppButton onPress={() => {}}>New listing</AppButton>

      <AppCard>
        <Text className="text-base font-semibold text-text-primary">
          My listings
        </Text>
        <Text className="mt-1 text-sm leading-5 text-text-secondary">
          You have no active listings yet.
        </Text>
      </AppCard>
    </ScrollView>
  );
}
