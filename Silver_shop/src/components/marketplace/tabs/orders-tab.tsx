import { useState } from "react";
import {Pressable, ScrollView, View} from "react-native";

import { AppText } from "@/components/ui/app-text";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useAppStore } from "@/stores/app-store";

const SELLER_STAGES = ["New", "In progress", "Completed"] as const;
const BUYER_STAGES = ["Active", "Completed"] as const;

/**
 * Same tab outside, different inside:
 *  - seller → order pipeline with stages to manage;
 *  - buyer  → my own purchases with statuses.
 * Real orders (API) plug into the empty states below.
 */
export function OrdersTab(): React.JSX.Element {
  const mode = useAppStore((s) => s.mode);
  const isSeller = mode === "seller";
  const stages = isSeller ? SELLER_STAGES : BUYER_STAGES;
  const [stage, setStage] = useState<string>(stages[0]);

  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title={isSeller ? "Orders to fulfil" : "My orders"}
        titleAlign="left"
        accentFirstLetter
      />

      <View className="flex-row gap-2">
        {stages.map((name) => {
          const isActive = stage === name;
          return (
            <Pressable
              key={name}
              onPress={() => setStage(name)}
              className={`rounded-full px-4 py-2 active:opacity-70 ${
                isActive ? "bg-primary" : "bg-silver-light"
              }`}
            >
              <AppText
                className={`text-sm font-semibold ${
                  isActive ? "text-white" : "text-text-secondary"
                }`}
              >
                {name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <EmptyStateCard
        title={isSeller ? `No ${stage.toLowerCase()} orders` : `No ${stage.toLowerCase()} purchases`}
        description={
          isSeller
            ? "New orders from buyers will appear here — accept, prepare and ship them step by step."
            : "Your purchases will appear here — track delivery and confirm receipt."
        }
      />
    </ScrollView>
  );
}
