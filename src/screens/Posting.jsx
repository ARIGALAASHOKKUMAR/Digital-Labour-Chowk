import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
// import DocumentPicker from 'react-native-document-picker';
import { useDispatch } from "react-redux";
import {
  commonAPICall,
  CONTEXT_HEADING,
  CREATEMARINEDISCHARGEPOSTING,
  MARINEDISCHARGEDETAILS,
} from "../utils/utils";
import ImageBucketRN from "../utils/ImageBucketRN";
// import { commonAPICall, CONTEXT_HEADING, CREATEMARINEDISCHARGEPOSTING, MARINEDISCHARGEDETAILS } from '../../utils/utils';
// import { showPDF } from '../../utils/CommonFunctions';
// import ImageBucket from '../../utils/FileUploadUtils';

const Posting = () => {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guardPondId: "",
    qtyReadyForDischarge: "",
    remarks: "",
    gpLevelMeterImage: null,
    guardPondImage: null,
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const [touched, setTouched] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.guardPondId) newErrors.guardPondId = "required";
    if (!formData.qtyReadyForDischarge)
      newErrors.qtyReadyForDischarge = "required";
    if (!formData.remarks) newErrors.remarks = "required";
    if (!formData.gpLevelMeterImage) newErrors.gpLevelMeterImage = "required";
    if (!formData.guardPondImage) newErrors.guardPondImage = "required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Allow numbers and dot only
  const allowNumbersOnlyDot = (text) => {
    const regex = /^\d*\.?\d*$/;
    return regex.test(text);
  };

  const HandleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        guardPondId: formData.guardPondId,
        qtyReadyForDischarge: formData.qtyReadyForDischarge,
        remarks: formData.remarks,
        gpLevelMeterImage: formData.gpLevelMeterImage,
        guardPondImage: formData.guardPondImage,
      };

      const res = await commonAPICall(
        CREATEMARINEDISCHARGEPOSTING,
        payload,
        "post",
        dispatch,
      );
      if (res.status === 201) {
        setShowModal(false);
        resetForm();
        GetData();
        Alert.alert("Success", "Posting created successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create posting");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      guardPondId: "",
      qtyReadyForDischarge: "",
      remarks: "",
      gpLevelMeterImage: null,
      guardPondImage: null,
    });
    setErrors({});
  };

  const GetData = async () => {
    try {
      const res = await commonAPICall(
        MARINEDISCHARGEDETAILS,
        {},
        "get",
        dispatch,
      );

      
      if (res.status === 200) {
        setData(res.data.MarineDischargePostingDetails || []);
      } else {
        setData([]);
      }
    } catch (error) {
      setData([]);
    }
  };

  //   const handleFileUpload = async (fieldName) => {
  //     try {
  //       const result = await DocumentPicker.pick({
  //         type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
  //         maxSize: 20971520, // 20MB
  //       });

  //       if (result && result[0]) {
  //         const file = result[0];
  //         const path = 'APEMCL/MARNINEPOSTING/';

  //         // Upload file using ImageBucket utility
  //         const uploadResult = await ImageBucket(file, path, '20971520');

  //         setFormData({
  //           ...formData,
  //           [fieldName]: uploadResult || file.uri,
  //         });

  //         // Clear error for this field
  //         setErrors({
  //           ...errors,
  //           [fieldName]: null,
  //         });
  //       }
  //     } catch (err) {
  //       if (DocumentPicker.isCancel(err)) {
  //         // User cancelled
  //       } else {
  //         Alert.alert('Error', 'Failed to select file');
  //       }
  //     }
  //   };

  const renderItem = ({ item, index }) => {
    const getGuardPondName = (id) => {
      const pondMap = {
        1: "Guard Pond-1",
        2: "Guard Pond-2",
        3: "Guard Pond-3",
        4: "Guard Pond-4",
      };
      return pondMap[id] || "-";
    };

    return (
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.sNoCell]}>{index + 1}</Text>
        <Text style={[styles.tableCell, styles.sampleIdCell]}>
          {item?.discharge_request_id || "-"}
        </Text>
        <Text style={[styles.tableCell, styles.pondCell]}>
          {getGuardPondName(item?.guard_pond_id)}
        </Text>
        <Text style={[styles.tableCell, styles.dateCell]}>
          {item?.discharge_request_date || "-"}
        </Text>
        <View style={[styles.tableCell, styles.fileCell]}>
          {item?.discharge_request_gp_level_meter_image ? (
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                showPDF(item.discharge_request_gp_level_meter_image, dispatch)
              }
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noFileText}>-</Text>
          )}
        </View>
        <View style={[styles.tableCell, styles.fileCell]}>
          {item?.discharge_request_guard_pond_image ? (
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                showPDF(item.discharge_request_guard_pond_image, dispatch)
              }
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noFileText}>-</Text>
          )}
        </View>
        <Text style={[styles.tableCell, styles.statusCell]}>
          {item?.current_status || "-"}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    GetData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Modal for Add Posting */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Posting</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Guard Pond Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Guard Pond <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.guardPondId}
                    onValueChange={(itemValue) => {
                      setFormData({ ...formData, guardPondId: itemValue });
                      setErrors({ ...errors, guardPondId: null });
                    }}
                  >
                    <Picker.Item label="Select" value="" />
                    <Picker.Item label="Guard Pond-1" value="1" />
                    <Picker.Item label="Guard Pond-2" value="2" />
                    <Picker.Item label="Guard Pond-3" value="3" />
                    <Picker.Item label="Guard Pond-4" value="4" />
                  </Picker>
                </View>
                {errors.guardPondId && (
                  <Text style={styles.errorText}>{errors.guardPondId}</Text>
                )}
              </View>

              {/* Qty Ready for Discharge */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Qty ready for Discharge(KL) <Text style={styles.star}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.qtyReadyForDischarge}
                  onChangeText={(text) => {
                    if (allowNumbersOnlyDot(text)) {
                      setFormData({ ...formData, qtyReadyForDischarge: text });
                      setErrors({ ...errors, qtyReadyForDischarge: null });
                    }
                  }}
                  maxLength={10}
                  keyboardType="decimal-pad"
                />
                {errors.qtyReadyForDischarge && (
                  <Text style={styles.errorText}>
                    {errors.qtyReadyForDischarge}
                  </Text>
                )}
              </View>

              {/* Remarks */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Remarks <Text style={styles.star}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.remarks}
                  onChangeText={(text) => {
                    setFormData({ ...formData, remarks: text });
                    setErrors({ ...errors, remarks: null });
                  }}
                  maxLength={50}
                  multiline
                  numberOfLines={3}
                />
                {errors.remarks && (
                  <Text style={styles.errorText}>{errors.remarks}</Text>
                )}
              </View>

              {/* GP Level Meter Image */}
              {/* GP Level Meter Image */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  GP level meter image <Text style={styles.star}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    errors.gpLevelMeterImage &&
                      touched.gpLevelMeterImage &&
                      styles.inputError,
                  ]}
                  onPress={() => {
                    setTouched({ ...touched, gpLevelMeterImage: true });

                    let path = "APEMCL/MARNINEPOSTING/";

                    // Create formik-like object for ImageBucketRN
                    const formikLike = {
                      values: formData,
                      setFieldValue: (field, value) => {
                        setFormData((prev) => ({ ...prev, [field]: value }));
                        setErrors((prev) => ({ ...prev, [field]: null }));
                      },
                    };

                    ImageBucketRN(
                      formikLike,
                      path,
                      "gpLevelMeterImage",
                      20971520, // 20MB
                      "all",
                      dispatch,
                    );
                  }}
                >
                  <Text style={styles.uploadButtonText}>
                    Upload GP Meter Image
                  </Text>
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>
                  {formData.gpLevelMeterImage
                    ? (() => {
                        const fileUrl = formData.gpLevelMeterImage;

                        const isImage = /\.(jpg|jpeg|png)$/i.test(fileUrl);
                        const isPdf = /\.pdf$/i.test(fileUrl);

                        // IMAGE PREVIEW
                        if (isImage) {
                          return (
                            <View style={{ marginTop: 10 }}>
                              <Image
                                source={{ uri: fileUrl }}
                                style={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 8,
                                  resizeMode: "cover",
                                }}
                              />
                            </View>
                          );
                        }

                        // PDF DOWNLOAD ICON
                        if (isPdf) {
                          return (
                            <TouchableOpacity
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 10,
                              }}
                              onPress={() => Linking.openURL(fileUrl)}
                            >
                              <Ionicons
                                name="document-text-outline"
                                size={24}
                                color="red"
                              />
                              <Text style={{ marginLeft: 8, color: "blue" }}>
                                Download PDF
                              </Text>
                            </TouchableOpacity>
                          );
                        }

                        // DEFAULT (other files)
                        return (
                          <Text style={styles.fileNameText}>{fileUrl}</Text>
                        );
                      })()
                    : null}
                </View>

                {errors.gpLevelMeterImage && touched.gpLevelMeterImage && (
                  <Text style={styles.errorText}>
                    {errors.gpLevelMeterImage}
                  </Text>
                )}
              </View>

              {/* Guard Pond Image */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Guard Pond image <Text style={styles.star}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    errors.guardPondImage &&
                      touched.guardPondImage &&
                      styles.inputError,
                  ]}
                  onPress={() => {
                    setTouched({ ...touched, guardPondImage: true });

                    let path = "APEMCL/MARNINEPOSTING/";

                    // Create formik-like object for ImageBucketRN
                    const formikLike = {
                      values: formData,
                      setFieldValue: (field, value) => {
                        setFormData((prev) => ({ ...prev, [field]: value }));
                        setErrors((prev) => ({ ...prev, [field]: null }));
                      },
                    };

                    ImageBucketRN(
                      formikLike,
                      path,
                      "guardPondImage",
                      20971520, // 20MB
                      "all",
                      dispatch,
                    );
                  }}
                >
                  <Text style={styles.uploadButtonText}>
                    Upload Guard Pond Image
                  </Text>
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>
                  {formData.guardPondImage
                    ? (() => {
                        const fileUrl = formData.guardPondImage;

                        const isImage = /\.(jpg|jpeg|png)$/i.test(fileUrl);
                        const isPdf = /\.pdf$/i.test(fileUrl);

                        // IMAGE PREVIEW
                        if (isImage) {
                          return (
                            <View style={{ marginTop: 10 }}>
                              <Image
                                source={{ uri: fileUrl }}
                                style={{
                                  width: 120,
                                  height: 120,
                                  borderRadius: 8,
                                  resizeMode: "cover",
                                }}
                              />
                            </View>
                          );
                        }

                        // PDF DOWNLOAD ICON
                        if (isPdf) {
                          return (
                            <TouchableOpacity
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 10,
                              }}
                              onPress={() => Linking.openURL(fileUrl)}
                            >
                              <Ionicons
                                name="document-text-outline"
                                size={24}
                                color="red"
                              />
                              <Text style={{ marginLeft: 8, color: "blue" }}>
                                Download PDF
                              </Text>
                            </TouchableOpacity>
                          );
                        }

                        // DEFAULT (other files)
                        return (
                          <Text style={styles.fileNameText}>{fileUrl}</Text>
                        );
                      })()
                    : null}
                </View>

                {errors.guardPondImage && touched.guardPondImage && (
                  <Text style={styles.errorText}>{errors.guardPondImage}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={HandleSubmit}
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

      {/* Main Content */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Posting</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.panelHeader}>
            <Text style={styles.contextHeading}>{CONTEXT_HEADING}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Posting</Text>
            </TouchableOpacity>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.sNoCell]}>S.No</Text>
            <Text style={[styles.headerCell, styles.sampleIdCell]}>
              Sample Id
            </Text>
            <Text style={[styles.headerCell, styles.pondCell]}>
              Guard Pond (Volume)
            </Text>
            <Text style={[styles.headerCell, styles.dateCell]}>
              Requested Date
            </Text>
            <Text style={[styles.headerCell, styles.fileCell]}>
              GP Meter Image
            </Text>
            <Text style={[styles.headerCell, styles.fileCell]}>GP Image</Text>
            <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
          </View>

          {/* Table Body */}
          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.tableBody}
            />
          ) : (
            <View style={styles.noRecords}>
              <Text style={styles.noRecordsText}>No Records Found</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardBody: {
    padding: 16,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  contextHeading: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  uploadButton: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  backgroundColor: '#f9f9f9',
  alignItems: 'center',
},
uploadButtonText: {
  color: '#555',
  fontSize: 14,
},
inputError: {
  borderColor: 'red',
  borderWidth: 2,
},
fileNameText: {
  color: '#007bff',
  fontSize: 12,
  textDecorationLine: 'underline',
  marginTop: 10,
},
  addButton: {
    backgroundColor: "#009688",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    maxHeight: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "normal",
  },
  closeButton: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 16,
  },
  // Form styles
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  star: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  fileInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  fileInputText: {
    color: "#555",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Table styles
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    paddingVertical: 10,
    alignItems: "center",
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#495057",
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 12,
    color: "#495057",
    paddingHorizontal: 4,
  },
  sNoCell: {
    width: "8%",
    textAlign: "center",
  },
  sampleIdCell: {
    width: "15%",
  },
  pondCell: {
    width: "18%",
  },
  dateCell: {
    width: "15%",
  },
  fileCell: {
    width: "12%",
    alignItems: "center",
  },
  statusCell: {
    width: "20%",
  },
  tableBody: {
    maxHeight: 400,
  },
  viewButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 10,
  },
  noFileText: {
    color: "#999",
  },
  noRecords: {
    padding: 20,
    alignItems: "center",
  },
  noRecordsText: {
    color: "#dc3545",
    fontSize: 14,
  },
});

export default Posting;
