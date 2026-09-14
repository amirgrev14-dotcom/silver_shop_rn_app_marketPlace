import { useState } from "react";
import { useRouter } from "expo-router";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { WelcomeScreen } from "./welcome-screen";

export type AuthScreen = "welcome" | "register" | "login";

interface AuthEntryScreenProps {
  onVerified?: () => void;
}

/**
 * Local-only auth-flow shell for Welcome / Login / Register.
 * Email verification lives on its own route (`/verify-email`) so that
 * both the in-flow screen and a cold start via magic link land on the
 * same single screen.
 */
export function AuthEntryScreen({ onVerified }: AuthEntryScreenProps = {}): React.JSX.Element {
  const [screen, setScreen] = useState<AuthScreen>("welcome");
  const router = useRouter();

  const requireVerification = (email: string) => {
    onVerified?.();
    if (__DEV__) console.log("[auth] → /verify-email for", email);
    router.push({ pathname: "/verify-email", params: { email } });
  };

  switch (screen) {
    case "login":
      return (
        <LoginForm
          onBack={() => setScreen("welcome")}
          onRegister={() => setScreen("register")}
          onRequireVerification={requireVerification}
        />
      );

    case "register":
      return (
        <RegisterForm
          onBack={() => setScreen("welcome")}
          onLogin={() => setScreen("login")}
          onRequireVerification={requireVerification}
        />
      );

    default:
      return (
        <WelcomeScreen
          onGetStarted={() => setScreen("register")}
          onLogin={() => setScreen("login")}
        />
      );
  }
}
