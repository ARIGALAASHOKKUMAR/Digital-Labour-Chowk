import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { FieldArray, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";

import { login } from "../actions";
import {
  BASICPROFILE,
  commonAPICall,
  GETDISTSAPP,
  GETMANDALSAPP,
  GETSKILLS,
  GETVILLAGESAPP,
} from "../utils/utils";
import { new_dist, profileMenu } from "../commonFunction";

// ==================== Basic Details Component ====================

const BasicDetails = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.LoginReducer);

  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ SIMPLE REQUIRED VALIDATION
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Required"),
    mobileNumber: Yup.string().required("Required"),
    email: Yup.string().required("Required"),
    dateOfBirth: Yup.string().required("Required"),
    gender: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      mobileNumber: "",
      email: "",
      profileImage: "test",
      userType: "WORKER",
      employerTypeId: 1,
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values, { setSubmitting, resetForm }) {
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        mobileNumber: values.mobileNumber,
        userType: state.roleName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        profileImage: values.profileImage,
        employerTypeId: values.employerTypeId,
        stageName: "BASIC_INFO",
      };

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      console.log("payload", payload);

      if (response?.status === 200) {
        resetForm();
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormikProvider value={formik}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic Details</Text>

          {/* Full Name */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Full Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.fullName &&
                  formik.touched.fullName &&
                  styles.inputError,
              ]}
              value={formik.values.fullName}
              onChangeText={formik.handleChange("fullName")}
              onBlur={formik.handleBlur("fullName")}
              placeholder="Enter full name"
            />
            {formik.errors.fullName && formik.touched.fullName && (
              <Text style={styles.errorText}>{formik.errors.fullName}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Date of Birth <Text style={styles.requiredStar}>*</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.datePickerButton,
                formik.errors.dateOfBirth &&
                  formik.touched.dateOfBirth &&
                  styles.inputError,
              ]}
              onPress={() => {
                formik.setFieldTouched("dateOfBirth", true);
                setShowDatePicker(true);
              }}
            >
              <Text>
                {formik.values.dateOfBirth || "Select Date of Birth"}
              </Text>
              <Ionicons name="calendar-outline" size={20} />
            </TouchableOpacity>

            {formik.errors.dateOfBirth && formik.touched.dateOfBirth && (
              <Text style={styles.errorText}>
                {formik.errors.dateOfBirth}
              </Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={
                  formik.values.dateOfBirth
                    ? new Date(formik.values.dateOfBirth)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formatted = selectedDate
                      .toISOString()
                      .split("T")[0];
                    formik.setFieldValue("dateOfBirth", formatted);
                  }
                }}
              />
            )}
          </View>

          {/* Gender */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Gender <Text style={styles.requiredStar}>*</Text>
            </Text>

            <View style={styles.radioRow}>
              {["MALE", "FEMALE", "OTHER"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.radioItem}
                  onPress={() => {
                    formik.setFieldTouched("gender", true);
                    formik.setFieldValue("gender", g);
                  }}
                >
                  <Ionicons
                    name={
                      formik.values.gender === g
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                  />
                  <Text>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formik.errors.gender && formik.touched.gender && (
              <Text style={styles.errorText}>{formik.errors.gender}</Text>
            )}
          </View>

          {/* Mobile */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Mobile Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.mobileNumber &&
                  formik.touched.mobileNumber &&
                  styles.inputError,
              ]}
              value={formik.values.mobileNumber}
              onChangeText={formik.handleChange("mobileNumber")}
              onBlur={formik.handleBlur("mobileNumber")}
              keyboardType="phone-pad"
              placeholder="Enter mobile number"
              maxLength={10}
            />
            {formik.errors.mobileNumber && formik.touched.mobileNumber && (
              <Text style={styles.errorText}>
                {formik.errors.mobileNumber}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Email <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.email &&
                  formik.touched.email &&
                  styles.inputError,
              ]}
              value={formik.values.email}
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              placeholder="Enter email"
              keyboardType="email-address"
            />
            {formik.errors.email && formik.touched.email && (
              <Text style={styles.errorText}>{formik.errors.email}</Text>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={formik.handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {formik.isSubmitting ? "UPDATING..." : "UPDATE PROFILE"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </FormikProvider>
  );
};


// ==================== Identity Verification Component ====================

const IdentityVerification = () => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const validationSchema = Yup.object().shape({
    documentType: Yup.string().required("Required"),
    documentNumber: Yup.string().required("Required"),
    // documentFile: Yup.string().required("Required"),
    eShramCardNumber: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      documentType: "",
      documentNumber: "",
      documentFile: "test",
      eShramCardNumber: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    try {
      const payload = {
        userType: state.roleName,
        stageName: "DOCUMENT_VERIFICATION",
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        uploadDocument: values.documentFile,
        eShramCardNumber: values.eShramCardNumber,
      };

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      console.log("payload", payload);

      if (response?.status === 200) {
        const updatedPayload = {
          ...state,
          isProfileUpdated: "Y",
        };
        dispatch(login(updatedPayload));
        resetForm();
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Identity & Verification</Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Document Type <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.documentType &&
                formik.touched.documentType &&
                styles.inputError,
            ]}
          >
            <Picker
              selectedValue={formik.values.documentType}
              onValueChange={(itemValue) => {
                formik.setFieldTouched("documentType", true);
                formik.setFieldValue("documentType", itemValue);
              }}
            >
              <Picker.Item label="Select Document Type" value="" />
              <Picker.Item label="PAN" value="PAN" />
              <Picker.Item label="Driving License" value="DRIVING_LICENSE" />
              <Picker.Item label="Voter ID" value="VOTER_ID" />
            </Picker>
          </View>
          {formik.errors.documentType && formik.touched.documentType && (
            <Text style={styles.errorText}>{formik.errors.documentType}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Document Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.documentNumber &&
                formik.touched.documentNumber &&
                styles.inputError,
            ]}
            value={formik.values.documentNumber}
            onChangeText={formik.handleChange("documentNumber")}
            onBlur={formik.handleBlur("documentNumber")}
            placeholder="Enter Document Number"
            editable={!formik.isSubmitting}
          />
          {formik.errors.documentNumber && formik.touched.documentNumber && (
            <Text style={styles.errorText}>{formik.errors.documentNumber}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Upload Document <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              formik.errors.documentFile &&
                formik.touched.documentFile &&
                styles.inputError,
            ]}
            onPress={() => {
              formik.setFieldTouched("documentFile", true);

              // replace this with actual picker
              Alert.alert("Upload", "Open Document Picker");
              formik.setFieldValue("documentFile", "test-document.pdf");
            }}
            disabled={formik.isSubmitting}
          >
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </TouchableOpacity>

          {formik.values.documentFile ? (
            <Text style={styles.fileNameText}>{formik.values.documentFile}</Text>
          ) : null}

          {formik.errors.documentFile && formik.touched.documentFile && (
            <Text style={styles.errorText}>{formik.errors.documentFile}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            e-Shram Card Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.eShramCardNumber &&
                formik.touched.eShramCardNumber &&
                styles.inputError,
            ]}
            value={formik.values.eShramCardNumber}
            onChangeText={formik.handleChange("eShramCardNumber")}
            onBlur={formik.handleBlur("eShramCardNumber")}
            placeholder="Enter e-Shram Card Number"
            editable={!formik.isSubmitting}
          />
          {formik.errors.eShramCardNumber &&
            formik.touched.eShramCardNumber && (
              <Text style={styles.errorText}>
                {formik.errors.eShramCardNumber}
              </Text>
            )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            formik.isSubmitting && styles.disabledButton,
          ]}
          onPress={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {formik.isSubmitting ? "SAVING..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>
    </FormikProvider>
  );
};


// ==================== Location Information Component ====================

const LocationInformation = () => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const [dists, setDists] = useState([]);
  const [mandal, setMandal] = useState([]);
  const [village, setVillage] = useState([]);

  const getdists = async () => {
    const response = await commonAPICall(GETDISTSAPP, {}, "get", dispatch);
    console.log("ress", response);
    if (response?.status === 200) {
      setDists(response?.data?.District_List || []);
    }
  };

  const getmandals = async (distcode) => {
    try {
      const response = await commonAPICall(
        GETMANDALSAPP + distcode,
        {},
        "get",
        dispatch,
      );
      if (response?.status === 200) {
        setMandal(response?.data?.Mandal_List || []);
      } else {
        setMandal([]);
      }
    } catch (error) {
      console.log("Error fetching mandals:", error);
      setMandal([]);
    }
  };

  const getVilages = async (distcode, mandalcode) => {
    try {
      const cleanMandalCode = String(mandalcode || "").replace(/,/g, "");

      const response = await commonAPICall(
        `${GETVILLAGESAPP}?distCode=${distcode}&mandalCode=${cleanMandalCode}`,
        {},
        "get",
        dispatch,
      );

      if (response?.status === 200) {
        setVillage(response?.data?.Village_List || []);
      } else {
        setVillage([]);
      }
    } catch (error) {
      console.log("Error fetching villages:", error);
      setVillage([]);
    }
  };

  const validationSchema = Yup.object().shape({
    district: Yup.string().required("Required"),
    mandal: Yup.string().required("Required"),
    village: Yup.string().required("Required"),
    surveyOrHouseNo: Yup.string().required("Required"),
    landmark: Yup.string().required("Required"),
    pinCode: Yup.string().required("Required"),
    latitude: Yup.string().required("Required"),
    longitude: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      district: "",
      mandal: "",
      village: "",
      surveyOrHouseNo: "",
      landmark: "",
      pinCode: "",
      latitude: "",
      longitude: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values, { setSubmitting, resetForm }) {
    try {
      const payload = {
        userType: state.roleName,
        stageName: "LOCATION_ADDRESS",
        plotOrHouseNumber: values.surveyOrHouseNo,
        landmark: values.landmark,
        pincode: values.pinCode,
        latitude: values.latitude,
        longitude: values.longitude,
        district: values.district,
        mandal: values.mandal,
        village: values.village,
      };

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        resetForm();
        setMandal([]);
        setVillage([]);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      formik.setFieldValue(
        "latitude",
        String(location?.coords?.latitude || ""),
      );
      formik.setFieldValue(
        "longitude",
        String(location?.coords?.longitude || ""),
      );
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert("Error", "Unable to fetch location");
    }
  };

  useEffect(() => {
    getdists();
    getLocation();
  }, []);

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Location Information</Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            District <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.district &&
                formik.touched.district &&
                styles.inputError,
            ]}
          >
            <Picker
              selectedValue={formik.values.district}
              onValueChange={(itemValue) => {
                formik.setFieldTouched("district", true);
                formik.setFieldValue("district", itemValue);
                formik.setFieldValue("mandal", "");
                formik.setFieldValue("village", "");
                setMandal([]);
                setVillage([]);

                if (itemValue) {
                  getmandals(itemValue);
                }
              }}
            >
              <Picker.Item label="---Select District---" value="" />
              {dists.map((dist) => (
                <Picker.Item
                  key={String(dist.dist_code)}
                  label={dist.dist_name}
                  value={String(dist.dist_code)}
                />
              ))}
            </Picker>
          </View>
          {formik.errors.district && formik.touched.district && (
            <Text style={styles.errorText}>{formik.errors.district}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Mandal <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.mandal &&
                formik.touched.mandal &&
                styles.inputError,
            ]}
          >
            <Picker
              selectedValue={formik.values.mandal}
              onValueChange={(itemValue) => {
                formik.setFieldTouched("mandal", true);
                formik.setFieldValue("mandal", itemValue);
                formik.setFieldValue("village", "");
                setVillage([]);

                if (itemValue && formik.values.district) {
                  getVilages(formik.values.district, itemValue);
                }
              }}
              enabled={!!formik.values.district}
            >
              <Picker.Item label="---Select Mandal---" value="" />
              {mandal.map((item) => (
                <Picker.Item
                  key={String(item.mandal_code)}
                  label={item.mandal_name}
                  value={String(item.mandal_code)}
                />
              ))}
            </Picker>
          </View>
          {formik.errors.mandal && formik.touched.mandal && (
            <Text style={styles.errorText}>{formik.errors.mandal}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Village <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.village &&
                formik.touched.village &&
                styles.inputError,
            ]}
          >
            <Picker
              selectedValue={formik.values.village}
              onValueChange={(itemValue) => {
                formik.setFieldTouched("village", true);
                formik.setFieldValue("village", itemValue);
              }}
              enabled={!!formik.values.mandal}
            >
              <Picker.Item label="---Select Village---" value="" />
              {village.map((item) => (
                <Picker.Item
                  key={String(item.village_code)}
                  label={item.village_name}
                  value={String(item.village_code)}
                />
              ))}
            </Picker>
          </View>
          {formik.errors.village && formik.touched.village && (
            <Text style={styles.errorText}>{formik.errors.village}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Door No. <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.surveyOrHouseNo &&
                formik.touched.surveyOrHouseNo &&
                styles.inputError,
            ]}
            value={formik.values.surveyOrHouseNo}
            onChangeText={formik.handleChange("surveyOrHouseNo")}
            onBlur={formik.handleBlur("surveyOrHouseNo")}
            placeholder="Enter Door No."
            maxLength={20}
          />
          {formik.errors.surveyOrHouseNo && formik.touched.surveyOrHouseNo && (
            <Text style={styles.errorText}>
              {formik.errors.surveyOrHouseNo}
            </Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Landmark <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.landmark &&
                formik.touched.landmark &&
                styles.inputError,
            ]}
            value={formik.values.landmark}
            onChangeText={formik.handleChange("landmark")}
            onBlur={formik.handleBlur("landmark")}
            placeholder="Enter Landmark"
            maxLength={100}
          />
          {formik.errors.landmark && formik.touched.landmark && (
            <Text style={styles.errorText}>{formik.errors.landmark}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Pin Code <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.pinCode &&
                formik.touched.pinCode &&
                styles.inputError,
            ]}
            value={formik.values.pinCode}
            onChangeText={formik.handleChange("pinCode")}
            onBlur={formik.handleBlur("pinCode")}
            placeholder="Enter Pin Code"
            keyboardType="numeric"
            maxLength={6}
          />
          {formik.errors.pinCode && formik.touched.pinCode && (
            <Text style={styles.errorText}>{formik.errors.pinCode}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Latitude <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.latitude &&
                formik.touched.latitude &&
                styles.inputError,
            ]}
            value={formik.values.latitude}
            onChangeText={formik.handleChange("latitude")}
            onBlur={formik.handleBlur("latitude")}
            placeholder="Latitude"
          />
          {formik.errors.latitude && formik.touched.latitude && (
            <Text style={styles.errorText}>{formik.errors.latitude}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Longitude <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.longitude &&
                formik.touched.longitude &&
                styles.inputError,
            ]}
            value={formik.values.longitude}
            onChangeText={formik.handleChange("longitude")}
            onBlur={formik.handleBlur("longitude")}
            placeholder="Longitude"
          />
          {formik.errors.longitude && formik.touched.longitude && (
            <Text style={styles.errorText}>{formik.errors.longitude}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            formik.isSubmitting && styles.disabledButton,
          ]}
          onPress={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {formik.isSubmitting ? "SAVING..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>
    </FormikProvider>
  );
};



const SkillDetails = () => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const [skillsList, setSkillsList] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  const validationSchema = Yup.object().shape({
    skillIds: Yup.array().min(1, "Required").required("Required"),
    experience: Yup.string().required("Required"),
    preferredWorkType: Yup.string().required("Required"),
    dailyRate: Yup.string().required("Required"),
    availabilityForWork: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      skillIds: [],
      experience: "",
      preferredWorkType: "",
      dailyRate: "",
      availabilityForWork: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const getSkillsData = async () => {
    try {
      const response = await commonAPICall(GETSKILLS, {}, "get", dispatch);

      if (response?.status === 200) {
        const skillData = response?.data?.Skill_Info_Details || [];
        setSkillsList(skillData);
      }
    } catch (error) {
      console.log("Error fetching skills:", error);
    }
  };

  useEffect(() => {
    getSkillsData();
  }, []);

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    try {
      const payload = {
        userType: state.roleName,
        stageName: "SKILL_INFO",
        skillIds: values.skillIds,
        experienceYears: values.experience ? Number(values.experience) : 0,
        preferredWorkType: values.preferredWorkType,
        dailyRate: values.dailyRate ? Number(values.dailyRate) : 0,
        workAvailability: values.availabilityForWork,
      };

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      console.log("payload", payload);

      if (response?.status === 200) {
        const updatedPayload = {
          ...state,
          isProfileUpdated: "Y",
        };
        dispatch(login(updatedPayload));
        resetForm();
        setShowSkillsDropdown(false);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const toggleSkill = (skillId) => {
    formik.setFieldTouched("skillIds", true);
    const selectedIds = formik.values.skillIds || [];

    if (selectedIds.includes(skillId)) {
      formik.setFieldValue(
        "skillIds",
        selectedIds.filter((id) => id !== skillId),
      );
    } else {
      formik.setFieldValue("skillIds", [...selectedIds, skillId]);
    }
  };

  const selectedSkillNames = skillsList
    .filter((item) => formik.values.skillIds.includes(item.id))
    .map((item) => item.skill_name)
    .join(", ");

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Skill Details</Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Select Skills <Text style={styles.requiredStar}>*</Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.selectBox,
              formik.touched.skillIds &&
                formik.errors.skillIds &&
                styles.inputError,
            ]}
            onPress={() => {
              formik.setFieldTouched("skillIds", true);
              setShowSkillsDropdown(!showSkillsDropdown);
            }}
          >
            <Text style={{ color: selectedSkillNames ? "#000" : "#999", flex: 1 }}>
              {selectedSkillNames || "Select Skills"}
            </Text>
            <Ionicons
              name={showSkillsDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>

          {showSkillsDropdown && (
            <View style={styles.dropdownBox}>
              {skillsList.map((item) => {
                const selected = formik.values.skillIds.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.skillItem}
                    onPress={() => toggleSkill(item.id)}
                  >
                    <Text style={styles.skillText}>{item.skill_name}</Text>
                    <Ionicons
                      name={selected ? "checkbox" : "square-outline"}
                      size={22}
                      color={selected ? "#1e3a5f" : "#999"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {formik.touched.skillIds && formik.errors.skillIds ? (
            <Text style={styles.errorText}>{formik.errors.skillIds}</Text>
          ) : null}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Experience <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.experience &&
                formik.touched.experience &&
                styles.inputError,
            ]}
            value={formik.values.experience}
            onChangeText={formik.handleChange("experience")}
            onBlur={formik.handleBlur("experience")}
            placeholder="Enter experience in years"
            keyboardType="numeric"
            maxLength={2}
          />
          {formik.errors.experience && formik.touched.experience && (
            <Text style={styles.errorText}>{formik.errors.experience}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Preferred Work Type <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.radioColumn}>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => {
                formik.setFieldTouched("preferredWorkType", true);
                formik.setFieldValue("preferredWorkType", "daily_wage");
              }}
            >
              <Ionicons
                name={
                  formik.values.preferredWorkType === "daily_wage"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={22}
                color="#0d6efd"
              />
              <Text style={styles.radioText}>Daily Wage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => {
                formik.setFieldTouched("preferredWorkType", true);
                formik.setFieldValue("preferredWorkType", "contract");
              }}
            >
              <Ionicons
                name={
                  formik.values.preferredWorkType === "contract"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={22}
                color="#0d6efd"
              />
              <Text style={styles.radioText}>Contract</Text>
            </TouchableOpacity>
          </View>
          {formik.errors.preferredWorkType &&
            formik.touched.preferredWorkType && (
              <Text style={styles.errorText}>
                {formik.errors.preferredWorkType}
              </Text>
            )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Daily Rate <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.dailyRate &&
                formik.touched.dailyRate &&
                styles.inputError,
            ]}
            value={formik.values.dailyRate}
            onChangeText={formik.handleChange("dailyRate")}
            onBlur={formik.handleBlur("dailyRate")}
            placeholder="Enter daily rate"
            keyboardType="numeric"
            maxLength={6}
          />
          {formik.errors.dailyRate && formik.touched.dailyRate && (
            <Text style={styles.errorText}>{formik.errors.dailyRate}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Select Availability for Work{" "}
            <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.availabilityForWork &&
                formik.touched.availabilityForWork &&
                styles.inputError,
            ]}
          >
            <Picker
              selectedValue={formik.values.availabilityForWork}
              onValueChange={(itemValue) => {
                formik.setFieldTouched("availabilityForWork", true);
                formik.setFieldValue("availabilityForWork", itemValue);
              }}
            >
              <Picker.Item label="Select Availability" value="" />
              <Picker.Item label="Yes" value="yes" />
              <Picker.Item label="No" value="no" />
            </Picker>
          </View>
          {formik.errors.availabilityForWork &&
            formik.touched.availabilityForWork && (
              <Text style={styles.errorText}>
                {formik.errors.availabilityForWork}
              </Text>
            )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            formik.isSubmitting && styles.disabledButton,
          ]}
          onPress={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {formik.isSubmitting ? "SAVING..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>
    </FormikProvider>
  );
};


const WorkExperience = () => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const [skillsList, setSkillsList] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [currentIndex, setCurrentIndex] = useState(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const emptyExperience = {
    employerName: "",
    projectName: "",
    workPlace: "",
    workType: "",
    skillId: "",
    taskDesc: "",
    startDate: "",
    endDate: "",
    daysWorked: "",
    dailyWage: "",
    totalAmount: "",
    paymentStatus: "",
    remarks: "",
    rating: "",
  };

  const getSkillsData = async () => {
    try {
      const response = await commonAPICall(GETSKILLS, {}, "get", dispatch);
      if (response?.status === 200) {
        setSkillsList(response?.data?.Skill_Info_Details || []);
      }
    } catch (error) {
      console.log("Error fetching skills:", error);
    }
  };

  useEffect(() => {
    getSkillsData();
  }, []);

  const validationSchema = Yup.object().shape({
    experiences: Yup.array().of(
      Yup.object().shape({
        employerName: Yup.string().required("Required"),
        projectName: Yup.string().required("Required"),
        workPlace: Yup.string().required("Required"),
        workType: Yup.string().required("Required"),
        skillId: Yup.string().required("Required"),
        taskDesc: Yup.string().required("Required"),
        startDate: Yup.string().required("Required"),
        endDate: Yup.string().required("Required"),
        daysWorked: Yup.string().required("Required"),
        dailyWage: Yup.string().required("Required"),
        totalAmount: Yup.string().required("Required"),
        paymentStatus: Yup.string().required("Required"),
        remarks: Yup.string().required("Required"),
        rating: Yup.string().required("Required"),
      }),
    ),
  });

  const formik = useFormik({
    initialValues: {
      experiences: [emptyExperience],
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateToApi = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseDisplayDateToDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date();
    const [dd, mm, yyyy] = parts;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    const payload = {
      userType: state.roleName || "",
      stageName: "WORK_HISTORY",
      workerExperienceList: values.experiences.map((exp) => ({
        employerName: exp.employerName?.trim() || "",
        projectName: exp.projectName?.trim() || "",
        workPlace: exp.workPlace?.trim() || "",
        workType: exp.workType?.trim() || "",
        skillId: exp.skillId ? Number(exp.skillId) : null,
        taskDescription: exp.taskDesc?.trim() || "",
        startDate: formatDateToApi(exp.startDate),
        endDate: formatDateToApi(exp.endDate),
        daysWorked: exp.daysWorked ? Number(exp.daysWorked) : 0,
        dailyWage: exp.dailyWage ? Number(exp.dailyWage) : 0,
        totalAmount: exp.totalAmount ? Number(exp.totalAmount) : 0,
        paymentStatus: exp.paymentStatus || "",
        remarks: exp.remarks?.trim() || "",
        rating: exp.rating ? Number(exp.rating) : 0,
      })),
    };

    console.log("Work Experience Payload =>", JSON.stringify(payload, null, 2));

    try {
      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        const updatedPayload = {
          ...state,
          isProfileUpdated: "Y",
        };
        dispatch(login(updatedPayload));
        resetForm();
      } else {
        console.log("API failed =>", response);
      }
    } catch (error) {
      console.log("Submit Error =>", error);
    } finally {
      setSubmitting(false);
    }
  }

  const addExperience = () => {
    formik.setFieldValue("experiences", [
      ...formik.values.experiences,
      { ...emptyExperience },
    ]);
  };

  const removeExperience = (index) => {
    const newExperiences = formik.values.experiences.filter(
      (_, i) => i !== index,
    );
    formik.setFieldValue("experiences", newExperiences);
  };

  const calculateTotalAmount = (index, days, wage) => {
    const daysNum = Number(days || 0);
    const wageNum = Number(wage || 0);

    if (daysNum > 0 && wageNum > 0) {
      formik.setFieldValue(
        `experiences[${index}].totalAmount`,
        String(daysNum * wageNum),
      );
    } else {
      formik.setFieldValue(`experiences[${index}].totalAmount`, "");
    }
  };

  const openDatePicker = (field, index) => {
    const currentValue = formik.values.experiences[index]?.[field];
    formik.setFieldTouched(`experiences[${index}].${field}`, true);
    setCurrentField(field);
    setCurrentIndex(index);
    setPickerDate(parseDisplayDateToDate(currentValue));
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event?.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const chosenDate = selectedDate || pickerDate;
    setPickerDate(chosenDate);

    if (currentIndex !== null && currentField) {
      const formatted = formatDate(chosenDate);
      const exp = formik.values.experiences[currentIndex];

      if (currentField === "startDate") {
        formik.setFieldValue(
          `experiences[${currentIndex}].startDate`,
          formatted,
        );

        if (exp.endDate) {
          const start = new Date(
            chosenDate.getFullYear(),
            chosenDate.getMonth(),
            chosenDate.getDate(),
          );
          const end = parseDisplayDateToDate(exp.endDate);

          if (end < start) {
            formik.setFieldValue(`experiences[${currentIndex}].endDate`, "");
          }
        }
      } else if (currentField === "endDate") {
        if (exp.startDate) {
          const start = parseDisplayDateToDate(exp.startDate);
          const end = new Date(
            chosenDate.getFullYear(),
            chosenDate.getMonth(),
            chosenDate.getDate(),
          );

          if (end < start) {
            Alert.alert("Invalid Date", "End date cannot be before Start date");
            return;
          }
        }

        formik.setFieldValue(`experiences[${currentIndex}].endDate`, formatted);
      }
    }
  };

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Experience / Work Experience</Text>

        {formik.values.experiences.map((item, index) => (
          <View key={index} style={styles.experienceCard}>
            <View style={styles.expHeader}>
              <Text style={styles.expTitle}>Experience {index + 1}</Text>

              {formik.values.experiences.length > 1 && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeExperience(index)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Employer Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.employerName &&
                    formik.errors.experiences?.[index]?.employerName &&
                    styles.inputError,
                ]}
                value={item.employerName}
                onChangeText={formik.handleChange(
                  `experiences[${index}].employerName`,
                )}
                onBlur={formik.handleBlur(`experiences[${index}].employerName`)}
                placeholder="Enter Employer Name"
              />
              {formik.touched.experiences?.[index]?.employerName &&
                formik.errors.experiences?.[index]?.employerName && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].employerName}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Project Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.projectName &&
                    formik.errors.experiences?.[index]?.projectName &&
                    styles.inputError,
                ]}
                value={item.projectName}
                onChangeText={formik.handleChange(
                  `experiences[${index}].projectName`,
                )}
                onBlur={formik.handleBlur(`experiences[${index}].projectName`)}
                placeholder="Enter Project Name"
              />
              {formik.touched.experiences?.[index]?.projectName &&
                formik.errors.experiences?.[index]?.projectName && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].projectName}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Work Place <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.workPlace &&
                    formik.errors.experiences?.[index]?.workPlace &&
                    styles.inputError,
                ]}
                value={item.workPlace}
                onChangeText={formik.handleChange(
                  `experiences[${index}].workPlace`,
                )}
                onBlur={formik.handleBlur(`experiences[${index}].workPlace`)}
                placeholder="Enter Work Place"
              />
              {formik.touched.experiences?.[index]?.workPlace &&
                formik.errors.experiences?.[index]?.workPlace && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].workPlace}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Work Type <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.workType &&
                    formik.errors.experiences?.[index]?.workType &&
                    styles.inputError,
                ]}
                value={item.workType}
                onChangeText={formik.handleChange(
                  `experiences[${index}].workType`,
                )}
                onBlur={formik.handleBlur(`experiences[${index}].workType`)}
                placeholder="Enter Work Type"
              />
              {formik.touched.experiences?.[index]?.workType &&
                formik.errors.experiences?.[index]?.workType && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].workType}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Skill <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.selectBox,
                  formik.touched.experiences?.[index]?.skillId &&
                    formik.errors.experiences?.[index]?.skillId &&
                    styles.inputError,
                ]}
              >
                <Picker
                  selectedValue={item.skillId}
                  onValueChange={(itemValue) => {
                    formik.setFieldTouched(`experiences[${index}].skillId`, true);
                    formik.setFieldValue(
                      `experiences[${index}].skillId`,
                      itemValue,
                    );
                  }}
                >
                  <Picker.Item label="Select Skill" value="" />
                  {skillsList.map((skill) => (
                    <Picker.Item
                      key={skill.id}
                      label={skill.skill_name}
                      value={String(skill.id)}
                    />
                  ))}
                </Picker>
              </View>
              {formik.touched.experiences?.[index]?.skillId &&
                formik.errors.experiences?.[index]?.skillId && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].skillId}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Task Description <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  formik.touched.experiences?.[index]?.taskDesc &&
                    formik.errors.experiences?.[index]?.taskDesc &&
                    styles.inputError,
                ]}
                value={item.taskDesc}
                onChangeText={formik.handleChange(
                  `experiences[${index}].taskDesc`,
                )}
                onBlur={formik.handleBlur(`experiences[${index}].taskDesc`)}
                placeholder="Enter Task Description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {formik.touched.experiences?.[index]?.taskDesc &&
                formik.errors.experiences?.[index]?.taskDesc && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].taskDesc}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Start Date <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.startDate &&
                    formik.errors.experiences?.[index]?.startDate &&
                    styles.inputError,
                ]}
                onPress={() => openDatePicker("startDate", index)}
              >
                <Text style={{ color: item.startDate ? "#000" : "#999" }}>
                  {item.startDate || "Select Start Date"}
                </Text>
              </TouchableOpacity>
              {formik.touched.experiences?.[index]?.startDate &&
                formik.errors.experiences?.[index]?.startDate && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].startDate}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                End Date <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.endDate &&
                    formik.errors.experiences?.[index]?.endDate &&
                    styles.inputError,
                ]}
                onPress={() => openDatePicker("endDate", index)}
              >
                <Text style={{ color: item.endDate ? "#000" : "#999" }}>
                  {item.endDate || "Select End Date"}
                </Text>
              </TouchableOpacity>
              {formik.touched.experiences?.[index]?.endDate &&
                formik.errors.experiences?.[index]?.endDate && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].endDate}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Days Worked <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.daysWorked &&
                    formik.errors.experiences?.[index]?.daysWorked &&
                    styles.inputError,
                ]}
                value={item.daysWorked}
                onChangeText={(text) => {
                  formik.setFieldValue(
                    `experiences[${index}].daysWorked`,
                    text,
                  );
                  calculateTotalAmount(index, text, item.dailyWage);
                }}
                onBlur={formik.handleBlur(`experiences[${index}].daysWorked`)}
                keyboardType="numeric"
                placeholder="Enter Days Worked"
              />
              {formik.touched.experiences?.[index]?.daysWorked &&
                formik.errors.experiences?.[index]?.daysWorked && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].daysWorked}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Daily Wage <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  formik.touched.experiences?.[index]?.dailyWage &&
                    formik.errors.experiences?.[index]?.dailyWage &&
                    styles.inputError,
                ]}
                value={item.dailyWage}
                onChangeText={(text) => {
                  formik.setFieldValue(`experiences[${index}].dailyWage`, text);
                  calculateTotalAmount(index, item.daysWorked, text);
                }}
                onBlur={formik.handleBlur(`experiences[${index}].dailyWage`)}
                keyboardType="numeric"
                placeholder="Enter Daily Wage"
              />
              {formik.touched.experiences?.[index]?.dailyWage &&
                formik.errors.experiences?.[index]?.dailyWage && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].dailyWage}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Total Amount <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.readOnlyInput,
                  formik.touched.experiences?.[index]?.totalAmount &&
                    formik.errors.experiences?.[index]?.totalAmount &&
                    styles.inputError,
                ]}
                value={item.totalAmount}
                editable={false}
                placeholder="Total Amount"
              />
              {formik.touched.experiences?.[index]?.totalAmount &&
                formik.errors.experiences?.[index]?.totalAmount && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].totalAmount}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Payment Status <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.selectBox,
                  formik.touched.experiences?.[index]?.paymentStatus &&
                    formik.errors.experiences?.[index]?.paymentStatus &&
                    styles.inputError,
                ]}
              >
                <Picker
                  selectedValue={item.paymentStatus}
                  onValueChange={(itemValue) => {
                    formik.setFieldTouched(
                      `experiences[${index}].paymentStatus`,
                      true,
                    );
                    formik.setFieldValue(
                      `experiences[${index}].paymentStatus`,
                      itemValue,
                    );
                  }}
                >
                  <Picker.Item label="Select Payment Status" value="" />
                  <Picker.Item label="Paid" value="paid" />
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="Partial" value="partial" />
                </Picker>
              </View>
              {formik.touched.experiences?.[index]?.paymentStatus &&
                formik.errors.experiences?.[index]?.paymentStatus && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].paymentStatus}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Remarks <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  formik.touched.experiences?.[index]?.remarks &&
                    formik.errors.experiences?.[index]?.remarks &&
                    styles.inputError,
                ]}
                value={item.remarks}
                onChangeText={formik.handleChange(
                  `experiences[${index}].remarks`,
                )}
                onBlur={formik.handleBlur(`experiences[${index}].remarks`)}
                placeholder="Enter Remarks"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {formik.touched.experiences?.[index]?.remarks &&
                formik.errors.experiences?.[index]?.remarks && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].remarks}
                  </Text>
                )}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Rating <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.selectBox,
                  formik.touched.experiences?.[index]?.rating &&
                    formik.errors.experiences?.[index]?.rating &&
                    styles.inputError,
                ]}
              >
                <Picker
                  selectedValue={item.rating}
                  onValueChange={(itemValue) => {
                    formik.setFieldTouched(`experiences[${index}].rating`, true);
                    formik.setFieldValue(
                      `experiences[${index}].rating`,
                      itemValue,
                    );
                  }}
                >
                  <Picker.Item label="Select Rating" value="" />
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="3" value="3" />
                  <Picker.Item label="4" value="4" />
                  <Picker.Item label="5" value="5" />
                </Picker>
              </View>
              {formik.touched.experiences?.[index]?.rating &&
                formik.errors.experiences?.[index]?.rating && (
                  <Text style={styles.errorText}>
                    {formik.errors.experiences[index].rating}
                  </Text>
                )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMoreBtn} onPress={addExperience}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addMoreBtnText}>Add Experience</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            formik.isSubmitting && styles.disabledButton,
          ]}
          onPress={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {formik.isSubmitting ? "SAVING..." : "SAVE"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
    </FormikProvider>
  );
};



const Education = () => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const emptyEducation = {
    educationLevel: "",
    institutionName: "",
    passingYear: "",
    certificateFile: "",
  };

  const validationSchema = Yup.object().shape({
    workerEducationList: Yup.array()
      .of(
        Yup.object().shape({
          educationLevel: Yup.string().required("Required"),
          institutionName: Yup.string().required("Required"),
          passingYear: Yup.string().required("Required"),
          // certificateFile: Yup.string().required("Required"),
        }),
      )
      .min(1, "Required"),
  });

  const formik = useFormik({
    initialValues: {
      workerEducationList: [emptyEducation],
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    try {
      const payload = {
        userType: state.roleName,
        stageName: "EDUCATION",
        workerEducationList: values.workerEducationList.map((item) => ({
          educationLevel: item.educationLevel,
          institutionName: item.institutionName,
          passingYear: item.passingYear,
          uploadCertificate: item.certificateFile || "",
        })),
      };

      console.log("payload =>", payload);

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        const updatedPayload = {
          ...state,
          isProfileUpdated: "Y",
        };
        dispatch(login(updatedPayload));
        resetForm();
      }
    } catch (error) {
      console.log("Submit Error =>", error);
    } finally {
      setSubmitting(false);
    }
  }

  const getError = (index, field) =>
    formik.touched?.workerEducationList?.[index]?.[field] &&
    formik.errors?.workerEducationList?.[index]?.[field];

  return (
    <FormikProvider value={formik}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Education</Text>

          <FieldArray
            name="workerEducationList"
            render={(arrayHelpers) => (
              <>
                {formik.values.workerEducationList.map((item, index) => (
                  <View key={index} style={styles.educationCard}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.subTitle}>
                        Qualification {index + 1}
                      </Text>

                      {formik.values.workerEducationList.length > 1 && (
                        <TouchableOpacity
                          onPress={() => arrayHelpers.remove(index)}
                          style={styles.deleteButton}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={styles.label}>
                        Education Level{" "}
                        <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View
                        style={[
                          styles.selectBox,
                          getError(index, "educationLevel") && styles.inputError,
                        ]}
                      >
                        <Picker
                          selectedValue={item.educationLevel}
                          onValueChange={(itemValue) => {
                            formik.setFieldTouched(
                              `workerEducationList[${index}].educationLevel`,
                              true,
                            );
                            formik.setFieldValue(
                              `workerEducationList[${index}].educationLevel`,
                              itemValue,
                            );
                          }}
                        >
                          <Picker.Item
                            label="Select Education Level"
                            value=""
                          />
                          <Picker.Item label="8th" value="8th" />
                          <Picker.Item label="10th" value="10th" />
                          <Picker.Item label="12th" value="12th" />
                          <Picker.Item label="Graduation" value="graduation" />
                          <Picker.Item
                            label="Post Graduation"
                            value="post_graduation"
                          />
                          <Picker.Item label="Diploma" value="diploma" />
                        </Picker>
                      </View>
                      {getError(index, "educationLevel") ? (
                        <Text style={styles.errorText}>
                          {formik.errors.workerEducationList[index]
                            .educationLevel}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={styles.label}>
                        Institute / School / College{" "}
                        <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          getError(index, "institutionName") &&
                            styles.inputError,
                        ]}
                        value={item.institutionName}
                        onChangeText={formik.handleChange(
                          `workerEducationList[${index}].institutionName`,
                        )}
                        onBlur={formik.handleBlur(
                          `workerEducationList[${index}].institutionName`,
                        )}
                        placeholder="Enter Institute / School / College Name"
                      />
                      {getError(index, "institutionName") ? (
                        <Text style={styles.errorText}>
                          {formik.errors.workerEducationList[index]
                            .institutionName}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={styles.label}>
                        Passing Year{" "}
                        <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          getError(index, "passingYear") && styles.inputError,
                        ]}
                        value={item.passingYear}
                        onChangeText={formik.handleChange(
                          `workerEducationList[${index}].passingYear`,
                        )}
                        onBlur={formik.handleBlur(
                          `workerEducationList[${index}].passingYear`,
                        )}
                        placeholder="Enter Passing Year"
                        keyboardType="numeric"
                        maxLength={4}
                      />
                      {getError(index, "passingYear") ? (
                        <Text style={styles.errorText}>
                          {formik.errors.workerEducationList[index].passingYear}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={styles.label}>
                        Upload Certificate{" "}
                        <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.uploadButton,
                          getError(index, "certificateFile") &&
                            styles.inputError,
                        ]}
                        onPress={async () => {
                          formik.setFieldTouched(
                            `workerEducationList[${index}].certificateFile`,
                            true,
                          );

                          // replace with actual picker
                          Alert.alert(
                            "Upload Certificate",
                            `Upload certificate for row ${index + 1}`,
                          );

                          formik.setFieldValue(
                            `workerEducationList[${index}].certificateFile`,
                            "certificate-uploaded",
                          );
                        }}
                      >
                        <Text style={styles.uploadButtonText}>
                          Upload Certificate
                        </Text>
                      </TouchableOpacity>

                      {item.certificateFile ? (
                        <Text style={styles.fileNameText}>
                          Certificate selected
                        </Text>
                      ) : null}

                      {getError(index, "certificateFile") ? (
                        <Text style={styles.errorText}>
                          {
                            formik.errors.workerEducationList[index]
                              .certificateFile
                          }
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => arrayHelpers.push({ ...emptyEducation })}
                >
                  <Text style={styles.addButtonText}>+ Add Qualification</Text>
                </TouchableOpacity>
              </>
            )}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              formik.isSubmitting && styles.disabledButton,
            ]}
            onPress={formik.handleSubmit}
            disabled={formik.isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {formik.isSubmitting ? "SAVING..." : "SAVE"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </FormikProvider>
  );
};


// ==================== Change Password Component ====================
const ChangePassword = () => {
  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values) {
    console.log("Change Password Values:", values);
    // API call here
  }

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.currentPassword &&
                formik.touched.currentPassword &&
                styles.inputError,
            ]}
            value={formik.values.currentPassword}
            onChangeText={formik.handleChange("currentPassword")}
            onBlur={formik.handleBlur("currentPassword")}
            placeholder="Enter Current Password"
            secureTextEntry
          />
          {formik.errors.currentPassword && formik.touched.currentPassword && (
            <Text style={styles.errorText}>
              {formik.errors.currentPassword}
            </Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.newPassword &&
                formik.touched.newPassword &&
                styles.inputError,
            ]}
            value={formik.values.newPassword}
            onChangeText={formik.handleChange("newPassword")}
            onBlur={formik.handleBlur("newPassword")}
            placeholder="Enter New Password"
            secureTextEntry
          />
          {formik.errors.newPassword && formik.touched.newPassword && (
            <Text style={styles.errorText}>{formik.errors.newPassword}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.confirmPassword &&
                formik.touched.confirmPassword &&
                styles.inputError,
            ]}
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange("confirmPassword")}
            onBlur={formik.handleBlur("confirmPassword")}
            placeholder="Enter Confirm Password"
            secureTextEntry
          />
          {formik.errors.confirmPassword && formik.touched.confirmPassword && (
            <Text style={styles.errorText}>
              {formik.errors.confirmPassword}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={formik.handleSubmit}
        >
          <Text style={styles.submitButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
    </FormikProvider>
  );
};

// ==================== Help Component ====================
const Help = () => {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Help</Text>

      <View style={styles.helpBox}>
        <Text style={styles.helpText}>Email: support@example.com</Text>
        <Text style={styles.helpText}>Phone: +91 9876543210</Text>
        <Text style={styles.helpText}>
          For profile update issues, contact support team.
        </Text>
      </View>
    </View>
  );
};

// ==================== Main ProfileUpdate Component ====================
const ProfileUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const state = useSelector((state) => state.LoginReducer);
  const { isLoggedIn } = state;

  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace("Login");
    }
  }, [isLoggedIn, navigation]);

  const renderSelectedSection = () => {
    switch (selectedSection) {
      case "basic_details":
        return <BasicDetails />;
      case "identity_verification":
        return <IdentityVerification />;
      case "location_information":
        return <LocationInformation />;
      case "skill_details":
        return <SkillDetails />;
      case "work_experience":
        return <WorkExperience />;
      case "education":
        return <Education />;
      case "change_password":
        return <ChangePassword />;
      case "help":
        return <Help />;
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>My Profile</Text>

        <View style={styles.panel}>
          {!selectedSection ? (
            <View>
              {profileMenu.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => setSelectedSection(item.value)}
                  activeOpacity={0.8}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color="#1e3a5f"
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedSection(null)}
              >
                <Ionicons name="arrow-back" size={20} color="#0d6efd" />
                <Text style={styles.backButtonText}>Back to Profile Menu</Text>
              </TouchableOpacity>

              {renderSelectedSection()}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileUpdate;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f6fa",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#e9ecef",
    paddingVertical: 14,
    color: "#222",
  },
  panel: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 1,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    flexShrink: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  backButtonText: {
    fontSize: 15,
    color: "#0d6efd",
    fontWeight: "600",
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  inputBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  requiredStar: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 6,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: "#198754",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    minHeight: 45,
    justifyContent: "center",
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  radioColumn: {
    marginTop: 5,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  radioText: {
    marginLeft: 6,
    fontSize: 15,
    color: "#333",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3856b5",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f0f4ff",
  },
  photoButtonText: {
    marginLeft: 8,
    color: "#3856b5",
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  fileNameText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: "#333",
  },
  removeFileButton: {
    padding: 4,
  },
  locationButton: {
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  helpBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
  },
  helpText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  readOnlyInput: {
    backgroundColor: "#f5f5f5",
  },
  experienceCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 4,
  },
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addMoreBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  skillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },

  skillText: {
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#e6f0ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#1e3a5f",
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "#ffe5e5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#c53030",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#1e3a5f",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
