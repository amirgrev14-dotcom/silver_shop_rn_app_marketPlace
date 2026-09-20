import {
  ChevronRight,
  CreditCard,
  Heart,
  LifeBuoy,
  MapPin,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react-native";
import {Pressable, ScrollView, View} from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppIcon } from "@/components/ui/app-icon";
import { CircleIconButton } from "@/components/ui/circle-icon-button";
import { MenuRow } from "@/components/ui/menu-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { MOCK_PROFILE } from "@/features/marketplace/mock-data";
import type { MarketplaceMode } from "@/features/marketplace/types";
import { useAppStore } from "@/stores/app-store";

const MENU_ITEMS: { title: string; icon: LucideIcon }[] = [
  { title: "My Orders", icon: ReceiptText },
  { title: "My Listings", icon: ShoppingBag },
  { title: "Saved Items", icon: Heart },
  { title: "Payment Methods", icon: CreditCard },
  { title: "Addresses", icon: MapPin },
  { title: "Settings", icon: Settings },
  { title: "Help & Support", icon: LifeBuoy },
];

const MODE_CARDS: { mode: MarketplaceMode; title: string; subtitle: string; icon: typeof Store }[] = [
  { mode: "buyer", title: "Buyer", subtitle: "Browse & buy silver", icon: ShoppingBag },
  { mode: "seller", title: "Seller", subtitle: "Sell & chat with buyers", icon: Store },
];

export function ProfileTab({ onSavedPress }: { onSavedPress?: () => void }): React.JSX.Element {
  const user = useAppStore((s) => s.user);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const logout = useAppStore((s) => s.logout);

  const displayName = user?.name ?? MOCK_PROFILE.name;
  const initial = (displayName || "?").slice(0, 1).toUpperCase();
  const stats = [
    { value: String(MOCK_PROFILE.stats.listings), label: "Listings" },
    { value: String(MOCK_PROFILE.stats.reviews), label: "Reviews" },
    { value: String(MOCK_PROFILE.stats.orders), label: "Orders" },
  ];

  return (
    <ScrollView
      contentContainerClassName="gap-5 px-5 pb-6 pt-4"
      showsVerticalScrollIndicator={false}
      className="bg-[#F8F8FB]"
    >
      <ScreenHeader
        title="Profile"
        titleAlign="left"
        accentFirstLetter
        titleClassName="text-2xl"
        right={<CircleIconButton icon={Settings} accessibilityLabel="Settings" />}
      />

      {/* User card */}
      <AppCard className="flex-row items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
          <AppText className="text-2xl font-bold text-white">{initial}</AppText>
        </View>
        <View className="flex-1 gap-1">
          <AppText className="text-lg font-bold text-text-primary">{displayName}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View profile"
            className="flex-row items-center gap-1 self-start active:opacity-70"
          >
            <AppText className="text-sm font-semibold text-primary">View Profile</AppText>
            <AppIcon icon={ChevronRight} size={16} color="primary" />
          </Pressable>
        </View>
      </AppCard>

      {/* Stats */}
      <AppCard className="flex-row">
        {stats.map((stat, index) => (
          <View
            key={stat.label}
            className={`flex-1 items-center gap-1 ${index > 0 ? "border-l border-border-light" : ""}`}
          >
            <AppText className="text-xl font-bold text-text-primary">{stat.value}</AppText>
            <AppText className="text-sm text-text-secondary">{stat.label}</AppText>
          </View>
        ))}
      </AppCard>

      {/* Menu */}
      <AppCard>
        {MENU_ITEMS.map((item, index) => (
          <MenuRow
            key={item.title}
            icon={item.icon}
            title={item.title}
            onPress={item.title === "Saved Items" ? onSavedPress : undefined}
            showDivider={index < MENU_ITEMS.length - 1}
          />
        ))}
      </AppCard>

      {/* Account type (keeps seller mode reachable; UI stays in the design system). */}
      <View>
        <AppText className="mb-2 text-sm font-semibold text-text-secondary">
          I use Silver Shop as
        </AppText>
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
                <AppText className="mt-2 text-base font-bold text-text-primary">
                  {card.title}
                </AppText>
                <AppText className="text-xs leading-4 text-text-muted">
                  {card.subtitle}
                </AppText>
                {isActive ? (
                  <AppText className="mt-1 text-xs font-bold text-primary">● Active</AppText>
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
