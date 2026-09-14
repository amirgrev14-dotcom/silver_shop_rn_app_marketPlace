import { Pressable, ScrollView, Text, View } from "react-native";
import { ShoppingBag, Store } from "lucide-react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppIcon } from "@/components/ui/app-icon";
import type { MarketplaceMode } from "@/features/marketplace/types";
import { useAppStore } from "@/stores/app-store";

const MODE_CARDS: { mode: MarketplaceMode; title: string; subtitle: string; icon: typeof Store }[] = [
  { mode: "buyer", title: "Buyer", subtitle: "Browse & buy silver", icon: ShoppingBag },
  { mode: "seller", title: "Seller", subtitle: "Sell & chat with buyers", icon: Store },
];

export function ProfileTab(): React.JSX.Element {
  const user = useAppStore((s) => s.user);
  const isVerifiedEmail = useAppStore((s) => s.isVerifiedEmail);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const logout = useAppStore((s) => s.logout);

  const initial = (user?.name ?? user?.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold tracking-tight text-text-primary">
        My profile
      </Text>

      <AppCard className="flex-row items-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
          <Text className="text-2xl font-bold text-white">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-text-primary">
            {user?.name ?? "Silver user"}
          </Text>
          <Text className="text-sm text-text-secondary">{user?.email ?? ""}</Text>
          <Text className="mt-0.5 text-xs font-semibold text-success">
            {isVerifiedEmail ? "Email verified ✓" : "Email not verified yet"}
          </Text>
        </View>
      </AppCard>

      <View>
        <Text className="mb-2 text-sm font-semibold text-text-secondary">
          I use Silver Shop as
        </Text>
        <View className="flex-row gap-3">
          {MODE_CARDS.map((card) => {
            const isActive = mode === card.mode;
            return (
              <Pressable
                key={card.mode}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                onPress={() => setMode(card.mode)}
                className={`flex-1 rounded-[20px] border p-4 active:opacity-70 ${
                  isActive ? "border-primary bg-surface" : "border-border-light bg-surface"
                }`}
              >
                <AppIcon icon={card.icon} size={26} color="primary" />
                <Text className="mt-2 text-base font-bold text-text-primary">
                  {card.title}
                </Text>
                <Text className="text-xs leading-4 text-text-muted">
                  {card.subtitle}
                </Text>
                {isActive ? (
                  <Text className="mt-1 text-xs font-bold text-primary">● Active</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <AppButton variant="secondary" onPress={() => void logout()}>
        Log out
      </AppButton>
    </ScrollView>
  );
}
