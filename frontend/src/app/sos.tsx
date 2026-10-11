import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import BottomNav from "@/components/BottomNav";

const API_URL = "http://child-tracker-81b1.onrender.com";

export default function SOS() {
  const [sosPressed, setSosPressed] = useState(false);
  const [sending, setSending] = useState(false);

  const sendSOS = async () => {
    try {
      setSending(true);

      const response = await fetch(`${API_URL}/api/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send SOS");
      }

      setSosPressed(true);

      Alert.alert(
        "SOS Recorded Successfully",
        "Your demo SOS event has been saved with the latest available child location. No SMS, call, or emergency notification was sent."
      );

      setTimeout(() => {
        setSosPressed(false);
      }, 3000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not connect to the backend.";

      Alert.alert(
        "SOS Failed",
        `${message}\n\nCheck that your backend is running and your laptop IP address is correct.`
      );
    } finally {
      setSending(false);
    }
  };

  const handleSOS = () => {
    Alert.alert(
      "Confirm Emergency SOS",
      "Do you want to record an SOS event for the child?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: sendSOS,
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
        <View style={styles.header}>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>
            Quickly record an emergency alert
          </Text>
        </View>

        <View style={styles.sosSection}>
          <View style={styles.warningCircle}>
            <Text style={styles.warningIcon}>🚨</Text>
          </View>

          <Text style={styles.question}>
            Need emergency help?
          </Text>

          <Text style={styles.description}>
            Press the button below to record an SOS
            event along with the latest available
            child location.
          </Text>

          <TouchableOpacity
            style={[
              styles.sosButton,
              sosPressed && styles.sosButtonPressed,
              sending && styles.sosButtonDisabled,
            ]}
            onPress={handleSOS}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <>
                <ActivityIndicator
                  size="large"
                  color="#FFFFFF"
                />
                <Text style={styles.sosButtonSubtext}>
                  Sending...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.sosButtonText}>
                  {sosPressed ? "SENT!" : "SOS"}
                </Text>

                <Text style={styles.sosButtonSubtext}>
                  {sosPressed
                    ? "Event recorded"
                    : "Tap for emergency"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {sosPressed && (
            <Text style={styles.successText}>
              ✓ SOS event saved successfully
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Emergency Contacts
        </Text>

        <View style={styles.contactCard}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactIcon}>👨</Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Father</Text>
            <Text style={styles.contactNumber}>
              +91 XXXXX XXXXX
            </Text>
          </View>

          <Text style={styles.callIcon}>📞</Text>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactIcon}>👩</Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Mother</Text>
            <Text style={styles.contactNumber}>
              +91 XXXXX XXXXX
            </Text>
          </View>

          <Text style={styles.callIcon}>📞</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Demo mode: SOS events are saved in the
            database with the latest available child
            location. Phone calls and notifications
            are not enabled.
          </Text>
        </View>
      </ScrollView>

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
  sosSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },
  warningCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  warningIcon: {
    fontSize: 35,
  },
  question: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172554",
  },
  description: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 25,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sosButtonPressed: {
    backgroundColor: "#10B981",
  },
  sosButtonDisabled: {
    opacity: 0.8,
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  sosButtonSubtext: {
    color: "#FFFFFF",
    fontSize: 11,
    marginTop: 3,
  },
  successText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 14,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  contactIcon: {
    fontSize: 23,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 13,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172554",
  },
  contactNumber: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  callIcon: {
    fontSize: 20,
  },
  infoCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    marginTop: 5,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#4F46E5",
  },
});