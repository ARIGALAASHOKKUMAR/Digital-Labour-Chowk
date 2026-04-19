import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import axios from "axios";

// same constants
export const IMG_UPLOAD_URL = process.env.REACT_APP_IMG_UPLOAD_URL;
export const IMG_DOWNLOAD_URL = process.env.REACT_APP_IMG_DOWNLOAD_URL;

export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/json",
  "video/mp4",
];


function validateFileTypeAndSize(file, size) {
  const maxSizeMB = size / (1024 * 1024);

  if (file.size > size) {
    Alert.alert(
      "Error",
      `File should be less than ${maxSizeMB} MB`
    );
    return false;
  }

  if (!SUPPORTED_FORMATS.includes(file.mimeType)) {
    Alert.alert(
      "Error",
      `Invalid file format: ${file.name}`
    );
    return false;
  }

  return true;
}

export default async function ImageBucketRN(
  formik,
  path,
  name,
  size = 20971520 // default 20MB
) {
  try {
    // pick document
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = result.assets[0];

    // ✅ Validate file
    if (!validateFileTypeAndSize(file, size)) return;

    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    });

    // loader (optional)
    console.log("Uploading file...");

    const res = await axios.post(IMG_UPLOAD_URL + path, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status === 200) {
      const uploadedPath = IMG_DOWNLOAD_URL + res.data;

      // ✅ set value in formik
      formik.setFieldValue(name, uploadedPath);

      Alert.alert("Success", "File Uploaded Successfully");
    }
  } catch (error) {
    formik.setFieldValue(name, null);
    Alert.alert("Error", "File upload failed");
  }
}