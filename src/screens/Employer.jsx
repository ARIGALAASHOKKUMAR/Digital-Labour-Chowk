import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Employer = () => {
  const skills = ["Helper Mason", "Helper Electrician", "Acoustical Insulator"];

  const menuItems = [
    {
      title: "Post Job",
      icon: "briefcase-outline",
      onPress: () => {},
    },
    {
      title: "My Jobs",
      icon: "chatbox-ellipses-outline",
      onPress: () => {},
    },
    {
      title: "Find Worker",
      icon: "person-search-outline",
      onPress: () => {},
      fullWidth: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=12",
            }}
            style={styles.profileImage}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Vikesh Kumar</Text>
            <Text style={styles.mobile}>5825812045</Text>

            <View style={styles.skillWrap}>
              {skills.map((item, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Menu Grid */}
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
    marginBottom: 10,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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