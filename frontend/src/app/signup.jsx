
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

const API_URL = "http://child-tracker-81b1.onrender.com";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [deviceId, setDeviceId] = useState("demo-device-001");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Check required fields
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword ||
      !childName.trim() ||
      childAge.trim() === ""
    ) {
      Alert.alert("Missing Details", "Please fill all fields.");
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email.");
      return;
    }

    // Validate password
    if (password.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    // Validate child age
    const age = Number(childAge);

    if (!Number.isInteger(age) || age < 0 || age > 18) {
      Alert.alert(
        "Invalid Age",
        "Enter a valid child age from 0 to 18."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          childName: childName.trim(),
          childAge: age,
          deviceId: deviceId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          "Signup Failed",
          data.message || "Could not create account."
        );
        return;
      }

      Alert.alert(
        "Account Created",
        "Your parent account has been created successfully.",
        [
          {
            text: "Continue to Login",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Check that your backend is running and your phone is on the same Wi-Fi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoCircle}>
        <Text style={styles.logo}>🛡️</Text>
      </View>

      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.subtitle}>
        Create your parent account to keep your child safe.
      </Text>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Parent Details</Text>

        <Text style={styles.label}>Parent Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor="#94A3B8"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 8 characters"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password again"
          placeholderTextColor="#94A3B8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionTitle}>Child Details</Text>

        <Text style={styles.label}>Child Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your child's name"
          placeholderTextColor="#94A3B8"
          value={childName}
          onChangeText={setChildName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Child Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter child's age"
          placeholderTextColor="#94A3B8"
          value={childAge}
          onChangeText={setChildAge}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
          </Text>
          <Text
            style={styles.loginLink}
            onPress={() => router.push("/login")}
          >
            Login
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 35,
  },
  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#172554",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 21,
  },
  form: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172554",
    marginBottom: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 7,
  },
  input: {
    height: 49,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 14,
    color: "#172554",
    backgroundColor: "#F8FAFC",
    marginBottom: 16,
  },
  button: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 20,
  },
  loginText: {
    color: "#64748B",
    fontSize: 13,
  },
  loginLink: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "700",
  },
});