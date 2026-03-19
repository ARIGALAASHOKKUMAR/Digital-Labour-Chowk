import { useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";

const Worker = ({ skills, workHistory, workerData, loading, refreshing }) => {
  const calculateAge = (dob) => {
    if (!dob) return "";
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return "";
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return `${age}`;
    } catch (e) {
      return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  const profile = useMemo(() => {
    const fullName = workerData?.full_name || "Aditya Kumar";
    const mobile = workerData?.mobile_number || "8920254311";
    const email = workerData?.email || "aditya76@gmail.com";

    const location = [
      workerData?.village_name,
      workerData?.mandal_name,
      workerData?.dist_name,
    ]
      .filter(Boolean)
      .join(", ");
    const experience =
      workerData?.skill_experience_years !== undefined &&
      workerData?.skill_experience_years !== null &&
      workerData?.skill_experience_years !== ""
        ? `${workerData.skill_experience_years} Years`
        : "5 Years";

    const age = calculateAge(workerData?.date_of_birth) || "40";

    return {
      fullName,
      mobile,
      email,
      location,
      experience,
      age,
      image:
        workerData?.profile_image &&
        workerData?.profile_image !== "base64imageorURL"
          ? workerData.profile_image
          : null,
    };
  }, [workerData]);

  const staticWorkHistory = [
    {
      projectName: "RCC Building Construction – Block A, Smart City Project",
      employerName: "L&T Construction Ltd.",
      taskDescription:
        "Worked as a Site Supervisor responsible for RCC slab work, shuttering supervision, bar bending schedule verification, and quality inspection as per IS standards.",
      skills: ["RCC Work", "Bar Bending", "Site Supervision", "AutoCAD"],
      paymentStatus: "Completed",
      totalAmount: "42,000/month",
      rating: "4.7",
      startDate: "2022-01-10",
      endDate: "2022-12-20",
    },
    {
      projectName: "Road Widening & Drainage Work – NH-58, Haridwar Section",
      employerName: "Shapoorji Pallonji Infra Pvt. Ltd.",
      taskDescription:
        "Engaged in road widening, subgrade preparation, concrete drainage system installation, and onsite coordination with NHAI engineers for progress verification.",
      skills: [
        "Road Construction",
        "Drainage Work",
        "Leveling & Surveying",
        "Safety Compliance",
      ],
      paymentStatus: "Completed",
      totalAmount: "38,500/month",
      rating: "4.6",
      startDate: "2023-03-05",
      endDate: "2023-09-30",
    },
  ];

  const staticSkills = [
    { skillName: "Helper Mason" },
    { skillName: "Assistant Shuttering Carpenter" },
  ];

  const displayWorkHistory =
    workHistory && workHistory.length > 0 ? workHistory : staticWorkHistory;

  const displaySkills = skills && skills.length > 0 ? skills : staticSkills;

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#2a7fd1" />
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.topCard}>
        <View style={styles.profileRow}>
          <View style={styles.profileImageWrap}>
            {profile.image ? (
              <Image
                source={{ uri: profile.image }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={{
                  uri: "https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_1280.png",
                }}
                style={styles.profileImage}
              />
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.fullName}</Text>

            <View style={styles.infoLine}>
              <Icon name="phone" size={16} color="#2a7fd1" />
              <Text style={styles.infoText}>{profile.mobile}</Text>
            </View>

            <View style={styles.infoLine}>
              <Icon name="email" size={16} color="#2a7fd1" />
              <Text style={styles.infoText}>{profile.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tileRow}>
          <View style={[styles.topTile, styles.statusTile]}>
            <Icon name="access-time" size={20} color="#7da3c7" />
            <Text style={styles.statusTitle}>Not Available</Text>
            <View style={styles.toggleCircle} />
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.topTile, styles.blueTile]}
          >
            <Icon name="work" size={22} color="#2a7fd1" />
            <Text style={styles.blueTileText}>Work / Job{"\n"}Applied</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.topTile, styles.blueTile]}
          >
            <Icon name="chat" size={22} color="#2a7fd1" />
            <Text style={styles.blueTileText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Icon name="location-on" size={20} color="#2a7fd1" />
          <Text style={styles.infoBoxLabel}>Location</Text>
          <Text style={styles.infoBoxValue}>{profile.location}</Text>
        </View>

        <View style={styles.infoBox}>
          <Icon name="work-outline" size={20} color="#2a7fd1" />
          <Text style={styles.infoBoxLabel}>Experience</Text>
          <Text style={styles.infoBoxValue}>{profile.experience}</Text>
        </View>

        <View style={styles.infoBox}>
          <Icon name="badge" size={20} color="#2a7fd1" />
          <Text style={styles.infoBoxLabel}>Age</Text>
          <Text style={styles.infoBoxValue}>{profile.age}</Text>
        </View>

        <View style={[styles.infoBox, styles.activeSchemeBox]}>
          <Icon name="currency-rupee" size={20} color="#2a7fd1" />
          <Text style={styles.infoBoxValue}>Welfare and Schemes</Text>
        </View>
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Work History</Text>

        {displayWorkHistory.map((item, index) => {
          const itemSkills =
            item?.skills && Array.isArray(item.skills) && item.skills.length > 0
              ? item.skills
              : [];

          return (
            <View key={index} style={styles.workCard}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateText}>
                  {formatDate(item.startDate)}-{formatDate(item.endDate)}
                </Text>
                {/* <Text style={styles.dateText}>
                    {formatDate(item.endDate)}
                  </Text> */}
              </View>

              <Text style={styles.workText}>
                <Text style={styles.boldText}>Project Name: </Text>
                {item.projectName || "N/A"}
              </Text>

              <Text style={styles.workText}>
                <Text style={styles.boldText}>Employer Name: </Text>
                {item.employerName || item.employeeName || "N/A"}
              </Text>

              <Text style={styles.workText}>
                <Text style={styles.boldText}>Description: </Text>
                {item.taskDescription || "N/A"}
              </Text>

              <Text style={[styles.workText, { marginTop: 6 }]}>
                <Text style={styles.boldText}>Skills:</Text>
              </Text>

              <View style={styles.chipWrap}>
                {itemSkills.length > 0 ? (
                  itemSkills.map((skill, idx) => (
                    <View key={idx} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>
                        {typeof skill === "string"
                          ? skill
                          : skill?.skillName || "Skill"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={styles.skillChip}>
                      <Text style={styles.skillChipText}>RCC Work</Text>
                    </View>
                    <View style={styles.skillChip}>
                      <Text style={styles.skillChipText}>Bar Bending</Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.paymentText}>
                  <Text style={styles.boldText}>Payment: </Text>
                  {item.paymentStatus || "Completed"} ( ₹
                  {item.totalAmount || "42,000/month"})
                </Text>

                <Text style={styles.ratingText}>
                  <Text style={styles.boldText}>Rating: </Text>
                  {item.rating || "4.7"}/5
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Skill & Specializations</Text>
        <View style={styles.chipWrap}>
          {displaySkills.map((skill, index) => (
            <View key={index} style={styles.bottomSkillChip}>
              <Text style={styles.bottomSkillText}>
                {skill?.skillName || "Skill"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const BORDER = "#dfe7ef";
const LIGHT_BLUE = "#d9ecff";
const PRIMARY = "#2a7fd1";
const TEXT = "#222";
const SUBTEXT = "#666";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3f8",
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef3f8",
  },
 scrollContent: {
  padding: 10,
  paddingBottom: 120,
  flexGrow: 1,
},

  topCard: {
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImageWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 4,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: TEXT,
  },

  tileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  topTile: {
    flex: 1,
    minHeight: 78,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  statusTile: {
    backgroundColor: "#fff",
  },
  statusTitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#d25d5d",
    fontWeight: "600",
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#888",
    marginTop: 6,
  },
  blueTile: {
    backgroundColor: LIGHT_BLUE,
  },
  blueTileText: {
    textAlign: "center",
    color: TEXT,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 5,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "space-between",
  },
  infoBox: {
    width: "49%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    minHeight: 95,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  activeSchemeBox: {
    backgroundColor: LIGHT_BLUE,
  },
  infoBoxLabel: {
    fontSize: 12,
    color: SUBTEXT,
    marginTop: 3,
    marginBottom: 2,
    textAlign: "center",
  },
  infoBoxValue: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
    lineHeight: 22,
  },

  sectionWrap: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 10,
  },

  workCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7edf3",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    position: "relative",
  },
  dateColumn: {
    position: "absolute",
    right: 10,
    top: 10,
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 9,
    color: "#444",
    fontWeight: "500",
    // lineHeight: 17,
  },
  workText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 19,
    paddingRight: 105,
  },
  boldText: {
    fontWeight: "700",
    color: "#222",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  skillChip: {
    backgroundColor: "#efefef",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  skillChipText: {
    fontSize: 12,
    color: "#555",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    flexWrap: "wrap",
  },
  paymentText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  bottomSkillChip: {
    backgroundColor: "#efefef",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  bottomSkillText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
});

export default Worker;
