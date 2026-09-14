import { ArrowLeft, Eye, EyeOff, LockKeyhole, LockKeyholeOpen, LockKeyholeOpenIcon, ShoppingBag, Store } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { register as registerUser } from "@/features/auth/services/auth-service";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAppStore } from "@/stores/app-store";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import { AppTextLink } from "@/components/ui/app-text-link";
import { AuthImageCard } from "@/components/ui/auth-image-card";
import { ScreenLoader } from "@/components/ui/screen-loader";
import {
  registerSchema,
  type RegisterFormInput,
} from "@/features/auth/schemas/auth.schema";
import { getPostAuthDestination, roleToMode } from "@/features/auth/lib/post-auth";

interface RegisterFormProps {
  onBack: () => void;
  onLogin: () => void;
  onRequireVerification?: (email: string) => void;
}

export function RegisterForm({
  onBack,
  onLogin,
  onRequireVerification,
}: RegisterFormProps): React.JSX.Element {
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
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "buyer",
    },
  });

  const ROLE_CARDS = [
    { role: "buyer", title: "Buyer", subtitle: "I want to buy silver", icon: ShoppingBag },
    { role: "seller", title: "Seller", subtitle: "I want to sell silver", icon: Store },
  ] as const;

  const name = watch("name")
  const email = watch("email")
  const password = watch("password")

  const handleNavigate = (navigate: () => void) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => navigate(), 400);
  };

  const onSubmit = async (data: RegisterFormInput) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setServerError(null);
    try {
      const authResponse = await registerUser(data);

      // Tab mode follows the DB role (source of truth), not the local pick.
      useAppStore.getState().setMode(roleToMode(authResponse.user.role));

      // Use the actual auth response data to login, not empty strings
      useAppStore.getState().login(
        authResponse.accessToken,
        authResponse.refreshToken,
        authResponse.user
      );

      const destination = getPostAuthDestination(authResponse.user);
      if (__DEV__) {
        console.log(
          "[auth] register ok:",
          JSON.stringify({
            email: authResponse.user.email,
            isVerifiedEmail: authResponse.user.isVerifiedEmail,
            destination: destination?.pathname ?? "(stay)",
          })
        );
      }
      if (destination) {
        onRequireVerification?.(destination.params.email);
        return;
      }

    //  handleNavigate(onHome);

     // Reset the form
      setValue("email", "");
      setValue("password", "");
      setValue("confirmPassword", "");
      setValue("name", "");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
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
            source={require("../../../assets/images/welcome-silver-necklace.jpg")}
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
              Create your account
            </Text>
            <Text className="mt-2 text-base leading-6 text-text-secondary text-balance">
              Join the Sliver community and start buying and selling silver
              items.
            </Text>
          </View>

          <View className="mt-8">
            <Text className="mb-3 text-sm font-medium text-text-primary">
              I join as
            </Text>
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-3">
                  {ROLE_CARDS.map((card) => {
                    const isActive = value === card.role;
                    return (
                      <Pressable
                        key={card.role}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isActive }}
                        onPress={() => onChange(card.role)}
                        className={`flex-1 flex-row items-center gap-3 rounded-[14px] border p-3 active:opacity-70 ${
                          isActive
                            ? "border-primary bg-surface"
                            : "border-border bg-surface"
                        }`}
                      >
                        <View
                          className={`h-11 w-11 items-center justify-center rounded-xl ${
                            isActive ? "bg-primary" : "bg-silver-light"
                          }`}
                        >
                          <AppIcon
                            icon={card.icon}
                            size={22}
                            color={isActive ? "white" : "primary"}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[15px] font-bold text-text-primary">
                            {card.title}
                          </Text>
                          <Text className="text-xs leading-4 text-text-muted">
                            {card.subtitle}
                          </Text>
                        </View>
                        <View
                          className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isActive ? "border-primary" : "border-border"
                          }`}
                        >
                          {isActive ? (
                            <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
            {errors.role?.message ? (
              <Text className="mt-2 text-sm text-error">{errors.role.message}</Text>
            ) : null}
          </View>

          <View className="mt-8 gap-4">

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  label="Full name"
                  placeholder="John Smith"
                  autoCapitalize="words"
                  autoComplete="name"
                  error={errors.name?.message}
                 
                />
              )}
            />

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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                label="Confirm password"
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
                error={errors.confirmPassword?.message}
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
              Create Account
            </AppButton>

            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border" />
              <Text className="text-sm text-text-muted">OR</Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            <View className="flex items-center mt-2">
              <AppTextLink
                linkClassName="text-[15px] font-bold"
                label="Already have an account?"
                onPress={() => handleNavigate(onLogin)}
                linkLabel="Sign in"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {isNavigating && <ScreenLoader />}
    </SafeAreaView>
  );
}