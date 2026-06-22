import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  commonAPICall,
  CONTEXT_HEADING,
  EDITAPPROVALACTION,
  MARINEDISCHARGEDETAILS,
} from '../utils/utils';

const EditRequests = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [selectedPostingId, setSelectedPostingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const GetData = async () => {
    try {
      setLoading(true);
      const res = await commonAPICall(MARINEDISCHARGEDETAILS, {}, 'get', dispatch);
      if (res.status === 200) {
        setData(res.data.MarineDischargePostingDetails || []);
      } else {
        setData([]);
        Alert.alert('Error', 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      Alert.alert('Error', 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve with confirmation
  const handleApprove = (postingId) => {
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Approve',
          onPress: () => submitAction(postingId, 2, ''),
          style: 'default',
        },
      ]
    );
  };

  // Handle Reject - open modal
  const handleReject = (postingId) => {
    setSelectedPostingId(postingId);
    setRejectRemarks('');
    setShowRejectModal(true);
  };

  // Submit rejection with remarks
  const handleRejectSubmit = async () => {
    if (!rejectRemarks.trim()) {
      Alert.alert('Warning', 'Please enter rejection remarks');
      return;
    }
    await submitAction(selectedPostingId, 3, rejectRemarks);
    setShowRejectModal(false);
    setRejectRemarks('');
    setSelectedPostingId(null);
  };

  // Common function to submit action
  const submitAction = async (postingId, actionFlag, remarks) => {
    try {
      setActionLoading(true);
      const payload = {
        postingId: postingId,
        actionFlag: actionFlag,
        ...(actionFlag === 3 && { startReadingEditRejectionRemarks: remarks }),
      };

      const res = await commonAPICall(EDITAPPROVALACTION, payload, 'post', dispatch);

      if (res.status === 200) {
        Alert.alert(
          'Success',
          actionFlag === 2 ? 'Request approved successfully!' : 'Request rejected successfully!'
        );
        await GetData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit action');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    GetData();
  }, []);

  // Format guard pond display
  const getGuardPondName = (id) => {
    const pondMap = {
      '1': 'Guard Pond-1',
      '2': 'Guard Pond-2',
      '3': 'Guard Pond-3',
      '4': 'Guard Pond-4',
    };
    return pondMap[id] || pondMap[String(id)] || '-';
  };

  // Check if buttons should be disabled
  const isButtonDisabled = (flag) => {
    return flag === 2 || flag === 3;
  };

  // Render Table Row
  const renderTableRow = (item, index) => {
    const disabled = isButtonDisabled(item.start_reading_edit_request_flag);
    
    return (
      <View key={item?.id || index} style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: 40, textAlign: 'center' }]}>
          {index + 1}
        </Text>
        <Text style={[styles.tableCell, { width: 130 }]}>
          {item?.discharge_request_industry || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 110 }]}>
          {item?.discharge_request_date || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 100 }]}>
          {getGuardPondName(item?.guard_pond_id)}
        </Text>
        <Text style={[styles.tableCell, { width: 100 }]}>
          {item?.discharge_started_by || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 110 }]}>
          {item?.discharge_request_remarks || '-'}
        </Text>
        <View style={[styles.tableCell, { width: 160, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }]}>
          <TouchableOpacity
            style={[styles.approveButton, disabled && styles.disabledButton]}
            onPress={() => handleApprove(item?.posting_id)}
            disabled={disabled || actionLoading}
          >
            <Icon name="checkmark-outline" size={14} color="#fff" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, disabled && styles.disabledButton]}
            onPress={() => handleReject(item?.posting_id)}
            disabled={disabled || actionLoading}
          >
            <Icon name="close-outline" size={14} color="#fff" />
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Rejection Modal
  const renderRejectModal = () => (
    <Modal
      visible={showRejectModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRejectModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rejection Remarks</Text>
            <TouchableOpacity onPress={() => setShowRejectModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>
              Please provide remarks for rejection:
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={rejectRemarks}
              onChangeText={setRejectRemarks}
              placeholder="Enter rejection remarks..."
              textAlignVertical="top"
            />
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRejectModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitRejectButton, !rejectRemarks.trim() && styles.disabledButton]}
              onPress={handleRejectSubmit}
              disabled={!rejectRemarks.trim() || actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitRejectButtonText}>Submit Rejection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      {renderRejectModal()}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Icon name="list" size={20} color="#000" /> Analysis Report
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.headerPanel}>
            <Text style={styles.headerText}>{CONTEXT_HEADING}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 40 }]}>S.No</Text>
                  <Text style={[styles.tableHeaderText, { width: 130 }]}>Industry</Text>
                  <Text style={[styles.tableHeaderText, { width: 110 }]}>Discharge Date</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Guard Pond</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>TL Name</Text>
                  <Text style={[styles.tableHeaderText, { width: 110 }]}>Remarks</Text>
                  <Text style={[styles.tableHeaderText, { width: 160 }]}>Action</Text>
                </View>

                {/* Table Body */}
                {data.length > 0 ? (
                  data.map((item, index) => renderTableRow(item, index))
                ) : (
                  <View style={styles.noRecords}>
                    <Text style={styles.noRecordsText}>No Records Found</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  cardBody: {
    padding: 10,
  },
  headerPanel: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingVertical: 8,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    paddingHorizontal: 6,
    fontSize: 10,
    color: '#000',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderTopWidth: 0,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tableCell: {
    paddingHorizontal: 6,
    fontSize: 10,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalBody: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  submitRejectButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitRejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '500',
    marginLeft: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  noRecords: {
    padding: 20,
    alignItems: 'center',
  },
  noRecordsText: {
    color: 'red',
    fontSize: 14,
  },
});

export default EditRequests;