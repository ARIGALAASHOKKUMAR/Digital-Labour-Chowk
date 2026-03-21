import axios from "axios";
import { Alert } from "react-native";
import { store } from "../reducers/allReducers";
import { useDispatch } from "react-redux";
import { hideLoader, hideMessage, showLoader, showMessage } from "../actions";
import { Toast } from "react-native-sprinkle-toast";

export const base_url = "https://swapi.dev.nidhi.apcfss.in/labour";
export const IMG_UPLOAD_URL =
  "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-upload/";
export const IMG_DOWNLOAD_URL =
  "https://swapi.dev.nidhi.apcfss.in/socialwelfaredms/user-defined-path/file-download/";

const state = store.getState();
const accessToken = state.LoginReducer.token;

export const myAxios = axios.create({
  baseURL: base_url,
  headers: {
    // Authorization: accessToken ? `Bearer ${accessToken}` : "",
  },
});

export const myAxiosLogin = axios.create({
  baseURL: base_url,
  headers: {},
});

myAxios.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.LoginReducer.token;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const getCurrentTimestamp = () => {
  const now = new Date();

  // This MAY or MAY NOT respect the timezone in React Native
  // It depends on the JavaScript engine (Hermes, JSC, V8)
  const date = now.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
  const time = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });

  return `${date} ${time}`;
};

const ToastFunc = (msg, type) => {
  const toastType =
    type.toUpperCase() === "FAILURE" ? "error" : type.toLowerCase();

  Toast.show({
    message: msg,
    type: toastType, // 'success', 'error', 'info', 'warning', or 'simple'
  });
};

export const commonAPICall = async (url, values, get_post, dispatch) => {
  let msg = null;
  let msgType = null;
  let responseStatus = null;
  let response = null;
  let data = null;
  dispatch(showLoader("Loading, Please Wait....."));

  try {
    if (
      get_post !== undefined &&
      get_post !== "undefined" &&
      get_post !== null &&
      get_post !== "null" &&
      get_post.toUpperCase() === "POST"
    ) {
      response = await myAxios.post(url, values);
    } else {
      response = await myAxios.get(url, values);
    }

    // console.log("response----..", response.data);

    responseStatus = response.status ?? "unknown status";
    msg =
      response.data.message !== undefined && response.data.message !== null
        ? response.data.message
        : "Operation completed successfully.";
    msgType = "success";
    data = response.data != null ? response.data : null;
  } catch (error) {
    msgType = "failure";

    if (error.response) {
      msg =
        error.response.data?.message === ""
          ? ""
          : error.response.data?.message
            ? `${error.response.data.message} (${error.response.data.status})`
            : "An error occurred";
      responseStatus = error.response.status;
    } else {
      msg = `An unexpected error occurred: ${error.message}`;
      responseStatus = 9999;
    }
  }

  // Show message if needed
  if ((msg || "").trim() !== "") {
    dispatch(showMessage(msg + " [" + getCurrentTimestamp() + "]", msgType));
    ToastFunc(msg, msgType);
  }

  // ALWAYS hide loader before returning
  dispatch(hideLoader());

  return { data, status: responseStatus };
};

const showNativeMessage = (msg, type) => {
  if (type?.toUpperCase() === "SUCCESS") {
    Alert.alert("Success", msg);
    return;
  } else if (type?.toUpperCase() === "FAILURE") {
    Alert.alert("Error", msg);
    return;
  } else {
    Alert.alert("Info", msg);
    return;
  }
};

export const CONTEXT_NAME = "Digital Labour Chowk";
export const CONTEXT_HEADING = "Digital Labour Chowk";
export const BASE_SERVER_URL = "https://forests.ap.gov.in/uploads/";
export const ACC_YEAR = new Date().getFullYear().toString();
export const LOGIN_END_POINT = "/api/open/login";
export const GENERATE_CAPTCHA = "/api/open/generate-captcha";
export const SERVICE_AUTH_END_POINT = "/api/open/validateToken";
export const LOGOUT_END_POINT = "/api/user/logout";
export const LOGOUT_ALL_END_POINT = "/api/user/logoutall";
export const LOGOUT_ALL_EXCEPT_THIS_END_POINT =
  "/api/user/logoutexceptcurrentsession";
export const CHANGE_PASSWORD = "/api/auth/changepassword";
export const UpdateProfile = "/api/auth/UpdateProfile";
export const EMPLOYEEREGOTP =
  "/api/open/digital-labour-chowk/generate-otp?mobileNumber=";
export const EMPLOYEEREG = "/api/open/digital-labour-chowk/register";
export const BASICPROFILE = "/api/user/digital-labour-chowk/updateBasicInfo";
export const GETSKILLS = "api/user/digital-labour-chowk/skillInfo";
export const GETDISTSAPP = "/api/user/v1/districts";
export const GETMANDALSAPP = "/api/user/v1/mandals?distCode=";
export const GETVILLAGESAPP = "/api/user/v1/villages";
export const DIGITALLABOURCHOWKDETAILS ="/api/user/digitalLabourChowkRegDetails";
export const EMPLOYERJOBPOST ="/api/user/digital-labour-chowk/createJobPosting";
export const JOBSEARCH = "/api/user/digitalLabourChowkJobPostings/search";