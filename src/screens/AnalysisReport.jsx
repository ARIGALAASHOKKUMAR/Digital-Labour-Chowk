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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ASSIGNDISCHARGEDUTY,
  commonAPICall,
  CONTEXT_HEADING,
  MARINEDISCHARGEDETAILS,
} from '../utils/utils';
import ImageBucketRN from '../utils/ImageBucketRN';

const AnalysisReport = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.LoginReducer);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Validation schema for Assign Duty
  const validationSchema = Yup.object({
    dischargeAssignedTeamLeaderId: Yup.string().required('Required'),
    dischargeAssignedDate: Yup.string().required('Required'),
  });

  // Validation schema for Notice
  const noticeValidationSchema = Yup.object({
    noticeRemarks: Yup.string().required('required').min(10, 'Remarks must be at least 10 characters'),
    noticeFile: Yup.string().required('required'),
  });

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

  const noticeFormik = useFormik({
    initialValues: {
      noticeRemarks: '',
      noticeFile: null,
    },
    validationSchema: noticeValidationSchema,
    onSubmit: (values) => {
      HandleNoticeSubmit(values);
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

  const HandleNoticeSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        postingId: rowData?.posting_id,
        noticeRemarks: values.noticeRemarks,
        noticeSubject: values.noticeSubject || 'Notice for discharge violation',
        noticeDate: moment().format('YYYY-MM-DD'),
        industryName: rowData?.discharge_request_industry,
        noticeFile: values.noticeFile,
      };
      
      const res = await commonAPICall('SEND_NOTICE', payload, 'post', dispatch);
      if (res.status === 200) {
        noticeFormik.resetForm();
        setShowNoticeModal(false);
        Alert.alert('Success', 'Notice sent successfully!');
      } else {
        Alert.alert('Error', 'Failed to send notice. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send notice');
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

  // QR Code Scanning
  const handleBarCodeScanned = async ({ data: scannedData }) => {
    if (!scanning) return;
    
    setScanning(false);
    setQrModal(false);
    
    if (scannedData) {
      try {
        setLoading(true);
        // Find the item with matching posting_id
        const foundItem = data.find(item => item.posting_id === scannedData);
        
        if (foundItem) {
          setRowData(foundItem);
          setShowModal(true);
          Alert.alert('Success', 'QR Code validated successfully!');
        } else {
          Alert.alert('Invalid QR Code', 'No record found for this QR code');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to validate QR code');
      } finally {
        setLoading(false);
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

  // Industry Limits
  const industryLimits = {
    "ANDHRA ORGANICS": {
      ph: { min: 5.5, max: 9.0 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      phosphate: 5,
      ammonical: 50,
      nitrate: 50,
      chromium: 0.1
    },
    "AETL": {
      ph: { min: 6.0, max: 9.0 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      ammonical: 50,
      nitrate: 50,
      chromium: 0.1
    },
    "APITORIA": {
      ph: { min: 6.5, max: 8.5 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      ammonical: 50,
      nitrate: 50,
      chromium: 0.1
    },
    "BRANDIX": {
      ph: { min: 6.0, max: 9.0 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      ammonical: 50,
      nitrate: 50,
      chromium: 0.1
    },
    "DECCAN": {
      ph: { min: 6.5, max: 8.5 },
      tss: 100,
      cod: 225,
      phenols: 1,
      phosphate: 5
    },
    "DIVI": {
      ph: { min: 6.5, max: 8.5 },
      tss: 100,
      cod: 225,
      fluoride: 15,
      phenols: 1,
      phosphate: 5,
      ammonical: 50,
      nitrate: 20,
      chromium: 0.1
    },
    "HETERO": {
      ph: { min: 6.0, max: 9.0 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      phosphate: 5,
      ammonical: 50,
      nitrate: 50,
      chromium: 0.1
    },
    "APARNA": {
      ph: { min: 6.0, max: 8.5 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      phosphate: 5,
      ammonical: 50,
      nitrate: 50,
      chromium: 0.1
    },
    "VISAKHA PHARMACITY": {
      ph: { min: 6.0, max: 9.0 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      ammonical: 50,
      nitrate: 50
    },
    "SMS": {
      ph: { min: 6.5, max: 8.5 },
      tss: 100,
      cod: 250,
      phenols: 1,
      phosphate: 5,
      ammonical: 100,
      chromium: 0.1
    },
    "SHREAS": {
      ph: { min: 5.5, max: 9.0 },
      tss: 100,
      cod: 250,
      phenols: 5,
      ammonical: 50,
      chromium: 1
    },
    "AUROACTIVE": {
      ph: { min: 5.5, max: 9.0 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      phosphate: 5,
      ammonical: 50,
      nitrate: 20,
      chromium: 0.1
    },
    "LYFIUS": {
      ph: { min: 5.5, max: 9.0 },
      tss: 100,
      cod: 250,
      fluoride: 15,
      phenols: 5,
      ammonical: 50,
      nitrate: 20,
      chromium: 1
    },
    "VIJAYANAGAR BIOTECH": {
      ph: { min: 6.5, max: 8.5 },
      tss: 100,
      cod: 250
    }
  };

  const defaultLimits = {
    ph: { min: 5.5, max: 9.0 },
    tds: 2100,
    tss: 100,
    cod: 250,
    fluoride: 15,
    phenols: 5,
    phosphate: 5,
    ammonical: 50,
    nitrate: 50,
    chromium: 0.1
  };

  const getIndustryLimitsByUsername = () => {
    const username = state?.username;
    if (!username) return defaultLimits;

    const normalizedUsername = username?.toUpperCase()?.trim();
    if (industryLimits[normalizedUsername]) {
      return industryLimits[normalizedUsername];
    }

    const matchedKey = Object.keys(industryLimits).find(
      (key) =>
        normalizedUsername.includes(key.toUpperCase()) ||
        key.toUpperCase().includes(normalizedUsername)
    );

    return matchedKey ? industryLimits[matchedKey] : defaultLimits;
  };

  const getValueColor = (value, limit, isPH = false) => {
    if (value === null || value === undefined || value === '' || value === '-' || limit === undefined) {
      return {};
    }

    const numericValue = parseFloat(value);
    let isValid = true;

    if (isPH) {
      isValid = numericValue >= limit?.min && numericValue <= limit?.max;
    } else {
      isValid = numericValue <= limit;
    }

    return {
      color: isValid ? 'green' : 'red',
      fontWeight: '700',
    };
  };

  const userIndustryLimits = getIndustryLimitsByUsername();

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
              <Text style={styles.label}>Team Leader <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.dischargeAssignedTeamLeaderId &&
                    formik.touched.dischargeAssignedTeamLeaderId &&
                    styles.inputError,
                ]}
                placeholder="Select Team Leader"
                value={formik.values.dischargeAssignedTeamLeaderId}
                onChangeText={formik.handleChange('dischargeAssignedTeamLeaderId')}
                onBlur={formik.handleBlur('dischargeAssignedTeamLeaderId')}
              />
              {formik.errors.dischargeAssignedTeamLeaderId &&
                formik.touched.dischargeAssignedTeamLeaderId && (
                  <Text style={styles.errorText}>
                    {formik.errors.dischargeAssignedTeamLeaderId}
                  </Text>
                )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assigning Date <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.dischargeAssignedDate &&
                    formik.touched.dischargeAssignedDate &&
                    styles.inputError,
                ]}
                placeholder="YYYY-MM-DD"
                value={formik.values.dischargeAssignedDate}
                onChangeText={formik.handleChange('dischargeAssignedDate')}
                onBlur={formik.handleBlur('dischargeAssignedDate')}
              />
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
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Notice Modal
  const renderNoticeModal = () => (
    <Modal
      visible={showNoticeModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setShowNoticeModal(false);
        noticeFormik.resetForm();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Notice</Text>
            <TouchableOpacity
              onPress={() => {
                setShowNoticeModal(false);
                noticeFormik.resetForm();
              }}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.textArea,
                  noticeFormik.errors.noticeRemarks &&
                    noticeFormik.touched.noticeRemarks &&
                    styles.inputError,
                ]}
                placeholder="Enter detailed remarks for the notice..."
                multiline
                numberOfLines={4}
                value={noticeFormik.values.noticeRemarks}
                onChangeText={noticeFormik.handleChange('noticeRemarks')}
                onBlur={noticeFormik.handleBlur('noticeRemarks')}
                textAlignVertical="top"
              />
              {noticeFormik.errors.noticeRemarks &&
                noticeFormik.touched.noticeRemarks && (
                  <Text style={styles.errorText}>
                    {noticeFormik.errors.noticeRemarks}
                  </Text>
                )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Attachment <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  noticeFormik.errors.noticeFile &&
                    noticeFormik.touched.noticeFile &&
                    styles.inputError,
                ]}
                onPress={() => {
                  const path = 'APEMCL/REGISTRATION/';
                  ImageBucketRN(
                    noticeFormik,
                    path,
                    'noticeFile',
                    20971520,
                    'all',
                    dispatch
                  );
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Attachment</Text>
              </TouchableOpacity>
              {noticeFormik.values.noticeFile && (
                <View style={styles.filePreview}>
                  {noticeFormik.values.noticeFile.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      source={{ uri: noticeFormik.values.noticeFile }}
                      style={styles.imagePreview}
                    />
                  ) : noticeFormik.values.noticeFile.match(/\.pdf$/i) ? (
                    <TouchableOpacity
                      style={styles.pdfPreview}
                      onPress={() => Linking.openURL(noticeFormik.values.noticeFile)}
                    >
                      <Icon name="document-text-outline" size={24} color="red" />
                      <Text style={styles.pdfText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.fileNameText}>{noticeFormik.values.noticeFile}</Text>
                  )}
                </View>
              )}
              {noticeFormik.errors.noticeFile &&
                noticeFormik.touched.noticeFile && (
                  <Text style={styles.errorText}>
                    {noticeFormik.errors.noticeFile}
                  </Text>
                )}
              <Text style={styles.hintText}>
                Allowed formats: PDF, JPEG, PNG, DOC, DOCX (Max size: 5MB)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={noticeFormik.handleSubmit}
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

  // Render QR Scanner Modal
  const renderQRScannerModal = () => {
    if (!permission?.granted) {
      return (
        <Modal visible={qrModal} transparent animationType="slide" onRequestClose={closeScanner}>
          <View style={styles.modalOverlay}>
            <View style={styles.qrModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Scan QR Code</Text>
                <TouchableOpacity onPress={closeScanner}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <View style={styles.permissionContainer}>
                <Icon name="camera-outline" size={60} color="#94a3b8" />
                <Text style={styles.permissionText}>Camera permission is required</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.cancelButton} onPress={closeScanner}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <Modal visible={qrModal} transparent animationType="slide" onRequestClose={closeScanner}>
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
            <TouchableOpacity style={styles.cancelButton} onPress={closeScanner}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Table Row
  const renderTableRow = (item, index) => {
    const limits = userIndustryLimits;
    const isAssigned = item.discharge_assigned_team_leader_id !== null;

    return (
      <View key={index} style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: 40, textAlign: 'center' }]}>
          {index + 1}
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
        <Text style={[styles.tableCell, { width: 60, textAlign: 'right', ...getValueColor(item?.tds_value, limits?.tds) }]}>
          {item?.tds_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 60, textAlign: 'right', ...getValueColor(item?.tss_value, limits?.tss) }]}>
          {item?.tss_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 60, textAlign: 'right', ...getValueColor(item?.cod_value, limits?.cod) }]}>
          {item?.cod_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 60, textAlign: 'right', ...getValueColor(item?.ph_value, limits?.ph, true) }]}>
          {item?.ph_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 70, textAlign: 'right', ...getValueColor(item?.fluoride_value, limits?.fluoride) }]}>
          {item?.fluoride_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 70, textAlign: 'right', ...getValueColor(item?.phenols_value, limits?.phenols) }]}>
          {item?.phenols_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 80, textAlign: 'right', ...getValueColor(item?.ortho_phosphate_value, limits?.phosphate) }]}>
          {item?.ortho_phosphate_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 80, textAlign: 'right', ...getValueColor(item?.nitrate_nitrogen_value, limits?.nitrate) }]}>
          {item?.nitrate_nitrogen_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 80, textAlign: 'right', ...getValueColor(item?.ammonical_nitrogen_value, limits?.ammonical) }]}>
          {item?.ammonical_nitrogen_value || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: 80, textAlign: 'right', ...getValueColor(item?.hexavalent_chromium_value, limits?.chromium) }]}>
          {item?.hexavalent_chromium_value || '-'}
        </Text>
        <View style={[styles.tableCell, { width: 120, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
          {isAssigned ? (
            <TouchableOpacity
              style={styles.disabledButton}
              disabled
            >
              <Icon name="person-add-outline" size={12} color="#fff" />
              <Text style={styles.disabledButtonText}>Assigned</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setShowModal(true);
                setRowData(item);
              }}
            >
              <Icon name="person-add-outline" size={12} color="#fff" />
              <Text style={styles.primaryButtonText}>Assign</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.warningButton}
            onPress={() => {
              setShowNoticeModal(true);
              setRowData(item);
              noticeFormik.resetForm();
            }}
          >
            <Icon name="notifications-outline" size={12} color="#000" />
            <Text style={styles.warningButtonText}>Notice</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderAssignDutyModal()}
      {renderNoticeModal()}
      {renderQRScannerModal()}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Icon name="list" size={20} color="#000" /> Analysis Report - {state?.username || 'Industry'}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.headerPanel}>
            <Text style={styles.headerText}>{CONTEXT_HEADING}</Text>
            <Text style={styles.headerSubText}>
              Industry Standards for: <Text style={styles.headerSubTextBold}>{state?.username || 'Default'}</Text>
            </Text>
          </View>

          {/* Scan QR Code Button */}
          <View style={styles.scanButtonContainer}>
            <TouchableOpacity style={styles.scanButton} onPress={openScanner} activeOpacity={0.8}>
              <Icon name="qr-code-outline" size={24} color="#fff" />
              <Text style={styles.scanButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
            <Text style={styles.scanHint}>Scan QR code to assign duty</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
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
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Phos</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Nitrate</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Ammonical</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Chromium</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Action</Text>
                </View>

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
  headerSubText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  headerSubTextBold: {
    fontWeight: 'bold',
  },
  scanButtonContainer: {
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  scanHint: {
    fontSize: 12,
    color: '#6c757d',
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
  hintText: {
    fontSize: 11,
    color: '#6c757d',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '500',
    marginLeft: 2,
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  disabledButtonText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '500',
    marginLeft: 2,
  },
  warningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffc107',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  warningButtonText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '500',
    marginLeft: 2,
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
    marginTop: 20,
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

export default AnalysisReport;