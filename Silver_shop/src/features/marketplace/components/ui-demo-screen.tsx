import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppInput } from "@/components/ui/app-input";
import { IconButton } from "@/components/ui/icon-button";
import { ProductCard } from "@/components/ui/product-card";
import { colors } from "@/components/ui/theme";

const colorTokens = [
  ["Primary", colors.primary],
  ["Primary light", colors.primaryLight],
  ["Silver", colors.silver],
  ["Surface", colors.surface],
  ["Success", colors.success],
  ["Error", colors.error],
] as const;

export function UiDemoScreen(): React.JSX.Element {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-app" edges={["top"]}>
      <ScrollView
        contentContainerClassName="gap-8 px-5 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-3xl font-bold tracking-tight text-text-primary">
            SLIVER
          </Text>
          <Text className="mt-1 text-sm font-semibold tracking-[2px] text-primary">
            UI COMPONENTS
          </Text>
          <Text className="mt-3 text-base leading-6 text-text-secondary">
            A light, premium foundation for buying and selling silver items.
          </Text>
        </View>

        <DemoSection title="COLORS">
          <View className="flex-row flex-wrap gap-3">
            {colorTokens.map(([name, color]) => (
              <View key={name} className="w-[30%] gap-2">
                <View
                  style={{ backgroundColor: color }}
                  className="h-14 rounded-[14px] border border-border-light"
                />
                <Text numberOfLines={1} className="text-xs text-text-secondary">
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </DemoSection>

        <DemoSection title="BUTTONS">
          <View className="gap-3">
            <AppButton onPress={() => undefined}>Continue</AppButton>
            <AppButton variant="secondary" onPress={() => undefined}>
              Create listing
            </AppButton>
            <AppButton
              fullWidth={false}
              variant="ghost"
              onPress={() => undefined}
            >
              View details
            </AppButton>
            <AppButton disabled>Disabled button</AppButton>
          </View>
        </DemoSection>

        <DemoSection title="INPUTS">
          <View className="gap-4">
            <AppInput
              label="Your name"
              leftIcon={
                <Feather color={colors.textMuted} name="user" size={18} />
              }
              onChangeText={setName}
              placeholder="Enter your name"
              value={name}
            />
            <AppInput
              label="Password"
              rightIcon={
                <Feather color={colors.textMuted} name="lock" size={18} />
              }
              onChangeText={setPassword}
              placeholder="Enter a password"
              secureTextEntry
              value={password}
            />
            <AppInput
              error="Please enter a valid email address"
              label="Email"
              placeholder="name@example.com"
            />
          </View>
        </DemoSection>

        <DemoSection title="CARDS">
          <AppCard>
            <Text className="text-lg font-semibold text-text-primary">
              Simple and considered
            </Text>
            <Text className="mt-2 text-base leading-6 text-text-secondary">
              Reusable cards keep future Sliver screens airy, clear and
              comfortably spaced.
            </Text>
          </AppCard>
        </DemoSection>

        <AppCard variant="ghost">
          <Text className="text-lg bg-transparent font-semibold text-text-primary">
            Simple and considered
          </Text>
          <Text className="mt-2 text-base bg-transparent leading-6 text-text-secondary">
            Reusable cards keep future Sliver screens airy, clear and
            comfortably spaced.
          </Text>
        </AppCard>

        <DemoSection title="PRODUCT CARD">
          <ProductCard
            imageSource={require("../../../../assets/images/logo-glow.png")}
            isFavorite={isFavorite}
            onFavoritePress={() => setIsFavorite((value) => !value)}
            onPress={() => undefined}
            price="$28.00"
            subtitle="925 sterling silver"
            title="Moonstone pendant "
          />
        </DemoSection>

        <DemoSection title="ICON BUTTONS">
          <View className="flex-row flex-wrap gap-3">
            <IconButton
              accessibilityLabel="Notifications"
              icon="bell"
              onPress={() => undefined}
            />
            <IconButton
              accessibilityLabel="Cart"
              icon="shopping-bag"
              onPress={() => undefined}
            />
            <IconButton
              active
              accessibilityLabel="Favorite"
              icon="heart"
              onPress={() => undefined}
            />
            <IconButton
              accessibilityLabel="Back"
              icon="arrow-left"
              onPress={() => undefined}
            />
            <IconButton
              accessibilityLabel="Settings"
              icon="settings"
              onPress={() => undefined}
            />
          </View>
        </DemoSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function DemoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View className="gap-4">
      <Text className="text-xs font-bold tracking-[1.6px]  text-text-secondary">
        {title}
      </Text>
      {children}
    </View>
  );
}
