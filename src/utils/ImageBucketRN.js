import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert,Image } from "react-native";
import axios from "axios";

// ✅ CONSTANTS (same as web)
export const IMG_UPLOAD_URL =
  "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-upload/";
export const IMG_DOWNLOAD_URL =
  "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-download/";

const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/javascript",
  "video/mp4",
  "application/json",
  "application/vnd.google-earth.kml+xml",
  "image/svg+xml",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "",
];

const MAX_FILE_SIZE = 20971520;

// ✅ COMMON AXIOS POST (same like web)
const CommonAxiosPost = async (url, values) => {
  try {
    let res = await axios({
      url: url,
      method: "post",
      data: values,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status === 200) {
      return res;
    }
  } catch (err) {
    Alert.alert("Error", "Upload failed");
  }
};

// ✅ VALIDATION (aligned with web)
function validateFileTypeAndSize(file, size) {
  const maxSizeMB = size / (1024 * 1024);

  const fileSize = file.size || file.fileSize || 0;
  const fileType = file.mimeType || file.type || "";

  if (fileSize > size) {
    Alert.alert(
      "Error",
      `Please check your file size, it should be less than ${maxSizeMB}MB`
    );
    return false;
  }

  // geojson exception
  if (
    !SUPPORTED_FORMATS.includes(fileType) &&
    file.name?.split(".").pop()?.toLowerCase() !== "geojson"
  ) {
    Alert.alert(
      "Error",
      `Invalid file format. Your file type is ${
        file.name?.split(".").pop()?.toLowerCase()
      }`
    );
    return false;
  }

  return true;
}

const getFileNameWithExtension = (file) => {
  let name = file.name || `file_${Date.now()}`;

  // If already has extension → return
  if (name.includes(".")) return name;

  // derive extension from mimeType
  const mime = file.mimeType || file.type || "";

  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "application/json": ".json",
  };

  const ext = map[mime] || "";

  return name + ext;
};

// ✅ COMMON UPLOAD FUNCTION (matches web ImageBucket)
async function uploadFile(file, formik, path, name, size) {
  if (!validateFileTypeAndSize(file, size)) return;

  console.log("ffff",file);
  

  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.fileName || file.name,
      type: file.mimeType || file.type || "application/octet-stream",
    });

    const response = await CommonAxiosPost(
      IMG_UPLOAD_URL + path,
      formData
    );

    if (response?.status === 200) {

        console.log("rrrrrr", response.data);
        
      const uploadedPath = IMG_DOWNLOAD_URL + response?.data;

      // ✅ EXACTLY SAME AS WEB (string only)
      formik.setFieldValue(name, uploadedPath);

      Alert.alert("Success", "File Uploaded Successfully");
    }
  } catch (error) {
    formik.setFieldValue(name, null);
    Alert.alert(
      "Error",
      "Unfortunately, we encountered an error while uploading"
    );
  }
}

// ✅ DOCUMENT PICKER
async function pickDocument(formik, path, name, size) {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (result.canceled) return;

  const file = result.assets[0];

  await uploadFile(file, formik, path, name, size);
}

// ✅ CAMERA
async function openCamera(formik, path, name, size) {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Camera access is needed");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 0.7,
  });

  if (result.canceled) return;

  const file = result.assets[0];

  await uploadFile(file, formik, path, name, size);
}

// ✅ GALLERY
async function openGallery(formik, path, name, size) {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Gallery access is needed");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 0.7,
  });

  if (result.canceled) return;

  const file = result.assets[0];

  await uploadFile(file, formik, path, name, size);
}

// ✅ MAIN FUNCTION (same flexibility as before)
export default async function ImageBucketRN(
  formik,
  path,
  name,
  size = MAX_FILE_SIZE,
  mode = "all"
) {
  try {
    if (mode === "document") {
      return pickDocument(formik, path, name, size);
    }

    if (mode === "camera") {
      return openCamera(formik, path, name, size);
    }

    if (mode === "gallery") {
      return openGallery(formik, path, name, size);
    }

    // ✅ ALL OPTIONS
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