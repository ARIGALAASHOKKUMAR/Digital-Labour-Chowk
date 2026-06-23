import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  Linking,
  Modal,
  NativeModules,
} from 'react-native';
import { commonAPICall, CONTEXT_HEADING, GENERATEQRCODES } from '../utils/utils';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');
const { RNFS } = NativeModules; // For React Native FS if available

function GenerateQrCode() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const dispatch = useDispatch();

  // Generate QR codes
  const generateQRs = async () => {
    setLoading(true);
    try {
      const generatedQRs = [];
      // Generate 10 QR codes with unique IDs
      for (let i = 0; i < 10; i++) {
        const uniqueId = `QR_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;
        generatedQRs.push({
          id: uniqueId,
          timestamp: new Date().toISOString(),
          type: 'PRODUCT_QR'
        });
      }
      
      const payload = {
        qrIds: generatedQRs.map(qr => qr.id),
      };

      const res = await commonAPICall(GENERATEQRCODES, payload, "post", dispatch);
      
      if (res.status === 200) {
        // Map response data to QR codes with image URLs
        const qrCodesWithImages = generatedQRs.map((qr, index) => ({
          ...qr,
          qrImageUrl: res.data.qrCodes?.[index]?.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr.id)}`,
          qrCodeId: res.data.qrCodes?.[index]?.id || qr.id,
        }));
        
        setQrCodes(qrCodesWithImages);
        setShowQRCodes(true);
        Alert.alert('Success', `${qrCodesWithImages.length} QR Codes generated successfully!`);
      }
    } catch (error) {
      console.error('Error generating QR codes:', error);
      Alert.alert('Error', 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  // Save image to gallery using RNFS (if available)
  const saveImageToGallery = async (imageUrl, fileName) => {
    try {
      // For Android, request permission
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save QR codes',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot save QR code without storage permission');
          return false;
        }
      }

      // Use Linking to open the image URL - this will work on both platforms
      await Linking.openURL(imageUrl);
      
      // Show success message
      if (Platform.OS === 'android') {
        ToastAndroid.show('Opening image for download', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Image opened in browser. Tap share icon to save.');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to open image for download');
      return false;
    }
  };

  // Download QR code image (using browser download)
  const downloadQRImage = async (qr, index) => {
    try {
      setDownloading(true);
      
      const imageUrl = qr.qrImageUrl;
      
      // Open the image URL in browser which will trigger download/prompt
      const supported = await Linking.canOpenURL(imageUrl);
      
      if (supported) {
        await Linking.openURL(imageUrl);
        if (Platform.OS === 'android') {
          ToastAndroid.show(`Opening QR Code ${index + 1} for download`, ToastAndroid.SHORT);
        } else {
          Alert.alert('Info', `QR Code ${index + 1} opened. Use browser's share button to save.`);
        }
      } else {
        Alert.alert('Error', 'Cannot open URL for download');
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      Alert.alert('Error', 'Failed to download QR code');
    } finally {
      setDownloading(false);
    }
  };

  // Share QR code image
  const shareQRImage = async (qr, index) => {
    try {
      const imageUrl = qr.qrImageUrl;
      const message = `📱 QR Code ${index + 1}\n\nID: ${qr.id}\n\nDownload QR Code Image: ${imageUrl}`;
      
      await Share.share({
        message: message,
        title: `QR Code ${index + 1}`,
        url: imageUrl, // For iOS, will try to share as URL
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // Fallback: share only URL
      try {
        await Share.share({
          message: `QR Code ${index + 1}: ${qr.id}\nImage: ${qr.qrImageUrl}`,
          title: `QR Code ${index + 1}`,
        });
      } catch (shareError) {
        Alert.alert('Error', 'Failed to share QR code');
      }
    }
  };

  // Share all QR codes
  const shareAllQRCodes = async () => {
    if (qrCodes.length === 0) {
      Alert.alert('Info', 'Please generate QR codes first');
      return;
    }

    try {
      let message = '📱 QR Codes List:\n\n';
      qrCodes.forEach((qr, index) => {
        message += `QR ${index + 1}:\n`;
        message += `ID: ${qr.id}\n`;
        message += `Download: ${qr.qrImageUrl}\n\n`;
      });
      
      await Share.share({
        message: message,
        title: 'All QR Codes',
      });
    } catch (error) {
      console.error('Error sharing QR codes:', error);
      Alert.alert('Error', 'Failed to share QR codes');
    }
  };

  // Download all QR codes
  const downloadAllQRCodes = async () => {
    if (qrCodes.length === 0) {
      Alert.alert('Info', 'Please generate QR codes first');
      return;
    }

    try {
      setDownloading(true);
      
      Alert.alert(
        'Download All QR Codes',
        `Open ${qrCodes.length} QR codes in browser for download?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open All', 
            onPress: async () => {
              let opened = 0;
              for (let i = 0; i < qrCodes.length; i++) {
                const imageUrl = qrCodes[i].qrImageUrl;
                const supported = await Linking.canOpenURL(imageUrl);
                if (supported) {
                  await Linking.openURL(imageUrl);
                  opened++;
                  if (Platform.OS === 'android') {
                    ToastAndroid.show(`Opening QR ${i + 1}/${qrCodes.length}`, ToastAndroid.SHORT);
                  }
                  // Add small delay between openings
                  if (i < qrCodes.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
              }
              Alert.alert('Success', `Opened ${opened} QR codes for download`);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading QR codes:', error);
      Alert.alert('Error', 'Failed to download QR codes');
    } finally {
      setDownloading(false);
    }
  };

  // View QR code in modal
  const viewQRCode = (qr, index) => {
    setSelectedQR({ ...qr, index });
    setShowPreviewModal(true);
  };

  // Handle QR code actions
  const handleQRAction = (action) => {
    if (!selectedQR) return;
    
    const { qr, index } = selectedQR;
    setShowPreviewModal(false);
    
    if (action === 'download') {
      downloadQRImage(qr, index);
    } else if (action === 'share') {
      shareQRImage(qr, index);
    }
  };

  // Render QR Code Preview Modal
  const renderPreviewModal = () => (
    <Modal
      visible={showPreviewModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPreviewModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowPreviewModal(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          
          {selectedQR && (
            <>
              <Text style={styles.modalTitle}>QR Code {selectedQR.index + 1}</Text>
              <Image
                source={{ uri: selectedQR.qr.qrImageUrl }}
                style={styles.modalQRImage}
                resizeMode="contain"
              />
              <Text style={styles.modalQRId}>ID: {selectedQR.qr.id}</Text>
              
              <View style={styles.modalActionContainer}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalShareButton]}
                  onPress={() => handleQRAction('share')}
                >
                  <Text style={styles.modalActionText}>📤 Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalDownloadButton]}
                  onPress={() => handleQRAction('download')}
                >
                  <Text style={styles.modalActionText}>📥 Download</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalHint}>
                Download will open the image in browser for saving
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      {renderPreviewModal()}
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Text style={styles.icon}>⚓</Text> Marine Industry
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.panel}>
            <View style={styles.panelHeading}>
              <Text style={styles.panelTitle}>{CONTEXT_HEADING}</Text>
            </View>

            <View style={styles.panelBody}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generateQRs}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Generate QR Codes</Text>
                  )}
                </TouchableOpacity>
              </View>

              {qrCodes.length > 0 && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>
                    Total QR Codes Generated: {qrCodes.length}
                  </Text>
                  <Text style={styles.statsSubText}>
                    Generated at: {new Date(qrCodes[0]?.timestamp).toLocaleString()}
                  </Text>
                </View>
              )}

              {showQRCodes && qrCodes.length > 0 && (
                <>
                  <View style={styles.gridContainer}>
                    {qrCodes.map((qr, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.gridItem}
                        // onPress={() => viewQRCode(qr, i)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: qr.qrImageUrl }}
                          style={styles.qrImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.qrLabel}>QR {i + 1}</Text>
                        {/* <Text style={styles.tapHint}>Tap to view</Text> */}
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.shareAllButton]}
                      onPress={shareAllQRCodes}
                    >
                      <Text style={styles.buttonText}>Share All</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.downloadAllButton]}
                      onPress={downloadAllQRCodes}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.buttonText}>Download All</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  icon: {
    marginRight: 8,
  },
  cardBody: {
    padding: 16,
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
    padding: 12,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  panelBody: {
    padding: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  generateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    minWidth: 200,
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 120,
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  shareAllButton: {
    backgroundColor: '#17a2b8',
  },
  downloadAllButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginVertical: 10,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statsSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  gridItem: {
    width: width / 4 - 16,
    padding: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  qrImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  qrLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 9,
    color: '#17a2b8',
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalQRImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  modalQRId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modalActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalShareButton: {
    backgroundColor: '#17a2b8',
  },
  modalDownloadButton: {
    backgroundColor: '#28a745',
  },
  modalActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalHint: {
    fontSize: 11,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default GenerateQrCode;