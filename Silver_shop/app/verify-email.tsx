import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { ScreenLoader } from "@/components/ui/screen-loader";
import {
  parseVerificationLink,
  verifyEmail,
} from "@/features/auth/services/auth-service";
import { useAppStore } from "@/stores/app-store";

/** Deep-link entry: `silvershop://verify-email?token=…&id=…`. Confirms and goes home. */
export default function VerifyEmailRoute(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; id?: string; userId?: string }>();
  const setEmailVerified = useAppStore((s) => s.setEmailVerified);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const confirm = async () => {
      // expo-router params first, raw URL as fallback.
      const id = params.id ?? params.userId;
      const link =
        params.token && id
          ? { token: params.token, id }
          : parseVerificationLink((await Linking.getInitialURL()) ?? "");

      if (!link) {
        setError("This verification link is invalid or expired.");
        return;
      }

      try {
        await verifyEmail(link);
        setEmailVerified(true);
        setDone(true);
        setTimeout(() => router.replace("/"), 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    };

    void confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-app" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center gap-4 px-8">
        {error ? (
          <>
            <Text className="text-center text-xl font-semibold text-text-primary">
              Verification failed
            </Text>
            <Text className="text-center text-base text-error">{error}</Text>
            <AppButton onPress={() => router.replace("/")}>Back to home</AppButton>
          </>
        ) : done ? (
          <Text className="text-center text-xl font-semibold text-text-primary">
            Email verified. Welcome!
          </Text>
        ) : (
          <>
            <Text className="text-center text-xl font-semibold text-text-primary">
              Confirming your email…
            </Text>
            <ScreenLoader />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
