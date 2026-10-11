
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import BottomNav from "@/components/BottomNav";

const API_URL = "http://child-tracker-81b1.onrender.com";

type SafeZone = {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
};

export default function SafeZones() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("100");

  const fetchSafeZones = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_URL}/api/safe-zones`);

      if (!response.ok) {
        throw new Error("Could not load safe zones.");
      }

      const result = await response.json();

      if (!Array.isArray(result.data)) {
        throw new Error("Unexpected server response.");
      }

      setSafeZones(result.data);
    } catch (error) {
      console.log("Safe Zone API Error:", error);
      Alert.alert(
        "Connection Error",
        "Safe zones load nahi hue. Check karo backend running hai."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSafeZones();
    }, [])
  );

  const saveSafeZone = async () => {
    const trimmedName = name.trim();
    const lat = Number(latitude);
    const lng = Number(longitude);
    const zoneRadius = Number(radius);

    if (!trimmedName || !latitude.trim() ||
        !longitude.trim() || !radius.trim()) {
      Alert.alert("Missing Details", "Saari fields fill karo.");
      return;
    }

    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      Alert.alert("Invalid Latitude", "Latitude -90 se 90 ke beech honi chahiye.");
      return;
    }

    if (
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      Alert.alert("Invalid Longitude", "Longitude -180 se 180 ke beech honi chahiye.");
      return;
    }

    if (
      !Number.isFinite(zoneRadius) ||
      zoneRadius <= 0
    ) {
      Alert.alert("Invalid Radius", "Radius zero se zyada hona chahiye.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/safe-zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          latitude: lat,
          longitude: lng,
          radius: zoneRadius,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Safe zone save nahi hua.");
      }

      // Server se returned record use karenge.
      setSafeZones((previous) => [
        result.data,
        ...previous.filter((zone) => zone._id !== result.data._id),
      ]);

      setName("");
      setLatitude("");
      setLongitude("");
      setRadius("100");
      setShowForm(false);

      Alert.alert("Success", "Safe zone successfully save ho gaya.");
    } catch (error) {
      console.log("Save Safe Zone Error:", error);

      Alert.alert(
        "Save Failed",
        error instanceof Error
          ? error.message
          : "Backend se connect nahi ho paya."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSafeZones(true)}
            tintColor="#4F46E5"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Safe Zones</Text>
          <Text style={styles.subtitle}>
            Your child's safe locations
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Locations</Text>
          <Text style={styles.zoneCount}>{safeZones.length} zones</Text>
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.emptyText}>Loading safe zones...</Text>
          </View>
        ) : safeZones.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No Safe Zones Yet</Text>
            <Text style={styles.emptyText}>
              Add your child's home or school to get started.
            </Text>
          </View>
        ) : (
          safeZones.map((zone) => (
            <View key={zone._id} style={styles.zoneCard}>
              <View style={styles.zoneIconContainer}>
                <Text style={styles.zoneIcon}>
                  {zone.name.toLowerCase().includes("school") ? "🏫" : "🏠"}
                </Text>
              </View>

              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.name}</Text>

                <Text style={styles.zoneLocation}>
                  Lat: {Number(zone.latitude).toFixed(5)}
                </Text>

                <Text style={styles.zoneLocation}>
                  Lng: {Number(zone.longitude).toFixed(5)}
                </Text>

                <Text style={styles.radiusText}>
                  Radius: {zone.radius} meters
                </Text>

                <View style={styles.activeRow}>
                  <View
                    style={[
                      styles.activeDot,
                      {
                        backgroundColor: zone.active ? "#10B981" : "#EF4444",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.activeText,
                      {
                        color: zone.active ? "#059669" : "#DC2626",
                      },
                    ]}
                  >
                    {zone.active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm((previous) => !previous)}
        >
          <Text style={styles.addIcon}>{showForm ? "−" : "+"}</Text>
          <Text style={styles.addText}>
            {showForm ? "Close Form" : "Add Safe Zone"}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Safe Zone</Text>

            <Text style={styles.label}>Zone Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Home or School"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />

            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 22.7196"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 75.8577"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>Radius in meters</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              value={radius}
              onChangeText={setRadius}
              keyboardType="numeric"
            />

            <Text style={styles.helperText}>
              Tip: Use actual location coordinates when GPS is available.
              Current demo coordinates can be entered for testing.
            </Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={saveSafeZone}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Save Safe Zone</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🛡️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What are Safe Zones?</Text>
            <Text style={styles.infoText}>
              Safe Zones are trusted locations such as home or school.
              The app can compare the child's latest coordinates with
              these zones to determine whether the child is inside or outside.
            </Text>
          </View>
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
    paddingBottom: 130,
  },
  header: {
    marginBottom: 22,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172554",
  },
  zoneCount: {
    fontSize: 12,
    color: "#64748B",
  },
  zoneCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  zoneIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  zoneIcon: {
    fontSize: 24,
  },
  zoneInfo: {
    flex: 1,
    marginLeft: 14,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 3,
  },
  zoneLocation: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  radiusText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  activeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  addButton: {
    height: 55,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 18,
  },
  addIcon: {
    color: "#FFFFFF",
    fontSize: 25,
    marginRight: 8,
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    marginBottom: 15,
  },
  infoIcon: {
    fontSize: 25,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3730A3",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#4F46E5",
    marginTop: 5,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 7,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    color: "#172554",
    fontSize: 14,
    backgroundColor: "#F8FAFC",
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginBottom: 14,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

