import { ScrollView, Text, View } from "react-native";

import { AppCard } from "@/components/ui/app-card";

export function HomeTab(): React.JSX.Element {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text className="text-3xl font-bold tracking-tight text-text-primary">
          SILVER
        </Text>
        <Text className="mt-1 text-sm font-semibold tracking-[2px] text-primary">
          MARKETPLACE
        </Text>
        <Text className="mt-3 text-base leading-6 text-text-secondary">
          Buy and sell silver items between people.
        </Text>
      </View>

      <AppCard>
        <Text className="text-base font-semibold text-text-primary">
          Fresh listings
        </Text>
        <Text className="mt-1 text-sm leading-5 text-text-secondary">
          New silver pieces from the community will appear here.
        </Text>
      </AppCard>

      <AppCard>
        <Text className="text-base font-semibold text-text-primary">
          How it works
        </Text>
        <Text className="mt-1 text-sm leading-5 text-text-secondary">
          Browse, chat with the seller and track your order — all in one place.
        </Text>
      </AppCard>
    </ScrollView>
  );
}
