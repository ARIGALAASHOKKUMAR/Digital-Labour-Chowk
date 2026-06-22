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
  Image,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
// Import Camera correctly
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ASSIGNDUTYTEAMLEADER,
  COLLECTSAMPLEANDSENDTOLAB,
  commonAPICall,
  CONTEXT_HEADING,
  MARINEDISCHARGEDETAILS,
  UPDATEASSIGNDUTY,
} from '../utils/utils';
import ImageBucketRN from '../utils/ImageBucketRN';
import { Picker } from '@react-native-picker/picker';

const SampleCollectionRequests = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.LoginReducer);
  const { roleId } = state;
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [sampleModal, setSampleModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Validation Schemas
  const validationSchema = Yup.object({
    assignedTeamLeaderId: Yup.string().required('required'),
    assignedDate: Yup.string().required('required'),
  });

  const updateValidationSchema = Yup.object({
    assignedTeamLeaderId: Yup.string().required('required'),
    assignedDate: Yup.string().required('required'),
  });

  const sampleValidationSchema = Yup.object({
    inletSealImage: Yup.string().required('required'),
    levelMeterImage: Yup.string().required('required'),
    sampleCollectionRemarks: Yup.string().required('required'),
  });

  // Formik instances
  const formik = useFormik({
    initialValues: {
      assignedTeamLeaderId: '',
      assignedDate: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      HandleSubmit(values);
    },
  });

  const updateFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      assignedTeamLeaderId: rowData?.sample_collection_team_leader_id || '',
      assignedDate: rowData?.sample_collection_assigned_date
        ? moment(rowData.sample_collection_assigned_date, "DD-MM-YYYY").format("YYYY-MM-DD")
        : '',
    },
    validationSchema: updateValidationSchema,
    onSubmit: (values) => {
      HandleUpdateSubmit(values);
    },
  });

  const sampleFormik = useFormik({
    initialValues: {
      inletSealImage: null,
      levelMeterImage: null,
      sampleCollectionRemarks: '',
      sampleQrCode: '',
    },
    validationSchema: sampleValidationSchema,
    onSubmit: (values) => {
      HandleSampleSubmit(values);
    },
  });

  // API Calls
  const HandleSubmit = async (values) => {
    try {
      const payload = {
        postingId: rowData.posting_id,
        assignedTeamLeaderId: values.assignedTeamLeaderId,
        assignedDate: values.assignedDate,
        assignmentRemarks: 'Assigned for sample collection at Marine Discharge Point.',
      };
      const res = await commonAPICall(ASSIGNDUTYTEAMLEADER, payload, 'post', dispatch);
      if (res.status === 200) {
        setShowModal(false);
        GetData();
        formik.resetForm();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to assign duty');
    }
  };

  const HandleUpdateSubmit = async (values) => {
    try {
      const payload = {
        postingId: rowData.posting_id,
        assignedTeamLeaderId: values.assignedTeamLeaderId,
        assignedDate: values.assignedDate,
        assignmentRemarks: 'Team Leader changed due to unavailability of previously assigned officer.',
      };
      const res = await commonAPICall(UPDATEASSIGNDUTY, payload, 'post', dispatch);
      if (res.status === 200) {
        setUpdateModal(false);
        GetData();
        updateFormik.resetForm();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update duty');
    }
  };

  const HandleSampleSubmit = async (values) => {
    try {
      const payload = {
        postingId: rowData.posting_id,
        inletSealImage: values.inletSealImage,
        levelMeterImage: values.levelMeterImage,
        sampleCollectionRemarks: values.sampleCollectionRemarks,
        sampleQrCode: values.sampleQrCode || "QR059",
      };
      const res = await commonAPICall(COLLECTSAMPLEANDSENDTOLAB, payload, 'post', dispatch);
      if (res.status === 200) {
        setSampleModal(false);
        GetData();
        sampleFormik.resetForm();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit sample');
    }
  };

  const GetData = async () => {
    try {
      const res = await commonAPICall(MARINEDISCHARGEDETAILS, {}, 'get', dispatch);
      if (res.status === 200) {
        setData(res.data.MarineDischargePostingDetails);
      } else {
        setData([]);
      }
    } catch (error) {
      setData([]);
    }
  };

  // QR Code Scanning
  const handleBarCodeScanned = ({ data }) => {
    if (!scanning) return;

    setScanning(false);
    setQrModal(false);

    if (data) {
      sampleFormik.setFieldValue('sampleQrCode', data);
      Alert.alert('QR Code Scanned', `QR Code: ${data}`);

      if (!sampleModal) {
        setSampleModal(true);
      }
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to scan QR codes');
        return;
      }
    }
    setScanning(true);
    setQrModal(true);
  };

  const closeScanner = () => {
    setScanning(false);
    setQrModal(false);
  };

  useEffect(() => {
    GetData();
  }, []);

  // Render Functions
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
              <Text style={styles.label}>Team Leader <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.assignedTeamLeaderId && formik.touched.assignedTeamLeaderId && styles.inputError
                ]}
                placeholder="Select Team Leader"
                value={formik.values.assignedTeamLeaderId}
                onChangeText={formik.handleChange('assignedTeamLeaderId')}
                onBlur={formik.handleBlur('assignedTeamLeaderId')}
              />
              {formik.errors.assignedTeamLeaderId && formik.touched.assignedTeamLeaderId && (
                <Text style={styles.errorText}>{formik.errors.assignedTeamLeaderId}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Team Leader <Text style={styles.star}>*</Text></Text>
              <View style={[styles.dropdownContainer, formik.errors.assignedTeamLeaderId && formik.touched.assignedTeamLeaderId && styles.inputError]}>
                <Picker
                  selectedValue={formik.values.assignedTeamLeaderId}
                  onValueChange={(itemValue) => formik.setFieldValue('assignedTeamLeaderId', itemValue)}
                  onBlur={formik.handleBlur('assignedTeamLeaderId')}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Team Leader" value="" />
                  <Picker.Item label="TEAML" value="TEAML" />
                </Picker>
              </View>
              {formik.errors.assignedTeamLeaderId && formik.touched.assignedTeamLeaderId && (
                <Text style={styles.errorText}>{formik.errors.assignedTeamLeaderId}</Text>
              )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={formik.handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderUpdateDutyModal = () => (
    <Modal
      visible={updateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setUpdateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Duty</Text>
            <TouchableOpacity onPress={() => setUpdateModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Team Leader <Text style={styles.star}>*</Text></Text>
              <View style={[styles.dropdownContainer, updateFormik.errors.assignedTeamLeaderId && updateFormik.touched.assignedTeamLeaderId && styles.inputError]}>
                <Picker
                  selectedValue={updateFormik.values.assignedTeamLeaderId}
                  onValueChange={(itemValue) => updateFormik.setFieldValue('assignedTeamLeaderId', itemValue)}
                  onBlur={updateFormik.handleBlur('assignedTeamLeaderId')}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Team Leader" value="" />
                  <Picker.Item label="TEAML" value="TEAML" />

                </Picker>
              </View>
              {updateFormik.errors.assignedTeamLeaderId && updateFormik.touched.assignedTeamLeaderId && (
                <Text style={styles.errorText}>{updateFormik.errors.assignedTeamLeaderId}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assigning Date <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  updateFormik.errors.assignedDate && updateFormik.touched.assignedDate && styles.inputError
                ]}
                placeholder="YYYY-MM-DD"
                value={updateFormik.values.assignedDate}
                onChangeText={updateFormik.handleChange('assignedDate')}
                onBlur={updateFormik.handleBlur('assignedDate')}
              />
              {updateFormik.errors.assignedDate && updateFormik.touched.assignedDate && (
                <Text style={styles.errorText}>{updateFormik.errors.assignedDate}</Text>
              )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={updateFormik.handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSampleCollectionModal = () => (
    <Modal
      visible={sampleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setSampleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sample Collection</Text>
            <TouchableOpacity onPress={() => setSampleModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Inlet Seal Image <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  sampleFormik.errors.inletSealImage && sampleFormik.touched.inletSealImage && styles.inputError
                ]}
                onPress={() => {
                  const path = "APEMCL/MARINE/";
                  ImageBucketRN(
                    sampleFormik,
                    path,
                    "inletSealImage",
                    20971520,
                    "all",
                    dispatch
                  );
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Inlet Seal Image</Text>
              </TouchableOpacity>
              {sampleFormik.values.inletSealImage && (
                <View style={styles.filePreview}>
                  {sampleFormik.values.inletSealImage.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      source={{ uri: sampleFormik.values.inletSealImage }}
                      style={styles.imagePreview}
                    />
                  ) : sampleFormik.values.inletSealImage.match(/\.pdf$/i) ? (
                    <TouchableOpacity
                      style={styles.pdfPreview}
                      onPress={() => Linking.openURL(sampleFormik.values.inletSealImage)}
                    >
                      <Icon name="document-text-outline" size={24} color="red" />
                      <Text style={styles.pdfText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.fileNameText}>{sampleFormik.values.inletSealImage}</Text>
                  )}
                </View>
              )}
              {sampleFormik.errors.inletSealImage && sampleFormik.touched.inletSealImage && (
                <Text style={styles.errorText}>{sampleFormik.errors.inletSealImage}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Level Meter Image <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  sampleFormik.errors.levelMeterImage && sampleFormik.touched.levelMeterImage && styles.inputError
                ]}
                onPress={() => {
                  const path = "APEMCL/MARINE/";
                  ImageBucketRN(
                    sampleFormik,
                    path,
                    "levelMeterImage",
                    20971520,
                    "all",
                    dispatch
                  );
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Level Meter Image</Text>
              </TouchableOpacity>
              {sampleFormik.values.levelMeterImage && (
                <View style={styles.filePreview}>
                  {sampleFormik.values.levelMeterImage.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      source={{ uri: sampleFormik.values.levelMeterImage }}
                      style={styles.imagePreview}
                    />
                  ) : sampleFormik.values.levelMeterImage.match(/\.pdf$/i) ? (
                    <TouchableOpacity
                      style={styles.pdfPreview}
                      onPress={() => Linking.openURL(sampleFormik.values.levelMeterImage)}
                    >
                      <Icon name="document-text-outline" size={24} color="red" />
                      <Text style={styles.pdfText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.fileNameText}>{sampleFormik.values.levelMeterImage}</Text>
                  )}
                </View>
              )}
              {sampleFormik.errors.levelMeterImage && sampleFormik.touched.levelMeterImage && (
                <Text style={styles.errorText}>{sampleFormik.errors.levelMeterImage}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>QR Code</Text>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={openScanner}
              >
                <Icon name="qr-code-outline" size={24} color="#fff" />
                <Text style={styles.qrButtonText}>Scan QR Code</Text>
              </TouchableOpacity>
              {sampleFormik.values.sampleQrCode && (
                <View style={styles.qrPreview}>
                  <Icon name="checkmark-circle" size={20} color="green" />
                  <Text style={styles.qrCodeText}>QR Code: {sampleFormik.values.sampleQrCode}</Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.textArea,
                  sampleFormik.errors.sampleCollectionRemarks && sampleFormik.touched.sampleCollectionRemarks && styles.inputError
                ]}
                placeholder="Enter remarks"
                multiline
                numberOfLines={4}
                value={sampleFormik.values.sampleCollectionRemarks}
                onChangeText={sampleFormik.handleChange('sampleCollectionRemarks')}
                onBlur={sampleFormik.handleBlur('sampleCollectionRemarks')}
              />
              {sampleFormik.errors.sampleCollectionRemarks && sampleFormik.touched.sampleCollectionRemarks && (
                <Text style={styles.errorText}>{sampleFormik.errors.sampleCollectionRemarks}</Text>
              )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={sampleFormik.handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderQRScannerModal = () => {
    // Don't render Camera if permission is not granted
    if (!permission?.granted) {
      return (
        <Modal
          visible={qrModal}
          transparent
          animationType="slide"
          onRequestClose={closeScanner}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.qrModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Scan QR Code</Text>
                <TouchableOpacity onPress={closeScanner}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Camera permission is required</Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermission}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeScanner}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <Modal
        visible={qrModal}
        transparent
        animationType="slide"
        onRequestClose={closeScanner}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan QR Code</Text>
              <TouchableOpacity onPress={closeScanner}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
              >
                <View style={styles.overlay}>
                  <View style={styles.scannerFrame} />
                  <Text style={styles.scanInstruction}>Align QR code within the frame</Text>
                </View>
              </CameraView>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeScanner}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderAssignDutyModal()}
      {renderUpdateDutyModal()}
      {renderSampleCollectionModal()}
      {renderQRScannerModal()}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Icon name="list" size={20} color="#000" /> Sample Collection Requests
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.headerPanel}>
            <Text style={styles.headerText}>{CONTEXT_HEADING}</Text>
          </View>

          <View style={styles.tableContainer}>
            <ScrollView horizontal>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 50 }]}>S.No</Text>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>Requested Industry</Text>
                  {roleId === 8 && (
                    <Text style={[styles.tableHeaderText, { width: 130 }]}>Sample Request Date</Text>
                  )}
                  {roleId === 9 && (
                    <Text style={[styles.tableHeaderText, { width: 100 }]}>Sample Id</Text>
                  )}
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Guard Pond</Text>
                  {roleId === 9 && (
                    <Text style={[styles.tableHeaderText, { width: 130 }]}>Assigned Date</Text>
                  )}
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Action</Text>
                </View>

                {data.length > 0 ? (
                  data.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: 50, textAlign: 'center' }]}>
                        {index + 1}
                      </Text>
                      <Text style={[styles.tableCell, { width: 150 }]}>
                        {item?.discharge_request_industry}
                      </Text>
                      {roleId === 8 && (
                        <Text style={[styles.tableCell, { width: 130 }]}>
                          {item?.discharge_request_date}
                        </Text>
                      )}
                      {roleId === 9 && (
                        <Text style={[styles.tableCell, { width: 100, textAlign: 'right' }]}>
                          {item?.posting_id}
                        </Text>
                      )}
                      <Text style={[styles.tableCell, { width: 120 }]}>
                        {item?.guard_pond_id === 1 || item?.guard_pond_id === '1'
                          ? 'Guard Pond-1'
                          : item?.guard_pond_id === 2 || item?.guard_pond_id === '2'
                            ? 'Guard Pond-2'
                            : item?.guard_pond_id === 3 || item?.guard_pond_id === '3'
                              ? 'Guard Pond-3'
                              : item?.guard_pond_id === 4 || item?.guard_pond_id === '4'
                                ? 'Guard Pond-4'
                                : '-'}
                      </Text>
                      {roleId === 9 && (
                        <Text style={[styles.tableCell, { width: 130 }]}>
                          {item?.sample_collection_assigned_date}
                        </Text>
                      )}
                      <View style={[styles.tableCell, { width: 120, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }]}>
                        {roleId === 8 && (
                          <>
                            {item.sample_collection_team_leader_id !== null ? (
                              <>
                                <TouchableOpacity style={styles.disabledButton} disabled>
                                  <Text style={styles.disabledButtonText}>Assigned</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.editButton}
                                  onPress={() => {
                                    setUpdateModal(true);
                                    setRowData(item);
                                  }}
                                >
                                  <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>
                              </>
                            ) : (
                              <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => {
                                  setShowModal(true);
                                  setRowData(item);
                                }}
                              >
                                <Text style={styles.primaryButtonText}>Assign Duty</Text>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                        {roleId === 9 && (
                          <TouchableOpacity
                            style={styles.editIcon}
                            onPress={() => {
                              setSampleModal(true);
                              setRowData(item);
                              sampleFormik.setFieldValue('sampleQrCode', '');
                            }}
                          >
                            <Icon name="create-outline" size={20} color="#007bff" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noRecords}>
                    <Text style={styles.noRecordsText}>No Records Found</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
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
  tableContainer: {
    overflow: 'scroll',
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
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#000',
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
    paddingHorizontal: 8,
    fontSize: 12,
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
    maxHeight: '80%',
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '95%',
    height: '80%',
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
  textArea: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
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
  qrButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  qrPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  qrCodeText: {
    marginLeft: 8,
    color: 'green',
    fontSize: 14,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  disabledButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  editIcon: {
    padding: 6,
  },
  noRecords: {
    padding: 20,
    alignItems: 'center',
  },
  noRecordsText: {
    color: 'red',
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
    marginTop: 10,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 400,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#007bff',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  scanInstruction: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  permissionText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SampleCollectionRequests;