import * as Linking from "expo-linking";
import { ArrowLeft, CircleCheck, MailCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppTextLink } from "@/components/ui/app-text-link";
import { AuthImageCard } from "@/components/ui/auth-image-card";
import { ScreenLoader } from "@/components/ui/screen-loader";
import {
  getMe,
  parseVerificationLink,
  resendVerificationCode,
  verifyEmail,
} from "@/features/auth/services/auth-service";
import { useAppStore } from "@/stores/app-store";

const RESEND_COOLDOWN = 60;

type VerifyStatus = "idle" | "verifying" | "verified" | "error";

interface VerifyEmailFormProps {
  email: string;
  onBack: () => void;
  onVerified: () => void;
  onChangeEmail: () => void;
}

/**
 * Magic-link flow: no codes. The user taps the link in their inbox
 * (token + user id), the app opens via deep link and confirms automatically.
 * This screen explains that and handles resend / manual status check.
 */
export function VerifyEmailForm({
  email,
  onBack,
  onVerified,
  onChangeEmail,
}: VerifyEmailFormProps): React.JSX.Element {
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const incomingUrl = Linking.useURL();
  const setEmailVerified = useAppStore((s) => s.setEmailVerified);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const confirmWithLink = async (url: string) => {
    const linkParams = parseVerificationLink(url);
    if (!linkParams ) return;
    setStatus("verifying");
    setError(null);
    try {
      await verifyEmail(linkParams);
      setEmailVerified(true);
      setStatus("verified");
      onVerified();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  // Auto-confirm when the app is opened via the magic link.
  useEffect(() => {
    if (incomingUrl) {
      void confirmWithLink(incomingUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingUrl]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await resendVerificationCode(email);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the link.");
    } finally {
      setIsResending(false);
    }
  };

  /** Manual fallback: user tapped the link on another device, then returns here. */
  const handleCheckStatus = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setError(null);
    try {
      const { user } = await getMe();
      if (user.isVerifiedEmail) {
        setEmailVerified(true);
        setStatus("verified");
        onVerified();
      } else {
        setError("Email is not confirmed yet. Please tap the link in your inbox.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check status.");
    } finally {
      setIsChecking(false);
    }
  };

  const busy = status === "verifying" || isChecking || isResending;

  return (
    <SafeAreaView className="flex-1 bg-app" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerClassName="flex-grow px-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="absolute top-20 bottom-0 right-0 left-0">
          <AuthImageCard
            className="rounded-none border-0 opacity-80"
            size="full"
            accessibilityLabel="Silver necklace on white textile"
            source={require("../../../../assets/images/welcome-silver-necklace.jpg")}
          />
        </View>

        <View className="w-full max-w-[340px] self-center py-8">
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            className="flex-row items-center gap-2 self-start"
          >
            <AppIcon icon={ArrowLeft} size={20} color="primary" />
            <Text className="text-base font-medium text-primary">Back</Text>
          </Pressable>

          <View className="mt-8 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface">
              <AppIcon
                icon={status === "verified" ? CircleCheck : MailCheck}
                size={30}
                color="primary"
              />
            </View>
            <Text className="mt-4 text-center text-3xl font-semibold tracking-tight text-text-primary">
              {status === "verified" ? "Email verified" : "Check your inbox"}
            </Text>
            <Text className="mt-2 text-center text-base leading-6 text-text-secondary text-balance">
              {status === "verified"
                ? "Your email is confirmed. You can continue using the app."
                : `We sent a confirmation link to\n`}
              {status !== "verified" ? (
                <Text className="font-semibold text-text-primary">{email}</Text>
              ) : null}
            </Text>
            {status !== "verified" ? (
              <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                Tap the link in the email and the app will confirm your account
                automatically.
              </Text>
            ) : null}
          </View>

          {error ? (
            <Text className="mt-4 text-center text-sm text-error">{error}</Text>
          ) : null}

          <View className="mt-6 gap-4">
            {status !== "verified" ? (
              <>
                <AppButton onPress={handleCheckStatus} loading={isChecking}>
                  I tapped the link — continue
                </AppButton>

                <View className="items-center">
                  {cooldown > 0 ? (
                    <Text className="text-sm text-text-muted">
                      Resend link in 0:{String(cooldown).padStart(2, "0")}
                    </Text>
                  ) : (
                    <AppTextLink
                      label="Didn't get the email?"
                      linkLabel={isResending ? "Sending..." : "Resend link"}
                      onPress={handleResend}
                    />
                  )}
                </View>

                <View className="items-center">
                  <AppTextLink
                    label="Wrong email?"
                    linkLabel="Change email"
                    onPress={onChangeEmail}
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
      {busy && <ScreenLoader />}
    </SafeAreaView>
  );
}
