import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";

import PostJob from "./PostJob";
import { commonAPICall, DIGITALLABOURCHOWKDETAILS } from "../utils/utils";

const Employer = ({navigation}) => {
  const [selectedScreen, setSelectedScreen] = useState("home");
  const [employerdata, setEmployerdata] = useState([]);
  const dispatch = useDispatch();

  const fetchWorkerDetails = async () => {
    const res = await commonAPICall(
      DIGITALLABOURCHOWKDETAILS,
      {},
      "get",
      dispatch,
    );

    if (res?.status === 200) {
      const data = res?.data?.DigitalLabourChowkRegistration_Details || [];
      setEmployerdata(data);
    }
  };

  useEffect(() => {
    fetchWorkerDetails();
  }, []);

  const employer = employerdata?.[0] || {};

  const parsedCategories = (() => {
    try {
      return employer?.categories ? JSON.parse(employer.categories) : [];
    } catch (error) {
      return [];
    }
  })();

  const skills =
    parsedCategories.length > 0
      ? parsedCategories.map((item) => item.categoryName)
      : [];

  const fullName = employer?.full_name || "Employer Name";
  const mobileNumber = employer?.mobile_number || "Mobile Number";
  const employerType = employer?.employer_type_name || "Employer Type";
  const location = [
    employer?.village_name,
    employer?.mandal_name,
    employer?.dist_name,
  ]
    .filter(Boolean)
    .join(", ");

  const menuItems = [
    {
      title: "Post Job",
      icon: "briefcase-outline",
      onPress: () => navigation.navigate("JobPosting"), // Direct navigation
    },
    {
      title: "My Jobs",
      icon: "chatbox-ellipses-outline",
      onPress: () => navigation.navigate("EmployerJob"), // Direct navigation
    },
    {
      title: "Find Worker",
      icon: "person-search-outline",
      onPress: () => navigation.navigate("WorkerSearch"), // Direct navigation
      fullWidth: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                employer?.profile_image &&
                employer?.profile_image !== "base64imageorURL"
                  ? employer.profile_image
                  : "https://i.pravatar.cc/150?img=12",
            }}
            style={styles.profileImage}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.mobile}>{mobileNumber}</Text>

            {!!employerType && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={14} color="#666" />
                <Text style={styles.infoText}>{employerType}</Text>
              </View>
            )}

            {!!location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.infoText}>{location}</Text>
              </View>
            )}

            <View style={styles.skillWrap}>
              {skills.length > 0 ? (
                skills.map((item, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{item}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.skillChip}>
                  <Text style={styles.skillText}>No Categories</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.gridRow}>
          {menuItems.slice(0, 2).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={28} color="#2b78d4" />
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.gridCard, styles.fullWidthCard]}
          activeOpacity={0.85}
          onPress={menuItems[2].onPress}
        >
          <Ionicons name={menuItems[2].icon} size={28} color="#2b78d4" />
          <Text style={styles.gridText}>{menuItems[2].title}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Employer;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eaf4ff",
  },
  container: {
    padding: 10,
    backgroundColor: "#eaf4ff",
    flexGrow: 1,
  },
  header: {
    height: 56,
    backgroundColor: "#1976d2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    alignItems: "flex-start",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },
  mobile: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#555",
    flexShrink: 1,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  skillChip: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 11,
    color: "#555",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  gridCard: {
    width: "49.5%",
    backgroundColor: "#cfe8ff",
    borderWidth: 1,
    borderColor: "#b9d8f5",
    minHeight: 95,
    justifyContent: "center",
    alignItems: "center",
  },
  fullWidthCard: {
    width: "100%",
    marginTop: 2,
  },
  gridText: {
    marginTop: 8,
    fontSize: 15,
    color: "#244a73",
    fontWeight: "500",
  },
});
