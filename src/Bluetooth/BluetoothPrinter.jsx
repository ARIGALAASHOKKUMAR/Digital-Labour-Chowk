import React, { useState, useEffect } from "react";
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
} from "react-native";

const {
  BLEPrinter,
} = require("react-native-thermal-receipt-printer-image-qr");

const BluetoothPrinter = ({
  visible,
  onClose,
  printData,
  onPrintComplete,
  onPrintError,
}) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (visible) {
      initializePrinter();
    }
  }, [visible]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS !== "android") {
        return true;
      }

      if (Platform.Version >= 31) {
        const granted =
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

        return (
          granted["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted =
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );

        return (
          granted === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } catch (error) {
      console.log("Permission Error:", error);
      return false;
    }
  };

  const initializePrinter = async () => {
    try {
      const permissionGranted =
        await requestPermissions();

      if (!permissionGranted) {
        Alert.alert(
          "Permission Denied",
          "Bluetooth permission required"
        );
        return;
      }

      scanDevices();
    } catch (error) {
      console.log("INIT ERROR:", error);
    }
  };

  const scanDevices = async () => {
    try {
      setIsScanning(true);
      setDevices([]);

      await BLEPrinter.init();

      const printerList =
        await BLEPrinter.getDeviceList();

      console.log("Printers:", printerList);

      if (
        printerList &&
        Array.isArray(printerList)
      ) {
        setDevices(printerList);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.log("SCAN ERROR:", error);

      Alert.alert(
        "Error",
        "Unable to scan printers"
      );
    } finally {
      setIsScanning(false);
    }
  };

  const generatePrintContent = () => {
    try {
      const ticket =
        printData?.data?.TicketDetails?.[0];

      if (!ticket) {
        return "NO DATA\n\n";
      }

      let content = "";

      content +=
        "================================\n";

      content += `${
        ticket.spotName || "TICKET"
      }\n`;

      content +=
        "================================\n";

      content += `Order ID : ${
        ticket.OrderId || ""
      }\n`;

      content += `Date : ${
        ticket.BookingDate || ""
      }\n`;

      content +=
        "--------------------------------\n";

      if (
        ticket.categoryList &&
        ticket.categoryList.length > 0
      ) {
        ticket.categoryList.forEach((item) => {
          content += `${item.categoryName} x ${item.quantity}\n`;
        });
      }

      content +=
        "--------------------------------\n";

      content += `Total : Rs.${
        ticket.totalPrice || 0
      }\n`;

      content += "\n";

      content += "Thank You\n";
      content += "\n\n\n";

      return content;
    } catch (error) {
      console.log(error);
      return "PRINT ERROR\n\n";
    }
  };

  const connectPrinter = async (device) => {
    try {
      setIsConnecting(true);

      console.log("Connecting:", device);

      const macAddress =
        device?.inner_mac_address ||
        device?.macAddress ||
        device?.address;

      if (!macAddress) {
        Alert.alert(
          "Error",
          "Printer MAC address not found"
        );
        return;
      }

      await BLEPrinter.connectPrinter(
        macAddress
      );

      const printText =
        generatePrintContent();

      await BLEPrinter.printText(printText, {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1,
        fonttype: 1,
      });

      Alert.alert(
        "Success",
        "Printed Successfully"
      );

      if (onPrintComplete) {
        onPrintComplete();
      }

      onClose();
    } catch (error) {
      console.log("PRINT ERROR:", error);

      Alert.alert(
        "Print Failed",
        error?.message || "Unable to print"
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
        onPress={() => connectPrinter(item)}
        disabled={isConnecting}
      >
        <Text style={styles.deviceName}>
          {item.device_name ||
            item.name ||
            "Unknown Printer"}
        </Text>

        <Text style={styles.deviceId}>
          {item.inner_mac_address ||
            item.macAddress ||
            item.address ||
            ""}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
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
                Scanning Printers...
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={devices}
                keyExtractor={(item, index) =>
                  index.toString()
                }
                renderItem={renderDevice}
                ListEmptyComponent={
                  <Text style={styles.noDevice}>
                    No Printers Found
                  </Text>
                }
              />

              <TouchableOpacity
                style={styles.scanButton}
                onPress={scanDevices}
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
                ? "Connecting..."
                : "Close"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BluetoothPrinter;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },

  scanText: {
    marginTop: 10,
    fontSize: 16,
  },

  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  deviceId: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
  },

  noDevice: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
  },

  scanButton: {
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  closeButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});