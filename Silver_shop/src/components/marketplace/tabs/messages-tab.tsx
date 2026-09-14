import { ScrollView, Text } from "react-native";

import { AppCard } from "@/components/ui/app-card";

export function MessagesTab(): React.JSX.Element {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold tracking-tight text-text-primary">
        Messages
      </Text>

      <AppCard>
        <Text className="text-base font-semibold text-text-primary">
          No conversations yet
        </Text>
        <Text className="mt-1 text-sm leading-5 text-text-secondary">
          When buyers write to you about your listings, chats will appear here.
        </Text>
      </AppCard>
    </ScrollView>
  );
}
