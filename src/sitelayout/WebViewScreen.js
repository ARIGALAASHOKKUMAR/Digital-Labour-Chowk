// WebViewScreen.js
import React, { useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';

const WebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { url } = route.params;
  const webViewRef = useRef(null);

  // Loading component
  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading webpage...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          startInLoadingState={true}
          renderLoading={LoadingIndicator}
          // Performance optimizations
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          domStorageEnabled={true}
          javaScriptEnabled={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          // Improve loading speed
          scalesPageToFit={true}
          // Error handling
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            Alert.alert(
              'Error', 
              'Failed to load the webpage. Please check your internet connection.',
              [
                { text: 'Go Back', onPress: () => navigation.goBack() },
                { text: 'Retry', onPress: () => webViewRef.current?.reload() }
              ]
            );
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('HTTP error: ', nativeEvent.statusCode);
            if (nativeEvent.statusCode >= 400) {
              Alert.alert('Error', `HTTP Error ${nativeEvent.statusCode}: Failed to load the webpage`);
            }
          }}
          style={styles.webview}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  webview: {
    flex: 1,
    padding:0
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default WebViewScreen;