import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
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
import { useDispatch } from "react-redux";
import ImageBucketRN from "../utils/ImageBucketRN";
import { dists28 } from "../utils/CommonFunctions";

const GeoTagging = () => {
  const dispatch = useDispatch();

  const SubmitDetails = async (values) => {
    const response = await commonAPICall(
      GEOTAGGINGPOST,
      values,
      "post",
      dispatch,
    );

    console.log("responseresponse", response);

    if (response.status === 200) {
      formik.resetForm();
    }
  };

  // ✅ Validation
  const validationSchema = Yup.object().shape({
    districtId: Yup.string().required("District is required"),
    categoryId: Yup.string().required("Category is required"),
    frontImage: Yup.string().required("Front image required"),
    backImage: Yup.string().required("Back image required"),
    sideImage: Yup.string().required("Side image required"),
  });

  const getGeoTaggingDetails = async () => {
    const response = await commonAPICall(GEOTAGGINGGET, {}, "get", dispatch);

    if (response.status === 200) {
      const data = response?.data.Geo_Tagging_Details?.[0];
      if (data) {
        formik.setValues({
          districtId: data?.district_id?.toString() || "",
          categoryId: data?.category_id?.toString() || "",

          frontImage: data?.front_image,
          frontImageLocation: data?.front_image_location || "",

          backImage: data?.back_image,
          backImageLocation: data?.back_image_location || "",

          sideImage: data?.side_image,
          sideImageLocation: data?.side_image_location || "",
        });
      }
    }
  };

  useEffect(() => {
    getGeoTaggingDetails();
  }, []);

  const formik = useFormik({
    initialValues: {
      districtId: "",
      categoryId: "",

      frontImage: "",
      frontImageLocation: "",
      backImage: "",
      backImageLocation: "",
      sideImage: "",
      sideImageLocation: "",
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
          >
            <Picker.Item label="Select Category" value="" />

            <Picker.Item label="Bus Shelters & Hoardings" value="1" />
            <Picker.Item
              label="Hospital TV Screens & Anna Canteens"
              value="2"
            />
            <Picker.Item
              label="CCTV Screens at APSRTC Bus Stations"
              value="3"
            />
            <Picker.Item
              label="Auto Backs & Digital Wall Paintings"
              value="4"
            />
            <Picker.Item label="Pillar Boards" value="5" />
          </Picker>
        </View>
        {formik.touched.categoryId && formik.errors.categoryId && (
          <Text style={styles.error}>{formik.errors.categoryId}</Text>
        )}

        {/* IMAGE BLOCK */}
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

        {/* SUBMIT */}
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
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
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
