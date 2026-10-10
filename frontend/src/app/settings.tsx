import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

import BottomNav from "@/components/BottomNav";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("authToken");
              router.replace("/login");
            } catch (error) {
              Alert.alert(
                "Error",
                "Could not logout. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Settings
          </Text>

          <Text style={styles.subtitle}>
            Manage your Child Tracker
          </Text>
        </View>


        {/* Profile */}
        <View style={styles.profileCard}>

          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              D
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Devraj
            </Text>

            <Text style={styles.profileEmail}>
              Parent Account
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>

        </View>


        {/* Preferences */}
        <Text style={styles.sectionTitle}>
          Preferences
        </Text>


        {/* Notifications */}
        <View style={styles.settingCard}>

          <View style={styles.settingIconContainer}>
            <Text style={styles.settingIcon}>
              🔔
            </Text>
          </View>

          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              Notifications
            </Text>

            <Text style={styles.settingDescription}>
              Receive alerts and updates
            </Text>
          </View>

          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{
              false: "#CBD5E1",
              true: "#A5B4FC",
            }}
            thumbColor={
              notifications ? "#4F46E5" : "#F8FAFC"
            }
          />

        </View>


        {/* Location Tracking */}
        <View style={styles.settingCard}>

          <View style={styles.settingIconContainer}>
            <Text style={styles.settingIcon}>
              📍
            </Text>
          </View>

          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              Location Tracking
            </Text>

            <Text style={styles.settingDescription}>
              Track your child's location
            </Text>
          </View>

          <Switch
            value={locationTracking}
            onValueChange={setLocationTracking}
            trackColor={{
              false: "#CBD5E1",
              true: "#A5B4FC",
            }}
            thumbColor={
              locationTracking ? "#4F46E5" : "#F8FAFC"
            }
          />

        </View>


        {/* Device */}
        <Text style={styles.sectionTitle}>
          Device
        </Text>


        <TouchableOpacity style={styles.menuCard}>

          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>
              📱
            </Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Device Information
            </Text>

            <Text style={styles.menuDescription}>
              Battery, GPS and connection status
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>

        </TouchableOpacity>


        {/* Security */}
        <Text style={styles.sectionTitle}>
          Security
        </Text>


        <TouchableOpacity style={styles.menuCard}>

          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>
              🔐
            </Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Security
            </Text>

            <Text style={styles.menuDescription}>
              Password and account security
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>

        </TouchableOpacity>


        {/* About */}
        <Text style={styles.sectionTitle}>
          About
        </Text>


        <TouchableOpacity style={styles.menuCard}>

          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>
              ℹ️
            </Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              About Child Tracker
            </Text>

            <Text style={styles.menuDescription}>
              Version 1.0.0
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>

        </TouchableOpacity>

        {/*logout button  */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

      </ScrollView>


      {/* Custom Navigation */}
      <BottomNav />

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 25,
  },


  /* Header */

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#172554",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },


  /* Profile */

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  profileAvatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },

  profileAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4F46E5",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172554",
  },

  profileEmail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },


  /* Sections */

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 12,
  },


  /* Settings */

  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  settingIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  settingIcon: {
    fontSize: 20,
  },

  settingInfo: {
    flex: 1,
    marginLeft: 13,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172554",
  },

  settingDescription: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },


  /* Menu */

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  menuIcon: {
    fontSize: 20,
  },

  menuInfo: {
    flex: 1,
    marginLeft: 13,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172554",
  },

  menuDescription: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  arrow: {
    fontSize: 27,
    color: "#94A3B8",
  },


  /* Logout */

  logoutButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 10,
  },

  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },

});