import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch } from "react-redux";

import {
  commonAPICall,
  REPRINT,
  TicketBookingDetails,
  TicketBookingEntryDetails,
} from "../utils/utils";

import { numberToWordsWithPrecision } from "../utils/CommonFunctions";
import BluetoothPrinter from "./BluetoothPrinter";
// import BluetoothPrinter from "./BluetoothPrinter";

const TicketBooking = (props) => {
  const [data, setData] = useState([]);
  const [spots, setSpots] = useState([]);
  const [mode, setMode] = useState("offline");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();

  // FIX FOR MULTILINGUAL OBJECT VALUES
  const getDisplayText = (value) => {
    if (typeof value === "object" && value !== null) {
      return (
        value.combined ||
        value.english ||
        value.telugu ||
        JSON.stringify(value)
      );
    }
    return value || "";
  };

  useEffect(() => {
    fetchSpotBookingDetails();
    requestBluetoothPermission();
  }, []);

  const requestBluetoothPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        console.log("Bluetooth permissions:", granted);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const fetchSpotBookingDetails = async () => {
    setLoading(true);

    try {
      const response = await commonAPICall(
        TicketBookingDetails,
        {},
        "GET",
        dispatch
      );

      if (response.status === 200) {
        const fetchedSpots = response.data.spotBookingDetails.map((spot) => ({
          spotId: spot.spotId,

          // FIXED
          spotName: getDisplayText(spot.spotName),

          paymentMode: "offline",

          categoryList: spot.categoryList.map((category) => ({
            categoryId: category.categoryId,

            // FIXED
            categoryName: getDisplayText(category.categoryName),

            categoryAmount: parseFloat(category.categoryAmount),
            quantity: "",
            Total: 0,
          })),
        }));

        setData(response.data.spotBookingDetails);
        setSpots(fetchedSpots);
      } else {
        Alert.alert("Error", "Failed to fetch spot details");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const calculateSpotTotal = (categoryList) => {
    return categoryList.reduce((total, category) => {
      const quantity = category.quantity
        ? parseInt(category.quantity, 10)
        : 0;

      return total + category.categoryAmount * quantity;
    }, 0);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    spots.forEach((spot, spotIndex) => {
      const hasNonZeroQuantity = spot.categoryList.some(
        (cat) => cat.quantity && parseInt(cat.quantity, 10) > 0
      );

      if (!hasNonZeroQuantity) {
        newErrors[`spots[${spotIndex}]`] =
          "At least one category should be filled";

        isValid = false;
      }

      spot.categoryList.forEach((category, catIndex) => {
        if (category.quantity && parseInt(category.quantity, 10) < 0) {
          newErrors[
            `spots[${spotIndex}].categoryList[${catIndex}].quantity`
          ] = "Quantity cannot be negative";

          isValid = false;
        }
      });
    });

    setErrors(newErrors);

    return isValid;
  };

  const handleQuantityChange = (spotIndex, categoryIndex, value) => {
    const newSpots = [...spots];

    newSpots[spotIndex].categoryList[categoryIndex].quantity = value;

    setSpots(newSpots);
  };

  const handlePrintComplete = () => {
    setShowPrinterModal(false);
    setPrintData(null);

    Alert.alert("Success", "Ticket printed successfully!");

    fetchSpotBookingDetails();
  };

  const handlePrintError = (error) => {
    console.error("Print error:", error);

    Alert.alert(
      "Print Error",
      "Failed to print ticket. Please check printer connection."
    );
  };

  const TicketPopup = (response) => {
    setOrderId("");
    setPrintData(response);
    setShowPrinterModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill at least one category with quantity greater than 0"
      );

      return;
    }

    setLoading(true);

    try {
      const modifiedValues = {
        spots: spots
          .map((spot) => ({
            spotId: spot.spotId,
            paymentMode: mode,
            totalPrice: calculateSpotTotal(spot.categoryList),

            categoryList: spot.categoryList
              .filter(
                (category) =>
                  category.quantity &&
                  parseInt(category.quantity, 10) > 0
              )
              .map((category) => ({
                categoryId: category.categoryId,
                categoryAmount: category.categoryAmount,
                quantity: parseInt(category.quantity, 10),

                // FIXED
                categoryName: getDisplayText(category.categoryName),
              })),
          }))
          .filter((spot) => spot.categoryList.length > 0),
      };

      const response = await commonAPICall(
        TicketBookingEntryDetails,
        modifiedValues,
        "POST",
        dispatch
      );

      console.log("Booking response:", response);
      if (response.status === 200) {
        TicketPopup(response);
      } else {
        Alert.alert("Error", "Ticket booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      Alert.alert("Error", "An error occurred while booking ticket");
    } finally {
      setLoading(false);
    }
  };

  const Reprint = async () => {
    if (!orderId || orderId.trim() === "") {
      Alert.alert("Error", "Order ID should not be empty");

      return;
    }

    setLoading(true);

    try {
      const response = await commonAPICall(
        REPRINT + `orderId=${orderId}`,
        {},
        "GET",
        dispatch
      );

      if (response.status === 200) {
        TicketPopup(response);
      } else {
        Alert.alert("Error", "Order not found");
      }
    } catch (error) {
      console.error("Reprint error:", error);

      Alert.alert("Error", "Failed to reprint ticket");
    } finally {
      setLoading(false);
    }
  };

  const renderSpotForm = () => {
    if (spots.length === 0 && !loading) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>⚠️ No Data Found</Text>
        </View>
      );
    }

    return spots.map((spot, spotIndex) => (
      <View key={spotIndex} style={styles.spotCard}>
        <View style={styles.spotHeader}>
          <Text style={styles.spotName}>
            {getDisplayText(spot.spotName)}
          </Text>
        </View>

        {errors[`spots[${spotIndex}]`] && (
          <Text style={styles.errorText}>
            {errors[`spots[${spotIndex}]`]}
          </Text>
        )}

        <View style={styles.categoryContainer}>
          {spot.categoryList.map((category, categoryIndex) => (
            <View key={categoryIndex} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>
                  {getDisplayText(category.categoryName)}
                </Text>

                <Text style={styles.categoryPrice}>
                  ₹{category.categoryAmount}/-
                </Text>
              </View>

              <View style={styles.quantityInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Quantity"
                  keyboardType="numeric"
                  value={String(category.quantity || "")}
                  onChangeText={(value) =>
                    handleQuantityChange(
                      spotIndex,
                      categoryIndex,
                      value
                    )
                  }
                />
              </View>

              {errors[
                `spots[${spotIndex}].categoryList[${categoryIndex}].quantity`
              ] && (
                <Text style={styles.errorSmallText}>
                  {
                    errors[
                      `spots[${spotIndex}].categoryList[${categoryIndex}].quantity`
                    ]
                  }
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.paymentModeContainer}>
          <Text style={styles.labelTextBlack}>Mode of Payment</Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={mode}
              onValueChange={(itemValue) => setMode(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Offline" value="offline" />
              <Picker.Item label="Online" value="online" />
            </Picker>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>

          <Text style={styles.totalAmount}>
            ₹{calculateSpotTotal(spot.categoryList)}
          </Text>
        </View>

        <Text style={styles.amountInWords}>
          {getDisplayText(
            numberToWordsWithPrecision(
              calculateSpotTotal(spot.categoryList)
            )
          )}
        </Text>
      </View>
    ));
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 Ticket Booking</Text>

          <View style={styles.reprintContainer}>
            <Text style={styles.labelText}>Order ID</Text>

            <View style={styles.reprintRow}>
              <TextInput
                style={[styles.input, styles.reprintInput]}
                placeholder="Enter Order ID"
                value={orderId}
                onChangeText={setOrderId}
              />

              <TouchableOpacity
                style={styles.printButton}
                onPress={Reprint}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Print</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />

            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        {renderSpotForm()}

        {spots.length > 0 && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              Book Ticket
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

       {showPrinterModal && BluetoothPrinter && (
        <BluetoothPrinter
          visible={showPrinterModal}
          onClose={() => setShowPrinterModal(false)}
          printData={printData}
          onPrintComplete={handlePrintComplete}
          onPrintError={handlePrintError}
        />
      )} 
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 100,
  },

  header: {
    backgroundColor: "#1976D2",
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },

  reprintContainer: {
    marginTop: 10,
  },

  labelText: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },

  labelTextBlack: {
    color: "#000",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },

  reprintRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  reprintInput: {
    flex: 1,
    backgroundColor: "white",
    marginRight: 10,
  },

  printButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  spotCard: {
    backgroundColor: "white",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },

  spotHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
    marginBottom: 15,
  },

  spotName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
  },

  categoryContainer: {
    marginBottom: 15,
  },

  categoryRow: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },

  categoryPrice: {
    fontSize: 14,
    color: "#666",
  },

  quantityInput: {
    marginTop: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  paymentModeContainer: {
    marginTop: 10,
    marginBottom: 15,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#fff",
  },

  picker: {
    height: 50,
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 10,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
  },

  amountInWords: {
    fontSize: 12,
    color: "red",
    marginTop: 5,
    fontStyle: "italic",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 5,
  },

  errorSmallText: {
    color: "red",
    fontSize: 11,
    marginTop: 3,
  },

  submitButton: {
    backgroundColor: "#1976D2",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    marginBottom: 30,
  },

  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },

  noDataContainer: {
    padding: 50,
    alignItems: "center",
  },

  noDataText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TicketBooking;