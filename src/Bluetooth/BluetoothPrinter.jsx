import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const BluetoothPrinter = ({
  visible,
  onClose,
  printData,
  onPrintComplete,
  onPrintError,
}) => {
  const bleManagerRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeBLE();

    return () => {
      try {
        if (bleManagerRef.current) {
          bleManagerRef.current.stopDeviceScan();
          bleManagerRef.current.destroy();
        }
      } catch (e) {
        console.log(e);
      }
    };
  }, []);

  useEffect(() => {
    if (visible && isInitialized) {
      scanForDevices();
    }
  }, [visible, isInitialized]);

  const initializeBLE = async () => {
    try {
      console.log('Initializing BLE...');

      const manager = new BleManager();

      bleManagerRef.current = manager;

      setIsInitialized(true);

      console.log('BLE initialized successfully');
    } catch (error) {
      console.log('BLE INIT ERROR:', error);

      Alert.alert(
        'Bluetooth Error',
        'Failed to initialize Bluetooth.',
      );
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const scanForDevices = async () => {
    const bleManager = bleManagerRef.current;

    if (!bleManager) {
      return;
    }

    const permission = await requestPermissions();

    if (!permission) {
      Alert.alert('Permission denied');
      return;
    }

    setDevices([]);
    setIsScanning(true);

    try {
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('SCAN ERROR:', error);
          setIsScanning(false);
          return;
        }

        if (device?.name) {
          setDevices(prev => {
            const exists = prev.find(d => d.id === device.id);

            if (exists) {
              return prev;
            }

            return [...prev, device];
          });
        }
      });

      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }, 10000);
    } catch (error) {
      console.log(error);
      setIsScanning(false);
    }
  };

  const generatePrintContent = data => {
    try {
      const ticket = data?.data?.TicketDetails?.[0];

      if (!ticket) {
        return 'No Data\n\n';
      }

      let content = '';

      content += '\x1B\x40';

      content += `${ticket.spotName || 'Ticket'}\n`;
      content += '------------------------------\n';

      content += `Order ID : ${ticket.OrderId || ''}\n`;
      content += `Date     : ${ticket.BookingDate || ''}\n`;

      content += '------------------------------\n';

      if (ticket.categoryList?.length > 0) {
        ticket.categoryList.forEach(item => {
          content += `${item.categoryName} x ${item.quantity}\n`;
        });
      }

      content += '------------------------------\n';

      content += `Total : ₹${ticket.totalPrice || 0}\n\n`;

      content += 'Thank You\n\n\n';

      return content;
    } catch (e) {
      console.log(e);
      return 'Print Error\n';
    }
  };

  const connectToDevice = async device => {
    try {
      setIsConnecting(true);

      const bleManager = bleManagerRef.current;

      bleManager.stopDeviceScan();

      console.log('Connecting to:', device.name);

      const connectedDevice = await bleManager.connectToDevice(device.id);

      await connectedDevice.discoverAllServicesAndCharacteristics();

      const services = await connectedDevice.services();

      let writableCharacteristic = null;

      for (const service of services) {
        const characteristics = await service.characteristics();

        for (const characteristic of characteristics) {
          if (
            characteristic.isWritableWithResponse ||
            characteristic.isWritableWithoutResponse
          ) {
            writableCharacteristic = characteristic;
            break;
          }
        }

        if (writableCharacteristic) {
          break;
        }
      }

      if (!writableCharacteristic) {
        throw new Error('No writable characteristic found');
      }

      const printContent = generatePrintContent(printData);

      const base64Data = Buffer.from(printContent, 'utf8').toString(
        'base64',
      );

      if (writableCharacteristic.isWritableWithResponse) {
        await connectedDevice.writeCharacteristicWithResponseForService(
          writableCharacteristic.serviceUUID,
          writableCharacteristic.uuid,
          base64Data,
        );
      } else {
        await connectedDevice.writeCharacteristicWithoutResponseForService(
          writableCharacteristic.serviceUUID,
          writableCharacteristic.uuid,
          base64Data,
        );
      }

      Alert.alert('Success', 'Printed Successfully');

      await connectedDevice.cancelConnection();

      if (onPrintComplete) {
        onPrintComplete();
      }

      onClose();
    } catch (error) {
      console.log('PRINT ERROR:', error);

      Alert.alert(
        'Print Failed',
        error?.message || 'Unable to print',
      );

      if (onPrintError) {
        onPrintError(error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const renderDevice = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.deviceItem}
        onPress={() => connectToDevice(item)}
      >
        <View>
          <Text style={styles.deviceName}>
            {item.name}
          </Text>

          <Text style={styles.deviceId}>
            {item.id}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            Select Printer
          </Text>

          {isScanning ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" />

              <Text style={styles.scanText}>
                Scanning printers...
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={devices}
                keyExtractor={item => item.id}
                renderItem={renderDevice}
                ListEmptyComponent={
                  <Text style={styles.noDevice}>
                    No devices found
                  </Text>
                }
              />

              <TouchableOpacity
                style={styles.scanButton}
                onPress={scanForDevices}
              >
                <Text style={styles.buttonText}>
                  Scan Again
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isConnecting}
          >
            <Text style={styles.buttonText}>
              {isConnecting
                ? 'Connecting...'
                : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },

  scanText: {
    marginTop: 10,
  },

  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  deviceId: {
    fontSize: 12,
    marginTop: 4,
    color: '#777',
  },

  noDevice: {
    textAlign: 'center',
    marginVertical: 20,
  },

  scanButton: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },

  closeButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BluetoothPrinter;