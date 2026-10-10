import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePathname, useRouter } from "expo-router";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bottomNav}>

      {/* Home */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/")}
      >
        <Text
          style={[
            styles.navIcon,
            pathname === "/" && styles.activeNavIcon,
          ]}
        >
          🏠
        </Text>

        <Text
          style={[
            styles.navText,
            pathname === "/" && styles.activeNavText,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>


      {/* History */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/history")}
      >
        <Text
          style={[
            styles.navIcon,
            pathname === "/history" && styles.activeNavIcon,
          ]}
        >
          🕘
        </Text>

        <Text
          style={[
            styles.navText,
            pathname === "/history" && styles.activeNavText,
          ]}
        >
          History
        </Text>
      </TouchableOpacity>


      {/* Safe Zones */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/safe-zones")}
      >
        <Text
          style={[
            styles.navIcon,
            pathname === "/safe-zones" && styles.activeNavIcon,
          ]}
        >
          🛡️
        </Text>

        <Text
          style={[
            styles.navText,
            pathname === "/safe-zones" && styles.activeNavText,
          ]}
        >
          Zones
        </Text>
      </TouchableOpacity>


      {/* SOS */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/sos")}
      >
        <Text
          style={[
            styles.navIcon,
            pathname === "/sos" && styles.activeNavIcon,
          ]}
        >
          🚨
        </Text>

        <Text
          style={[
            styles.navText,
            pathname === "/sos" && styles.activeNavText,
          ]}
        >
          SOS
        </Text>
      </TouchableOpacity>


      {/* Settings */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/settings")}
      >
        <Text
          style={[
            styles.navIcon,
            pathname === "/settings" && styles.activeNavIcon,
          ]}
        >
          ⚙️
        </Text>

        <Text
          style={[
            styles.navText,
            pathname === "/settings" && styles.activeNavText,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

  bottomNav: {
    height: 75,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },

  activeNavIcon: {
    opacity: 1,
  },

  navText: {
    fontSize: 10,
    color: "#64748B",
  },

  activeNavText: {
    color: "#4F46E5",
    fontWeight: "700",
  },

});