import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import axios from "axios";


export const IMG_UPLOAD_URL = "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-upload/";
export const IMG_DOWNLOAD_URL = "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-download/";

export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/json",
  "video/mp4",
];

// ✅ validation
function validateFileTypeAndSize(file, size) {
  const maxSizeMB = size / (1024 * 1024);

  if (file.size && file.size > size) {
    Alert.alert("Error", `File should be less than ${maxSizeMB} MB`);
    return false;
  }

  if (file.mimeType && !SUPPORTED_FORMATS.includes(file.mimeType)) {
    Alert.alert("Error", `Invalid file format: ${file.name}`);
    return false;
  }

  return true;
}

// ✅ common upload API
async function uploadToServer(file, formik, path, name) {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.name || `file_${Date.now()}`,
      type: file.mimeType || "application/octet-stream",
    });

    console.log("Uploading file...");

    const res = await axios.post(IMG_UPLOAD_URL + path, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status === 200) {
      const uploadedPath = IMG_DOWNLOAD_URL + res.data;

      // ✅ store string in formik
      formik.setFieldValue(name, uploadedPath);

      Alert.alert("Success", "File Uploaded Successfully");
    }
  } catch (error) {
    formik.setFieldValue(name, null);
    Alert.alert("Error", "File upload failed");
  }
}

// ✅ pick document (PDF, etc.)
async function pickDocument(formik, path, name, size) {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (result.canceled) return;

  const file = result.assets[0];

  if (!validateFileTypeAndSize(file, size)) return;

  await uploadToServer(file, formik, path, name);
}

// ✅ camera
async function openCamera(formik, path, name, size) {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Camera access is needed");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (result.canceled) return;

  const file = result.assets[0];

  if (!validateFileTypeAndSize(file, size)) return;

  await uploadToServer(file, formik, path, name);
}

// ✅ gallery
async function openGallery(formik, path, name, size) {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Gallery access is needed");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (result.canceled) return;

  const file = result.assets[0];

  if (!validateFileTypeAndSize(file, size)) return;

  await uploadToServer(file, formik, path, name);
}

// ✅ MAIN COMMON FUNCTION
export default async function ImageBucketRN(
  formik,
  path,
  name,
  size = 20971520,
  mode = "all" // 👈 important
) {
  try {
    // 👉 CASE 1: only document
    if (mode === "document") {
      return pickDocument(formik, path, name, size);
    }

    // 👉 CASE 2: only camera
    if (mode === "camera") {
      return openCamera(formik, path, name, size);
    }

    // 👉 CASE 3: only gallery
    if (mode === "gallery") {
      return openGallery(formik, path, name, size);
    }

    // 👉 CASE 4: ALL OPTIONS (default)
    Alert.alert("Upload", "Choose option", [
      {
        text: "Camera",
        onPress: () => openCamera(formik, path, name, size),
      },
      {
        text: "Gallery",
        onPress: () => openGallery(formik, path, name, size),
      },
      {
        text: "Files",
        onPress: () => pickDocument(formik, path, name, size),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  } catch (error) {
    Alert.alert("Error", "Something went wrong");
  }
}