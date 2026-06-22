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
    
    // Format date to YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split('T')[0];
    formik.setFieldValue('dischargeAssignedDate', formattedDate);
  };

  // Handle manual date input
  const handleDateInput = (text) => {
    // Allow only numbers and dashes
    const cleaned = text.replace(/[^0-9-]/g, '');
    
    // Auto-format as user types (YYYY-MM-DD)
    let formatted = cleaned;
    if (cleaned.length === 4 || cleaned.length === 7) {
      formatted = cleaned + '-';
    }
    
    formik.setFieldValue('dischargeAssignedDate', formatted);
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
          <View>
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
                  }}
                  onBlur={formik.handleBlur('dischargeAssignedTeamLeaderId')}
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
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View pointerEvents="none">
                  <TextInput
                    style={[
                      styles.input,
                      formik.errors.dischargeAssignedDate &&
                        formik.touched.dischargeAssignedDate &&
                        styles.inputError,
                    ]}
                    placeholder="YYYY-MM-DD"
                    value={formik.values.dischargeAssignedDate}
                    onChangeText={handleDateInput}
                    onBlur={formik.handleBlur('dischargeAssignedDate')}
                    editable={false}
                  />
                </View>
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
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Table Row
  const renderTableRow = (item, index) => (
    <View key={index} style={styles.tableRow}>
      <Text style={[styles.tableCell, { width: 40, textAlign: 'center' }]}>
        {index + 1 || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 120 }]}>
        {item?.discharge_request_industry || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 100 }]}>
        {item?.sample_collected_date?.split(' ')[0] || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 100 }]}>
        {item?.analysis_date?.split(' ')[0] || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 90 }]}>
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
      <Text style={[styles.tableCell, { width: 60, textAlign: 'right' }]}>
        {item?.tds_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 60, textAlign: 'right' }]}>
        {item?.tss_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 60, textAlign: 'right' }]}>
        {item?.cod_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 60, textAlign: 'right' }]}>
        {item?.ph_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 70, textAlign: 'right' }]}>
        {item?.fluoride_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 70, textAlign: 'right' }]}>
        {item?.phenols_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 80, textAlign: 'right' }]}>
        {item?.ortho_phosphate_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 80, textAlign: 'right' }]}>
        {item?.nitrate_nitrogen_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 80, textAlign: 'right' }]}>
        {item?.ammonical_nitrogen_value || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 80, textAlign: 'right' }]}>
        {item?.hexavalent_chromium_value || '-'}
      </Text>
      <View style={[styles.tableCell, { width: 120, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
        {item?.discharge_assigned_team_leader_id !== null ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setShowModal(true);
              setRowData(item);
            }}
          >
            <Text style={styles.primaryButtonText}>Assign Duty</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.disabledButton} disabled>
            <Text style={styles.disabledButtonText}>Assigned</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.warningButton}>
          <Text style={styles.warningButtonText}>Notice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 40 }]}>S.No</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Industry</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Collected</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Analysis</Text>
                  <Text style={[styles.tableHeaderText, { width: 90 }]}>Pond</Text>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>TDS</Text>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>TSS</Text>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>COD</Text>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>PH</Text>
                  <Text style={[styles.tableHeaderText, { width: 70 }]}>Flouride</Text>
                  <Text style={[styles.tableHeaderText, { width: 70 }]}>Phenols</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Ortho Phos</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Nitrate N</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Ammonical N</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Hexa Chrom</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Action</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
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
  primaryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  disabledButtonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '500',
  },
  warningButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  warningButtonText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '500',
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

export default DischargeSummary;