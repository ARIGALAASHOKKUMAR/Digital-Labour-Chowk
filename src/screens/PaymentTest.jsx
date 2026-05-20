import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { commonAPICall, PAYMENT_API } from '../utils/utils';
import { useDispatch } from 'react-redux';

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Static payload for payment creation
  const paymentPayload = {
    orderAmount: 1.00,
    orderRefNumber: "SBI200058",
    returnUrl: "https://swapi.dev.nidhi.apcfss.in/labour/api/open/payment/callback",
    payMode: "DC"
  };

  // Generate unique order reference number
  const generateOrderRefNumber = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `SBI${timestamp}${randomStr}`;
  };

  const dispatch = useDispatch();

  const createPayment = async (payMode) => {
    setLoading(true);
    
    try {
      const uniqueOrderRef = generateOrderRefNumber();
      const payload = {
        ...paymentPayload,
        orderRefNumber: uniqueOrderRef,
        payMode: payMode
      };

      const response = await commonAPICall(PAYMENT_API, payload, "post", dispatch);
      
      console.log("Payment API Response:", response);
      
      const data = response.data;
      
      if (data.status === 'CREATED' && data.transactionUrl && data.orderHash) {
        setOrderDetails(data);
        // Create HTML form for auto-submission to SBIePay
        const html = generateAutoSubmitForm(data);
        setPaymentHtml(html);
        setShowWebView(true);
      } else {
        Alert.alert('Error', 'Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Generate HTML form that auto-submits to SBIePay
 const generateAutoSubmitForm = (paymentData) => {
  const transactionUrl = paymentData.transactionUrl;
  
  // SBIePay typically expects these parameter names
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>SBIePay Secure Payment</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
        .loader {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        p {
          font-family: Arial, sans-serif;
          margin-top: 20px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <p>Redirecting to SBIePay Secure Gateway...</p>
      </div>
      
      <form id="paymentForm" method="POST" action="${transactionUrl}">
        <input type="hidden" name="encRequest" value="${paymentData.orderHash || paymentData.encRequest}" />
        <input type="hidden" name="accessCode" value="${paymentData.accessCode || ''}" />
      </form>
      
      <script>
        document.getElementById('paymentForm').submit();
      </script>
    </body>
    </html>
  `;
};

  const handleWebViewNavigationStateChange = (navState) => {
    console.log('Navigation URL:', navState.url);
    
    // Check for return URL or success/failure indicators
    if (navState.url.includes('/labour/api/open/payment/callback')) {
      console.log('Payment callback received:', navState.url);
      setShowWebView(false);
      
      // Parse the URL for payment status if needed
      Alert.alert(
        'Payment Status',
        'Payment process completed. Please check your payment status.',
        [{ text: 'OK', onPress: () => {
          setOrderDetails(null);
          setPaymentHtml('');
        }}]
      );
    }
    
    // Handle payment success/failure based on SBIePay response
    if (navState.url.includes('payment=success') || navState.url.includes('status=success')) {
      Alert.alert('Success', 'Payment completed successfully!');
    } else if (navState.url.includes('payment=failure') || navState.url.includes('status=failure')) {
      Alert.alert('Failed', 'Payment failed. Please try again.');
    }
  };

  const renderPaymentOptions = () => {
    return (
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Select Payment Method</Text>
        
        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => createPayment('CC')}
        >
          <Text style={styles.optionText}>💳 Credit Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => createPayment('DC')}
        >
          <Text style={styles.optionText}>💳 Debit Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => createPayment('NB')}
        >
          <Text style={styles.optionText}>🏦 Net Banking</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: '#9C27B0' }]}
          onPress={() => createPayment('UPI')}
        >
          <Text style={styles.optionText}>📱 UPI</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionButton, { backgroundColor: '#F44336' }]}
          onPress={() => createPayment('WALLET')}
        >
          <Text style={styles.optionText}>👛 Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (showWebView && paymentHtml) {
    return (
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => {
          setShowWebView(false);
          setPaymentHtml('');
        }}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.headerTitle}>Secure Payment Gateway</Text>
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Cancel Payment',
                  'Are you sure you want to cancel the payment?',
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', onPress: () => {
                      setShowWebView(false);
                      setPaymentHtml('');
                    }}
                  ]
                );
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: paymentHtml }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading Payment Gateway...</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Labour App Payment</Text>
        <Text style={styles.subtitle}>Complete your payment securely</Text>
      </View>

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>₹{paymentPayload.orderAmount.toFixed(2)}</Text>
        <Text style={styles.orderRef}>Order: {paymentPayload.orderRefNumber}</Text>
      </View>

      {renderPaymentOptions()}

      {/* Dummy Pay Now Button for Testing */}
      <View style={styles.dummySection}>
        <Text style={styles.dummyTitle}>Quick Test Payment</Text>
        <TouchableOpacity 
          style={styles.dummyPayButton}
          onPress={() => {
            Alert.alert(
              'Test Mode',
              'Select a payment method above to proceed with payment.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.dummyPayButtonText}>💰 PROCEED TO PAY</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Secure Payment Information</Text>
        <Text style={styles.infoText}>✓ Powered by SBIePay Secure Gateway</Text>
        <Text style={styles.infoText}>✓ 128-bit SSL Encryption</Text>
        <Text style={styles.infoText}>✓ All major Cards, UPI & NetBanking accepted</Text>
        <Text style={styles.infoText}>✓ PCI-DSS Compliant</Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Creating payment session...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  amountCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 10,
  },
  orderRef: {
    fontSize: 12,
    color: '#999',
  },
  optionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dummySection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  dummyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  dummyPayButton: {
    backgroundColor: '#FF5722',
    padding: 18,
    borderRadius: 10,
    elevation: 3,
  },
  dummyPayButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2196F3',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentScreen;