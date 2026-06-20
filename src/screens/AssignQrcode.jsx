import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Linking,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ASSIGNDUTYTEAMLEADER, 
  COLLECTSAMPLEANDSENDTOLAB, 
  commonAPICall, 
  CONTEXT_HEADING, 
  MARINEDISCHARGEDETAILS, 
  UPDATEASSIGNDUTY 
} from '../utils/utils';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import ImageBucketRN from '../utils/ImageBucketRN';

function AssignQrcode() {
  const [showModal, setShowModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [sampleModal, setSampleModal] = useState(false);
  const [scanModal, setScanModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [scannedQR, setScannedQR] = useState('');
  const webViewRef = useRef(null);

  const state = useSelector((state) => state.LoginReducer);
  const { roleId } = state;

  // Form states
  const [assignForm, setAssignForm] = useState({
    assignedTeamLeaderId: '',
    assignedDate: ''
  });

  const [updateForm, setUpdateForm] = useState({
    assignedTeamLeaderId: '',
    assignedDate: ''
  });

  const [sampleForm, setSampleForm] = useState({
    inletSealImage: null,
    levelMeterImage: null,
    sampleCollectionRemarks: '',
    sampleQrCode: ''
  });

  // Form errors and touched states
  const [sampleErrors, setSampleErrors] = useState({});
  const [sampleTouched, setSampleTouched] = useState({});

  // Get data on mount
  useEffect(() => {
    GetData();
  }, []);

  // Handle form changes
  const handleAssignChange = (field, value) => {
    setAssignForm({ ...assignForm, [field]: value });
  };

  const handleUpdateChange = (field, value) => {
    setUpdateForm({ ...updateForm, [field]: value });
  };

  const handleSampleChange = (field, value) => {
    setSampleForm({ ...sampleForm, [field]: value });
    if (sampleErrors[field]) {
      setSampleErrors({ ...sampleErrors, [field]: null });
    }
  };

  // Validate sample form
  const validateSampleForm = () => {
    const errors = {};
    if (!sampleForm.inletSealImage) {
      errors.inletSealImage = 'Inlet Seal Image is required';
    }
    if (!sampleForm.levelMeterImage) {
      errors.levelMeterImage = 'Level Meter Image is required';
    }
    if (!sampleForm.sampleCollectionRemarks) {
      errors.sampleCollectionRemarks = 'Remarks are required';
    }
    if (!sampleForm.sampleQrCode) {
      errors.sampleQrCode = 'QR Code is required';
    }
    
    setSampleErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle QR Code Scan via WebView
  const handleQRCodeScanned = (data) => {
    setScannedQR(data);
    setSampleForm({ ...sampleForm, sampleQrCode: data });
    if (sampleErrors.sampleQrCode) {
      setSampleErrors({ ...sampleErrors, sampleQrCode: null });
    }
    setScanModal(false);
    Alert.alert('Success', 'QR Code scanned successfully!');
  };

  const dispatch = useDispatch()

  // Handle Sample Submit
  async function HandleSampleSubmit() {
    setSampleTouched({
      inletSealImage: true,
      levelMeterImage: true,
      sampleCollectionRemarks: true,
      sampleQrCode: true
    });

    if (!validateSampleForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let payload = {
        postingId: rowData.posting_id,
        inletSealImage: sampleForm.inletSealImage,
        levelMeterImage: sampleForm.levelMeterImage,
        sampleCollectionRemarks: sampleForm.sampleCollectionRemarks,
        sampleQrCode: sampleForm.sampleQrCode
      };
      
      let res = await commonAPICall(COLLECTSAMPLEANDSENDTOLAB, payload, 'post',dispatch);
      if (res.status === 200) {
        setSampleModal(false);
        GetData();
        setSampleForm({
          inletSealImage: null,
          levelMeterImage: null,
          sampleCollectionRemarks: '',
          sampleQrCode: ''
        });
        setScannedQR('');
        setSampleErrors({});
        setSampleTouched({});
        Alert.alert('Success', 'Sample collected and sent to lab successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to submit sample');
    } finally {
      setLoading(false);
    }
  }

  // Get Data
  async function GetData() {
    setLoading(true);
    try {
      let res = await commonAPICall(MARINEDISCHARGEDETAILS, {}, 'get',dispatch);
      if (res.status === 200) {
        setData(res.data.MarineDischargePostingDetails || []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  // Handle Assign Submit
  async function HandleSubmit() {
    if (!assignForm.assignedTeamLeaderId || !assignForm.assignedDate) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let payload = {
        postingId: rowData.posting_id,
        assignedTeamLeaderId: assignForm.assignedTeamLeaderId,
        assignedDate: assignForm.assignedDate,
        assignmentRemarks: 'Assigned for sample collection at Marine Discharge Point.'
      };
      let res = await commonAPICall(ASSIGNDUTYTEAMLEADER, payload, 'post',dispatch);
      if (res.status === 200) {
        setShowModal(false);
        GetData();
        setAssignForm({
          assignedTeamLeaderId: '',
          assignedDate: ''
        });
        Alert.alert('Success', 'Duty assigned successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to assign duty');
    } finally {
      setLoading(false);
    }
  }

  // Handle Update Submit
  async function HandleUpdateSubmit() {
    if (!updateForm.assignedTeamLeaderId || !updateForm.assignedDate) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let payload = {
        postingId: rowData.posting_id,
        assignedTeamLeaderId: updateForm.assignedTeamLeaderId,
        assignedDate: updateForm.assignedDate,
        assignmentRemarks: 'Team Leader changed due to unavailability of previously assigned officer.'
      };
      let res = await commonAPICall(UPDATEASSIGNDUTY, payload, 'post',dispatch);
      if (res.status === 200) {
        setUpdateModal(false);
        GetData();
        setUpdateForm({
          assignedTeamLeaderId: '',
          assignedDate: ''
        });
        Alert.alert('Success', 'Duty updated successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to update duty');
    } finally {
      setLoading(false);
    }
  }

  // QR Scanner Component using WebView
  const QRScannerWebView = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <script src="https://unpkg.com/jsqr@1.4.0/dist/jsQR.js"></script>
          <style>
            body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
            video { width: 100%; height: 100%; object-fit: cover; }
            #overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; pointer-events: none; }
            #scanner-box { width: 250px; height: 250px; border: 2px solid #00ff00; border-radius: 10px; box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.5); }
          </style>
        </head>
        <body>
          <video id="video" autoplay playsinline></video>
          <div id="overlay">
            <div id="scanner-box"></div>
          </div>
          <script>
            const video = document.getElementById('video');
            let scanning = true;

            // Get camera
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
              .then(stream => {
                video.srcObject = stream;
                video.play();
                requestAnimationFrame(tick);
              })
              .catch(err => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ error: 'Camera access denied' }));
              });

            function tick() {
              if (!scanning) return;
              if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
                
                if (code && code.data) {
                  scanning = false;
                  window.ReactNativeWebView.postMessage(JSON.stringify({ data: code.data }));
                }
              }
              requestAnimationFrame(tick);
            }
          </script>
        </body>
      </html>
    `;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.data) {
          handleQRCodeScanned(data.data);
        } else if (data.error) {
          Alert.alert('Error', data.error);
          setScanModal(false);
        }
      } catch (error) {
        console.error('Error parsing QR data:', error);
      }
    };

    return (
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        onError={(error) => {
          console.error('WebView error:', error);
          Alert.alert('Error', 'Failed to load QR scanner');
          setScanModal(false);
        }}
      />
    );
  };

  // Render loading indicator
  if (loading && data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* QR Code Scanner Modal using WebView */}
      <Modal
        visible={scanModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setScanModal(false)}
      >
        <SafeAreaView style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
            <TouchableOpacity onPress={() => setScanModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <QRScannerWebView />
          <View style={styles.scannerInstructions}>
            <Text style={styles.instructionText}>Position QR code in the box</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Assign Duty Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Duty</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Team Leader <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select Team Leader"
                  value={assignForm.assignedTeamLeaderId}
                  onChangeText={(value) => handleAssignChange('assignedTeamLeaderId', value)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Assigning Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={assignForm.assignedDate}
                  onChangeText={(value) => handleAssignChange('assignedDate', value)}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={HandleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Duty Modal */}
      <Modal
        visible={updateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Duty</Text>
              <TouchableOpacity onPress={() => setUpdateModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Team Leader <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select Team Leader"
                  value={updateForm.assignedTeamLeaderId}
                  onChangeText={(value) => handleUpdateChange('assignedTeamLeaderId', value)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Assigning Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={updateForm.assignedDate}
                  onChangeText={(value) => handleUpdateChange('assignedDate', value)}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={HandleUpdateSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sample Collection Modal */}
      <Modal
        visible={sampleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSampleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sample Collection</Text>
              <TouchableOpacity onPress={() => setSampleModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* QR Code Scanner */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Scan QR Code <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[
                    styles.scanButton,
                    sampleErrors.sampleQrCode && sampleTouched.sampleQrCode && styles.inputError
                  ]}
                  onPress={() => {
                    setSampleTouched({ ...sampleTouched, sampleQrCode: true });
                    setScannedQR('');
                    setScanModal(true);
                  }}
                >
                  <Text style={styles.scanButtonText}>
                    {sampleForm.sampleQrCode ? '✓ QR Scanned' : '📷 Scan QR Code'}
                  </Text>
                </TouchableOpacity>
                {sampleForm.sampleQrCode && (
                  <Text style={styles.scannedText}>QR Code: {sampleForm.sampleQrCode}</Text>
                )}
                {sampleErrors.sampleQrCode && sampleTouched.sampleQrCode && (
                  <Text style={styles.errorText}>{sampleErrors.sampleQrCode}</Text>
                )}
              </View>

              {/* Inlet Seal Image */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Inlet Seal Image <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    sampleErrors.inletSealImage && sampleTouched.inletSealImage && styles.inputError
                  ]}
                  onPress={() => {
                    setSampleTouched({ ...sampleTouched, inletSealImage: true });
                    let path = "APEMCL/MARINE/";
                    ImageBucketRN(
                      sampleForm,
                      path,
                      "inletSealImage",
                      20971520,
                    );
                  }}
                >
                  <Text style={styles.uploadButtonText}>
                    {sampleForm.inletSealImage ? '✓ Image Uploaded' : '📷 Upload Inlet Seal Image'}
                  </Text>
                </TouchableOpacity>
                
                <View style={{ alignItems: 'center' }}>
                  {sampleForm.inletSealImage ? (
                    (() => {
                      const fileUrl = sampleForm.inletSealImage;
                      const isImage = /\.(jpg|jpeg|png)$/i.test(fileUrl);
                      const isPdf = /\.pdf$/i.test(fileUrl);

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

                      return <Text style={styles.fileNameText}>{fileUrl}</Text>;
                    })()
                  ) : null}
                </View>

                {sampleErrors.inletSealImage && sampleTouched.inletSealImage && (
                  <Text style={styles.errorText}>{sampleErrors.inletSealImage}</Text>
                )}
              </View>

              {/* Level Meter Image */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Level Meter Image <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    sampleErrors.levelMeterImage && sampleTouched.levelMeterImage && styles.inputError
                  ]}
                  onPress={() => {
                    setSampleTouched({ ...sampleTouched, levelMeterImage: true });
                    let path = "APEMCL/MARINE/";
                    ImageBucketRN(
                      sampleForm,
                      path,
                      "levelMeterImage",
                      20971520,
                    );
                  }}
                >
                  <Text style={styles.uploadButtonText}>
                    {sampleForm.levelMeterImage ? '✓ Image Uploaded' : '📷 Upload Level Meter Image'}
                  </Text>
                </TouchableOpacity>
                
                <View style={{ alignItems: 'center' }}>
                  {sampleForm.levelMeterImage ? (
                    (() => {
                      const fileUrl = sampleForm.levelMeterImage;
                      const isImage = /\.(jpg|jpeg|png)$/i.test(fileUrl);
                      const isPdf = /\.pdf$/i.test(fileUrl);

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

                      return <Text style={styles.fileNameText}>{fileUrl}</Text>;
                    })()
                  ) : null}
                </View>

                {sampleErrors.levelMeterImage && sampleTouched.levelMeterImage && (
                  <Text style={styles.errorText}>{sampleErrors.levelMeterImage}</Text>
                )}
              </View>

              {/* Remarks */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Remarks <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    sampleErrors.sampleCollectionRemarks && sampleTouched.sampleCollectionRemarks && styles.inputError
                  ]}
                  placeholder="Enter remarks"
                  multiline
                  numberOfLines={4}
                  value={sampleForm.sampleCollectionRemarks}
                  onChangeText={(value) => {
                    handleSampleChange('sampleCollectionRemarks', value);
                    setSampleTouched({ ...sampleTouched, sampleCollectionRemarks: true });
                  }}
                  onBlur={() => setSampleTouched({ ...sampleTouched, sampleCollectionRemarks: true })}
                />
                {sampleErrors.sampleCollectionRemarks && sampleTouched.sampleCollectionRemarks && (
                  <Text style={styles.errorText}>{sampleErrors.sampleCollectionRemarks}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={HandleSampleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit Sample</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Main Card */}
      <ScrollView style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Text style={styles.icon}>📋</Text> Sample Collection Requests
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.panel}>
            <View style={styles.panelHeading}>
              <Text style={styles.panelTitle}>{CONTEXT_HEADING}</Text>
            </View>

            <View style={styles.panelBody}>
              <ScrollView horizontal>
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.headerCell, { width: 50 }]}>S.No</Text>
                    <Text style={[styles.tableCell, styles.headerCell, { width: 150 }]}>Requested Industry</Text>
                    {roleId === 8 && (
                      <Text style={[styles.tableCell, styles.headerCell, { width: 120 }]}>Sample Request Date</Text>
                    )}
                    {roleId === 9 && (
                      <Text style={[styles.tableCell, styles.headerCell, { width: 100 }]}>Sample Id</Text>
                    )}
                    <Text style={[styles.tableCell, styles.headerCell, { width: 120 }]}>Guard Pond</Text>
                    {roleId === 9 && (
                      <Text style={[styles.tableCell, styles.headerCell, { width: 120 }]}>Assigned Date</Text>
                    )}
                    <Text style={[styles.tableCell, styles.headerCell, { width: 150 }]}>Action</Text>
                  </View>

                  {data.length > 0 ? (
                    data.map((item, i) => (
                      <View key={i} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: 50, textAlign: 'center' }]}>{i + 1}</Text>
                        <Text style={[styles.tableCell, { width: 150 }]}>{item?.discharge_request_industry}</Text>
                        {roleId === 8 && (
                          <Text style={[styles.tableCell, { width: 120 }]}>{item?.discharge_request_date}</Text>
                        )}
                        {roleId === 9 && (
                          <Text style={[styles.tableCell, { width: 100, textAlign: 'right' }]}>{item?.posting_id}</Text>
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
                          <Text style={[styles.tableCell, { width: 120 }]}>{item?.sample_collection_assigned_date}</Text>
                        )}
                        <View style={[styles.tableCell, { width: 150 }]}>
                          {roleId === 8 && (
                            <View style={styles.actionContainer}>
                              {item.sample_collection_team_leader_id !== null ? (
                                <>
                                  <TouchableOpacity style={[styles.actionButton, styles.disabledButton]} disabled>
                                    <Text style={styles.actionText}>Assigned</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => {
                                      setUpdateModal(true);
                                      setRowData(item);
                                      setUpdateForm({
                                        assignedTeamLeaderId: item.sample_collection_team_leader_id || '',
                                        assignedDate: item.sample_collection_assigned_date 
                                          ? moment(item.sample_collection_assigned_date, "DD-MM-YYYY").format("YYYY-MM-DD")
                                          : ''
                                      });
                                    }}
                                  >
                                    <Text style={styles.actionText}>Edit</Text>
                                  </TouchableOpacity>
                                </>
                              ) : (
                                <TouchableOpacity
                                  style={[styles.actionButton, styles.assignButton]}
                                  onPress={() => {
                                    setShowModal(true);
                                    setRowData(item);
                                  }}
                                >
                                  <Text style={styles.actionText}>Assign Duty</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                          {roleId === 9 && (
                            <TouchableOpacity
                              style={[styles.actionButton, styles.collectButton]}
                              onPress={() => {
                                setSampleModal(true);
                                setRowData(item);
                                setSampleForm({
                                  inletSealImage: null,
                                  levelMeterImage: null,
                                  sampleCollectionRemarks: '',
                                  sampleQrCode: ''
                                });
                                setSampleErrors({});
                                setSampleTouched({});
                                setScannedQR('');
                              }}
                            >
                              <Text style={styles.actionText}>📝</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  icon: {
    marginRight: 8,
  },
  cardBody: {
    padding: 10,
  },
  panel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  panelHeading: {
    backgroundColor: '#007bff',
    padding: 10,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  panelBody: {
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#dee2e6',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    alignItems: 'center',
  },
  tableCell: {
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#333',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#495057',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  editButton: {
    backgroundColor: '#17a2b8',
  },
  assignButton: {
    backgroundColor: '#007bff',
  },
  collectButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  noRecords: {
    padding: 20,
    alignItems: 'center',
  },
  noRecordsText: {
    color: '#dc3545',
    fontSize: 14,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007bff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 15,
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
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  uploadButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fileNameText: {
    marginTop: 8,
    color: '#333',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007bff',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerInstructions: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
  },
  scanButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scannedText: {
    marginTop: 8,
    fontSize: 12,
    color: '#28a745',
  },
});

export default AssignQrcode;