import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/components/app-providers";
import "../global.css";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout(): React.JSX.Element {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
      </Stack>
      <StatusBar style="dark" />
    </AppProviders>
  );
}