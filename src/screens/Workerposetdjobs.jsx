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
import { commonAPICall, MYJOBSOFWORKER } from "../utils/utils";
import { useDispatch } from "react-redux";

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

      console.log("responseofworkerjobs",response);
      

      if (response?.status === 200) {
        // Parse JSON strings for jobcategories and facilities
        const parsedJobs = response.DigitalLabourChowkJobPosting_Details.map(
          (job) => ({
            ...job,
            jobcategories: job.jobcategories
              ? JSON.parse(job.jobcategories)
              : [],
            facilities: job.facilities ? JSON.parse(job.facilities) : [],
          }),
        );
        setJobs(parsedJobs);
      } else {
        setError("No jobs found");
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
    return time;
  };

  const JobCard = ({ job }) => {
    return (
      <View style={styles.card}>
        {/* Job Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle}>{job.jobtitle}</Text>
          <View style={styles.workTypeBadge}>
            <Text style={styles.workTypeText}>
              {getWorkTypeDisplay(job.preferredworktype)}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Location:</Text>
          <Text style={styles.infoValue}>
            {job.village_name}, {job.mandalname}, {job.districtname}
          </Text>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏠 Address:</Text>
          <Text style={styles.infoValue}>
            Door No: {job.doorno}, {job.landmark || "No landmark"}
          </Text>
        </View>

        {/* Work Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Work Duration</Text>
              <Text style={styles.detailValue}>{job.workduration} days</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rate/Day</Text>
              <Text style={styles.detailValue}>₹{job.workrateperday}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Required People</Text>
              <Text style={styles.detailValue}>{job.requiredpeople}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Work Time</Text>
              <Text style={styles.detailValue}>
                {getWorkTimeDisplay(job.worktime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.dateContainer}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{formatDate(job.startdate)}</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>{formatDate(job.enddate)}</Text>
          </View>
        </View>

        {/* Job Categories */}
        {job.jobcategories && job.jobcategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Categories</Text>
            <View style={styles.tagsContainer}>
              {job.jobcategories.map((cat, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{cat.jobCategoryName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Facilities */}
        {job.facilities && job.facilities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.tagsContainer}>
              {job.facilities.map((fac, index) => (
                <View key={index} style={[styles.tag, styles.facilityTag]}>
                  <Text style={styles.tagText}>{fac.facilityName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Job Description */}
        {job.jobdescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{job.jobdescription}</Text>
          </View>
        )}

        {/* Tools Required */}
        {job.toolsrequired && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🛠️ Tools Required:</Text>
            <Text style={styles.infoValue}>{job.toolsrequired}</Text>
          </View>
        )}
      </View>
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
            <JobCard key={job.jobpostingid} job={job} />
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
  card: {
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
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
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
    marginBottom: 8,
    flexWrap: "wrap",
  },
  infoLabel: {
    width: 100,
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
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
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
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
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
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
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
