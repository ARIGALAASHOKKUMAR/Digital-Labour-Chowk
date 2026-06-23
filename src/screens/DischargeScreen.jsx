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
  Platform,
  FlatList,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ASSIGNDISCHARGEDUTY,
  commonAPICall,
  CONTEXT_HEADING,
  MARINEDISCHARGEDETAILS,
} from '../utils/utils';

const DischargeSummary = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Validation Schema
  const validationSchema = Yup.object({
    dischargeAssignedTeamLeaderId: Yup.string().required('Required'),
    dischargeAssignedDate: Yup.string().required('Required'),
  });

  // Formik instance
  const formik = useFormik({
    initialValues: {
      dischargeAssignedTeamLeaderId: '',
      dischargeAssignedDate: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      HandleSubmit(values);
    },
  });

  // API Calls
  const HandleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        postingId: rowData?.posting_id,
        dischargeAssignmentRemarks: 'Assigned for treated water discharge verification.',
      };
      const res = await commonAPICall(ASSIGNDISCHARGEDUTY, payload, 'post', dispatch);
      if (res.status === 200) {
        formik.resetForm();
        GetData();
        setShowModal(false);
        Alert.alert('Success', 'Duty assigned successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to assign duty');
    } finally {
      setLoading(false);
    }
  };

  const GetData = async () => {
    try {
      setLoading(true);
      const res = await commonAPICall(MARINEDISCHARGEDETAILS, {}, 'get', dispatch);
      if (res.status === 200) {
        setData(res.data.MarineDischargePostingDetails);
      } else {
        setData([]);
      }
    } catch (error) {
      setData([]);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetData();
  }, []);

  // Handle Date Change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    setShowDatePicker(Platform.OS === 'ios');
    setTempDate(currentDate);
    
    const formattedDate = currentDate.toISOString().split('T')[0];
    formik.setFieldValue('dischargeAssignedDate', formattedDate);
  };

  // Render Assign Duty Modal
  const renderAssignDutyModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign Duty</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Team Leader <Text style={styles.star}>*</Text>
              </Text>
              <View style={[
                styles.pickerWrapper,
                formik.errors.dischargeAssignedTeamLeaderId &&
                  formik.touched.dischargeAssignedTeamLeaderId &&
                  styles.inputError,
              ]}>
                <Picker
                  selectedValue={formik.values.dischargeAssignedTeamLeaderId}
                  onValueChange={(itemValue) => {
                    formik.setFieldValue('dischargeAssignedTeamLeaderId', itemValue);
                    formik.setFieldTouched('dischargeAssignedTeamLeaderId', true);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  <Picker.Item label="Select Team Leader" value="" />
                  <Picker.Item label="Team A" value="team_a" />
                  <Picker.Item label="Team B" value="team_b" />
                  <Picker.Item label="Team C" value="team_c" />
                  <Picker.Item label="Team D" value="team_d" />
                </Picker>
              </View>
              {formik.errors.dischargeAssignedTeamLeaderId &&
                formik.touched.dischargeAssignedTeamLeaderId && (
                  <Text style={styles.errorText}>
                    {formik.errors.dischargeAssignedTeamLeaderId}
                  </Text>
                )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Assigning Date <Text style={styles.star}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateInputWrapper,
                  formik.errors.dischargeAssignedDate &&
                    formik.touched.dischargeAssignedDate &&
                    styles.inputError,
                ]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dateInputText,
                  !formik.values.dischargeAssignedDate && styles.datePlaceholder
                ]}>
                  {formik.values.dischargeAssignedDate || 'YYYY-MM-DD'}
                </Text>
                <Icon name="calendar-outline" size={22} color="#666" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
              
              {formik.errors.dischargeAssignedDate &&
                formik.touched.dischargeAssignedDate && (
                  <Text style={styles.errorText}>
                    {formik.errors.dischargeAssignedDate}
                  </Text>
                )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={formik.handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render Card
  const renderCard = ({ item, index }) => {
    const isAssigned = item?.discharge_assigned_team_leader_id !== null;

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardHeaderItem}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardIndustry}>{item?.discharge_request_industry || '-'}</Text>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>#{index + 1}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBodyItem}>
          <View style={styles.cardRow}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Collected Date</Text>
              <Text style={styles.cardValue}>{item?.sample_collected_date?.split(' ')[0] || '-'}</Text>
            </View>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Analysis Date</Text>
              <Text style={styles.cardValue}>{item?.analysis_date?.split(' ')[0] || '-'}</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Guard Pond</Text>
              <Text style={styles.cardValue}>
                {item?.guard_pond_id === 1 || item?.guard_pond_id === '1'
                  ? 'Pond-1'
                  : item?.guard_pond_id === 2 || item?.guard_pond_id === '2'
                  ? 'Pond-2'
                  : item?.guard_pond_id === 3 || item?.guard_pond_id === '3'
                  ? 'Pond-3'
                  : item?.guard_pond_id === 4 || item?.guard_pond_id === '4'
                  ? 'Pond-4'
                  : '-'}
              </Text>
            </View>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Status</Text>
              <View style={[
                styles.statusBadge,
                isAssigned ? styles.statusAssigned : styles.statusPending
              ]}>
                <Text style={[
                  styles.statusText,
                  isAssigned ? styles.statusTextAssigned : styles.statusTextPending
                ]}>
                  {isAssigned ? 'Assigned' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Parameter Grid */}
          <View style={styles.parameterGrid}>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>TDS</Text>
              <Text style={styles.parameterValue}>{item?.tds_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>TSS</Text>
              <Text style={styles.parameterValue}>{item?.tss_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>COD</Text>
              <Text style={styles.parameterValue}>{item?.cod_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>PH</Text>
              <Text style={styles.parameterValue}>{item?.ph_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Flouride</Text>
              <Text style={styles.parameterValue}>{item?.fluoride_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Phenols</Text>
              <Text style={styles.parameterValue}>{item?.phenols_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Phosphate</Text>
              <Text style={styles.parameterValue}>{item?.ortho_phosphate_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Nitrate</Text>
              <Text style={styles.parameterValue}>{item?.nitrate_nitrogen_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Ammonical</Text>
              <Text style={styles.parameterValue}>{item?.ammonical_nitrogen_value || '-'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Chromium</Text>
              <Text style={styles.parameterValue}>{item?.hexavalent_chromium_value || '-'}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            {isAssigned ? (
              <TouchableOpacity style={styles.disabledButton} disabled>
                <Text style={styles.disabledButtonText}>Assigned</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.assignButton}
                onPress={() => {
                  setShowModal(true);
                  setRowData(item);
                }}
              >
                <Icon name="person-add-outline" size={16} color="#fff" />
                <Text style={styles.assignButtonText}>Assign Duty</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.noticeButton}>
              <Icon name="notifications-outline" size={16} color="#000" />
              <Text style={styles.noticeButtonText}>Notice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderAssignDutyModal()}

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
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderCard}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.noRecords}>
                  <Text style={styles.noRecordsText}>No Records Found</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    flex: 1,
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
    flex: 1,
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
  listContainer: {
    paddingBottom: 20,
  },
  // Card Styles
  cardItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeaderItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIndustry: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a5f',
    flex: 1,
  },
  cardBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBodyItem: {
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLabelContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusAssigned: {
    backgroundColor: '#d4edda',
  },
  statusPending: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextAssigned: {
    color: '#155724',
  },
  statusTextPending: {
    color: '#721c24',
  },
  parameterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  parameterItem: {
    width: '50%',
    paddingVertical: 4,
  },
  parameterLabel: {
    fontSize: 10,
    color: '#6c757d',
  },
  parameterValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 0.45,
    justifyContent: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  noticeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 0.45,
    justifyContent: 'center',
  },
  noticeButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
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
    maxHeight: '90%',
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
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  star: {
    color: 'red',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dateInputText: {
    fontSize: 14,
    color: '#333',
  },
  datePlaceholder: {
    color: '#999',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noRecords: {
    padding: 40,
    alignItems: 'center',
  },
  noRecordsText: {
    color: 'red',
    fontSize: 14,
  },
});

export default DischargeSummary;