import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import ImageBucketRN from "../utils/ImageBucketRN";
import { useDispatch } from "react-redux";
import { commonAPICall, FRSREGISTRATION } from "../utils/utils";

const FRSRegistration = () => {
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validationSchema = Yup.object().shape({
    employeeName: Yup.string()
      .required("Employee Name is required")
      .min(3, "Minimum 3 characters"),
    employeeCode: Yup.string().required("Employee Code is required"),
    mobileNumber: Yup.string()
      .required("Mobile Number is required")
      .matches(/^[0-9]{10}$/, "Enter valid 10-digit mobile number"),
    email: Yup.string()
      .email("Invalid email")
      .required("Email is required"),
    gender: Yup.string().required("Select gender"),
    dateOfBirth: Yup.string().required("Date of Birth is required"),
    department: Yup.string().required("Department is required"),
    workLocation: Yup.string().required("Work Location is required"),
    faceFrontImage: Yup.string().required("Front face image is required"),
    faceLeftImage: Yup.string().required("Left face image is required"),
    faceRightImage: Yup.string().required("Right face image is required"),
  });

  const submitDetails = async (values) => {
    const response = await commonAPICall(
      FRSREGISTRATION,
      values,
      "post",
      dispatch
    );
    if (response.status === 200) {
      formik.resetForm();
    }
  };

  const formik = useFormik({
    initialValues: {
      employeeCode: "",
      employeeName: "",
      mobileNumber: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      department: "",
      workLocation: "",
      faceFrontImage: "",
      faceLeftImage: "",
      faceRightImage: "",
      authMode: "FACE",
    },
    validationSchema,
    onSubmit: submitDetails,
  });

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      formik.setFieldValue("dateOfBirth", formattedDate);
    }
  };

  const renderImageBlock = (label, field) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.captureBtn}
        onPress={async () => {
          await ImageBucketRN(
            formik,
            "FRS/FACES/",
            field,
            20971520,
            "camera",
            dispatch
          );
        }}
      >
        <Ionicons name="camera" size={18} color="#fff" />
        <Text style={styles.captureText}>Capture</Text>
      </TouchableOpacity>

      {formik.values[field] ? (
        <Image source={{ uri: formik.values[field] }} style={styles.preview} />
      ) : (
        <Text style={styles.placeholder}>No image</Text>
      )}

      {formik.touched[field] && formik.errors[field] && (
        <Text style={styles.error}>{formik.errors[field]}</Text>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FRS Registration</Text>

      {/* Employee Name */}
      <TextInput
        placeholder="Employee Name"
        style={styles.input}
        value={formik.values.employeeName}
        onChangeText={formik.handleChange("employeeName")}
        onBlur={formik.handleBlur("employeeName")}
      />
      {formik.touched.employeeName && formik.errors.employeeName && (
        <Text style={styles.error}>{formik.errors.employeeName}</Text>
      )}

      {/* Employee Code */}
      <TextInput
        placeholder="Employee Code"
        style={styles.input}
        value={formik.values.employeeCode}
        onChangeText={formik.handleChange("employeeCode")}
        onBlur={formik.handleBlur("employeeCode")}
      />
      {formik.touched.employeeCode && formik.errors.employeeCode && (
        <Text style={styles.error}>{formik.errors.employeeCode}</Text>
      )}

      {/* Mobile */}
      <TextInput
        placeholder="Mobile Number"
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}
        value={formik.values.mobileNumber}
        onChangeText={formik.handleChange("mobileNumber")}
        onBlur={formik.handleBlur("mobileNumber")}
      />
      {formik.touched.mobileNumber && formik.errors.mobileNumber && (
        <Text style={styles.error}>{formik.errors.mobileNumber}</Text>
      )}

      {/* Email */}
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={formik.values.email}
        onChangeText={formik.handleChange("email")}
        onBlur={formik.handleBlur("email")}
      />
      {formik.touched.email && formik.errors.email && (
        <Text style={styles.error}>{formik.errors.email}</Text>
      )}

      {/* DOB */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: formik.values.dateOfBirth ? "#000" : "#888" }}>
          {formik.values.dateOfBirth || "Select Date of Birth"}
        </Text>
      </TouchableOpacity>
      {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
        <Text style={styles.error}>{formik.errors.dateOfBirth}</Text>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={
            formik.values.dateOfBirth
              ? new Date(formik.values.dateOfBirth)
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Gender */}
      <View style={styles.genderContainer}>
        {["Male", "Female", "Other"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.genderBtn,
              formik.values.gender === g && styles.genderSelected,
            ]}
            onPress={() => formik.setFieldValue("gender", g)}
          >
            <Text
              style={[
                styles.genderText,
                formik.values.gender === g && { color: "#fff" },
              ]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {formik.touched.gender && formik.errors.gender && (
        <Text style={styles.error}>{formik.errors.gender}</Text>
      )}

      {/* Department */}
      <TextInput
        placeholder="Department"
        style={styles.input}
        value={formik.values.department}
        onChangeText={formik.handleChange("department")}
        onBlur={formik.handleBlur("department")}
      />
      {formik.touched.department && formik.errors.department && (
        <Text style={styles.error}>{formik.errors.department}</Text>
      )}

      {/* Work Location */}
      <TextInput
        placeholder="Work Location"
        style={styles.input}
        value={formik.values.workLocation}
        onChangeText={formik.handleChange("workLocation")}
        onBlur={formik.handleBlur("workLocation")}
      />
      {formik.touched.workLocation && formik.errors.workLocation && (
        <Text style={styles.error}>{formik.errors.workLocation}</Text>
      )}

      {/* Face Images */}
      {renderImageBlock("Front Face", "faceFrontImage")}
      {renderImageBlock("Left Face", "faceLeftImage")}
      {renderImageBlock("Right Face", "faceRightImage")}

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={formik.handleSubmit}>
        <Text style={styles.submitText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FRSRegistration;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#eef2f7",
    paddingBottom: 120,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e293b",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 14,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#334155",
  },

  genderContainer: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-between",
  },

  genderBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  genderSelected: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },

  genderText: {
    color: "#4f46e5",
    fontWeight: "600",
  },

  captureBtn: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  captureText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

  preview: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  placeholder: {
    color: "#94a3b8",
    marginTop: 6,
    fontStyle: "italic",
  },

  submitBtn: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 14,
    marginTop: 25,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  error: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
});