// WorkerRegistration.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useDispatch } from "react-redux";
import { currentLanguageData } from "../utils/te";
import ImageBucketRN from "../utils/ImageBucketRN";
import {
  commonAPICall,
  WORKER_REGISTRATION,
  GET_DISTRICTS,
  GET_MANDALS,
  GET_VILLAGESS,
  GENERATE_AADHAAR_OTP,
  VERIFY_AADHAAR_OTP,
  AADHAAR_OTP,
  GET_STATES_API,
  CASTE_API,
  BANK_DETAILS,
  GET_DISTRICT_REPORT,
  GET_VILLAGES,
} from "../utils/utils";
import { showErrorToast, showInfoToast } from "../utils/showToast";
import { dists28 } from "../utils/CommonFunctions";

const WorkerRegistration = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showMemberDobPicker, setShowMemberDobPicker] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [txnNo, setTxnNo] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");

  // Tabs configuration with section-wise grouping
  const tabs = [
    {
      id: 0,
      name: currentLanguageData?.personalDetails || "Personal Details",
      icon: "person-outline",
    },
    {
      id: 1,
      name: currentLanguageData?.field?.familyDetaile || "Family Details",
      icon: "people-outline",
    },
    {
      id: 2,
      name: currentLanguageData?.field?.bankDetailes || "Bank Details",
      icon: "business-outline",
    },
    {
      id: 3,
      name: currentLanguageData?.field?.address || "Address Details",
      icon: "home-outline",
    },
    {
      id: 4,
      name: currentLanguageData?.field?.otherDetailes || "Employment Details",
      icon: "briefcase-outline",
    },
    {
      id: 5,
      name: currentLanguageData?.field?.workDetails || "Work Details",
      icon: "construct-outline",
    },
    {
      id: 6,
      name: currentLanguageData?.field?.documents || "Documents",
      icon: "document-text-outline",
    },
    {
      id: 7,
      name: currentLanguageData?.field?.payment || "Payment",
      icon: "time-outline",
    },
  ];

  // Get field label based on language
  const getFieldLabel = (fieldKey) => {
    return currentLanguageData?.field?.[fieldKey] || fieldKey;
  };

  // Helper functions
  // API calls

  const generateOtpForAadhaar = async (aadhaarNo) => {
    try {
      console.log("Generating OTP for:", aadhaarNo);

      const response = await commonAPICall(
        AADHAAR_OTP,
        { aadharNo: aadhaarNo },
        "POST",
        dispatch,
      );

      console.log("gggggggggg", response);

      const isSuccess = response?.status === 200;

      if (isSuccess) {
        const txn = response?.data?.txnNo || "";
        setTxnNo(txn);
        setOtpVisible(true);
        setIsOtpSent(true);
      } else {
        setOtpVisible(false);
        setIsOtpSent(false);
        setTxnNo("");
      }
    } catch (error) {
      console.error("OTP ERROR:", error);
      setOtpVisible(false);
      setIsOtpSent(false);
      setTxnNo("");
    }
  };

  const verifyOtp = async (aadhaarNumber, setFieldValue) => {
    if (!aadhaarOtp) {
      showInfoToast("Please enter OTP", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await commonAPICall(
        VERIFY_AADHAAR_OTP,
        {
          txnNo,
          otp: aadhaarOtp.toString(),
          aadharNo: aadhaarNumber || "",
        },
        "post",
        dispatch,
      );
      console.log("rrrrrrrr", {
        txnNo,
        otp: aadhaarOtp.toString(),
        aadharNo: aadhaarNumber || "",
      });

      if (response.status === 200) {
        setOtpVerified(true);
        setOtpVisible(false);
        setFieldValue("aadhaarVerified", true);
        if (response.data.name) {
          setFieldValue("name", response.data.name);
        }
        if (response.data.dob) {
          setFieldValue("dob", formatDateToApi(response.data.dob));
        }
        setAadhaarOtp("");
      } else {
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation Schema

  const validationSchema = Yup.object().shape({
    // ========== TAB 0: PERSONAL INFORMATION ==========
    aadhaarNo: Yup.string()
      .length(12, "Aadhaar number must be exactly 12 digits")
      .matches(/^\d+$/, "Aadhaar number must contain only digits")
      .required("Required"),

    firstName: Yup.string().required("Required"),

    soWo: Yup.string().required("Required"),

    fatherName: Yup.string().required("Required"),

    gender: Yup.string().required("Required"),

    dob: Yup.string().required("Required"),

    phoneNo: Yup.string()
      .matches(/^\d{10}$/, "Enter valid 10 digit mobile number")
      .required("Required"),

    otherContactNo: Yup.string()
      .matches(/^\d{10}$/, "Enter valid 10 digit mobile number")
      .nullable(),

    religion: Yup.string().required("Required"),

    caste: Yup.string().when("religion", {
      is: (val) => val && val !== "Other",
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    casteText: Yup.string().when("religion", {
      is: "Other",
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    subCaste: Yup.string().when("religion", {
      is: (val) => val && val !== "Other",
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    subCasteText: Yup.string().when("religion", {
      is: "Other",
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    maritalStatus: Yup.string().required("Required"),

    aadhaarVerified: Yup.boolean(),

    // ========== TAB 1: FAMILY DETAILS ==========
    // familyDetails: Yup.array().of(
    //   Yup.object().shape({
    //     familyMemberName: Yup.string().required("Family member name required"),
    //     relation: Yup.string().required("Relation required"),
    //     memberDob: Yup.string().nullable(),
    //     aadhaarNo: Yup.string()
    //       .length(12, "Aadhaar must be 12 digits")
    //       .matches(/^\d+$/, "Only digits allowed")
    //       .nullable(),
    //     isNomine: Yup.string(),
    //     nominePer: Yup.string().when("isNomine", {
    //       is: "yes",
    //       then: () => Yup.string().required("Nominee percentage required"),
    //       otherwise: () => Yup.string().nullable(),
    //     }),
    //   }),
    // ),

    familyDetails: Yup.array()
      .of(
        Yup.object().shape({
          familyMemberName: Yup.string()
            .required("Member name is required")
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name must not exceed 100 characters"),

          relation: Yup.string()
            .required("Relation is required")
            .min(2, "Relation must be at least 2 characters"),

          memberDob: Yup.string()
            .required("Date of birth is required")
            .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),

          aadhaarNo: Yup.string()
            .required("Aadhaar number is required")
            .matches(/^\d{12}$/, "Aadhaar number must be exactly 12 digits"),

          isNomine: Yup.string()
            .required("Please select whether this member is a nominee")
            .oneOf(["yes", "no"], "Invalid selection"),

          nominePer: Yup.string().test({
            name: "nominePer-validation",
            message: "Nominee percentage is required when member is a nominee",
            test: function (value) {
              const { isNomine } = this.parent;
              if (isNomine === "yes") {
                if (!value) {
                  return this.createError({
                    message:
                      "Nominee percentage is required when member is a nominee",
                  });
                }
                const num = parseInt(value, 10);
                if (isNaN(num) || num < 5 || num > 100 || num % 5 !== 0) {
                  return this.createError({
                    message:
                      "Percentage must be between 5% and 100% in multiples of 5",
                  });
                }
              }
              return true;
            },
          }),
        }),
      )
      .min(1, "At least one family member is required"),

    // ========== TAB 2: BANK DETAILS ==========
    ifscCode: Yup.string()
      .required("Required")
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),

    bankName: Yup.string().required("Required"),

    branchName: Yup.string().required("Required"),

    bankAccountNo: Yup.string()
      .required("Required")
      .matches(/^\d+$/, "Only digits allowed"),

    rbankAccountNo: Yup.string()
      .required("Required")
      .oneOf(
        [Yup.ref("bankAccountNo"), null],
        "Bank account numbers must match",
      ),

    nameInBank: Yup.string().required("Required"),

    // ========== TAB 3: PERMANENT ADDRESS ==========
    permanentState: Yup.string().required("Required"),

    permanentDistrictCode: Yup.string().required("Required"),

    permanentMadalCode: Yup.string().required("Required"),

    permanentVillageCode: Yup.string().required("Required"),

    permanentPincode: Yup.string()
      .matches(/^\d{6}$/, "Enter valid pincode")
      .nullable(),

    permanentDoorNo: Yup.string().nullable(),

    permanentAddress: Yup.string().nullable(),

    permanentDivision: Yup.string().nullable(),

    permanentLandMark: Yup.string().nullable(),

    permanentCity: Yup.string().nullable(),

    // ========== TAB 3: PRESENT ADDRESS ==========
    isPermanent: Yup.boolean(),

    presentState: Yup.string().when("isPermanent", {
      is: false,
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    presentDistrictCode: Yup.string().when("isPermanent", {
      is: false,
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    presentMadalCode: Yup.string().when("isPermanent", {
      is: false,
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    presentVillageCode: Yup.string().when("isPermanent", {
      is: false,
      then: () => Yup.string().required("Required"),
      otherwise: () => Yup.string().nullable(),
    }),

    presentPincode: Yup.string().when("isPermanent", {
      is: false,
      then: () =>
        Yup.string()
          .required("Required")
          .matches(/^\d{6}$/, "Enter valid pincode"),
      otherwise: () => Yup.string().nullable(),
    }),

    presentDoorNo: Yup.string().nullable(),

    presentAddress: Yup.string().nullable(),

    presentDivision: Yup.string().nullable(),

    presentLandMark: Yup.string().nullable(),

    presentCity: Yup.string().nullable(),

    // ========== TAB 4: EMPLOYMENT DETAILS ==========
    isNregs: Yup.string(),

    jobCardNo: Yup.string().when("isNregs", {
      is: "Y",
      then: () => Yup.string().required("Job card number required"),
      otherwise: () => Yup.string().nullable(),
    }),

    isUnionMember: Yup.string(),

    unionName: Yup.string().when("isUnionMember", {
      is: "Y",
      then: () => Yup.string().required("Union name required"),
      otherwise: () => Yup.string().nullable(),
    }),

    regNo: Yup.string().when("isUnionMember", {
      is: "Y",
      then: () => Yup.string().required("Registration number required"),
      otherwise: () => Yup.string().nullable(),
    }),

    // ========== TAB 5: WORK DETAILS ==========
    empName: Yup.string().required("Required"),

    presentOfficeName: Yup.string().required("Required"),

    typeOfWork: Yup.string().required("Required"),

    otherTradeWork: Yup.string().nullable(),

    workCapability: Yup.string().required("Required"),

    isMigrant: Yup.string().nullable(),

    // Work Location Fields
    workDistrict: Yup.string().nullable(),

    workMandal: Yup.string().nullable(),

    workVillage: Yup.string().nullable(),

    workDoorNo: Yup.string().nullable(),

    workPincode: Yup.string()
      .matches(/^\d{6}$/, "Enter valid pincode")
      .nullable(),

    // ========== TAB 6: DOCUMENTS ==========
    photoDesc: Yup.mixed().required("Photo is required"),

    signatureDesc: Yup.mixed().required("Signature is required"),

    selfAffidavitDesc: Yup.mixed().required("Self declaration is required"),

    // ========== TAB 7: PAYMENT & DECLARATION ==========
    years: Yup.string()
      .required("Required")
      .matches(/^\d+$/, "Must be a number"),

    amount: Yup.string()
      .required("Required")
      .matches(/^\d+$/, "Must be a number"),

    selfDeclaration: Yup.boolean().oneOf(
      [true],
      "Must accept self declaration",
    ),

    // Additional field
    workerId: Yup.string().nullable(),
  });

  // Formik initialization
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      // Personal Details
      workerId: "",
      aadhaarNo: "",
      firstName: "",
      soWo: "", // Son of / Wife of / Daughter of
      fatherName: "",
      gender: "",
      dob: "",
      phoneNo: "",
      otherContactNo: "",
      religion: "",
      caste: "",
      casteText: "", // For "Other" religion
      subCaste: "",
      subCasteText: "", // For "Other" religion
      maritalStatus: "",
      aadhaarVerified: false,

      // ========== TAB 1: FAMILY DETAILS ==========
      familyDetails: [
        {
          familyMemberName: "",
          relation: "",
          memberDob: "",
          aadhaarNo: "",
          isNomine: "",
          nominePer: "",
        },
      ],

      // ========== TAB 2: BANK DETAILS ==========
      ifscCode: "",
      bankName: "",
      branchName: "",
      bankAccountNo: "",
      rbankAccountNo: "",
      nameInBank: "",

      // ========== TAB 3: PERMANENT ADDRESS ==========
      permanentState: "",
      permanentDistrictCode: "",
      permanentMadalCode: "",
      permanentVillageCode: "",
      permanentPincode: "",
      permanentDoorNo: "",
      permanentAddress: "",
      permanentDivision: "",
      permanentLandMark: "",
      permanentCity: "",

      // ========== TAB 3: PRESENT ADDRESS ==========
      isPermanent: false,
      presentState: "",
      presentDistrictCode: "",
      presentMadalCode: "",
      presentVillageCode: "",
      presentPincode: "",
      presentDoorNo: "",
      presentAddress: "",
      presentDivision: "",
      presentLandMark: "",
      presentCity: "",

      // ========== TAB 4: EMPLOYMENT DETAILS ==========
      isNregs: "", // "Y" or "N"
      jobCardNo: "",
      isUnionMember: "", // "Y" or "N"
      unionName: "",
      regNo: "",

      // ========== TAB 5: WORK DETAILS ==========
      empName: "",
      presentOfficeName: "",
      typeOfWork: "",
      otherTradeWork: "",
      workCapability: "", // "yes" or "no"
      isMigrant: "",

      // Work Location Fields (from Work Tab UI)
      workDistrict: "",
      workMandal: "",
      workVillage: "",
      workDoorNo: "",
      workPincode: "",

      // ========== TAB 6: DOCUMENTS ==========
      photoDesc: null,
      signatureDesc: null,
      selfAffidavitDesc: null,

      // ========== TAB 7: PAYMENT & DECLARATION ==========
      years: "",
      amount: "",
      selfDeclaration: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          if (key === "photoDesc" && values.photoDesc) {
            formData.append(key, {
              uri: values.photoDesc.uri,
              type: values.photoDesc.type,
              name: values.photoDesc.fileName || `photo_${Date.now()}.jpg`,
            });
          } else if (key === "signatureDesc" && values.signatureDesc) {
            formData.append(key, {
              uri: values.signatureDesc.uri,
              type: values.signatureDesc.type,
              name:
                values.signatureDesc.fileName || `signature_${Date.now()}.jpg`,
            });
          } else if (key === "selfAffidavitDesc" && values.selfAffidavitDesc) {
            formData.append(key, {
              uri: values.selfAffidavitDesc.uri,
              type: values.selfAffidavitDesc.type,
              name:
                values.selfAffidavitDesc.fileName ||
                `declaration_${Date.now()}.jpg`,
            });
          } else if (key === "familyDetails") {
            formData.append(key, JSON.stringify(values[key]));
          } else if (key !== "aadhaarVerified") {
            formData.append(key, values[key]);
          }
        });

        const response = await axios.post(WORKER_REGISTRATION, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          //   showToast("Worker registered successfully!", "success");
          navigation.goBack();
        } else {
          //   showToast(response.data.message || "Registration failed", "error");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        // showToast("Failed to register worker", "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Handle adding/removing family members
  const addFamilyMember = () => {
    formik.setFieldValue("familyDetails", [
      ...formik.values.familyDetails,
      {
        familyMemberName: "",
        relation: "",
        memberDob: "",
        aadhaar: "",
        isNomine: "",
        nominePer: "",
      },
    ]);
  };

  const removeFamilyMember = (index) => {
    const familyDetails = [...formik.values.familyDetails];
    familyDetails.splice(index, 1);
    formik.setFieldValue("familyDetails", familyDetails);
  };

  // Handle permanent address copy to present address

  useEffect(() => {
    loadCasteData();
    // getStates();
  }, []);

  const [allSubCastes, setAllSubCastes] = useState([]);
  const [casteList, setCasteList] = useState([]);
  const [subCasteList, setSubCasteList] = useState([]);
  const [allCastes, setAllCastes] = useState([]);
  const [showerror, setShowerror] = useState("");
  const [religionList, setReligionList] = useState([]);

  const AadharClearValues = (setFieldValue) => {
    setFieldValue("firstName", "");
    setFieldValue("fatherName", "");
    setFieldValue("gender", "");
    setFieldValue("dob", "");
    setFieldValue("phoneNo", "");
    setOtpVerified(false);
  };

  const RELIGION_CODE_MAP = {
    Buddhist: "BUD",
    Christian: "CHR",
    Hindu: "HIN",
    Jain: "JAI",
    Muslim: "MUS",
    Parsi: "PAR",
    Sikh: "SIK",
    Other: "OTH",
  };

  const loadCasteData = async () => {
    try {
      const response = await commonAPICall(CASTE_API, {}, "GET", dispatch);

      if (response?.status === 200) {
        // Set religions from API response
        setReligionList(response.data.religions || []);
        // Set castes from API response
        setAllCastes(response.data.castes || []);
        setCasteList(response.data.castes || []);
        // Set sub castes from API response
        setAllSubCastes(response.data.sub_castes || []);
      }
    } catch (err) {
      console.error("Failed to load caste data", err);
      setShowerror("Failed to load caste data");
    }
  };

  // Religion mapping for filtering castes
  const getReligionCode = (religionName) => {
    const religion = religionList.find((r) => r.religiondesc === religionName);
    return religion?.religionid || "";
  };

  // Handle religion change
  const handleReligionChange = (religionName, setFieldValue) => {
    setFieldValue("religion", religionName);
    setFieldValue("caste", "");
    setFieldValue("subCaste", "");
    setFieldValue("casteText", "");
    setFieldValue("subCasteText", "");
    setSubCasteList([]);

    const religionCode = getReligionCode(religionName);
    const filteredCastes = allCastes.filter((c) => c.religion === religionCode);
    setCasteList(filteredCastes);
  };

  const handleCasteChange = (casteCode, setFieldValue) => {
    setFieldValue("caste", casteCode);
    setFieldValue("subCaste", "");
    setFieldValue("subCasteText", "");

    const filteredSubCastes = allSubCastes.filter(
      (sub) => sub.caste_code === parseInt(casteCode),
    );
    setSubCasteList(filteredSubCastes);
  };

  // Get pure sub caste name (without numbering)
  const getPureSubCasteName = (subCasteDesc) => {
    if (!subCasteDesc) return "";
    // Remove numbering like "1)", "2)", etc. from start
    const cleaned = subCasteDesc.replace(/^\d+\)\s*/, "");
    return cleaned.split("-")[0]?.trim() || cleaned;
  };

  useEffect(() => {
    loadCasteData();
  }, []);

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 80);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const formatDateForPicker = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const formatDateToApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Render Personal Info Tab
  const renderPersonalInfoTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        {getFieldLabel("personalDetails")}
      </Text>

      {/* Aadhaar Number Field */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("aadhaarNo")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            formik.errors.aadhaarNo &&
              formik.touched.aadhaarNo &&
              styles.inputError,
          ]}
          value={formik.values.aadhaarNo}
          onChangeText={(text) => {
            const value = text.replace(/\D/g, "").slice(0, 12);
            AadharClearValues(formik.setFieldValue);
            formik.setFieldValue("aadhaarNo", value);
            setOtpVerified(false);

            // Reset when user deletes
            if (value.length < 12) {
              setOtpVisible(false);
              setIsOtpSent(false);
              setTxnNo("");
              return;
            }

            // Call OTP once when reaches 12 digits
            if (value.length === 12 && !isOtpSent) {
              setIsOtpSent(true);
              generateOtpForAadhaar(value);
            }
          }}
          onBlur={formik.handleBlur("aadhaarNo")}
          placeholder={`Enter ${getFieldLabel("aadhaarNo")}`}
          keyboardType="numeric"
          maxLength={12}
        />
        {formik.errors.aadhaarNo && formik.touched.aadhaarNo && (
          <Text style={styles.errorText}>{formik.errors.aadhaarNo}</Text>
        )}
      </View>

      {/* OTP Field - Only visible after OTP is sent */}
      {otpVisible && (
        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Enter OTP <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.otpContainer}>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={aadhaarOtp}
              onChangeText={(text) => {
                const value = text.replace(/\D/g, "").slice(0, 6);
                setAadhaarOtp(value);

                if (value.length === 6) {
                  verifyOtp(formik.values.aadhaarNo, formik.setFieldValue);
                }
              }}
              placeholder="Enter OTP"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          {showerror !== "" && (
            <Text style={styles.errorText}>{showerror}</Text>
          )}
        </View>
      )}

      {/* Verified Badge */}
      {otpVerified && (
        <Text style={styles.successText}>✓ Aadhaar Verified</Text>
      )}

      {/* First Name - Disabled until Aadhaar verified */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("firstName")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            formik.errors.firstName &&
              formik.touched.firstName &&
              styles.inputError,
          ]}
          value={formik.values.firstName}
          onChangeText={formik.handleChange("firstName")}
          onBlur={formik.handleBlur("firstName")}
          placeholder={`Enter ${getFieldLabel("firstName")}`}
          editable={false}
        />
        {formik.errors.firstName && formik.touched.firstName && (
          <Text style={styles.errorText}>{formik.errors.firstName}</Text>
        )}
      </View>

      {/* Father Name - Disabled until Aadhaar verified */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("fatherName")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            formik.errors.fatherName &&
              formik.touched.fatherName &&
              styles.inputError,
          ]}
          value={formik.values.fatherName}
          onChangeText={formik.handleChange("fatherName")}
          onBlur={formik.handleBlur("fatherName")}
          placeholder={`Enter ${getFieldLabel("fatherName")}`}
          editable={false}
        />
        {formik.errors.fatherName && formik.touched.fatherName && (
          <Text style={styles.errorText}>{formik.errors.fatherName}</Text>
        )}
      </View>

      {/* Gender - Disabled until Aadhaar verified */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("gender")} <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("gender", "M")}
            disabled={true}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.gender === "M" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>{getFieldLabel("male")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("gender", "F")}
            disabled={true}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.gender === "F" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>{getFieldLabel("female")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("gender", "T")}
            disabled={true}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.gender === "T" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>{getFieldLabel("others")}</Text>
          </TouchableOpacity>
        </View>
        {formik.errors.gender && formik.touched.gender && (
          <Text style={styles.errorText}>{formik.errors.gender}</Text>
        )}
      </View>

      {/* Date of Birth - Disabled until Aadhaar verified */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("dob")} <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => {
            if (otpVerified) {
              formik.setFieldTouched("dob", true);
              setShowDobPicker(true);
            }
          }}
          disabled={!otpVerified}
        >
          <Text style={styles.dateText}>
            {formik.values.dob || `Select ${getFieldLabel("dob")}`}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#555" />
        </TouchableOpacity>
        {formik.errors.dob && formik.touched.dob && (
          <Text style={styles.errorText}>{formik.errors.dob}</Text>
        )}
      </View>

      {/* Phone Number - Disabled until Aadhaar verified */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("phoneNo")} <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            formik.errors.phoneNo &&
              formik.touched.phoneNo &&
              styles.inputError,
          ]}
          value={formik.values.phoneNo}
          onChangeText={(text) => {
            const value = text.replace(/\D/g, "").slice(0, 10);
            formik.setFieldValue("phoneNo", value);
          }}
          onBlur={formik.handleBlur("phoneNo")}
          placeholder={`Enter ${getFieldLabel("phoneNo")}`}
          keyboardType="numeric"
          maxLength={10}
          editable={false}
        />
        {formik.errors.phoneNo && formik.touched.phoneNo && (
          <Text style={styles.errorText}>{formik.errors.phoneNo}</Text>
        )}
      </View>

      {/* Religion Field */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("religion")} <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.religion}
            onValueChange={(itemValue) => {
              formik.setFieldTouched("religion", true);
              formik.setFieldValue("religion", itemValue);
              formik.setFieldValue("caste", "");
              formik.setFieldValue("subCaste", "");
              formik.setFieldValue("casteText", "");
              formik.setFieldValue("subCasteText", "");
              setSubCasteList([]);

              // Fix: Use getReligionCode instead of RELIGION_CODE_MAP for consistency with API data
              const religionCode = getReligionCode(itemValue);
              const filteredCastes = allCastes.filter(
                (c) => c.religion === religionCode,
              );
              setCasteList(filteredCastes);
            }}
          >
            <Picker.Item label="---- Select Religion ----" value="" />
            {religionList.length > 0 ? (
              religionList.map((religion) => (
                <Picker.Item
                  key={religion.religionid}
                  label={religion.religiondesc}
                  value={religion.religiondesc}
                />
              ))
            ) : (
              <>
                <Picker.Item label="Buddhist" value="Buddhist" />
                <Picker.Item label="Christian" value="Christian" />
                <Picker.Item label="Hindu" value="Hindu" />
                <Picker.Item label="Jain" value="Jain" />
                <Picker.Item label="Muslim" value="Muslim" />
                <Picker.Item label="Parsi" value="Parsi" />
                <Picker.Item label="Sikh" value="Sikh" />
                <Picker.Item label="Other" value="Other" />
              </>
            )}
          </Picker>
        </View>
        {formik.errors.religion && formik.touched.religion && (
          <Text style={styles.errorText}>{formik.errors.religion}</Text>
        )}
      </View>

      {/* Caste Field */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("caste")} <Text style={styles.requiredStar}>*</Text>
        </Text>
        {formik.values.religion === "Other" ? (
          <TextInput
            style={styles.input}
            value={formik.values.casteText}
            onChangeText={(text) => {
              formik.handleChange("casteText")(text);
              // Clear any validation errors when user types
              if (formik.errors.casteText) {
                formik.setFieldError("casteText", "");
              }
            }}
            onBlur={formik.handleBlur("casteText")}
            placeholder="Enter Caste"
          />
        ) : (
          <View style={styles.selectBox}>
            <Picker
              selectedValue={formik.values.caste}
              onValueChange={(itemValue) => {
                handleCasteChange(itemValue, formik.setFieldValue);
                formik.setFieldTouched("caste", true);
              }}
              enabled={!!formik.values.religion}
            >
              <Picker.Item label="---- Select Caste ----" value="" />
              {casteList.length > 0 ? (
                casteList.map((caste) => (
                  <Picker.Item
                    key={caste.caste_code}
                    label={caste.caste_desc}
                    value={caste.caste_code.toString()}
                  />
                ))
              ) : (
                <Picker.Item label="No castes available" value="" />
              )}
            </Picker>
          </View>
        )}
        {formik.errors.caste && formik.touched.caste && (
          <Text style={styles.errorText}>{formik.errors.caste}</Text>
        )}
        {formik.values.religion === "Other" &&
          formik.errors.casteText &&
          formik.touched.casteText && (
            <Text style={styles.errorText}>{formik.errors.casteText}</Text>
          )}
      </View>

      {/* Sub Caste Field */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("subCaste")} <Text style={styles.requiredStar}>*</Text>
        </Text>
        {formik.values.religion === "Other" ? (
          <TextInput
            style={styles.input}
            value={formik.values.subCasteText}
            onChangeText={(text) => {
              formik.handleChange("subCasteText")(text);
              // Clear any validation errors when user types
              if (formik.errors.subCasteText) {
                formik.setFieldError("subCasteText", "");
              }
            }}
            onBlur={formik.handleBlur("subCasteText")}
            placeholder="Enter Sub Caste"
          />
        ) : (
          <View style={styles.selectBox}>
            <Picker
              selectedValue={formik.values.subCaste}
              onValueChange={(itemValue) => {
                formik.setFieldValue("subCaste", itemValue);
                formik.setFieldTouched("subCaste", true);
              }}
              enabled={!!formik.values.caste && casteList.length > 0}
            >
              <Picker.Item label="---- Select Sub Caste ----" value="" />
              {subCasteList.length > 0 ? (
                subCasteList.map((sub) => (
                  <Picker.Item
                    key={sub.sub_caste_code}
                    label={getPureSubCasteName(sub.sub_caste_desc)}
                    value={sub.sub_caste_code.toString()}
                  />
                ))
              ) : (
                <Picker.Item label="No sub castes available" value="" />
              )}
            </Picker>
          </View>
        )}
        {formik.errors.subCaste && formik.touched.subCaste && (
          <Text style={styles.errorText}>{formik.errors.subCaste}</Text>
        )}
        {formik.values.religion === "Other" &&
          formik.errors.subCasteText &&
          formik.touched.subCasteText && (
            <Text style={styles.errorText}>{formik.errors.subCasteText}</Text>
          )}
      </View>

      {/* Marital Status */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("maritalStatus")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.maritalStatus}
            onValueChange={(itemValue) => {
              formik.setFieldTouched("maritalStatus", true);
              formik.setFieldValue("maritalStatus", itemValue);
            }}
          >
            <Picker.Item label="----Select-----" value="" />
            <Picker.Item label="Unmarried" value="Single" />
            <Picker.Item label="Married" value="Married" />
            <Picker.Item label="Divorced" value="Divorced" />
            <Picker.Item label="Widower" value="Widower" />
            <Picker.Item label="Widow" value="Widow" />
          </Picker>
        </View>
        {formik.errors.maritalStatus && formik.touched.maritalStatus && (
          <Text style={styles.errorText}>{formik.errors.maritalStatus}</Text>
        )}
      </View>

      {/* Other Contact Number */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("otherContactNumber")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.otherContactNo}
          onChangeText={(text) => {
            let value = text.replace(/\D/g, "").slice(0, 10);
            // Block if first digit is 1–5
            if (value.length === 1 && !/[6-9]/.test(value)) {
              value = "";
            }
            formik.setFieldValue("otherContactNo", value);
          }}
          onBlur={formik.handleBlur("otherContactNo")}
          placeholder="Enter alternate number"
          keyboardType="numeric"
          maxLength={10}
        />
        {formik.errors.otherContactNo && formik.touched.otherContactNo && (
          <Text style={styles.errorText}>{formik.errors.otherContactNo}</Text>
        )}
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDobPicker} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DateTimePicker
              value={formatDateForPicker(formik.values.dob)}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  const age =
                    new Date().getFullYear() - selectedDate.getFullYear();
                  if (age >= 18 && age <= 80) {
                    formik.setFieldValue("dob", formatDateToApi(selectedDate));
                  } else {
                    Alert.alert("Error", "Age must be between 18 and 80 years");
                  }
                }
                setShowDobPicker(false);
              }}
              minimumDate={minDate}
              maximumDate={maxDate}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDobPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
  // Render Family Tab
  const renderFamilyTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{getFieldLabel("familyDetaile")}*</Text>

      {formik.values.familyDetails.map((member, index) => (
        <View key={index} style={styles.familyCard}>
          <Text style={styles.cardTitle}>
            {getFieldLabel("familyMember")} {index + 1}
          </Text>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>{getFieldLabel("memberName")}*</Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.familyDetails?.[index]?.familyMemberName &&
                  formik.touched.familyDetails?.[index]?.familyMemberName &&
                  styles.errorInput,
              ]}
              value={member.familyMemberName}
              onChangeText={(text) => {
                const familyDetails = [...formik.values.familyDetails];
                familyDetails[index].familyMemberName = text;
                formik.setFieldValue("familyDetails", familyDetails);
              }}
              onBlur={() => {
                formik.setFieldTouched(
                  `familyDetails[${index}].familyMemberName`,
                  true,
                );
              }}
              placeholder={`Enter ${getFieldLabel("memberName")}`}
            />
            {formik.errors.familyDetails?.[index]?.familyMemberName &&
              formik.touched.familyDetails?.[index]?.familyMemberName && (
                <Text style={styles.errorText}>
                  {formik.errors.familyDetails[index].familyMemberName}
                </Text>
              )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>{getFieldLabel("relation")}*</Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.familyDetails?.[index]?.relation &&
                  formik.touched.familyDetails?.[index]?.relation &&
                  styles.errorInput,
              ]}
              value={member.relation}
              onChangeText={(text) => {
                const familyDetails = [...formik.values.familyDetails];
                familyDetails[index].relation = text;
                formik.setFieldValue("familyDetails", familyDetails);
              }}
              onBlur={() => {
                formik.setFieldTouched(
                  `familyDetails[${index}].relation`,
                  true,
                );
              }}
              placeholder={`Enter ${getFieldLabel("relation")}`}
            />
            {formik.errors.familyDetails?.[index]?.relation &&
              formik.touched.familyDetails?.[index]?.relation && (
                <Text style={styles.errorText}>
                  {formik.errors.familyDetails[index].relation}
                </Text>
              )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>{getFieldLabel("memberDob")}*</Text>
            <TouchableOpacity
              style={[
                styles.datePickerButton,
                formik.errors.familyDetails?.[index]?.memberDob &&
                  formik.touched.familyDetails?.[index]?.memberDob &&
                  styles.errorInput,
              ]}
              onPress={() => {
                setSelectedMemberIndex(index);
                setShowMemberDobPicker(true);
              }}
              onBlur={() => {
                formik.setFieldTouched(
                  `familyDetails[${index}].memberDob`,
                  true,
                );
              }}
            >
              <Text style={styles.dateText}>
                {member.memberDob || `Select ${getFieldLabel("memberDob")}`}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>
            {formik.errors.familyDetails?.[index]?.memberDob &&
              formik.touched.familyDetails?.[index]?.memberDob && (
                <Text style={styles.errorText}>
                  {formik.errors.familyDetails[index].memberDob}
                </Text>
              )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>{getFieldLabel("aadhaarNo")}*</Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.familyDetails?.[index]?.aadhaarNo &&
                  formik.touched.familyDetails?.[index]?.aadhaarNo &&
                  styles.errorInput,
              ]}
              value={member.aadhaarNo}
              onChangeText={(text) => {
                const familyDetails = [...formik.values.familyDetails];
                familyDetails[index].aadhaarNo = text
                  .replace(/\D/g, "")
                  .slice(0, 12);
                formik.setFieldValue("familyDetails", familyDetails);
              }}
              onBlur={() => {
                formik.setFieldTouched(
                  `familyDetails[${index}].aadhaarNo`,
                  true,
                );
              }}
              placeholder={`Enter ${getFieldLabel("aadhaarNo")}`}
              keyboardType="numeric"
              maxLength={12}
            />
            {formik.errors.familyDetails?.[index]?.aadhaarNo &&
              formik.touched.familyDetails?.[index]?.aadhaarNo && (
                <Text style={styles.errorText}>
                  {formik.errors.familyDetails[index].aadhaarNo}
                </Text>
              )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>{getFieldLabel("isNomine")}*</Text>
            <View
              style={[
                styles.selectBox,
                formik.errors.familyDetails?.[index]?.isNomine &&
                  formik.touched.familyDetails?.[index]?.isNomine &&
                  styles.errorSelect,
              ]}
            >
              <Picker
                selectedValue={member.isNomine}
                onValueChange={(itemValue) => {
                  const familyDetails = [...formik.values.familyDetails];
                  familyDetails[index].isNomine = itemValue;
                  if (itemValue !== "yes") {
                    familyDetails[index].nominePer = "";
                  }
                  formik.setFieldValue("familyDetails", familyDetails);
                  formik.setFieldTouched(
                    `familyDetails[${index}].isNomine`,
                    true,
                  );
                }}
              >
                <Picker.Item label="---Select---" value="" />
                <Picker.Item label="Yes" value="yes" />
                <Picker.Item label="No" value="no" />
              </Picker>
            </View>
            {formik.errors.familyDetails?.[index]?.isNomine &&
              formik.touched.familyDetails?.[index]?.isNomine && (
                <Text style={styles.errorText}>
                  {formik.errors.familyDetails[index].isNomine}
                </Text>
              )}
          </View>

          {formik.values.familyDetails[index].isNomine === "yes" && (
            <View style={styles.inputBlock}>
              <Text style={styles.label}>{getFieldLabel("nominePer")}*</Text>
              <View
                style={[
                  styles.selectBox,
                  formik.errors.familyDetails?.[index]?.nominePer &&
                    formik.touched.familyDetails?.[index]?.nominePer &&
                    styles.errorSelect,
                ]}
              >
                <Picker
                  selectedValue={member.nominePer}
                  onValueChange={(itemValue) => {
                    const familyDetails = [...formik.values.familyDetails];
                    familyDetails[index].nominePer = itemValue;
                    formik.setFieldValue("familyDetails", familyDetails);
                    formik.setFieldTouched(
                      `familyDetails[${index}].nominePer`,
                      true,
                    );
                  }}
                >
                  <Picker.Item label="----Select-----" value="" />
                  {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map(
                    (value) => (
                      <Picker.Item
                        key={value}
                        label={value.toString()}
                        value={value.toString()}
                      />
                    ),
                  )}
                </Picker>
              </View>
              {formik.errors.familyDetails?.[index]?.nominePer &&
                formik.touched.familyDetails?.[index]?.nominePer && (
                  <Text style={styles.errorText}>
                    {formik.errors.familyDetails[index].nominePer}
                  </Text>
                )}
            </View>
          )}

          {formik.values.familyDetails.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFamilyMember(index)}
            >
              <Text style={styles.removeButtonText}>Remove Member</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addFamilyMember}>
        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.addButtonText}>Add Family Member</Text>
      </TouchableOpacity>

      {showMemberDobPicker && (
        <DateTimePicker
          value={formatDateForPicker(
            selectedMemberIndex !== null
              ? formik.values.familyDetails[selectedMemberIndex]?.memberDob
              : null,
          )}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowMemberDobPicker(false);
            if (selectedDate && selectedMemberIndex !== null) {
              const familyDetails = [...formik.values.familyDetails];
              familyDetails[selectedMemberIndex].memberDob =
                formatDateToApi(selectedDate);
              formik.setFieldValue("familyDetails", familyDetails);
              formik.setFieldTouched(
                `familyDetails[${selectedMemberIndex}].memberDob`,
                true,
              );
              setSelectedMemberIndex(null);
            }
          }}
        />
      )}
    </View>
  );

  const getBankByIFSC = async (ifsc, setFieldValue) => {
    if (!ifsc || ifsc.length < 11) {
      setFieldValue("bankName", "");
      setFieldValue("branchName", "");
      return;
    }

    try {
      const res = await commonAPICall(
        `${BANK_DETAILS}?ifscCode=${ifsc}`,
        {},
        "GET",
        dispatch,
      );

      if (res.data?.status === "success" && res.data.Banks?.length > 0) {
        const bank = res.data.Banks[0];

        setFieldValue("bankName", bank.bankname || "");
        setFieldValue("branchName", bank.branch_name || "");
      } else {
        setFieldValue("bankName", "");
        setFieldValue("branchName", "");
      }
    } catch (error) {
      console.error("IFSC API error", error);

      setFieldValue("bankName", "");
      setFieldValue("branchName", "");
    }
  };

  // Render Bank Tab
  const renderBankTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{getFieldLabel("bankDetailes")}</Text>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("ifscCode")} <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            formik.errors.ifscCode &&
              formik.touched.ifscCode &&
              styles.inputError,
          ]}
          value={formik.values.ifscCode?.toUpperCase() || ""}
          onChangeText={(text) => {
            const val = text.toUpperCase();

            formik.setFieldValue("ifscCode", val);

            if (val.length < 11) {
              getBankByIFSC(val, formik.setFieldValue);
            }

            if (val.length === 11) {
              getBankByIFSC(val, formik.setFieldValue);
            }
          }}
          onBlur={formik.handleBlur("ifscCode")}
          placeholder={`Enter ${getFieldLabel("ifscCode")}`}
          maxLength={11}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {formik.errors.ifscCode && formik.touched.ifscCode && (
          <Text style={styles.errorText}>{formik.errors.ifscCode}</Text>
        )}
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("bankName")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.bankName}
          onChangeText={formik.handleChange("bankName")}
          onBlur={formik.handleBlur("bankName")}
          placeholder={`Enter ${getFieldLabel("bankName")}`}
        />
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("branchName")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.branchName}
          onChangeText={formik.handleChange("branchName")}
          onBlur={formik.handleBlur("branchName")}
          placeholder={`Enter ${getFieldLabel("branchName")}`}
        />
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("bankAccountNo")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            formik.errors.bankAccountNo &&
              formik.touched.bankAccountNo &&
              styles.inputError,
          ]}
          value={formik.values.bankAccountNo}
          onChangeText={formik.handleChange("bankAccountNo")}
          onBlur={formik.handleBlur("bankAccountNo")}
          placeholder={`Enter ${getFieldLabel("bankAccountNo")}`}
          keyboardType="numeric"
        />
        {formik.errors.bankAccountNo && formik.touched.bankAccountNo && (
          <Text style={styles.errorText}>{formik.errors.bankAccountNo}</Text>
        )}
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("rbankAccountNo")}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            formik.errors.rbankAccountNo &&
              formik.touched.rbankAccountNo &&
              styles.inputError,
          ]}
          value={formik.values.rbankAccountNo}
          onChangeText={formik.handleChange("rbankAccountNo")}
          onBlur={formik.handleBlur("rbankAccountNo")}
          placeholder={`Re-enter ${getFieldLabel("bankAccountNo")}`}
          keyboardType="numeric"
        />
        {formik.errors.rbankAccountNo && formik.touched.rbankAccountNo && (
          <Text style={styles.errorText}>{formik.errors.rbankAccountNo}</Text>
        )}
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("nameInBank")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.nameInBank}
          onChangeText={formik.handleChange("nameInBank")}
          onBlur={formik.handleBlur("nameInBank")}
          placeholder={`Enter ${getFieldLabel("nameInBank")}`}
        />
      </View>
    </View>
  );

  const [statesList, setStatesList] = useState([]);

  const getStates = async () => {
    const res = await commonAPICall(GET_STATES_API, null, "GET", dispatch);

    if (res?.status === 200) {
      setStatesList(res.data?.States || []);
    }
  };

  useEffect(() => {
    getStates();
  }, []);

  const copyPermanentToPresent = (value) => {
    if (value) {
      formik.setFieldValue("presentState", formik.values.permanentState);
      formik.setFieldValue(
        "presentDistrictCode",
        formik.values.permanentDistrictCode,
      );
      formik.setFieldValue(
        "presentMadalCode",
        formik.values.permanentMadalCode,
      );
      formik.setFieldValue(
        "presentVillageCode",
        formik.values.permanentVillageCode,
      );
      formik.setFieldValue("presentPincode", formik.values.permanentPincode);
      formik.setFieldValue("presentDoorNo", formik.values.permanentDoorNo);
      formik.setFieldValue("presentAddress", formik.values.permanentAddress);
      formik.setFieldValue("presentDivision", formik.values.permanentDivision);
      formik.setFieldValue("presentLandMark", formik.values.permanentLandMark);
      formik.setFieldValue("presentCity", formik.values.permanentCity);
    }
  };

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [mandals2, setMandals2] = useState([]);
  const [villages, setVillages] = useState([]);
  const [villages2, setVillages2] = useState([]);
  const [mandals3, setMandals3] = useState([]);
  const [villages3, setVillages3] = useState([]);

  useEffect(() => {
    loadDistricts();
  }, []);

  const [perDist, setPerDist] = useState([]);

  const loadDistricts = async () => {
    const response = await commonAPICall(
      GET_DISTRICT_REPORT,
      {},
      "GET",
      dispatch,
    );

    if (response?.status === 200) {
      const districts = response.data?.districts || [];

      setPerDist(districts);
      //   setEmpDist(districts);
      //   setEstDist(districts);
    }
  };
  const getMandals = (distCode, from) => {
    const distId = Number(distCode);

    const selectedDistrict = perDist.find((d) => d.districtId === distId);
    if (from === "per") {
      setMandals(selectedDistrict?.mandals || []);
    } else if (from === "pre") {
      setMandals2(selectedDistrict?.mandals || []);
    } else {
      setMandals3(selectedDistrict?.mandals || []);
    }
  };
  const getVillages = async (mandalCode, distCode, from) => {
    const query = `?dist_code=${distCode}&mandal_code=${mandalCode}`;

    const response = await commonAPICall(
      `${GET_VILLAGES}${query}`,
      {},
      "GET",
      dispatch,
    );

    if (response?.status === 200) {
      if (from === "per") {
        setVillages(response.data?.villages || []);
      } else if (from === "pre") {
        setVillages2(response.data?.villages || []);
      } else {
        setVillages3(response.data?.villages || []);
      }
    }
  };

  // Render Address Tab
  const renderAddressTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        {getFieldLabel("paddress") || "శాశ్వత చిరునామా"}
      </Text>

      {/* State */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("state") || "రాష్ట్రం"}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.permanentState}
            onValueChange={(itemValue) => {
              formik.setFieldValue("permanentState", itemValue);
              formik.setFieldValue("permanentDistrictCode", "");
              formik.setFieldValue("permanentMadalCode", "");
              formik.setFieldValue("permanentVillageCode", "");
              //   if (itemValue) {
              //     fetchDistricts(itemValue);
              //   }
            }}
          >
            <Picker.Item label="---Select State---" value="" />
            {statesList.map((state) => (
              <Picker.Item
                key={state.state_code}
                label={state.state_name}
                value={String(state.state_code)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* District */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("permanentDistrictCode") || "జిల్లా"}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.permanentDistrictCode}
            onValueChange={(itemValue) => {
              formik.setFieldValue("permanentDistrictCode", itemValue);
              formik.setFieldValue("permanentMadalCode", "");
              formik.setFieldValue("permanentVillageCode", "");

              setMandals([]);
              setVillages([]);

              if (itemValue) {
                getMandals(itemValue, "per");
              }
            }}
            enabled={!!formik.values.permanentState}
          >
            <Picker.Item label="---Select District---" value="" />
            {dists28.map((district) => (
              <Picker.Item
                key={district.dist_code}
                label={district.dist_name}
                value={String(district.dist_code)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Mandal */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("permanentMadalCode") || "మండలం"}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.permanentMadalCode}
            onValueChange={(itemValue) => {
              formik.setFieldValue("permanentMadalCode", itemValue);
              formik.setFieldValue("permanentVillageCode", "");

              setVillages([]);

              if (itemValue && formik.values.permanentDistrictCode) {
                getVillages(
                  itemValue,
                  formik.values.permanentDistrictCode,
                  "per",
                );
              }
            }}
            enabled={!!formik.values.permanentDistrictCode}
          >
            <Picker.Item label="---Select Mandal---" value="" />
            {mandals.map((mandal) => (
              <Picker.Item
                key={mandal.mandalCode}
                label={mandal.mandalName}
                value={String(mandal.mandalCode)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Village */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("permanentVillageCode") || "గ్రామం"}{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.permanentVillageCode}
            onValueChange={(itemValue) => {
              formik.setFieldValue("permanentVillageCode", itemValue);
            }}
            enabled={!!formik.values.permanentMadalCode}
          >
            <Picker.Item label="---Select Village---" value="" />
            {villages.map((village) => (
              <Picker.Item
                key={village.village_code}
                label={village.village_name}
                value={String(village.village_code)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Pincode */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("presentPincode") || "పిన్ కోడ్"}
        </Text>
        <TextInput
          style={styles.input}
          value={formik.values.permanentPincode}
          onChangeText={(text) => {
            const value = text.replace(/\D/g, "").slice(0, 6);
            formik.setFieldValue("permanentPincode", value);
          }}
          placeholder="Enter Pincode"
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      {/* Division / Ward Number */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("presentDivision") || "డివిజన్ / వార్డు నంబర్"}
        </Text>
        <TextInput
          style={styles.input}
          value={formik.values.permanentDivision}
          onChangeText={formik.handleChange("permanentDivision")}
          placeholder={`Enter ${getFieldLabel("presentDivision") || "Division / Ward Number"}`}
        />
      </View>

      {/* Landmark / Area */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("presentLandMark") || "ల్యాండ్ మార్క్ / ప్రాంతం"}
        </Text>
        <TextInput
          style={styles.input}
          value={formik.values.permanentLandMark}
          onChangeText={formik.handleChange("permanentLandMark")}
          placeholder={`Enter ${getFieldLabel("presentLandMark") || "Landmark / Area"}`}
        />
      </View>

      {/* Town / City */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("presentCity") || "పట్టణం / నగరం"}
        </Text>
        <TextInput
          style={styles.input}
          value={formik.values.permanentCity}
          onChangeText={formik.handleChange("permanentCity")}
          placeholder={`Enter ${getFieldLabel("presentCity") || "Town / City"}`}
        />
      </View>

      {/* Same as Permanent Address Switch */}
      <View style={styles.inputBlock}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>
            {getFieldLabel("isPermanent") ||
              "ప్రస్తుత చిరునామా శాశ్వత చిరునామా లాగే ఉందా?"}
          </Text>
          <Switch
            value={formik.values.isPermanent}
            onValueChange={(value) => {
              formik.setFieldValue("isPermanent", value);
              copyPermanentToPresent(value);
            }}
            trackColor={{ false: "#767577", true: "#007AFF" }}
          />
        </View>
      </View>

      {/* Present Address Section - Only show if isPermanent is false */}
      {!formik.values.isPermanent && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
            {getFieldLabel("PresentAddress") || "ప్రస్తుత చిరునామా"}
          </Text>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("state") || "రాష్ట్రం"}
            </Text>
            <View style={styles.selectBox}>
              <Picker
                selectedValue={formik.values.presentState}
                onValueChange={(itemValue) => {
                  formik.setFieldValue("presentState", itemValue);
                  formik.setFieldValue("presentDistrictCode", "");
                  formik.setFieldValue("presentMadalCode", "");
                  formik.setFieldValue("presentVillageCode", "");
                }}
              >
                <Picker.Item label="---Select State---" value="" />
                {statesList.map((state) => (
                  <Picker.Item
                    key={state.state_code}
                    label={state.state_name}
                    value={String(state.state_code)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("permanentDistrictCode") || "జిల్లా"}
            </Text>
            <View style={styles.selectBox}>
              <Picker
                selectedValue={formik.values.presentDistrictCode}
                onValueChange={(itemValue) => {
                  formik.setFieldValue("presentDistrictCode", itemValue);
                  formik.setFieldValue("presentMadalCode", "");
                  formik.setFieldValue("presentVillageCode", "");
                  if (itemValue) {
                    getMandals(itemValue, "pre");
                  }
                }}
              >
                <Picker.Item label="---Select District---" value="" />
                {dists28.map((district) => (
                  <Picker.Item
                    key={district.dist_code}
                    label={district.dist_name}
                    value={String(district.dist_code)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("presentMadalCode") || "మండలం"}
            </Text>
            <View style={styles.selectBox}>
              <Picker
                selectedValue={formik.values.presentMadalCode}
                onValueChange={(itemValue) => {
                  formik.setFieldValue("presentMadalCode", itemValue);
                  formik.setFieldValue("presentVillageCode", "");
                  if (itemValue && formik.values.presentDistrictCode) {
                    getVillages(
                      itemValue,
                      formik.values.presentDistrictCode,
                      "pre",
                    );
                  }
                }}
              >
                <Picker.Item label="---Select Mandal---" value="" />
                {mandals2.map((mandal) => (
                  <Picker.Item
                    key={mandal.mandalCode}
                    label={mandal.mandalName}
                    value={String(mandal.mandalCode)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("presentVillageCode") || "గ్రామం"}
            </Text>
            <View style={styles.selectBox}>
              <Picker
                selectedValue={formik.values.presentVillageCode}
                onValueChange={(itemValue) => {
                  formik.setFieldValue("presentVillageCode", itemValue);
                }}
              >
                <Picker.Item label="---Select Village---" value="" />
                {villages2.map((village) => (
                  <Picker.Item
                    key={village.village_code}
                    label={village.village_name}
                    value={String(village.village_code)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("presentPincode") || "పిన్ కోడ్"}
            </Text>
            <TextInput
              style={styles.input}
              value={formik.values.presentPincode}
              onChangeText={(text) => {
                const value = text.replace(/\D/g, "").slice(0, 6);
                formik.setFieldValue("presentPincode", value);
              }}
              placeholder="Enter Pincode"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("presentDoorNo") || "డోర్ నంబర్"}
            </Text>
            <TextInput
              style={styles.input}
              value={formik.values.presentDoorNo}
              onChangeText={formik.handleChange("presentDoorNo")}
              placeholder="Enter Door No"
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("presentDivision") || "డివిజన్ / వార్డు నంబర్"}
            </Text>
            <TextInput
              style={styles.input}
              value={formik.values.presentDivision}
              onChangeText={formik.handleChange("presentDivision")}
              placeholder="Enter Division / Ward Number"
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("presentLandMark") || "ల్యాండ్ మార్క్ / ప్రాంతం"}
            </Text>
            <TextInput
              style={styles.input}
              value={formik.values.presentLandMark}
              onChangeText={formik.handleChange("presentLandMark")}
              placeholder="Enter Landmark / Area"
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              {getFieldLabel("presentCity") || "పట్టణం / నగరం"}
            </Text>
            <TextInput
              style={styles.input}
              value={formik.values.presentCity}
              onChangeText={formik.handleChange("presentCity")}
              placeholder="Enter Town / City"
            />
          </View>
        </>
      )}
    </View>
  );

  // Render Employment Tab
  const renderEmploymentTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{getFieldLabel("otherDetailes")}</Text>

      {/* isNregs Question with Yes/No and conditional jobCardNo */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("isNregs")}</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("isNregs", "Y")}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.isNregs === "Y" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("isNregs", "N")}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.isNregs === "N" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Job Card No - Conditional (only shows if isNregs is "Y") */}
      {formik.values.isNregs === "Y" && (
        <View style={styles.inputBlock}>
          <Text style={styles.label}>{getFieldLabel("jobCardNo")}</Text>
          <TextInput
            style={styles.input}
            value={formik.values.jobCardNo}
            onChangeText={formik.handleChange("jobCardNo")}
            onBlur={formik.handleBlur("jobCardNo")}
            placeholder={`Enter ${getFieldLabel("jobCardNo")}`}
            maxLength={12}
          />
        </View>
      )}

      {/* isUnionMember Question with Yes/No and conditional fields */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("isUnionMember")}</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("isUnionMember", "Y")}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.isUnionMember === "Y" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("isUnionMember", "N")}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.isUnionMember === "N" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Union Name and Reg No - Conditional (only shows if isUnionMember is "Y") */}
      {formik.values.isUnionMember === "Y" && (
        <>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>{getFieldLabel("unionName")}</Text>
            <TextInput
              style={styles.input}
              value={formik.values.unionName}
              onChangeText={formik.handleChange("unionName")}
              onBlur={formik.handleBlur("unionName")}
              placeholder={`Enter ${getFieldLabel("unionName")}`}
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>{getFieldLabel("regNo")}</Text>
            <TextInput
              style={styles.input}
              value={formik.values.regNo}
              onChangeText={formik.handleChange("regNo")}
              onBlur={formik.handleBlur("regNo")}
              placeholder={`Enter ${getFieldLabel("regNo")}`}
              maxLength={12}
            />
          </View>
        </>
      )}
    </View>
  );

  const renderWorkTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{getFieldLabel("workPlace")}</Text>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("empName")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.empName}
          onChangeText={formik.handleChange("empName")}
          onBlur={formik.handleBlur("empName")}
          placeholder={`Enter ${getFieldLabel("empName") || "Employer Name"}`}
        />
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("presentOfficeName")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.presentOfficeName}
          onChangeText={formik.handleChange("presentOfficeName")}
          onBlur={formik.handleBlur("presentOfficeName")}
          placeholder={`Enter ${getFieldLabel("presentOfficeName") || "Construction Company Name"}`}
        />
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("typeOfWork")}</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.typeOfWork}
            onValueChange={(itemValue) => {
              formik.setFieldTouched("typeOfWork", true);
              formik.setFieldValue("typeOfWork", itemValue);
            }}
          >
            <Picker.Item label="---Select Work Type---" value="" />
            <Picker.Item label="Construction" value="construction" />
            <Picker.Item label="Agriculture" value="agriculture" />
            <Picker.Item label="Manufacturing" value="manufacturing" />
            <Picker.Item label="Services" value="services" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("workCapability")}</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("workCapability", "yes")}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.workCapability === "yes" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>Yes / అవును</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => formik.setFieldValue("workCapability", "no")}
          >
            <View
              style={[
                styles.radioCircle,
                formik.values.workCapability === "no" && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>No / కాదు</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("district")}</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.workDistrict}
            onValueChange={(itemValue) => {
              formik.setFieldValue("workDistrict", itemValue);
              formik.setFieldValue("workMandal", "");
              formik.setFieldValue("workVillage", "");
              if (itemValue) {
                getMandals(itemValue, "work");
              }
            }}
          >
            <Picker.Item label="---Select District---" value="" />
            {dists28.map((district) => (
              <Picker.Item
                key={district.dist_code}
                label={district.dist_name}
                value={String(district.dist_code)}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("mandal")}</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.workMandal}
            onValueChange={(itemValue) => {
              formik.setFieldValue("workMandal", itemValue);
              formik.setFieldValue("workVillage", "");
              if (itemValue) {
                getVillages(itemValue, formik.values.workDistrict, "work");
              }
            }}
            enabled={!!formik.values.workDistrict}
          >
            <Picker.Item label="---Select Mandal---" value="" />
            {mandals3.map((mandal) => (
              <Picker.Item
                key={mandal.mandalCode}
                label={mandal.mandalName}
                value={String(mandal.mandalCode)}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("village")}</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.workVillage}
            onValueChange={(itemValue) => {
              formik.setFieldValue("workVillage", itemValue);
            }}
            enabled={!!formik.values.workMandal}
          >
            <Picker.Item label="---Select Village---" value="" />
            {villages3.map((village) => (
              <Picker.Item
                key={village.village_code}
                label={village.village_name}
                value={String(village.village_code)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Door No - Added */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("doorNo") || "డోర్ నంబర్"}
        </Text>
        <TextInput
          style={styles.input}
          value={formik.values.workDoorNo}
          onChangeText={formik.handleChange("workDoorNo")}
          onBlur={formik.handleBlur("workDoorNo")}
          placeholder={`Enter ${getFieldLabel("doorNo") || "Door No"}`}
        />
      </View>

      {/* Pincode - Added */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          {getFieldLabel("pincode") || "పిన్ కోడ్"}
        </Text>
        <TextInput
          style={styles.input}
          value={formik.values.workPincode}
          onChangeText={(text) => {
            const value = text.replace(/\D/g, "").slice(0, 6);
            formik.setFieldValue("workPincode", value);
          }}
          onBlur={formik.handleBlur("workPincode")}
          placeholder={`Enter ${getFieldLabel("pincode") || "Pincode"}`}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>
    </View>
  );

  // Render Documents Tab
  const renderDocumentsTab = () => {
    const openPDF = (url) => {
      Linking.openURL(url).catch((err) => {
        console.error("Failed to open URL:", err);
        showErrorToast("Failed to open document", "error");
      });
    };

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>{getFieldLabel("upload")}</Text>

        {/* NOTE Section for Self Declaration */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            <Text style={styles.noteLabel}>NOTE: </Text>
            <Text
              style={styles.noteLink}
              onPress={() =>
                openPDF(
                  "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-download/labour/1776922353301_selfAffidavitDesc-english.pdf",
                )
              }
            >
              Click Here{" "}
              <Ionicons name="download-outline" size={14} color="#28a745" />
            </Text>
            <Text>
              {" "}
              to Download Self Declaration. Sign the document & upload{" "}
            </Text>
            <Text style={styles.noteHighlight}>(In English)</Text>
          </Text>
          <Text style={[styles.noteText, { marginTop: 8 }]}>
            <Text
              style={styles.noteLink}
              onPress={() =>
                openPDF(
                  "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-download/labour/1776774368863_RegistrationSelfDeclaration-telugu.pdf",
                )
              }
            >
              Click Here{" "}
              <Ionicons name="download-outline" size={14} color="#28a745" />
            </Text>
            <Text>
              {" "}
              స్వీయ ధృవీకరణ డౌన్లోడ్ చేసుకోండి. డాక్యుమెంట్ సంతకం చేసి అప్‌లోడ్
              చేయండి.{" "}
            </Text>
            <Text style={styles.noteHighlight}>(In Telugu)</Text>
          </Text>
        </View>

        {/* Row 1: Photo, Signature, Self Declaration - 3 columns */}
        <View style={styles.docRow}>
          {/* Photo Upload */}
          <View style={styles.docColumn}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                {getFieldLabel("photoDesc")}{" "}
                <Text style={styles.requiredStar}>*</Text>
              </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={async () => {
                  formik.setFieldTouched("photoDesc", true);
                  await ImageBucketRN(
                    formik,
                    "APFD/WORKER/PHOTO/",
                    "photoDesc",
                    20971520,
                    "all",
                    dispatch,
                  );
                }}
              >
                <View style={styles.uploadButtonContent}>
                  <Ionicons
                    name="camera"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.uploadButtonText}>
                    Choose {getFieldLabel("photoDesc")}
                  </Text>
                </View>
              </TouchableOpacity>

              {formik.touched.photoDesc && formik.errors.photoDesc && (
                <Text style={styles.errorText}>{formik.errors.photoDesc}</Text>
              )}

              {formik.values.photoDesc &&
                typeof formik.values.photoDesc === "string" && (
                  <View style={styles.previewContainer}>
                    <Image
                      source={{ uri: getImageUrl(formik.values.photoDesc) }}
                      style={styles.previewImage}
                    />
                  </View>
                )}
            </View>
          </View>

          {/* Signature Upload */}
          <View style={styles.docColumn}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                {getFieldLabel("signatureDesc")}{" "}
                <Text style={styles.requiredStar}>*</Text>
              </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={async () => {
                  formik.setFieldTouched("signatureDesc", true);
                  await ImageBucketRN(
                    formik,
                    "APFD/WORKER/SIGNATURE/",
                    "signatureDesc",
                    20971520,
                    "all",
                    dispatch,
                  );
                }}
              >
                <View style={styles.uploadButtonContent}>
                  <Ionicons
                    name="camera"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.uploadButtonText}>
                    Capture {getFieldLabel("signatureDesc")}
                  </Text>
                </View>
              </TouchableOpacity>

              {formik.touched.signatureDesc && formik.errors.signatureDesc && (
                <Text style={styles.errorText}>
                  {formik.errors.signatureDesc}
                </Text>
              )}

              {formik.values.signatureDesc &&
                typeof formik.values.signatureDesc === "string" && (
                  <View style={styles.previewContainer}>
                    <Image
                      source={{ uri: getImageUrl(formik.values.signatureDesc) }}
                      style={styles.previewImage}
                    />
                  </View>
                )}
            </View>
          </View>

          {/* Self Declaration Upload */}
          <View style={styles.docColumn}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                {getFieldLabel("selfAffidavitDesc")}{" "}
                <Text style={styles.requiredStar}>*</Text>
              </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={async () => {
                  formik.setFieldTouched("selfAffidavitDesc", true);
                  await ImageBucketRN(
                    formik,
                    "APFD/WORKER/DECLARATION/",
                    "selfAffidavitDesc",
                    20971520,
                    "all",
                    dispatch,
                  );
                }}
              >
                <View style={styles.uploadButtonContent}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.uploadButtonText}>
                    Upload {getFieldLabel("selfAffidavitDesc")}
                  </Text>
                </View>
              </TouchableOpacity>

              {formik.touched.selfAffidavitDesc &&
                formik.errors.selfAffidavitDesc && (
                  <Text style={styles.errorText}>
                    {formik.errors.selfAffidavitDesc}
                  </Text>
                )}

              {formik.values.selfAffidavitDesc &&
                typeof formik.values.selfAffidavitDesc === "string" && (
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      viewBucketImage(formik.values.selfAffidavitDesc)
                    }
                  >
                    <Text style={styles.viewButtonText}>View File</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render Payment Tab
  const renderPaymentTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>{getFieldLabel("payment")}</Text>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("fee")}</Text>
        <Text style={styles.feeText}>
          Registration Fee: ₹50 (one time) + ₹12 annual subscription
        </Text>
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("years")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.years}
          onChangeText={(text) => {
            const value = text.replace(/\D/g, "");
            formik.setFieldValue("years", value);
          }}
          placeholder={`Enter ${getFieldLabel("years")}`}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputBlock}>
        <Text style={styles.label}>{getFieldLabel("amount")}</Text>
        <TextInput
          style={styles.input}
          value={formik.values.amount}
          onChangeText={(text) => {
            const value = text.replace(/\D/g, "");
            formik.setFieldValue("amount", value);
          }}
          placeholder={`Enter ${getFieldLabel("amount")}`}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputBlock}>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() =>
              formik.setFieldValue(
                "selfDeclaration",
                !formik.values.selfDeclaration,
              )
            }
          >
            <View
              style={[
                styles.checkboxBox,
                formik.values.selfDeclaration && styles.checkboxChecked,
              ]}
            >
              {formik.values.selfDeclaration && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              {getFieldLabel("selfCheck")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderPersonalInfoTab();
      case 1:
        return renderFamilyTab();
      case 2:
        return renderBankTab();
      case 3:
        return renderAddressTab();
      case 4:
        return renderEmploymentTab();
      case 5:
        return renderWorkTab();
      case 6:
        return renderDocumentsTab();
      case 7:
        return renderPaymentTab();
      default:
        return null;
    }
  };

  return (
    <FormikProvider value={formik}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>
          {currentLanguageData?.title || "Worker Registration"}
        </Text>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? "#007AFF" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionCard}>{renderTabContent()}</View>

          <TouchableOpacity
            style={[
              styles.submitButton,
            ]}
            onPress={() => {
              if (activeTab === 7) {
                formik.handleSubmit();
              } else {
                formik.handleSubmit();
                // setActiveTab((curr) => curr + 1);
              }
            }}
          >
            <Text style={styles.submitButtonText}>
              {isLoading
                ? "REGISTERING..."
                : activeTab === 7
                  ? "REGISTER WORKER"
                  : "NEXT"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Loading Modal */}
      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.loadingModal}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      </Modal>
    </FormikProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 50,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  tabBar: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    flexWrap: "wrap",
    width: 450,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    width: "43%",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabContent: {
    paddingBottom: 20,
  },
  inputBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  requiredStar: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: "green",
    fontSize: 12,
    marginTop: 4,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: "#007AFF",
  },
  radioLabel: {
    fontSize: 14,
    color: "#333",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  familyCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  uploadButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  removeButton: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  removeButtonText: {
    color: "red",
    fontSize: 14,
  },
  otpContainer: {
    marginTop: 8,
  },
  otpInput: {
    marginBottom: 8,
  },
  verifyButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#333",
  },
  feeText: {
    fontSize: 14,
    color: "#666",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
});

export default WorkerRegistration;
