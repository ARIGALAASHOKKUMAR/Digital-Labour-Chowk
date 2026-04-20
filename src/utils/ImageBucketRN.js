import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import { hideLoader, showLoader } from "../actions";

// ✅ IMPORT YOUR LOADER ACTIONS

// ✅ CONSTANTS
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

// ✅ COMMON AXIOS POST
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

// ✅ VALIDATION
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

  if (
    !SUPPORTED_FORMATS.includes(fileType) &&
    file.name?.split(".").pop()?.toLowerCase() !== "geojson"
  ) {
    Alert.alert(
      "Error",
      `Invalid file format. Your file type is ${file.name
        ?.split(".")
        .pop()
        ?.toLowerCase()}`
    );
    return false;
  }

  return true;
}

// ✅ UPLOAD
async function uploadFile(file, formik, path, name, size) {
  if (!validateFileTypeAndSize(file, size)) return;

  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.fileName || file.name,
      type: file.mimeType || file.type || "application/octet-stream",
    });

    const response = await CommonAxiosPost(IMG_UPLOAD_URL + path, formData);

    if (response?.status === 200) {
      const uploadedPath = IMG_DOWNLOAD_URL + response?.data;

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

// ✅ CAMERA WITH REDUX LOADER
async function openCamera(formik, path, name, size, dispatch) {
  try {
    // ✅ OPEN CAMERA FIRST (NO DELAY)
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

    // ✅ SHOW LOADER AFTER CAPTURE (better UX)
    dispatch(showLoader("Fetching location..."));

    let addressText = null;

    try {
      const locPermission = await Location.requestForegroundPermissionsAsync();

      if (locPermission.granted) {
        const loc = await Location.getCurrentPositionAsync({});

        const address = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (address.length > 0) {
          const place = address[0];

          addressText = [
            place.formattedAddress,
            `Lat:${loc.coords.latitude}`,
            `Lng:${loc.coords.longitude}`,
          ]
            .filter(Boolean)
            .join(" - ");
        }
      }
    } catch (e) {
      console.log("Location error", e);
    }

    dispatch(hideLoader());

    if (addressText) {
      formik.setFieldValue(`${name}_location`, addressText);
    }

    await uploadFile(file, formik, path, name, size);
  } catch (err) {
    dispatch(hideLoader());
    Alert.alert("Error", "Something went wrong");
  }
}

// ✅ GALLERY
async function openGallery(formik, path, name, size) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

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

// ✅ DOCUMENT
async function pickDocument(formik, path, name, size) {
  const result = await DocumentPicker.getDocumentAsync({});

  if (result.canceled) return;

  const file = result.assets[0];

  await uploadFile(file, formik, path, name, size);
}

// ✅ MAIN FUNCTION
export default async function ImageBucketRN(
  formik,
  path,
  name,
  size = MAX_FILE_SIZE,
  mode = "all",
  dispatch
) {
  try {
    if (mode === "document") {
      return pickDocument(formik, path, name, size);
    }

    if (mode === "camera") {
      return openCamera(formik, path, name, size, dispatch);
    }

    if (mode === "gallery") {
      return openGallery(formik, path, name, size);
    }

    Alert.alert("Upload", "Choose option", [
      {
        text: "Camera",
        onPress: () =>
          openCamera(formik, path, name, size, dispatch),
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
    dispatch(hideLoader());
    Alert.alert("Error", "Something went wrong");
  }
}