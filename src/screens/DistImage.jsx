import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";

import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Picker } from "@react-native-picker/picker";

import {
  commonAPICall,
  GEOTAGGINGGET,
  GEOTAGGINGPOST,
  GETDISTSAPP,
} from "../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import ImageBucketRN from "../utils/ImageBucketRN";
import { dists28 } from "../utils/CommonFunctions";

const GeoTagging = () => {
  const dispatch = useDispatch();
  const roleId = useSelector((state) => state.LoginReducer.roleId); 
  
  
  const [existingData, setExistingData] = useState(null);
  
  const SubmitDetails = async (values) => {
    // Prepare payload with ground truthing images
    const payload = {
      districtId: values.districtId,
      categoryId: values.categoryId,
      // Ground truthing images (new ones for roleId 11)
      groundTruthFrontImage: values.groundTruthFrontImage || "",
      groundTruthFrontLocation: values.groundTruthFrontLocation || "",
      groundTruthBackImage: values.groundTruthBackImage || "",
      groundTruthBackLocation: values.groundTruthBackLocation || "",
      groundTruthSideImage: values.groundTruthSideImage || "",
      groundTruthSideLocation: values.groundTruthSideLocation || "",
      remarks: values.remarks,
      // For roleId 4, these will be the main images
      frontImage: values.frontImage || "",
      frontImageLocation: values.frontImageLocation || "",
      backImage: values.backImage || "",
      backImageLocation: values.backImageLocation || "",
      sideImage: values.sideImage || "",
      sideImageLocation: values.sideImageLocation || "",
    };

    const response = await commonAPICall(
      GEOTAGGINGPOST,
      payload,
      "post",
      dispatch,
    );

    console.log("responseresponse", response);

    if (response.status === 201) {
      formik.resetForm();
      if (roleId === 4) {
        // Refresh existing data to show updated ground truth images
        getGeoTaggingDetails();
      }
    }
  };

  // Validation based on role
  const validationSchema = Yup.object().shape({
    districtId: Yup.string().required("District is required"),
    categoryId: Yup.string().required("Category is required"),
    ...(roleId === 11 && {
      frontImage: Yup.string().required("Front image required"),
      backImage: Yup.string().required("Back image required"),
      sideImage: Yup.string().required("Side image required"),
    }),
    ...(roleId === 4 && {
      groundTruthFrontImage: Yup.string().required("Ground truth front image required"),
      groundTruthBackImage: Yup.string().required("Ground truth back image required"),
      groundTruthSideImage: Yup.string().required("Ground truth side image required"),
    })
  });

  const getGeoTaggingDetails = async () => {
    const response = await commonAPICall(GEOTAGGINGGET, {}, "get", dispatch);

    if (response.status === 200) {
      const data = response?.data.Geo_Tagging_Details?.[0];
      if (data) {
        setExistingData(data);
        // For roleId 11, populate the existing data to display
        if (roleId === 4) {
          formik.setValues({
            districtId: data?.district_id?.toString() || "",
            categoryId: data?.category_id?.toString() || "",
            // Existing images (read-only)
            existingFrontImage: data?.front_image || "",
            existingFrontLocation: data?.front_image_location || "",
            existingBackImage: data?.back_image || "",
            existingBackLocation: data?.back_image_location || "",
            existingSideImage: data?.side_image || "",
            existingSideLocation: data?.side_image_location || "",
            // Ground truth images (to be filled)
            groundTruthFrontImage: "",
            groundTruthFrontLocation: "",
            groundTruthBackImage: "",
            groundTruthBackLocation: "",
            groundTruthSideImage: "",
            groundTruthSideLocation: "",
            remarks: ""
          });
        }
      }
    }
  };

  useEffect(() => {
    if (roleId === 11) {
      getGeoTaggingDetails();
      formik.resetForm();
    }
    if (roleId === 4) {
      getGeoTaggingDetails();
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      districtId: "",
      categoryId: "",
      // For roleId 4
      frontImage: "",
      frontImageLocation: "",
      backImage: "",
      backImageLocation: "",
      sideImage: "",
      sideImageLocation: "",
      // For roleId 11 (existing data display)
      existingFrontImage: "",
      existingFrontLocation: "",
      existingBackImage: "",
      existingBackLocation: "",
      existingSideImage: "",
      existingSideLocation: "",
      // For roleId 11 (ground truth images)
      groundTruthFrontImage: "",
      groundTruthFrontLocation: "",
      groundTruthBackImage: "",
      groundTruthBackLocation: "",
      groundTruthSideImage: "",
      groundTruthSideLocation: "",
      remarks: ""
    },
    validationSchema,
    onSubmit: SubmitDetails,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <FormikProvider value={formik}>
        <Text style={styles.title}>GEO TAGGING</Text>

        {/* DISTRICT */}
        <Text style={styles.label}>District / జిల్లా</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.districtId}
            onValueChange={(value) => formik.setFieldValue("districtId", value)}
            enabled={roleId !== 4 || !existingData} // Disable for roleId 11 if data exists
          >
            <Picker.Item label="Select District" value="" />
            {dists28.map((dist) => (
              <Picker.Item
                key={String(dist.dist_code)}
                label={dist.dist_name}
                value={String(dist.dist_code)}
              />
            ))}
          </Picker>
        </View>
        {formik.touched.districtId && formik.errors.districtId && (
          <Text style={styles.error}>{formik.errors.districtId}</Text>
        )}

        {/* CATEGORY */}
        <Text style={styles.label}>Category / వర్గం</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.categoryId}
            onValueChange={(value) => formik.setFieldValue("categoryId", value)}
            enabled={roleId !== 4 || !existingData} // Disable for roleId 11 if data exists
          >
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Bus Shelters & Hoardings" value="1" />
            <Picker.Item label="Hospital TV Screens & Anna Canteens" value="2" />
            <Picker.Item label="CCTV Screens at APSRTC Bus Stations" value="3" />
            <Picker.Item label="Auto Backs & Digital Wall Paintings" value="4" />
            <Picker.Item label="Pillar Boards" value="5" />
          </Picker>
        </View>
        {formik.touched.categoryId && formik.errors.categoryId && (
          <Text style={styles.error}>{formik.errors.categoryId}</Text>
        )}

        {/* FOR ROLE ID 4 - Normal Image Upload */}
        {roleId === 11 && (
          <>
            {["frontImage", "backImage", "sideImage"].map((name) => {
              const label = name.replace("Image", "");
              return (
                <View key={name}>
                  <Text style={styles.label}>{label} Image</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => {
                      formik.setFieldTouched(name, true);
                      ImageBucketRN(
                        formik,
                        "APFD/SAWMILLS/",
                        name,
                        20971520,
                        "camera",
                        dispatch,
                      );
                    }}
                  >
                    <Text style={styles.uploadButtonText}>Capture {label}</Text>
                  </TouchableOpacity>
                  {formik.touched[name] && formik.errors[name] && (
                    <Text style={styles.error}>{formik.errors[name]}</Text>
                  )}
                  {formik.values[name] && (
                    <View style={styles.rowContainer}>
                      <Image
                        source={{ uri: formik.values[name] }}
                        style={styles.previewImage}
                      />
                      {formik.values[`${name}Location`] && (
                        <View style={styles.locationBox}>
                          <Text style={{ fontWeight: "bold" }}>📍 Location</Text>
                          <Text style={{ fontSize: 13, color: "#333" }}>
                            {formik.values[`${name}Location`]}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* FOR ROLE ID 11 - Show Existing Images (Read-only) + Ground Truth Upload */}
        {roleId === 4 && (
          <>
            {/* Read-only Existing Images Section */}
            {existingData && (
              <>
                <View style={styles.readOnlySection}>
                  <Text style={styles.sectionTitle}>📋 Existing Images (Read Only)</Text>
                  
                  {/* Existing Front Image */}
                  <Text style={styles.label}>Existing Front Image</Text>
                  {formik.values.existingFrontImage ? (
                    <View style={styles.rowContainer}>
                      <Image
                        source={{ uri: formik.values.existingFrontImage }}
                        style={styles.previewImage}
                      />
                      {formik.values.existingFrontLocation && (
                        <View style={styles.locationBox}>
                          <Text style={{ fontWeight: "bold" }}>📍 Location</Text>
                          <Text style={{ fontSize: 13, color: "#333" }}>
                            {formik.values.existingFrontLocation}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>No front image available</Text>
                  )}

                  {/* Existing Back Image */}
                  <Text style={styles.label}>Existing Back Image</Text>
                  {formik.values.existingBackImage ? (
                    <View style={styles.rowContainer}>
                      <Image
                        source={{ uri: formik.values.existingBackImage }}
                        style={styles.previewImage}
                      />
                      {formik.values.existingBackLocation && (
                        <View style={styles.locationBox}>
                          <Text style={{ fontWeight: "bold" }}>📍 Location</Text>
                          <Text style={{ fontSize: 13, color: "#333" }}>
                            {formik.values.existingBackLocation}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>No back image available</Text>
                  )}

                  {/* Existing Side Image */}
                  <Text style={styles.label}>Existing Side Image</Text>
                  {formik.values.existingSideImage ? (
                    <View style={styles.rowContainer}>
                      <Image
                        source={{ uri: formik.values.existingSideImage }}
                        style={styles.previewImage}
                      />
                      {formik.values.existingSideLocation && (
                        <View style={styles.locationBox}>
                          <Text style={{ fontWeight: "bold" }}>📍 Location</Text>
                          <Text style={{ fontSize: 13, color: "#333" }}>
                            {formik.values.existingSideLocation}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>No side image available</Text>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Ground Truth Images Upload Section */}
                <View style={styles.groundTruthSection}>
                  <Text style={styles.sectionTitle}>✅ Ground Truth Images (Upload New)</Text>
                  
                  {["groundTruthFrontImage", "groundTruthBackImage", "groundTruthSideImage"].map((name) => {
                    const label = name.replace("groundTruth", "").replace("Image", "");
                    return (
                      <View key={name}>
                        <Text style={styles.label}>Ground Truth {label} Image</Text>
                        <TouchableOpacity
                          style={styles.uploadButton}
                          onPress={() => {
                            formik.setFieldTouched(name, true);
                            ImageBucketRN(
                              formik,
                              "APFD/SAWMILLS/GROUNDTRUTH/",
                              name,
                              20971520,
                              "camera",
                              dispatch,
                            );
                          }}
                        >
                          <Text style={styles.uploadButtonText}>Capture Ground Truth {label}</Text>
                        </TouchableOpacity>
                        {formik.touched[name] && formik.errors[name] && (
                          <Text style={styles.error}>{formik.errors[name]}</Text>
                        )}
                        {formik.values[name] && (
                          <View style={styles.rowContainer}>
                            <Image
                              source={{ uri: formik.values[name] }}
                              style={styles.previewImage}
                            />
                            {formik.values[`${name.replace("Image", "Location")}`] && (
                              <View style={styles.locationBox}>
                                <Text style={{ fontWeight: "bold" }}>📍 Location</Text>
                                <Text style={{ fontSize: 13, color: "#333" }}>
                                  {formik.values[`${name.replace("Image", "Location")}`]}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* If no existing data, show message */}
            {!existingData && (
              <Text style={styles.noDataMessage}>No existing data found. Please contact administrator.</Text>
            )}
          </>
        )}

        {/* REMARKS - For both roles */}
        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 6,
            padding: 10,
            marginTop: 8,
          }}
          placeholder="Enter any remarks here..."
          value={formik.values.remarks}
          onChangeText={(text) => formik.setFieldValue("remarks", text)}
        />
        {formik.touched.remarks && formik.errors.remarks && (
          <Text style={styles.error}>{formik.errors.remarks}</Text>
        )}

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              opacity: formik.isValid ? 1 : 0.6,
            },
          ]}
          onPress={formik.handleSubmit}
          disabled={!formik.isValid}
        >
          <Text style={styles.submitText}>
            {roleId === 4 ? "Submit Ground Truth Images" : "Submit"}
          </Text>
        </TouchableOpacity>

        {roleId === 4 && existingData && (
          <Text style={styles.infoText}>
            ℹ️ Please capture 3 new ground truth images for verification
          </Text>
        )}
      </FormikProvider>
    </ScrollView>
  );
};

export default GeoTagging;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120, // 👈 important
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#2e7d32",
  },

  label: {
    marginTop: 12,
    marginBottom: 5,
    fontWeight: "600",
  },

  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },

  uploadButton: {
    backgroundColor: "#0288d1",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 5,
  },

  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  rowContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },

  locationBox: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },

  latLng: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },

  submitButton: {
    marginTop: 20,
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  },
});
