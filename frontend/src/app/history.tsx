
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import BottomNav from "@/components/BottomNav";

const API_URL = "http://10.205.23.6:5000";

type HistoryItem = {
  _id: string;
  latitude: number;
  longitude: number;
  battery: number;
  wifi: boolean;
  createdAt: string;
};

export default function History() {
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/device/history`
      );

      if (!response.ok) {
        throw new Error("Could not load location history.");
      }

      const result = await response.json();

      if (!Array.isArray(result.data)) {
        throw new Error("Unexpected response from server.");
      }

      setHistory(result.data);
    } catch (err) {
      console.log("History API Error:", err);
      setError(
        "History load nahi hui. Internet aur backend check karo."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Screen open karne ya wapas aane par history refresh hogi.
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Time unavailable";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backTouchable}
        >
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Location History</Text>

        <TouchableOpacity
          onPress={() => fetchHistory(true)}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHistory(true)}
            tintColor="#4F46E5"
          />
        }
      >
        <Text style={styles.sectionTitle}>
          Recent Activity
        </Text>

        <Text style={styles.subtitle}>
          Previously recorded device locations
        </Text>

        {/* Loading */}
        {loading ? (
          <View style={styles.messageCard}>
            <ActivityIndicator
              size="large"
              color="#4F46E5"
            />
            <Text style={styles.messageText}>
              Loading location history...
            </Text>
          </View>
        ) : error ? (
          /* Error */
          <View style={styles.messageCard}>
            <Text style={styles.messageIcon}>⚠️</Text>
            <Text style={styles.messageText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchHistory()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : history.length === 0 ? (
          /* Empty state */
          <View style={styles.messageCard}>
            <Text style={styles.messageIcon}>📍</Text>
            <Text style={styles.messageTitle}>
              No Location Records Yet
            </Text>
            <Text style={styles.messageText}>
              Location history will appear here when the
              device sends data to the backend.
            </Text>
          </View>
        ) : (
          /* History list */
          history.map((item, index) => (
            <View
              key={item._id || `${item.createdAt}-${index}`}
              style={styles.locationCard}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📍</Text>
              </View>

              <View style={styles.locationInfo}>
                <Text style={styles.time}>
                  {formatTime(item.createdAt)}
                </Text>

                <Text style={styles.date}>
                  {formatDate(item.createdAt)}
                </Text>

                <Text style={styles.location}>
                  Lat: {Number(item.latitude).toFixed(5)}
                </Text>

                <Text style={styles.location}>
                  Lng: {Number(item.longitude).toFixed(5)}
                </Text>

                <View style={styles.statusRow}>
                  <Text style={styles.details}>
                    Battery: {item.battery ?? "--"}%
                  </Text>

                  <Text
                    style={[
                      styles.wifiStatus,
                      {
                        color: item.wifi ? "#16A34A" : "#DC2626",
                      },
                    ]}
                  >
                    • Wi-Fi {item.wifi ? "Online" : "Offline"}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  backTouchable: {
    width: 30,
  },

  backButton: {
    fontSize: 35,
    color: "#172554",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#172554",
  },

  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  refreshText: {
    fontSize: 25,
    color: "#4338CA",
  },

  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172554",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 18,
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  icon: {
    fontSize: 20,
  },

  locationInfo: {
    flex: 1,
  },

  time: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
  },

  date: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    marginBottom: 8,
  },

  location: {
    fontSize: 13,
    color: "#475569",
    marginTop: 3,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 9,
    alignItems: "center",
  },

  details: {
    fontSize: 12,
    color: "#64748B",
  },

  wifiStatus: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "600",
  },

  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  messageIcon: {
    fontSize: 32,
    marginBottom: 12,
  },

  messageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
    textAlign: "center",
  },

  messageText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

