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

import { commonAPICall, GETDISTSAPP } from "../utils/utils";
import { useDispatch } from "react-redux";
import ImageBucketRN from "../utils/ImageBucketRN";
import { dists28 } from "../utils/CommonFunctions";

const GeoTagging = () => {
  const dispatch = useDispatch();

  // ✅ Yup Validation
  const validationSchema = Yup.object().shape({
    dist: Yup.string().required("District is required"),
    category: Yup.string().required("Category is required"),
    frontImage: Yup.string().required("Front image required"),
    backImage: Yup.string().required("Back image required"),
    sideImage: Yup.string().required("Side image required"),
  });

  const formik = useFormik({
    initialValues: {
      dist: "",
      category: "",

      frontImage: "",
      frontImage_location: null,

      backImage: "",
      backImage_location: null,

      sideImage: "",
      sideImage_location: null,
    },
    validationSchema,

    onSubmit: (values) => {
      console.log("FINAL PAYLOAD:", values);

      Alert.alert("Success", "Geo Tagging submitted successfully");

      // 👉 API CALL (optional)
      // commonAPICall(SAVE_API, payload, "post", dispatch);
    },
  });


  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {" "}
      <FormikProvider value={formik}>
        <Text style={styles.title}>GEO TAGGING</Text>

        {/* DISTRICT */}
        <Text style={styles.label}>District / జిల్లా</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.dist}
            onValueChange={(value) => formik.setFieldValue("dist", value)}
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
        {formik.touched.dist && formik.errors.dist && (
          <Text style={styles.error}>{formik.errors.dist}</Text>
        )}

        {/* CATEGORY */}
        <Text style={styles.label}>Category / వర్గం</Text>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.category}
            onValueChange={(value) => formik.setFieldValue("category", value)}
          >
            <Picker.Item label="Select Category" value="" />

            <Picker.Item
              label="Bus Shelters & Hoardings"
              value="1"
            />

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
        {formik.touched.category && formik.errors.category && (
          <Text style={styles.error}>{formik.errors.category}</Text>
        )}

        {/* IMAGE BLOCK FUNCTION */}
        {["frontImage", "backImage", "sideImage"].map((name, index) => {
          const label = name.replace("Image", "");

          return (
            <View key={name}>
              <Text style={styles.label}>{label} Image</Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => {
                  formik.setFieldTouched(name, true);
                  ImageBucketRN(formik, "APFD/SAWMILLS/", name, 20971520,"camera",dispatch);
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

                  {formik.values[`${name}_location`] && (
                    <View style={styles.locationBox}>
                      <Text style={{ fontWeight: "bold" }}>📍 Location</Text>

                      <Text style={{ fontSize: 13, color: "#333" }}>
                        {formik.values[`${name}_location`]}
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
