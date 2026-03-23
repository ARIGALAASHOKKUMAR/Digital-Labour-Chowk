import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonAPICall, MYJOBSOFWORKER } from "../utils/utils";
import { useDispatch } from "react-redux";
import { showModal } from "../actions";

const Workerposetdjobs = () => {
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const getWorkerJobs = async () => {
    try {
      setError(null);
      const response = await commonAPICall(MYJOBSOFWORKER, {}, "get", dispatch);

      console.log("responseofworkerjobs", response.data);

      if (response?.status === 200 && response?.data?.DigitalLabourChowkJobPosting_Details) {
        // Parse JSON strings for jobcategories and facilities
        const parsedJobs = response.data.DigitalLabourChowkJobPosting_Details.map(
          (job) => ({
            ...job,
            jobcategories: job.jobcategories
              ? JSON.parse(job.jobcategories)
              : [],
            facilities: job.facilities ? JSON.parse(job.facilities) : [],
          })
        );
        setJobs(parsedJobs);
      } else {
        setError(response?.data?.message || "No jobs found");
        setJobs([]);
      }
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getWorkerJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getWorkerJobs();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to get work type display
  const getWorkTypeDisplay = (type) => {
    if (type === "daily wages") return "💰 Daily Wages";
    if (type === "monthly") return "📅 Monthly";
    return type;
  };

  // Helper function to get work time display
  const getWorkTimeDisplay = (time) => {
    if (time === "T") return "Full Time";
    if (time === "P") return "Part Time";
    if (time === "9am") return "9:00 AM";
    if (time === "9AM-10PM") return "9:00 AM - 10:00 PM";
    return time;
  };

  // Minimal Job Card Component
  const MinimalJobCard = ({ job, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.minimalCard}>
          <View style={styles.minimalCardHeader}>
            <View style={styles.minimalTitleContainer}>
              <Text style={styles.minimalJobTitle}>{job.jobtitle}</Text>
              <View style={styles.workTypeBadge}>
                <Text style={styles.workTypeText}>
                  {getWorkTypeDisplay(job.preferredworktype)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>

          <View style={styles.minimalDetails}>
            <View style={styles.minimalInfoRow}>
              <Text style={styles.minimalInfoLabel}>📍 Location:</Text>
              <Text style={styles.minimalInfoValue}>
                {job.village_name}, {job.mandalname}
              </Text>
            </View>

            <View style={styles.minimalInfoRow}>
              <Text style={styles.minimalInfoLabel}>💰 Rate:</Text>
              <Text style={styles.minimalInfoValue}>₹{job.workrateperday}/day</Text>
            </View>

            <View style={styles.minimalInfoRow}>
              <Text style={styles.minimalInfoLabel}>📅 Duration:</Text>
              <Text style={styles.minimalInfoValue}>{job.workduration} days</Text>
            </View>

            <View style={styles.minimalInfoRow}>
              <Text style={styles.minimalInfoLabel}>👥 Required:</Text>
              <Text style={styles.minimalInfoValue}>{job.requiredpeople} people</Text>
            </View>

            <View style={styles.minimalFooter}>
              <Text style={styles.minimalDate}>
                {formatDate(job.startdate)} - {formatDate(job.enddate)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Full Job Details Component for Modal
  const JobDetailsCard = ({ data, handleSearch }) => {
    return (
      <ScrollView style={styles.modalContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.modalCard}>
          {/* Job Title and ID */}
          <View style={styles.modalTitleContainer}>
            <View style={styles.titleWrapper}>
              <Text style={styles.modalJobTitle}>{data.jobtitle}</Text>
              <Text style={styles.jobId}>ID: {data.jobpostingid}</Text>
            </View>
            <View style={styles.workTypeBadge}>
              <Text style={styles.workTypeText}>
                {getWorkTypeDisplay(data.preferredworktype)}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Location:</Text>
            <Text style={styles.infoValue}>
              {data.village_name}, {data.mandalname}, {data.districtname} - {data.pincode}
            </Text>
          </View>

          {/* Address */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏠 Address:</Text>
            <Text style={styles.infoValue}>
              Door No: {data.doorno}
              {data.landmark && `, ${data.landmark}`}
            </Text>
          </View>

          {/* Work Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Work Duration</Text>
                <Text style={styles.detailValue}>{data.workduration} days</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Rate/Day</Text>
                <Text style={styles.detailValue}>₹{data.workrateperday}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Required People</Text>
                <Text style={styles.detailValue}>{data.requiredpeople}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Work Time</Text>
                <Text style={styles.detailValue}>
                  {getWorkTimeDisplay(data.worktime)}
                </Text>
              </View>
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.dateContainer}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>{formatDate(data.startdate)}</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>{formatDate(data.enddate)}</Text>
            </View>
          </View>

          {/* Job Categories */}
          {data.jobcategories && data.jobcategories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Categories</Text>
              <View style={styles.tagsContainer}>
                {data.jobcategories.map((cat, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{cat.jobCategoryName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Facilities */}
          {data.facilities && data.facilities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities Provided</Text>
              <View style={styles.tagsContainer}>
                {data.facilities.map((fac, index) => (
                  <View key={index} style={[styles.tag, styles.facilityTag]}>
                    <Text style={styles.facilityTagText}>{fac.facilityName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Job Description */}
          {data.jobdescription && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{data.jobdescription}</Text>
            </View>
          )}

          {/* Tools Required */}
          {data.toolsrequired && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🛠️ Tools Required:</Text>
              <Text style={styles.infoValue}>{data.toolsrequired}</Text>
            </View>
          )}

          {/* Coordinates (optional) */}
          {data.latitude && data.longitude && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Coordinates:</Text>
              <Text style={styles.infoValue}>
                {data.latitude}, {data.longitude}
              </Text>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeModalButton} 
            onPress={() => {
              // Close modal - implement based on your modal close logic
              dispatch(showModal(null, false));
            }}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getWorkerJobs}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4CAF50"]}
        />
      }
    >
      {jobs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noJobsText}>No jobs found</Text>
          <Text style={styles.noJobsSubText}>Pull down to refresh</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Job Postings</Text>
            <Text style={styles.headerCount}>
              {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </Text>
          </View>
          {jobs.map((job) => (
            <MinimalJobCard
              key={job.jobpostingid}
              job={job}
              onPress={() => {
                dispatch(
                  showModal(
                    <JobDetailsCard data={job} />,
                    true,
                    true,
                  ),
                );
              }}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerCount: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Minimal Card Styles
  minimalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  minimalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  minimalTitleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 8,
  },
  minimalJobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  minimalDetails: {
    marginTop: 4,
  },
  minimalInfoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  minimalInfoLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  minimalInfoValue: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  minimalFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  minimalDate: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  // Modal Styles
  modalContainer: {
    backgroundColor: "#f5f5f5",
    maxHeight: "90%",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 20,
  },
  modalTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleWrapper: {
    flex: 1,
  },
  modalJobTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  jobId: {
    fontSize: 12,
    color: "#999",
  },
  workTypeBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  infoLabel: {
    width: 110,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  section: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  detailItem: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  dateBox: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#e3f2fd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityTag: {
    backgroundColor: "#f3e5f5",
  },
  tagText: {
    fontSize: 12,
    color: "#1976d2",
  },
  facilityTagText: {
    fontSize: 12,
    color: "#7b1fa2",
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  closeModalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noJobsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  noJobsSubText: {
    fontSize: 14,
    color: "#999",
  },
});

export default Workerposetdjobs;