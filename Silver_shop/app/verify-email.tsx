import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CircleCheck, MailCheck } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
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
import type { VerifyEmailValues } from "@/features/auth/types";
import { useAppStore } from "@/stores/app-store";

const RESEND_COOLDOWN = 60;
const HOME_REDIRECT_DELAY = 1200;

type VerifyStatus = "idle" | "verifying" | "verified" | "error";

/** expo-router may hand a param as `string[]`; the link needs the first one. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * THE single email-verification screen.
 *
 * Reached two ways, handled identically:
 *  - in-flow: after register/login via router (`/verify-email?email=…`);
 *  - cold start: tapping the magic link while the app is killed.
 * The link (token + user id) is picked up and confirmed automatically.
 * Nothing is sent until the user requests the link.
 */
export default function VerifyEmailRoute(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const incomingUrl = Linking.useURL();
  const setEmailVerified = useAppStore((s) => s.setEmailVerified);

  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [linkSent, setLinkSent] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  // Guards: one attempt per link (no double API calls), retry allowed on error.
  const triedKeysRef = useRef<Set<string>>(new Set());
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const email = confirmedEmail ?? first(params.email) ?? "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const goHome = useCallback(() => {
    redirectTimerRef.current = setTimeout(() => router.replace("/"), HOME_REDIRECT_DELAY);
  }, [router]);

  const confirmWithValues = useCallback(
    async (values: VerifyEmailValues) => {
      const key = `${values.token}:${values.id}`;
      if (triedKeysRef.current.has(key)) return;
      triedKeysRef.current.add(key);

      setStatus("verifying");
      setError(null);
      try {
        const result = await verifyEmail(values);
        
        if (result.email) setConfirmedEmail(result.email);
        setEmailVerified(true);
        setStatus("verified");
        goHome();
      } catch (err) {
        triedKeysRef.current.delete(key);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    },
    [goHome, setEmailVerified]
  );

  // Cold start / direct open: route params first, raw initial URL as fallback.
  const routeToken = first(params.token);
  const routeId = first(params.id) ?? first(params.userId);

  useEffect(() => {
    if (routeToken && routeId) {
      void confirmWithValues({ token: routeToken, id: routeId });
      return;
    }
    void Linking.getInitialURL().then((url) => {
      const link = url ? parseVerificationLink(url) : null;
      if (link) void confirmWithValues(link);
    });
  }, [routeToken, routeId, confirmWithValues]);

  // Warm start: link tapped while the app is already open.
  useEffect(() => {
    if (!incomingUrl) return;
    const link = parseVerificationLink(incomingUrl);
    if (link) void confirmWithValues(link);
  }, [incomingUrl, confirmWithValues]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setIsResending(true);
    setError(null);
    try {
      await resendVerificationCode(email);
      setLinkSent(true);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the link.");
    } finally {
      setIsResending(false);
    }
  };

  /** Manual fallback: link was tapped on another device. */
  const handleCheckStatus = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setError(null);
    try {
      const { user } = await getMe();
      if (user.isVerifiedEmail) {
        setEmailVerified(true);
        setStatus("verified");
        goHome();
      } else {
        setError("Email is not confirmed yet. Please tap the link in your inbox.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check status.");
    } finally {
      setIsChecking(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const busy = status === "verifying" || isChecking || isResending;
  const showActions = status !== "verified" && status !== "verifying";

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
            source={require("../assets/images/welcome-silver-necklace.jpg")}
          />
        </View>

        <View className="w-full max-w-[340px] self-center py-8">
          <Pressable
            accessibilityRole="button"
            onPress={goBack}
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
              {status === "verified"
                ? "Email verified"
                : status === "verifying"
                  ? "Confirming…"
                  : "Check your inbox"}
            </Text>
            {status !== "verified" && email ? (
              <>
                <Text className="mt-2 text-center text-base leading-6 text-text-secondary text-balance">
                  {linkSent ? "We sent a confirmation link to\n" : "Send a confirmation link to\n"}
                  <Text className="font-semibold text-text-primary">{email}</Text>
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                  {linkSent
                    ? "Tap the link in the email and the app will confirm your account automatically."
                    : "Press below to send the link, then tap it in your email."}
                </Text>
              </>
            ) : null}
            {status === "verified" ? (
              <Text className="mt-2 text-center text-base leading-6 text-text-secondary">
                Your email is confirmed. You can continue using the app.
              </Text>
            ) : null}
          </View>

          {error ? (
            <Text className="mt-4 text-center text-sm text-error">{error}</Text>
          ) : null}

          {showActions ? (
            <View className="mt-6 gap-4">
              <AppButton onPress={handleCheckStatus} loading={isChecking}>
                I tapped the link — continue
              </AppButton>

              {email ? (
                <View className="items-center">
                  {!linkSent ? (
                    <AppTextLink
                      label="No email yet?"
                      linkLabel={isResending ? "Sending..." : "Send verification link"}
                      onPress={handleResend}
                    />
                  ) : cooldown > 0 ? (
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
              ) : null}

              <View className="items-center">
                <AppTextLink
                  label="Wrong email?"
                  linkLabel="Change email"
                  onPress={goBack}
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
      {busy && <ScreenLoader />}
    </SafeAreaView>
  );
}
