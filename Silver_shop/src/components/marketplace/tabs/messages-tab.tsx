import {ScrollView} from "react-native";

import { AppText } from "@/components/ui/app-text";
import { EmptyStateCard } from "@/components/ui/empty-state-card";

export function MessagesTab(): React.JSX.Element {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <AppText className="text-2xl font-bold tracking-tight text-text-primary">
        Messages
      </AppText>

      <EmptyStateCard
        title="No conversations yet"
        description="When buyers write to you about your listings, chats will appear here."
      />
    </ScrollView>
  );
}
