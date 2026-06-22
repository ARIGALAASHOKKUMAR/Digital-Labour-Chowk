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
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  commonAPICall,
  CONTEXT_HEADING,
  MARINEDISCHARGEDETAILS,
  UPLOADANALYSISREPORT,
} from '../utils/utils';
import ImageBucketRN from '../utils/ImageBucketRN';

const AnalysisReport = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validation Schema
  const validationSchema = Yup.object({
    phValue: Yup.string().required('Required'),
    tssValue: Yup.string().required('Required'),
    tdsValue: Yup.string().required('Required'),
    codValue: Yup.string().required('Required'),
    fluorideValue: Yup.string().required('Required'),
    phenolsValue: Yup.string().required('Required'),
    orthoPhosphateValue: Yup.string().required('Required'),
    ammonicalNitrogenValue: Yup.string().required('Required'),
    nitrateNitrogenValue: Yup.string().required('Required'),
    hexavalentChromiumValue: Yup.string().required('Required'),
    analysisReportFile: Yup.string().required('Required'),
  });

  // Formik instance
  const formik = useFormik({
    initialValues: {
      phValue: '',
      tssValue: '',
      tdsValue: '',
      codValue: '',
      fluorideValue: '',
      phenolsValue: '',
      orthoPhosphateValue: '',
      ammonicalNitrogenValue: '',
      nitrateNitrogenValue: '',
      hexavalentChromiumValue: '',
      analysisReportFile: null,
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
      };
      const res = await commonAPICall(UPLOADANALYSISREPORT, payload, 'post', dispatch);
      if (res.status === 200) {
        formik.resetForm();
        GetData();
        setShowModal(false);
        Alert.alert('Success', 'Analysis report uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload analysis report');
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

  // Render Upload Modal
  const renderUploadModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Analysis Report</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* PH Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>PH Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.phValue && formik.touched.phValue && styles.inputError,
                ]}
                placeholder="Enter PH Value"
                keyboardType="numeric"
                value={formik.values.phValue}
                onChangeText={formik.handleChange('phValue')}
                onBlur={formik.handleBlur('phValue')}
              />
              {formik.errors.phValue && formik.touched.phValue && (
                <Text style={styles.errorText}>{formik.errors.phValue}</Text>
              )}
            </View>

            {/* TSS Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>TSS Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.tssValue && formik.touched.tssValue && styles.inputError,
                ]}
                placeholder="Enter TSS Value"
                keyboardType="numeric"
                value={formik.values.tssValue}
                onChangeText={formik.handleChange('tssValue')}
                onBlur={formik.handleBlur('tssValue')}
              />
              {formik.errors.tssValue && formik.touched.tssValue && (
                <Text style={styles.errorText}>{formik.errors.tssValue}</Text>
              )}
            </View>

            {/* TDS Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>TDS Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.tdsValue && formik.touched.tdsValue && styles.inputError,
                ]}
                placeholder="Enter TDS Value"
                keyboardType="numeric"
                value={formik.values.tdsValue}
                onChangeText={formik.handleChange('tdsValue')}
                onBlur={formik.handleBlur('tdsValue')}
              />
              {formik.errors.tdsValue && formik.touched.tdsValue && (
                <Text style={styles.errorText}>{formik.errors.tdsValue}</Text>
              )}
            </View>

            {/* COD Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>COD Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.codValue && formik.touched.codValue && styles.inputError,
                ]}
                placeholder="Enter COD Value"
                keyboardType="numeric"
                value={formik.values.codValue}
                onChangeText={formik.handleChange('codValue')}
                onBlur={formik.handleBlur('codValue')}
              />
              {formik.errors.codValue && formik.touched.codValue && (
                <Text style={styles.errorText}>{formik.errors.codValue}</Text>
              )}
            </View>

            {/* Fluoride Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fluoride Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.fluorideValue && formik.touched.fluorideValue && styles.inputError,
                ]}
                placeholder="Enter Fluoride Value"
                keyboardType="numeric"
                value={formik.values.fluorideValue}
                onChangeText={formik.handleChange('fluorideValue')}
                onBlur={formik.handleBlur('fluorideValue')}
              />
              {formik.errors.fluorideValue && formik.touched.fluorideValue && (
                <Text style={styles.errorText}>{formik.errors.fluorideValue}</Text>
              )}
            </View>

            {/* Phenols Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phenols Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.phenolsValue && formik.touched.phenolsValue && styles.inputError,
                ]}
                placeholder="Enter Phenols Value"
                keyboardType="numeric"
                value={formik.values.phenolsValue}
                onChangeText={formik.handleChange('phenolsValue')}
                onBlur={formik.handleBlur('phenolsValue')}
              />
              {formik.errors.phenolsValue && formik.touched.phenolsValue && (
                <Text style={styles.errorText}>{formik.errors.phenolsValue}</Text>
              )}
            </View>

            {/* Ortho Phosphate Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ortho Phosphate Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.orthoPhosphateValue && formik.touched.orthoPhosphateValue && styles.inputError,
                ]}
                placeholder="Enter Ortho Phosphate Value"
                keyboardType="numeric"
                value={formik.values.orthoPhosphateValue}
                onChangeText={formik.handleChange('orthoPhosphateValue')}
                onBlur={formik.handleBlur('orthoPhosphateValue')}
              />
              {formik.errors.orthoPhosphateValue && formik.touched.orthoPhosphateValue && (
                <Text style={styles.errorText}>{formik.errors.orthoPhosphateValue}</Text>
              )}
            </View>

            {/* Ammonical Nitrogen Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ammonical Nitrogen Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.ammonicalNitrogenValue && formik.touched.ammonicalNitrogenValue && styles.inputError,
                ]}
                placeholder="Enter Ammonical Nitrogen Value"
                keyboardType="numeric"
                value={formik.values.ammonicalNitrogenValue}
                onChangeText={formik.handleChange('ammonicalNitrogenValue')}
                onBlur={formik.handleBlur('ammonicalNitrogenValue')}
              />
              {formik.errors.ammonicalNitrogenValue && formik.touched.ammonicalNitrogenValue && (
                <Text style={styles.errorText}>{formik.errors.ammonicalNitrogenValue}</Text>
              )}
            </View>

            {/* Nitrate Nitrogen Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nitrate Nitrogen Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.nitrateNitrogenValue && formik.touched.nitrateNitrogenValue && styles.inputError,
                ]}
                placeholder="Enter Nitrate Nitrogen Value"
                keyboardType="numeric"
                value={formik.values.nitrateNitrogenValue}
                onChangeText={formik.handleChange('nitrateNitrogenValue')}
                onBlur={formik.handleBlur('nitrateNitrogenValue')}
              />
              {formik.errors.nitrateNitrogenValue && formik.touched.nitrateNitrogenValue && (
                <Text style={styles.errorText}>{formik.errors.nitrateNitrogenValue}</Text>
              )}
            </View>

            {/* Hexavalent Chromium Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hexavalent Chromium Value <Text style={styles.star}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  formik.errors.hexavalentChromiumValue && formik.touched.hexavalentChromiumValue && styles.inputError,
                ]}
                placeholder="Enter Hexavalent Chromium Value"
                keyboardType="numeric"
                value={formik.values.hexavalentChromiumValue}
                onChangeText={formik.handleChange('hexavalentChromiumValue')}
                onBlur={formik.handleBlur('hexavalentChromiumValue')}
              />
              {formik.errors.hexavalentChromiumValue && formik.touched.hexavalentChromiumValue && (
                <Text style={styles.errorText}>{formik.errors.hexavalentChromiumValue}</Text>
              )}
            </View>

            {/* Analysis Report File Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Analysis Report File <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  formik.errors.analysisReportFile && formik.touched.analysisReportFile && styles.inputError,
                ]}
                onPress={() => {
                  const path = 'APEMCL/MARINE/';
                  ImageBucketRN(
                    formik,
                    path,
                    'analysisReportFile',
                    20971520,
                    'all',
                    dispatch
                  );
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Analysis Report</Text>
              </TouchableOpacity>
              {formik.values.analysisReportFile && (
                <View style={styles.filePreview}>
                  {formik.values.analysisReportFile.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      source={{ uri: formik.values.analysisReportFile }}
                      style={styles.imagePreview}
                    />
                  ) : formik.values.analysisReportFile.match(/\.pdf$/i) ? (
                    <TouchableOpacity
                      style={styles.pdfPreview}
                      onPress={() => Linking.openURL(formik.values.analysisReportFile)}
                    >
                      <Icon name="document-text-outline" size={24} color="red" />
                      <Text style={styles.pdfText}>Download PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.fileNameText}>{formik.values.analysisReportFile}</Text>
                  )}
                </View>
              )}
              {formik.errors.analysisReportFile && formik.touched.analysisReportFile && (
                <Text style={styles.errorText}>{formik.errors.analysisReportFile}</Text>
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

  // Render Table Row
  const renderTableRow = (item, index) => (
    <View key={index} style={styles.tableRow}>
      <Text style={[styles.tableCell, { width: 40, textAlign: 'center' }]}>
        {index + 1}
      </Text>
      <Text style={[styles.tableCell, { width: 130 }]}>
        {item?.discharge_request_industry || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 120 }]}>
        {item?.discharge_request_date || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 100, textAlign: 'right' }]}>
        {item?.posting_id || '-'}
      </Text>
      <Text style={[styles.tableCell, { width: 100 }]}>
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
      <Text style={[styles.tableCell, { width: 120 }]}>
        {item?.sample_collection_assigned_date || '-'}
      </Text>
      <View style={[styles.tableCell, { width: 80, alignItems: 'center' }]}>
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => {
            setShowModal(true);
            setRowData(item);
          }}
        >
          <Icon name="create-outline" size={22} color="#007bff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderUploadModal()}

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
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Request Date</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Sample Id</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Guard Pond</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Assigned Date</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Action</Text>
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
    fontSize: 11,
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
    fontSize: 11,
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
    width: '95%',
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
});

export default AnalysisReport;