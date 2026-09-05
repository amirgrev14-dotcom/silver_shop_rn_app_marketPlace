import { ArrowLeft, Eye, EyeOff, LockKeyhole, LockKeyholeIcon, LockKeyholeOpen, LockKeyholeOpenIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { login } from "@/features/auth/services/auth-service";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAppStore } from "@/stores/app-store";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import { AppTextLink } from "@/components/ui/app-text-link";
import { AuthImageCard } from "@/components/ui/auth-image-card";
import { ScreenLoader } from "@/components/ui/screen-loader";
import {
  loginSchema,
  type LoginFormData,
} from "../schemas/auth.schema";

interface LoginFormProps {
  onBack: () => void;
  onRegister: () => void;
  onRequireVerification?: (email: string) => void;
}

export function LoginForm({
  onBack,
  onRegister,
  onRequireVerification,
}: LoginFormProps): React.JSX.Element {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

   const {
      control,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
  
      defaultValues: {
        email: "",
        password: "",
      },
    });
  

  const email = watch("email")
  const password = watch("password")

  const handleNavigate = (navigate: () => void) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => navigate(), 400);
  };

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setServerError(null);
    try {
      const authResponse = await login(data);

      useAppStore.getState().login(
        authResponse.accessToken,
        authResponse.refreshToken,
        authResponse.user
      );

      if (!authResponse.user.isVerifiedEmail) {
        onRequireVerification?.(authResponse.user.email);
        return;
      }

      // handleNavigate(onHome)\;
      setValue("email", "");
      setValue("password", "");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <View className="mt-8">
            <Text className="text-3xl font-semibold tracking-tight text-text-primary">
              Welcome back
            </Text>
            <Text className="mt-2 text-base leading-6 text-text-secondary text-balance">
              Sign in to continue buying and selling silver items.
            </Text>
          </View>

          <View className="mt-8 gap-4">
            
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                label="Email"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email?.message}
              />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                label="Password"
                placeholder="••••••••••"
                rightIcon={
                  <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <AppIcon
                      icon={isPasswordVisible ? LockKeyholeOpenIcon : LockKeyhole}
                      size={20}
                      color="primary"
                    />
                  </Pressable>
                }
                secureTextEntry={!isPasswordVisible}
                error={errors.password?.message}
                />
              )}
            />

            <Text className="self-end text-sm font-medium text-primary">
              Forgot password?
            </Text>
          </View>

          <View className="mt-6 gap-4">
            {serverError ? (
              <Text className="text-center text-sm text-error">{serverError}</Text>
            ) : null}
            <AppButton onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
              Sign In
            </AppButton>

            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border" />
              <Text className="text-sm text-text-muted">OR</Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            <View className="flex items-center mt-2">
              <AppTextLink
                linkClassName="text-[15px] font-bold"
                label="Don't have an account?"
                onPress={() => handleNavigate(onRegister)}
                linkLabel="Sign up"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {isNavigating && <ScreenLoader />}
    </SafeAreaView>
  );
}