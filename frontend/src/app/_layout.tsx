
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Slot,
  usePathname,
  useRouter,
} from "expo-router";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");

        const isAuthScreen =
          pathname === "/login" || pathname === "/signup";

        if (token && isAuthScreen) {
          router.replace("/");
        } else if (!token && !isAuthScreen) {
          router.replace("/login");
        }
      } catch (error) {
        console.log("Authentication check failed:", error);
        router.replace("/login");
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />
      {checkingAuth ? null : <Slot />}
    </ThemeProvider>
  );
}

