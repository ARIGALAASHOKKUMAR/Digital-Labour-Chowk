import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonAPICall, MYJOBSOFWORKER } from "../utils/utils";
import { useDispatch } from "react-redux";
import { showModal } from "../actions";

const { width, height } = Dimensions.get("window");

const Workerposetdjobs = () => {
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getWorkerJobs = async () => {
    try {
      setError(null);
      const response = await commonAPICall(MYJOBSOFWORKER, {}, "get", dispatch);

      console.log("responseofworkerjobs", response.data);

      if (
        response?.status === 200 &&
        response?.data?.DigitalLabourChowkJobPosting_Details
      ) {
        // Parse JSON strings for jobcategories and facilities
        const parsedJobs =
          response.data.DigitalLabourChowkJobPosting_Details.map((job) => ({
            ...job,
            jobcategories: job.jobcategories
              ? JSON.parse(job.jobcategories)
              : [],
            facilities: job.facilities ? JSON.parse(job.facilities) : [],
          }));
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
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to get work type display
  const getWorkTypeDisplay = (type) => {
    if (type === "daily wages") return "Daily Wages";
    if (type === "monthly") return "Monthly";
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

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  // Modern Job Card Component
  const ModernJobCard = ({ job }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openJobDetails(job)}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.companyIcon}>
              <Text style={styles.companyIconText}>💼</Text>
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.jobTitle}>{job.jobtitle}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={12} color="#666" />
                <Text style={styles.locationText}>
                  {job.village_name}, {job.mandalname}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.workTypeBadgeModern}>
            <Text style={styles.workTypeTextModern}>
              {getWorkTypeDisplay(job.preferredworktype)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailItemModern}>
            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
            <Text style={styles.detailValueModern}>₹{job.workrateperday}/day</Text>
          </View>
          <View style={styles.detailItemModern}>
            <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
            <Text style={styles.detailValueModern}>{job.workduration} days</Text>
          </View>
          <View style={styles.detailItemModern}>
            <Ionicons name="people-outline" size={16} color="#4CAF50" />
            <Text style={styles.detailValueModern}>{job.requiredpeople} required</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateRangeContainer}>
            <Ionicons name="time-outline" size={12} color="#999" />
            <Text style={styles.dateRangeText}>
              {formatDate(job.startdate)} - {formatDate(job.enddate)}
            </Text>
          </View>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color="#4CAF50" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Naukri-style Job Details Modal
  const JobDetailsModal = () => {
    if (!selectedJob) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header with gradient effect */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Job Details</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Job Title Section */}
              <View style={styles.jobTitleSection}>
                <Text style={styles.modalJobTitle}>{selectedJob.jobtitle}</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, styles.workTypeBadgeModal]}>
                    <Text style={styles.badgeText}>
                      {getWorkTypeDisplay(selectedJob.preferredworktype)}
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.jobIdBadge]}>
                    <Text style={styles.jobIdText}>ID: {selectedJob.jobpostingid}</Text>
                  </View>
                </View>
              </View>

              {/* Key Metrics Cards */}
              <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                  <Ionicons name="cash-outline" size={24} color="#4CAF50" />
                  <Text style={styles.metricValue}>₹{selectedJob.workrateperday}</Text>
                  <Text style={styles.metricLabel}>Per Day</Text>
                </View>
                <View style={styles.metricCard}>
                  <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
                  <Text style={styles.metricValue}>{selectedJob.workduration}</Text>
                  <Text style={styles.metricLabel}>Days</Text>
                </View>
                <View style={styles.metricCard}>
                  <Ionicons name="people-outline" size={24} color="#4CAF50" />
                  <Text style={styles.metricValue}>{selectedJob.requiredpeople}</Text>
                  <Text style={styles.metricLabel}>Required</Text>
                </View>
              </View>

              {/* Location Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={20} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>Location Details</Text>
                </View>
                <View style={styles.locationDetails}>
                  <Text style={styles.addressText}>
                    {selectedJob.village_name}, {selectedJob.mandalname}
                  </Text>
                  <Text style={styles.addressText}>
                    {selectedJob.districtname} - {selectedJob.pincode}
                  </Text>
                  {selectedJob.landmark && (
                    <Text style={styles.landmarkText}>
                      Landmark: {selectedJob.landmark}
                    </Text>
                  )}
                </View>
              </View>

              {/* Date Range Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={20} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>Duration</Text>
                </View>
                <View style={styles.dateRange}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>{formatDate(selectedJob.startdate)}</Text>
                  </View>
                  <View style={styles.dateDivider} />
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>End Date</Text>
                    <Text style={styles.dateValue}>{formatDate(selectedJob.enddate)}</Text>
                  </View>
                </View>
                <View style={styles.workTimeContainer}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.workTimeText}>
                    Work Time: {getWorkTimeDisplay(selectedJob.worktime)}
                  </Text>
                </View>
              </View>

              {/* Job Categories */}
              {selectedJob.jobcategories && selectedJob.jobcategories.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="briefcase" size={20} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Job Categories</Text>
                  </View>
                  <View style={styles.tagsContainer}>
                    {selectedJob.jobcategories.map((cat, index) => (
                      <View key={index} style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{cat.jobCategoryName}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Facilities */}
              {selectedJob.facilities && selectedJob.facilities.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="gift" size={20} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Facilities Provided</Text>
                  </View>
                  <View style={styles.tagsContainer}>
                    {selectedJob.facilities.map((fac, index) => (
                      <View key={index} style={styles.facilityTag}>
                        <Ionicons name="checkmark-circle" size={14} color="#7b1fa2" />
                        <Text style={styles.facilityTagText}>{fac.facilityName}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Job Description */}
              {selectedJob.jobdescription && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text" size={20} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Job Description</Text>
                  </View>
                  <Text style={styles.descriptionText}>
                    {selectedJob.jobdescription}
                  </Text>
                </View>
              )}

              {/* Tools Required */}
              {selectedJob.toolsrequired && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="construct" size={20} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Tools Required</Text>
                  </View>
                  <Text style={styles.toolsText}>{selectedJob.toolsrequired}</Text>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
        <Ionicons name="alert-circle" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getWorkerJobs}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.noJobsText}>No jobs found</Text>
            <Text style={styles.noJobsSubText}>Pull down to refresh</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>My Job Postings</Text>
              <View style={styles.headerCount}>
                <Text style={styles.headerCountText}>
                  {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
                </Text>
              </View>
            </View>
            {jobs.map((job) => (
              <ModernJobCard key={job.jobpostingid} job={job} />
            ))}
          </>
        )}
      </ScrollView>
      <JobDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
  },
  headerCount: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerCountText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "600",
  },
  // Modern Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    flex: 1,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  companyIconText: {
    fontSize: 24,
  },
  cardTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#6c757d",
    marginLeft: 4,
  },
  workTypeBadgeModern: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workTypeTextModern: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  detailItemModern: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailValueModern: {
    fontSize: 13,
    color: "#495057",
    marginLeft: 6,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateRangeText: {
    fontSize: 11,
    color: "#868e96",
    marginLeft: 4,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginRight: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.9,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f3f5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  jobTitleSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalJobTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  workTypeBadgeModal: {
    backgroundColor: "#e8f5e9",
  },
  jobIdBadge: {
    backgroundColor: "#f1f3f5",
  },
  badgeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  jobIdText: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500",
  },
  metricsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginLeft: 8,
  },
  locationDetails: {
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  landmarkText: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    marginTop: 4,
  },
  dateRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  dateDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e9ecef",
    marginHorizontal: 16,
  },
  workTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  workTimeText: {
    fontSize: 13,
    color: "#495057",
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryTagText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
  },
  facilityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  facilityTagText: {
    fontSize: 12,
    color: "#7b1fa2",
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  toolsText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  closeModalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
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
    color: "#6c757d",
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noJobsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6c757d",
    marginTop: 16,
    marginBottom: 8,
  },
  noJobsSubText: {
    fontSize: 14,
    color: "#adb5bd",
  },
});

export default Workerposetdjobs;