import { ScrollView, Text, View } from "react-native";
import {
  Award,
  Clock,
  Coins,
  Gem,
  Lamp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";

import { AppCard } from "@/components/ui/app-card";
import { AppIcon } from "@/components/ui/app-icon";

interface Category {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { title: "Jewelry", subtitle: "Rings, chains, bracelets", icon: Gem },
  { title: "Watches", subtitle: "Pocket & wrist watches", icon: Clock },
  { title: "Coins", subtitle: "Collectible & bullion", icon: Coins },
  { title: "Tableware", subtitle: "Cutlery, trays, cups", icon: UtensilsCrossed },
  { title: "Decor", subtitle: "Figurines, vases, frames", icon: Lamp },
  { title: "Vintage", subtitle: "Antique finds", icon: Award },
];

export function CategoriesTab(): React.JSX.Element {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-6 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold tracking-tight text-text-primary">
        Categories
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {CATEGORIES.map((category) => (
          <View key={category.title} className="w-[47%]">
            <AppCard className="items-center gap-2 py-5">
              <AppIcon icon={category.icon} size={28} color="primary" />
              <Text className="text-base font-semibold text-text-primary">
                {category.title}
              </Text>
              <Text className="text-center text-xs leading-4 text-text-muted">
                {category.subtitle}
              </Text>
            </AppCard>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
