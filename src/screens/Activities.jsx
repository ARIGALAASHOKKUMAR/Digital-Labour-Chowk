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
  Image,
  Linking,
  FlatList,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  commonAPICall,
  COMPLETEDISCHARGE,
  CONTEXT_HEADING,
  MARINEDISCHARGEDETAILS,
  STARTDISCHARGE,
  STARTREADINGEDITREQUEST,
} from '../utils/utils';
import ImageBucketRN from '../utils/ImageBucketRN';

const Activities = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= START VALIDATION =================
  const startValidationSchema = Yup.object({
    startReading: Yup.string().required('Required'),
    marineSealImage: Yup.string().required('Required'),
    startFlowMeterImage: Yup.string().required('Required'),
  });

  // ================= END VALIDATION =================
  const endValidationSchema = Yup.object({
    endReading: Yup.string().required('Required'),
    endFlowMeterImage: Yup.string().required('Required'),
  });

  // ================= START FORMIK =================
  const startFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      startReading: rowData?.start_reading || '',
      marineSealImage: null,
      startFlowMeterImage: null,
    },
    validationSchema: startValidationSchema,
    onSubmit: (values) => {
      HandleStartSubmit(values);
    },
  });

  // ================= END FORMIK =================
  const endFormik = useFormik({
    initialValues: {
      endReading: '',
      dischargeAction: '',
      endFlowMeterImage: null,
    },
    validationSchema: endValidationSchema,
    onSubmit: (values) => {
      HandleEndSubmit(values);
    },
  });

  // ================= START SUBMIT =================
  const HandleStartSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        postingId: rowData?.posting_id,
      };
      const res = await commonAPICall(STARTDISCHARGE, payload, 'post', dispatch);
      if (res.status === 200) {
        startFormik.resetForm();
        GetData();
        setShowStartModal(false);
        Alert.alert('Success', 'Start reading submitted successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit start reading');
    } finally {
      setLoading(false);
    }
  };

  // ================= END SUBMIT =================
  const HandleEndSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        postingId: rowData?.posting_id,
      };
      const res = await commonAPICall(COMPLETEDISCHARGE, payload, 'post', dispatch);
      if (res.status === 200) {
        endFormik.resetForm();
        GetData();
        setShowEndModal(false);
        Alert.alert('Success', 'End reading submitted successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit end reading');
    } finally {
      setLoading(false);
    }
  };

  // ================= GET DATA =================
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

  // ================= EDIT REQUEST =================
  const EditRequest = async () => {
    try {
      setLoading(true);
      const payload = {
        postingId: rowData?.posting_id,
        startReadingEditRequestRemarks: 'Incorrect start reading entered. Requesting permission to modify the reading.',
      };
      const res = await commonAPICall(STARTREADINGEDITREQUEST, payload, 'post', dispatch);
      if (res.status === 200) {
        GetData();
        Alert.alert('Success', 'Edit request submitted successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit edit request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetData();
  }, []);

  // ================= RENDER START MODAL =================
  const renderStartModal = () => (
    <Modal
      visible={showStartModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStartModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start Reading</Text>
            <TouchableOpacity onPress={() => setShowStartModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Start Reading <Text style={styles.star}>*</Text></Text>
                <TouchableOpacity onPress={EditRequest}>
                  <Icon name="create-outline" size={18} color="#6c757d" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  startFormik.errors.startReading &&
                    startFormik.touched.startReading &&
                    styles.inputError,
                ]}
                placeholder="Enter Start Reading"
                keyboardType="numeric"
                value={startFormik.values.startReading}
                onChangeText={startFormik.handleChange('startReading')}
                onBlur={startFormik.handleBlur('startReading')}
                editable={rowData?.start_reading_edit_request_flag === '2'}
              />
              {startFormik.errors.startReading && startFormik.touched.startReading && (
                <Text style={styles.errorText}>{startFormik.errors.startReading}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Marine Seal Image <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  startFormik.errors.marineSealImage &&
                    startFormik.touched.marineSealImage &&
                    styles.inputError,
                ]}
                onPress={() => {
                  const path = 'APEMCL/MARINE/';
                  ImageBucketRN(
                    startFormik,
                    path,
                    'marineSealImage',
                    20971520,
                    'all',
                    dispatch
                  );
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Marine Seal Image</Text>
              </TouchableOpacity>
              {startFormik.values.marineSealImage && (
                <View style={styles.filePreview}>
                  {startFormik.values.marineSealImage.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      source={{ uri: startFormik.values.marineSealImage }}
                      style={styles.imagePreview}
                    />
                  ) : startFormik.values.marineSealImage.match(/\.pdf$/i) ? (
                    <TouchableOpacity
                      style={styles.pdfPreview}
                      onPress={() => Linking.openURL(startFormik.values.marineSealImage)}
                    >
                      <Icon name="document-text-outline" size={24} color="red" />
                      <Text style={styles.pdfText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.fileNameText}>{startFormik.values.marineSealImage}</Text>
                  )}
                </View>
              )}
              {startFormik.errors.marineSealImage && startFormik.touched.marineSealImage && (
                <Text style={styles.errorText}>{startFormik.errors.marineSealImage}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Flow Meter Image <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  startFormik.errors.startFlowMeterImage &&
                    startFormik.touched.startFlowMeterImage &&
                    styles.inputError,
                ]}
                onPress={() => {
                  const path = 'APEMCL/MARINE/';
                  ImageBucketRN(
                    startFormik,
                    path,
                    'startFlowMeterImage',
                    20971520,
                    'all',
                    dispatch
                  );
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Flow Meter Image</Text>
              </TouchableOpacity>
              {startFormik.values.startFlowMeterImage && (
                <View style={styles.filePreview}>
                  {startFormik.values.startFlowMeterImage.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      source={{ uri: startFormik.values.startFlowMeterImage }}
                      style={styles.imagePreview}
                    />
                  ) : startFormik.values.startFlowMeterImage.match(/\.pdf$/i) ? (
                    <TouchableOpacity
                      style={styles.pdfPreview}
                      onPress={() => Linking.openURL(startFormik.values.startFlowMeterImage)}
                    >
                      <Icon name="document-text-outline" size={24} color="red" />
                      <Text style={styles.pdfText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.fileNameText}>{startFormik.values.startFlowMeterImage}</Text>
                  )}
                </View>
              )}
              {startFormik.errors.startFlowMeterImage && startFormik.touched.startFlowMeterImage && (
                <Text style={styles.errorText}>{startFormik.errors.startFlowMeterImage}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={startFormik.handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ================= RENDER END MODAL =================
  const renderEndModal = () => (
    <Modal
      visible={showEndModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEndModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>End Reading</Text>
            <TouchableOpacity onPress={() => setShowEndModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.startReadingDisplay}>
              <Text style={styles.startReadingLabel}>Start Reading:</Text>
              <Text style={styles.startReadingValue}>{rowData?.start_reading || '-'}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Discharge Type <Text style={styles.star}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <TextInput
                  style={[
                    styles.input,
                    endFormik.errors.dischargeAction &&
                      endFormik.touched.dischargeAction &&
                      styles.inputError,
                  ]}
                  placeholder="Select Discharge Type"
                  value={endFormik.values.dischargeAction}
                  onChangeText={endFormik.handleChange('dischargeAction')}
                  onBlur={endFormik.handleBlur('dischargeAction')}
                />
              </View>
              {endFormik.errors.dischargeAction && endFormik.touched.dischargeAction && (
                <Text style={styles.errorText}>{endFormik.errors.dischargeAction}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>End Reading <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  endFormik.errors.endReading &&
                    endFormik.touched.endReading &&
                    styles.inputError,
                ]}
                placeholder="Enter End Reading"
                keyboardType="numeric"
                value={endFormik.values.endReading}
                onChangeText={endFormik.handleChange('endReading')}
                onBlur={endFormik.handleBlur('endReading')}
              />
              {endFormik.errors.endReading && endFormik.touched.endReading && (
                <Text style={styles.errorText}>{endFormik.errors.endReading}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Flow Meter Image <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  endFormik.errors.endFlowMeterImage &&
                    endFormik.touched.endFlowMeterImage &&
                    styles.inputError,
                ]}
                onPress={() => {
                  const path = 'APEMCL/MARINE/';
                  ImageBucketRN(
                    endFormik,
                    path,
                    'endFlowMeterImage',
                    20971520,
                    'all',
                    dispatch
                  );
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Flow Meter Image</Text>
              </TouchableOpacity>
              {endFormik.values.endFlowMeterImage && (
                <View style={styles.filePreview}>
                  {endFormik.values.endFlowMeterImage.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      source={{ uri: endFormik.values.endFlowMeterImage }}
                      style={styles.imagePreview}
                    />
                  ) : endFormik.values.endFlowMeterImage.match(/\.pdf$/i) ? (
                    <TouchableOpacity
                      style={styles.pdfPreview}
                      onPress={() => Linking.openURL(endFormik.values.endFlowMeterImage)}
                    >
                      <Icon name="document-text-outline" size={24} color="red" />
                      <Text style={styles.pdfText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.fileNameText}>{endFormik.values.endFlowMeterImage}</Text>
                  )}
                </View>
              )}
              {endFormik.errors.endFlowMeterImage && endFormik.touched.endFlowMeterImage && (
                <Text style={styles.errorText}>{endFormik.errors.endFlowMeterImage}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={endFormik.handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ================= RENDER CARD =================
  const renderCard = ({ item, index }) => {
    const hasStartReading = item?.start_reading !== null && item?.start_reading !== undefined;
    const hasEndReading = item?.end_reading !== null && item?.end_reading !== undefined;
    const isStartDisabled = hasStartReading || hasEndReading;
    const isEndDisabled = !hasStartReading || hasEndReading;

    const totalDischarged = hasStartReading && hasEndReading
      ? (Number(item.end_reading || 0) - Number(item.start_reading || 0)).toFixed(2)
      : '-';

    const getGuardPondName = (id) => {
      const pondMap = {
        '1': 'Guard Pond-1',
        '2': 'Guard Pond-2',
        '3': 'Guard Pond-3',
        '4': 'Guard Pond-4',
      };
      return pondMap[id] || pondMap[String(id)] || '-';
    };

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardHeaderItem}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardIndustry}>{item?.discharge_request_industry || '-'}</Text>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>#{index + 1}</Text>
            </View>
          </View>
          <Text style={styles.cardPond}>{getGuardPondName(item?.guard_pond_id)}</Text>
        </View>

        <View style={styles.cardBodyItem}>
          <View style={styles.cardRow}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Discharge Date</Text>
              <Text style={styles.cardValue}>{item?.discharge_request_date?.split(' ')[0] || '-'}</Text>
            </View>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Total Qty</Text>
              <Text style={[styles.cardValue, styles.cardValueHighlight]}>{totalDischarged}</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Start Reading</Text>
              <Text style={styles.cardValue}>{item?.start_reading || '-'}</Text>
            </View>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>End Reading</Text>
              <Text style={styles.cardValue}>{item?.end_reading || '-'}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.cardActionButton, isStartDisabled ? styles.cardButtonDisabled : styles.cardButtonStart]}
              disabled={isStartDisabled}
              onPress={() => {
                setShowStartModal(true);
                setRowData(item);
              }}
            >
              <Icon
                name={hasStartReading ? 'checkmark-circle' : 'play-circle'}
                size={16}
                color="#fff"
              />
              <Text style={styles.cardButtonText}>
                {hasStartReading ? 'Started' : 'Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardActionButton, isEndDisabled ? styles.cardButtonDisabled : styles.cardButtonEnd]}
              disabled={isEndDisabled}
              onPress={() => {
                setShowEndModal(true);
                setRowData(item);
              }}
            >
              <Icon
                name={hasEndReading ? 'checkmark-circle' : 'stop-circle'}
                size={16}
                color="#fff"
              />
              <Text style={styles.cardButtonText}>
                {hasEndReading ? 'Completed' : 'End'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Indicator */}
          <View style={styles.cardStatus}>
            {hasStartReading && !hasEndReading && (
              <View style={styles.statusBadgeInProgress}>
                <View style={styles.statusDotInProgress} />
                <Text style={styles.statusTextInProgress}>In Progress</Text>
              </View>
            )}
            {hasStartReading && hasEndReading && (
              <View style={styles.statusBadgeCompleted}>
                <View style={styles.statusDotCompleted} />
                <Text style={styles.statusTextCompleted}>Completed</Text>
              </View>
            )}
            {!hasStartReading && !hasEndReading && (
              <View style={styles.statusBadgePending}>
                <View style={styles.statusDotPending} />
                <Text style={styles.statusTextPending}>Pending</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStartModal()}
      {renderEndModal()}

      <View >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Icon name="list" size={20} color="#000" /> Analysis Report
          </Text>
        </View>

        <View style={styles.cardBody}>
          {/* <View style={styles.headerPanel}>
            <Text style={styles.headerText}>{CONTEXT_HEADING}</Text>
          </View> */}

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
  cardPond: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
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
  cardValueHighlight: {
    color: '#007bff',
    fontWeight: '700',
    fontSize: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    flex: 0.45,
    justifyContent: 'center',
  },
  cardButtonStart: {
    backgroundColor: '#007bff',
  },
  cardButtonEnd: {
    backgroundColor: '#28a745',
  },
  cardButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardStatus: {
    marginTop: 10,
    alignItems: 'center',
  },
  statusBadgeInProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDotInProgress: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffc107',
    marginRight: 6,
  },
  statusDotCompleted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
    marginRight: 6,
  },
  statusDotPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc3545',
    marginRight: 6,
  },
  statusTextInProgress: {
    fontSize: 11,
    color: '#856404',
    fontWeight: '500',
  },
  statusTextCompleted: {
    fontSize: 11,
    color: '#155724',
    fontWeight: '500',
  },
  statusTextPending: {
    fontSize: 11,
    color: '#721c24',
    fontWeight: '500',
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#333',
    fontSize: 14,
  },
  filePreview: {
    marginTop: 10,
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  pdfText: {
    marginLeft: 8,
    color: 'blue',
  },
  fileNameText: {
    fontSize: 12,
    color: '#666',
  },
  startReadingDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startReadingLabel: {
    fontSize: 14,
    color: '#666',
  },
  startReadingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d6efd',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#fff',
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

export default Activities;