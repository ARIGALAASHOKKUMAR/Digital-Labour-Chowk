import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
} from "react-native";

import { useFormik } from "formik";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons";

import { commonAPICall, GETDISTSAPP } from "../utils/utils";
import { useDispatch } from "react-redux";
import ImageBucketRN from "../utils/ImageBucketRN";

// ⚠️ make sure this exists in your project
// import ImageBucketRN from "../utils/ImageBucketRN";

const DistImage = () => {
  const [dists, setDists] = useState([]);

  const formik = useFormik({
    initialValues: {
      dist: "",
      image: "",
      uploadDocument: "",
      image_location: null,
    },
  });

  const dispatch = useDispatch();

  const getdists = async () => {
    try {
      const response = await commonAPICall(GETDISTSAPP, {}, "get", dispatch);
      if (response?.status === 200) {
        setDists(response?.data?.District_List || []);
      } else {
        setDists([]);
      }
    } catch (error) {
      console.log("Error fetching districts:", error);
      setDists([]);
    }
  };

  useEffect(() => {
    getdists();
  }, []);

  return (
    <View style={styles.container}>
      {/* DISTRICT */}
      <View style={styles.halfWidth}>
        <Text style={styles.fieldLabel}>District / జిల్లా</Text>

        <View style={styles.selectBox}>
          <Picker
            selectedValue={formik.values.dist}
            onValueChange={(value) => {
              formik.setFieldValue("dist", value);
            }}
          >
            <Picker.Item
              label="Select District / జిల్లాను ఎంచుకోండి"
              value=""
            />

            {dists.map((dist) => (
              <Picker.Item
                key={String(dist.dist_code)}
                label={dist.dist_name}
                value={String(dist.dist_code)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* UPLOAD */}
      <View style={styles.inputBlock}>
        <Text style={styles.label}>
          Upload Document / ఫోటో అప్లోడ్ చేయండి{" "}
          <Text style={styles.requiredStar}>*</Text>
        </Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => {
            formik.setFieldTouched("uploadDocument", true);

            let path = "APFD/SAWMILLS/";

            ImageBucketRN(formik, path, "uploadDocument", 20971520);
          }}
        >
          <Text style={styles.uploadButtonText}>
            Upload Image / ఫోటో అప్లోడ్ చేయండి
          </Text>
        </TouchableOpacity>

        {/* PREVIEW */}
        <View style={{ alignItems: "center" }}>
          {formik.values.uploadDocument ? (
            /\.(jpg|jpeg|png)$/i.test(formik.values.uploadDocument) ? (
              <Image
                source={{ uri: formik.values.uploadDocument }}
                style={styles.previewImage}
              />
            ) : /\.pdf$/i.test(formik.values.uploadDocument) ? (
              <TouchableOpacity
                style={styles.pdfRow}
                onPress={() =>
                  Linking.openURL(formik.values.uploadDocument)
                }
              >
                <Ionicons name="document-text-outline" size={24} color="red" />
                <Text style={styles.pdfText}>Download PDF</Text>
              </TouchableOpacity>
            ) : (
              <Text>{formik.values.uploadDocument}</Text>
            )
          ) : null}
        </View>

        {/* LOCATION */}
        {formik.values.image_location && (
          <View style={styles.locationBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              📍 Location Details
            </Text>

            <Text style={{ fontSize: 13 }}>
              {formik.values.image_location.street}
              {"\n"}
              {formik.values.image_location.city}
              {"\n"}
              {formik.values.image_location.state} -{" "}
              {formik.values.image_location.pincode}
            </Text>

            <Text style={styles.latLng}>
              Lat: {formik.values.image_location.lat} | Lng:{" "}
              {formik.values.image_location.lng}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DistImage;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },

  halfWidth: {
    marginBottom: 15,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },

  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
  },

  inputBlock: {
    marginTop: 15,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
  },

  requiredStar: {
    color: "red",
  },

  uploadButton: {
    backgroundColor: "#2e7d32",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },

  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginTop: 10,
  },

  pdfRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  pdfText: {
    marginLeft: 8,
    color: "blue",
  },

  locationBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },

  latLng: {
    fontSize: 11,
    color: "gray",
    marginTop: 5,
  },
});