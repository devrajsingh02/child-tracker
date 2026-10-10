
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNav from "@/components/BottomNav";

const API_URL = "http://10.205.23.6:5000";
const REFRESH_INTERVAL = 5000;

export default function Dashboard() {
  const router = useRouter();
  const mapRef = useRef<WebView>(null);

  const [deviceData, setDeviceData] = useState<any>(null);
  const [safeZoneStatus, setSafeZoneStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<any>(null);

  const fetchParent = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setParent(result.parent);
      } else {
        console.log("Could not fetch parent profile:", result.message);
      }
    } catch (error) {
      console.log("Parent profile error:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [deviceResponse, zoneResponse] = await Promise.all([
        fetch(`${API_URL}/api/device/latest`),
        fetch(`${API_URL}/api/device/safe-zone-status`),
      ]);

      const deviceResult = await deviceResponse.json();
      const zoneResult = await zoneResponse.json();

      if (deviceResponse.ok && deviceResult.success && deviceResult.data) {
        setDeviceData(deviceResult.data);

        console.log(
          "Latest GPS coordinates:",
          deviceResult.data.latitude,
          deviceResult.data.longitude
        );
      }

      if (zoneResponse.ok && zoneResult.success) {
        setSafeZoneStatus(zoneResult);
      } else {
        setSafeZoneStatus(null);
      }
    } catch (error) {
      console.log("Dashboard API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data initially, then automatically every 5 seconds.
  useEffect(() => {
    fetchParent();
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const latitude = Number(deviceData?.latitude ?? 22.7196);
  const longitude = Number(deviceData?.longitude ?? 75.8577);

  const childName = parent?.child?.name || "Child";

  // Update the existing Leaflet marker without reloading the whole map.
  const updateMapLocation = () => {
    const safeLatitude = Number.isFinite(latitude) ? latitude : 22.7196;
    const safeLongitude = Number.isFinite(longitude) ? longitude : 75.8577;

    const script = `
      if (window.updateChildLocation) {
        window.updateChildLocation(
          ${safeLatitude},
          ${safeLongitude},
          ${JSON.stringify(childName)}
        );
      }
      true;
    `;

    mapRef.current?.injectJavaScript(script);
  };

  // Whenever new GPS coordinates arrive, move the map marker.
  useEffect(() => {
    updateMapLocation();
  }, [latitude, longitude, childName]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {parent?.name || "Parent"} 👋
            </Text>

            <Text style={styles.subtitle}>
              Welcome to Child Tracker
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>
              {parent?.name?.charAt(0)?.toUpperCase() || "P"}
            </Text>
          </View>
        </View>

        {/* Child Card */}
        <View style={styles.childCard}>
          <View style={styles.childAvatar}>
            <Text style={styles.childEmoji}>🧒</Text>
          </View>

          <View style={styles.childInfo}>
            <Text style={styles.childName}>
              {parent?.child?.name || "Child"}
            </Text>

            <Text style={styles.childAge}>
              Age {parent?.child?.age ?? "—"} years
            </Text>

            <View style={styles.onlineRow}>
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: deviceData
                      ? "#10B981"
                      : "#94A3B8",
                  },
                ]}
              />

              <Text
                style={[
                  styles.onlineText,
                  {
                    color: deviceData ? "#10B981" : "#64748B",
                  },
                ]}
              >
                {deviceData ? "Device Connected" : "Waiting for Device"}
              </Text>
            </View>
          </View>

          <View style={styles.batteryBadge}>
            <Text style={styles.batteryText}>
              🔋 {deviceData?.battery ?? "--"}%
            </Text>
          </View>
        </View>

        {/* Live Map */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Location</Text>

          <TouchableOpacity onPress={fetchDashboardData}>
            <Text style={styles.refreshText}>Refresh ↻</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <WebView
            ref={mapRef}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={updateMapLocation}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport"
                    content="width=device-width, initial-scale=1.0">

                  <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                  />

                  <style>
                    html, body, #map {
                      height: 100%;
                      width: 100%;
                      margin: 0;
                      padding: 0;
                    }
                  </style>
                </head>

                <body>
                  <div id="map"></div>

                  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

                  <script>
                    const map = L.map("map").setView(
                      [22.7196, 75.8577],
                      15
                    );

                    L.tileLayer(
                      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                      {
                        attribution: "&copy; OpenStreetMap contributors"
                      }
                    ).addTo(map);

                    const marker = L.marker([22.7196, 75.8577])
                      .addTo(map);

                    window.updateChildLocation = function(lat, lng, name) {
                      lat = Number(lat);
                      lng = Number(lng);

                      if (
                        !Number.isFinite(lat) ||
                        !Number.isFinite(lng) ||
                        lat < -90 || lat > 90 ||
                        lng < -180 || lng > 180
                      ) {
                        return;
                      }

                      marker.setLatLng([lat, lng]);

                      marker
                        .bindPopup(
                          String(name) + "'s Location<br>" +
                          lat.toFixed(6) + ", " + lng.toFixed(6)
                        );

                      map.setView([lat, lng], 17);
                    };
                  </script>
                </body>
                </html>
              `,
            }}
          />
        </View>

        {/* Current Coordinates */}
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>📍</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>
              Current Coordinates
            </Text>

            <Text style={styles.locationValue}>
              {deviceData
                ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                : "Waiting for GPS coordinates..."}
            </Text>

            {deviceData && (
              <Text style={styles.liveText}>
                ● GPS data received
              </Text>
            )}
          </View>
        </View>

        {/* Device Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔋</Text>

            <Text style={styles.statValue}>
              {deviceData?.battery ?? "--"}%
            </Text>

            <Text style={styles.statLabel}>Battery</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📶</Text>

            <Text style={styles.statValue}>
              {deviceData
                ? deviceData.wifi
                  ? "Online"
                  : "Offline"
                : "--"}
            </Text>

            <Text style={styles.statLabel}>Wi-Fi</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🛰️</Text>

            <Text style={styles.statValue}>
              {deviceData ? "Available" : "Waiting"}
            </Text>

            <Text style={styles.statLabel}>Location</Text>
          </View>
        </View>

        {/* Safe Zone Status */}
        <View style={styles.safeZoneCard}>
          <View style={styles.safeZoneHeader}>
            <Text style={styles.safeZoneIcon}>🛡️</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.safeZoneTitle}>
                Safe Zone Status
              </Text>

              <Text
                style={[
                  styles.safeZoneStatus,
                  {
                    color:
                      safeZoneStatus?.status === "SAFE"
                        ? "#10B981"
                        : safeZoneStatus?.status === "OUTSIDE"
                          ? "#EF4444"
                          : "#64748B",
                  },
                ]}
              >
                {safeZoneStatus?.status === "SAFE"
                  ? "Inside Safe Zone"
                  : safeZoneStatus?.status === "OUTSIDE"
                    ? "Outside Safe Zone"
                    : "Status unavailable"}
              </Text>
            </View>
          </View>

          {safeZoneStatus?.status === "SAFE" &&
            safeZoneStatus?.zone && (
              <View style={styles.safeZoneDetails}>
                <Text style={styles.safeZoneDetailText}>
                  Zone: {safeZoneStatus.zone.zoneName}
                </Text>

                <Text style={styles.safeZoneDetailText}>
                  Distance: {safeZoneStatus.zone.distance} m
                </Text>

                <Text style={styles.safeZoneDetailText}>
                  Radius: {safeZoneStatus.zone.radius} m
                </Text>
              </View>
            )}

          {safeZoneStatus?.status === "OUTSIDE" && (
            <Text style={styles.warningText}>
              Your child is outside all active safe zones.
            </Text>
          )}
        </View>

        {/* Location History */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.historyButtonText}>
            📍 View Location History
          </Text>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Emergency SOS */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => router.push("/sos")}
        >
          <Text style={styles.sosIcon}>🚨</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>Emergency SOS</Text>

            <Text style={styles.sosSubtitle}>
              Open emergency assistance
            </Text>
          </View>

          <Text style={styles.sosArrow}>›</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#4F46E5" />

            <Text style={styles.loadingText}>
              Loading device information...
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          Child Tracker • Keeping your child safe
        </Text>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 115,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#172554",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4F46E5",
  },
  signupButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 13,
    alignItems: "center",
    marginBottom: 18,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  childCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  childAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  childEmoji: {
    fontSize: 30,
  },
  childInfo: {
    flex: 1,
    marginLeft: 13,
  },
  childName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172554",
  },
  childAge: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 5,
  },
  onlineText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  batteryBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172554",
  },
  refreshText: {
    fontSize: 13,
    color: "#4F46E5",
    fontWeight: "600",
  },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#E2E8F0",
  },
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172554",
  },
  locationValue: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  liveText: {
    fontSize: 11,
    color: "#10B981",
    marginTop: 5,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172554",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  safeZoneCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  safeZoneHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  safeZoneIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  safeZoneTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
  },
  safeZoneStatus: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  safeZoneDetails: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  safeZoneDetailText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  warningText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 12,
  },
  historyButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  historyButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#172554",
  },
  arrow: {
    fontSize: 25,
    color: "#94A3B8",
  },
  sosButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  sosIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  sosTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B91C1C",
  },
  sosSubtitle: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
  },
  sosArrow: {
    fontSize: 26,
    color: "#DC2626",
  },
  loadingRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 12,
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 22,
  },
});
