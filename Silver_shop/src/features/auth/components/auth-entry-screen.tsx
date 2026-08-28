import { useState } from "react";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { WelcomeScreen } from "./welcome-screen";

export type AuthScreen = "welcome" | "register" | "login";

/**
 * Local-only auth-flow shell. Switches between Welcome, Login and Register
 * using local state; no navigation or persistence is intentionally performed
 * at this stage.
 */
export function AuthEntryScreen(): React.JSX.Element {
  const [screen, setScreen] = useState<AuthScreen>("welcome");

  switch (screen) {
    case "login":
      return (
        <LoginForm
          onBack={() => setScreen("welcome")}
          onRegister={() => setScreen("register")}
        />
      );

    case "register":
      return (
        <RegisterForm
          onBack={() => setScreen("welcome")}
          onLogin={() => setScreen("login")}
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
