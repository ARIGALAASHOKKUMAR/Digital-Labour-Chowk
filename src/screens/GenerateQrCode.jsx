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
  Platform
} from 'react-native';
import { CONTEXT_HEADING } from '../utils/utils';

const { width } = Dimensions.get('window');

function GenerateQrCode() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);

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
      setShowQRCodes(false); // Hide QR codes initially after generation
      Alert.alert('Success', `${generatedQRs.length} QR codes generated successfully!`);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      Alert.alert('Error', 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  // Prepare payload with only unique IDs
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

  

  // Share QR codes with payload
  const shareQRCodes = async () => {
    if (qrCodes.length === 0) {
      Alert.alert('Info', 'Please generate QR codes first');
      return;
    }

    try {
      // Prepare the payload
      const payload = preparePayload();
      
      if (!payload) return;

      // Format payload for sharing
      const shareMessage = {
        title: 'QR Codes Payload',
        message: `Total QR Codes: ${payload.totalCount}\n\nQR IDs:\n${payload.qrIds.join('\n')}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`,
        timestamp: payload.generatedAt
      };

      // Share using React Native's Share API
      await Share.share({
        message: shareMessage.message,
        title: shareMessage.title,
      });

      // Also log payload to console for debugging
      console.log('Shared Payload:', payload);
      
    } catch (error) {
      console.error('Error sharing QR codes:', error);
      Alert.alert('Error', 'Failed to share QR codes');
    }
  };

  // Share only the payload as JSON
  const sharePayloadAsJSON = async () => {
    if (qrCodes.length === 0) {
      Alert.alert('Info', 'Please generate QR codes first');
      return;
    }

    try {
      const payload = preparePayload();
      if (!payload) return;

      const jsonPayload = JSON.stringify(payload, null, 2);
      
      await Share.share({
        message: `Here is the QR codes payload:\n\n${jsonPayload}`,
        title: 'QR Codes Payload JSON',
      });

      console.log('JSON Payload shared:', jsonPayload);
      
    } catch (error) {
      console.error('Error sharing payload:', error);
      Alert.alert('Error', 'Failed to share payload');
    }
  };

  // Copy payload to clipboard (optional - if you want)
  const copyPayload = () => {
    const payload = preparePayload();
    if (!payload) return;

    // For now just show alert with payload
    Alert.alert(
      'Payload Ready',
      JSON.stringify(payload, null, 2),
      [
        {
          text: 'OK',
          style: 'default'
        },
        {
          text: 'Share Payload',
          onPress: sharePayloadAsJSON
        }
      ]
    );
  };

  // Reveal QR codes
  const revealQRs = () => {
    if (qrCodes.length === 0) {
      Alert.alert('Info', 'Please generate QR codes first');
      return;
    }
    setShowQRCodes(true);
  };

  // Hide QR codes
  const hideQRs = () => {
    setShowQRCodes(false);
  };

  // Share individual QR code
  const shareIndividualQR = async (qr, index) => {
    try {
      // Prepare individual payload
      const individualPayload = {
        qrId: qr.id,
        timestamp: new Date().toISOString(),
        type: 'INDIVIDUAL_QR'
      };

      await Share.share({
        message: `QR Code ${index + 1}\nID: ${qr.id}\nPayload: ${JSON.stringify(individualPayload, null, 2)}`,
        title: `QR Code ${index + 1}`,
        url: qr.qrImagedownloadUrl, // For iOS
      });
    } catch (error) {
      console.error('Error sharing individual QR:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
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

              {/* Action Buttons Row */}
              {qrCodes.length > 0 && (
                <View style={styles.actionRow}>
                  {!showQRCodes ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.revealButton]}
                      onPress={revealQRs}
                    >
                      <Text style={styles.buttonText}>Reveal QR Codes</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.hideButton]}
                      onPress={hideQRs}
                    >
                      <Text style={styles.buttonText}>Hide QR Codes</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Share and Payload Buttons */}
              {qrCodes.length > 0 && (
                <View style={styles.shareButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.shareButton, styles.shareAllButton]}
                    onPress={shareQRCodes}
                  >
                    <Text style={styles.buttonText}>Share All</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.shareButton, styles.payloadButton]}
                    onPress={sharePayloadAsJSON}
                  >
                    <Text style={styles.buttonText}>Share Payload</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareButton, styles.copyButton]}
                    onPress={copyPayload}
                  >
                    <Text style={styles.buttonText}>View Payload</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* QR Codes Grid - Only shown when reveal is clicked */}
              {showQRCodes && qrCodes.length > 0 && (
                <View style={styles.gridContainer}>
                  {qrCodes.map((qr, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.gridItem}
                      onPress={() => shareIndividualQR(qr, i)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: qr.qrImagedownloadUrl }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.qrLabel}>QR {i + 1}</Text>
                      {/* <Text style={styles.qrSubLabel}>
                        {qr.id.substring(0, 15)}...
                      </Text> */}
                      <Text style={styles.tapHint}>Tap to share</Text>
                    </TouchableOpacity>
                  ))}
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 150,
    alignItems: 'center',
  },
  revealButton: {
    backgroundColor: '#28a745',
  },
  hideButton: {
    backgroundColor: '#dc3545',
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 8,
  },
  shareButton: {
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
  payloadButton: {
    backgroundColor: '#6c757d',
  },
  copyButton: {
    backgroundColor: '#ffc107',
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
  qrSubLabel: {
    fontSize: 10,
    color: '#888',
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