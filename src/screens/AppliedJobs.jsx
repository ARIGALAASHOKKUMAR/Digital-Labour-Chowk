import React, { useEffect, useState } from "react";
import { commonAPICall, JOBSEARCH } from "../utils/utils";
import { useDispatch } from "react-redux";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

const AppliedJobs = ({ navigation }) => {
  const [jobsList, setJobs] = useState([]);
  const dispatch = useDispatch();

  const getjobs = async () => {
    const response = await commonAPICall(JOBSEARCH, {}, "get", dispatch);
    if (response.status === 200) {
      setJobs(response.data.DigitalLabourChowkJobPosting_SearchResults);
    }
  };

  useEffect(() => {
    getjobs();
  }, []);

  const formatTimeAgo = (value) => {
    if (!value) return "Recently posted";
    return value;
  };

  const formatSalary = (value) => {
    if (value === null || value === undefined || value === "")
      return "Not mentioned";
    return `₹ ${value}/month`;
  };

  return (
    <ScrollView>
      {jobsList?.length > 0 ? (
        jobsList.filter((item) => item.isapplied === true).map((item, index) => (
          <TouchableOpacity
            key={item?.id ? String(item.id) : String(index)}
            style={styles.jobCard}
            activeOpacity={0.85}
            onPress={() => {
              if (navigation) {
                navigation.navigate("JobDetails", { jobData: item });
              }
            }}
          >
            <View style={styles.jobLeftIconWrap}>
              <View style={styles.jobLeftIconCircle}>
                <MaterialIcons name="work" size={22} color="#000" />
              </View>
            </View>

            <View style={styles.jobContent}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {item.jobtitle}
              </Text>

              <View style={styles.jobMetaRow}>
                <Ionicons name="location-sharp" size={13} color="#e75480" />
                <Text style={styles.jobMetaText} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>

              <View style={styles.jobMetaRow}>
                <Ionicons name="calendar-outline" size={13} color="#666" />
                <Text style={styles.jobMetaText}>
                  {formatTimeAgo(item.jobpostedtime)}
                </Text>
              </View>

              <View style={styles.jobMetaRow}>
                <FontAwesome5 name="rupee-sign" size={11} color="#c58543" />
                <Text style={styles.jobMetaText}>
                  {formatSalary(item.workrateperday)}
                </Text>
              </View>
            </View>

            <View style={styles.jobArrowWrap}>
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() => {
                  if (navigation) {
                    navigation.navigate("JobDetails", { jobData: item });
                  }
                }}
              >
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noDataCard}>
          <Text style={styles.noDataText}>No jobs found</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AppliedJobs;

const styles = StyleSheet.create({
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  jobLeftIconWrap: {
    marginRight: 10,
  },
  jobLeftIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d9efff",
    alignItems: "center",
    justifyContent: "center",
  },
  jobContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  jobMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  jobMetaText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#666",
  },
  jobArrowWrap: {
    marginLeft: 10,
  },
  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2d7fd3",
    alignItems: "center",
    justifyContent: "center",
  },
  noDataCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});