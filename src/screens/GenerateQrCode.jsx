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
  Linking
} from 'react-native';
import { commonAPICall, CONTEXT_HEADING, GENERATEQRCODES } from '../utils/utils';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

function GenerateQrCode() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Generate QR codes using free API (no installation needed)
  const generateQRCodeFromAPI = async (id) => {
    try {
      // Create QR code data
      const qrData = {
        id: id,
        timestamp: new Date().toISOString(),
        type: 'PRODUCT_QR'
      };
      
      // Convert to JSON string
      const qrDataString = JSON.stringify(qrData);
      
      // Use free QR code generation API
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataString)}`;
      
      return {
        id: id,
        data: qrData,
        qrImagedownloadUrl: qrImageUrl,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const dispatch = useDispatch()

  const preparePayload = () => {
    if (qrCodes.length === 0) {
      Alert.alert('Info', 'Please generate QR codes first');
      return null;
    }

    // Extract only unique IDs from QR codes
    const uniqueIds = qrCodes.map(qr => qr.id);
    
    // Create payload
    const payload = {
      qrIds: uniqueIds,
    };

    console.log("payload",payload);
    return payload;
  };

  // Generate multiple QR codes
  const generateQRs = async () => {
    setLoading(true);
    try {
      const generatedQRs = [];
      // Generate 10 QR codes with unique IDs
      for (let i = 0; i < 10; i++) {
        const uniqueId = `QR_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;
        const qr = await generateQRCodeFromAPI(uniqueId);
        generatedQRs.push(qr);
      }
      
      setQrCodes(generatedQRs);
      setShowQRCodes(false);
      const res = await commonAPICall(GENERATEQRCODES, preparePayload(), "post", dispatch)
      if(res.status === 200){
        setShowQRCodes(true)
      }
    } catch (error) {
      console.error('Error generating QR codes:', error);
      Alert.alert('Error', 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
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
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Download QR code image (using built-in browser download for web/Android)
  const downloadQRImage = async (qr, index) => {
    try {
      setDownloading(true);
      
      // For Android, request permission
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Cannot save QR code without storage permission');
          setDownloading(false);
          return;
        }
      }

      const imageUrl = qr.qrImagedownloadUrl;
      
      // Open the image URL in browser which will trigger download
      // This works on both Android and iOS
      const supported = await Linking.canOpenURL(imageUrl);
      
      if (supported) {
        await Linking.openURL(imageUrl);
        if (Platform.OS === 'android') {
          ToastAndroid.show(`Opening QR Code ${index + 1} for download`, ToastAndroid.SHORT);
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
      const imageUrl = qr.qrImagedownloadUrl;
      
      // Share the image URL
      await Share.share({
        message: `QR Code ${index + 1}\nGenerated QR Code Image\nURL: ${imageUrl}`,
        title: `QR Code ${index + 1}`,
        url: imageUrl, // For iOS
      });
      
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  // Share all QR codes
  const shareAllQRCodes = async () => {
    if (qrCodes.length === 0) {
      Alert.alert('Info', 'Please generate QR codes first');
      return;
    }

    try {
      // Create a message with all QR code URLs
      let message = 'QR Codes:\n\n';
      qrCodes.forEach((qr, index) => {
        message += `QR ${index + 1}: ${qr.qrImagedownloadUrl}\n\n`;
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
      
      // For Android, request permission
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Cannot save QR codes without storage permission');
          setDownloading(false);
          return;
        }
      }

      Alert.alert(
        'Download All',
        `Open ${qrCodes.length} QR codes in browser to download?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open All', 
            onPress: async () => {
              let opened = 0;
              for (let i = 0; i < qrCodes.length; i++) {
                const imageUrl = qrCodes[i].qrImagedownloadUrl;
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

  // Handle individual QR click
  const handleQRPress = (qr, index) => {
    Alert.alert(
      `QR Code ${index + 1}`,
      'Choose action:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share Image', 
          onPress: () => shareQRImage(qr, index)
        },
        { 
          text: 'Download Image', 
          onPress: () => downloadQRImage(qr, index)
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Text style={styles.icon}>⚓</Text> Marine Industry
          </Text>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.panel}>
            <View style={styles.panelHeading}>
              <Text style={styles.panelTitle}>{CONTEXT_HEADING}</Text>
            </View>

            <View style={styles.panelBody}>
              {/* Generate Button */}
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

              {/* QR Code Stats */}
              {qrCodes.length > 0 && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>
                    Total QR Codes Generated: {qrCodes.length}
                  </Text>
                  <Text style={styles.statsSubText}>
                    Generated at: {new Date(qrCodes[0]?.generatedAt).toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Share and Download All Buttons */}

              {/* QR Codes Grid - Only shown when reveal is clicked */}
              {showQRCodes && qrCodes.length > 0 && (
                <View style={styles.gridContainer}>
                  {qrCodes.map((qr, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.gridItem}
                      onPress={() => handleQRPress(qr, i)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: qr.qrImagedownloadUrl }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.qrLabel}>QR {i + 1}</Text>
                      <Text style={styles.tapHint}>Tap for options</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {qrCodes.length > 0 && (
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareAllButton]}
                    onPress={shareAllQRCodes}
                  >
                    <Text style={styles.buttonText}>Share All URLs</Text>
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
    minWidth: 150,
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
});

export default GenerateQrCode;