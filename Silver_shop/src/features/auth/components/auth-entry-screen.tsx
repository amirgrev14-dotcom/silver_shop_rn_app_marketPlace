import { useState } from "react";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { VerifyEmailForm } from "./verify-email-form";
import { WelcomeScreen } from "./welcome-screen";

export type AuthScreen = "welcome" | "register" | "login" | "verify-email";

interface AuthEntryScreenProps {
  onVerified?: () => void;
}

/**
 * Local-only auth-flow shell. Switches between Welcome, Login, Register
 * and VerifyEmail using local state; no navigation or persistence is
 * intentionally performed at this stage.
 */
export function AuthEntryScreen({ onVerified }: AuthEntryScreenProps = {}): React.JSX.Element {
  const [screen, setScreen] = useState<AuthScreen>("welcome");
  const [pendingEmail, setPendingEmail] = useState("");

  const requireVerification = (email: string) => {
    setPendingEmail(email);
    setScreen("verify-email");
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

    case "verify-email":
      return (
        <VerifyEmailForm
          email={pendingEmail}
          onBack={() => setScreen("login")}
          onChangeEmail={() => setScreen("register")}
          onVerified={() => onVerified?.()}
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
