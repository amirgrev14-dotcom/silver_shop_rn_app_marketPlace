import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { AppCard } from "@/components/ui/app-card";
import { AuthImageCard } from "@/components/ui/auth-image-card";
import { Grid2X2Check, ShieldCheck, Sparkles } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { ScreenLoader } from "@/components/ui/screen-loader";
interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const featuresIcons = [
  {
    icon: ShieldCheck,
    title: "Trusted Community",
    description: "Buy and sell safely with verified users.",
  },
  {
    icon: Sparkles,
    title: "Beautiful Silver Items",
    description: "Discover unique and handcrafted pieces.",
  },
  {
    icon: Grid2X2Check,
    title: "Easy & Secure",
    description: "Chat, pay and track orders with confidence.",
  },
] as const;

export function WelcomeScreen({
  onGetStarted,
  onLogin,
}: WelcomeScreenProps): React.JSX.Element {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (navigate: () => void) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => navigate(), 400);
  };

  return (
    <SafeAreaView className="flex-1 bg-app" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerClassName="flex-grow px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Image overlay Sliver necklace */}
        <View className="absolute top-20 bottom-0 right-0 left-0">
          <AuthImageCard
            className="rounded-none border-0 opacity-80"
            size="full"
            accessibilityLabel="Silver necklace on white textile"
            source={require("../../../../assets/images/welcome-silver-necklace.jpg")}
          />
        </View>

        <View className="w-full max-w-[250px] self-center">
          {/* Sliver logo */}
          <View className="items-center flex-row gap-4 mt-8 items-left">
            <AuthImageCard
              size="logo"
              accessibilityLabel="Silver necklace on white textile"
              source={require("../../../../assets/images/bg-logo-silver-big.png")}
            />

            <Text className="text-4xl font-semibold tracking-tight text-text-primary">
              Sliver
            </Text>
          </View>

          <Text className="mt-3 text-xl leading-7 text-black font-semibold text-balance">
            Buy and sell silver items between people.
          </Text>

          <View className="mt-4">
            {featuresIcons.map((feature) => (
              <AppCard
                key={feature.title}
                variant="ghost"
                className="flex-row items-center gap-5 px-0 py-3"
              >
                <AppIcon
                  icon={feature.icon}
                  size={30}
                  color="primary"
                  className="bg-[#e7e5eea8] p-3 rounded-md"
                />

                <View className="flex-1">
                  <Text className="text-md font-bold text-text-primary">
                    {feature.title}
                  </Text>

                  <Text className="mt-1 text-base leading-5 text-text-secondary text-balance">
                    {feature.description}
                  </Text>
                </View>
              </AppCard>
            ))}
          </View>

          <View className="items-center mt-10 gap-2">
            <AppButton onPress={() => handleNavigate(onGetStarted)}>
              Get Started
            </AppButton>
            <AppButton variant="ghost" onPress={() => handleNavigate(onLogin)}>
              I already have an account
            </AppButton>
          </View>
        </View>
      </ScrollView>
      {isNavigating && <ScreenLoader />}
    </SafeAreaView>
  );
}
