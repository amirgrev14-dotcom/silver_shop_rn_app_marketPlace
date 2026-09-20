import {ScrollView} from "react-native";

import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ScreenHeader } from "@/components/ui/screen-header";

export function MessagesTab(): React.JSX.Element {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Messages" titleAlign="left" accentFirstLetter />

      <EmptyStateCard
        title="No conversations yet"
        description="When buyers write to you about your listings, chats will appear here."
      />
    </ScrollView>
  );
}
