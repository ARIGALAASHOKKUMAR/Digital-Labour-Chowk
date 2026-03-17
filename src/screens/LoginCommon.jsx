import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Button,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  commonAPICall,
  EMPLOYEEREG,
  EMPLOYEEREGOTP,
  GENERATE_CAPTCHA,
  LOGIN_END_POINT,
  LOGOUT_END_POINT,
  myAxios,
  myAxiosLogin,
} from "../utils/utils";
import { useDispatch } from "react-redux";
import { login } from "../actions";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../utils/showToast";
import amblem from "../../assets/labour_log.png";
import labour_img from "../../assets/labour.png";
import React, { useEffect, useRef, useState } from "react";
import { ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";

const { width } = Dimensions.get("window");

const LoginCommon = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deptCaptcha, setDeptCaptcha] = useState("");
  const [storedCaptchaId, setStoredCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedUserType, setSelectedUserType] = useState(""); // worker | employer
  const [selectedAction, setSelectedAction] = useState(""); // login | register

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    deptCaptcha: "",
  });

  const dispatch = useDispatch();

  const encodeBase64 = (value) => {
    try {
      if (typeof btoa === "function") return btoa(value);
      if (global?.btoa) return global.btoa(value);
      return value;
    } catch {
      return value;
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setDeptCaptcha("");
    setShowPassword(false);
    setErrors({
      username: "",
      password: "",
      deptCaptcha: "",
    });
  };

  const goBackToRoleSelection = () => {
    setSelectedUserType("");
    setSelectedAction("");
    resetForm();
  };

  const goBackToActionSelection = () => {
    setSelectedAction("");
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
      deptCaptcha: "",
    };

    let valid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (username.trim().length < 4) {
      newErrors.username = "Username must be at least 4 characters";
      valid = false;
    } else if (username.trim().length > 18) {
      newErrors.username = "Username must be less than 18 characters";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!deptCaptcha.trim()) {
      newErrors.deptCaptcha = "Captcha is required";
      valid = false;
    } else if (deptCaptcha.trim().length !== 6) {
      newErrors.deptCaptcha = "Captcha must be exactly 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const generateCaptcha = async () => {
    try {
      const response = await commonAPICall(
        GENERATE_CAPTCHA,
        {},
        "get",
        dispatch,
      );
      setCaptchaImage(response?.data?.captcha || "");
      setStoredCaptchaId(response?.data?.captchaId || "");
    } catch (error) {
      console.log("Captcha error:", error);
    }
  };

  const logoutUser = async () => {
    try {
      await myAxios.get(`${LOGOUT_END_POINT}?type=HOMEPAGE`);
    } catch (error) {
      console.log("Logout skipped:", error?.message);
    }
  };

  useEffect(() => {
    logoutUser();
    generateCaptcha();
  }, []);

  const getLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const values = {
      username: username.trim(),
      password: encodeBase64(password),
      deptCaptcha: deptCaptcha.trim(),
      storedCaptchaId,
      latitude: null,
      longitude: null,
      loginSource: "mobile",
      // loginType: selectedUserType, // enable if backend needs this
    };

    try {
      const response = await myAxiosLogin.post(LOGIN_END_POINT, values);

      if (response.status === 200) {
        const payload = {
          isLoggedIn: true,
          isDefaultPassword: response.data.isDefaultPassword,
          isProfileUpdated: response.data.isProfileUpdated,
          officerName: response.data.officerName,
          mobile: response.data.mobile,
          parents: response.data.parents,
          services: response.data.services,
          roleId: response.data.roleId,
          userId: response.data.userId,
          username: response.data.username,
          token: response.data.token,
          roleName: response.data.roleName,
          photoPath: response.data.photoPath,
          lastLoginTime: response.data.lastLoginTime,
          uuid: response.data.uuid,
          lastLogoutTime: response.data.lastLogoutTime,
          lastFailureAttemptTime: response.data.lastFailureAttemptTime,
          passwordSinceUpdated: response.data.passwordSinceUpdated,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          loginLocation: response.data.location,
        };

        dispatch(login(payload));

        const currentTime = new Date().getHours();
        let welcomeMsg = "";

        if (currentTime >= 5 && currentTime < 12) {
          welcomeMsg =
            "Good morning! A book is a window to the world—start your day with knowledge!";
        } else if (currentTime >= 12 && currentTime < 18) {
          welcomeMsg =
            "Good afternoon! Dive into a book and let your imagination take you on an adventure!";
        } else {
          welcomeMsg =
            "Good evening! End your day with the wisdom of a good book!";
        }

        showSuccessToast(welcomeMsg);

        if (
          parseInt(response?.data?.passwordSinceUpdated) >= 85 &&
          parseInt(response?.data?.passwordSinceUpdated) < 90
        ) {
          showInfoToast(
            `Your password will expire in ${
              90 - response.data.passwordSinceUpdated
            } days. Please update it soon.`,
          );
        }

        navigation.navigate("HOME");
      } else {
        showErrorToast("Please enter valid credentials");
      }
    } catch (error) {
      if (error.response) {
        setCaptchaImage(error.response?.data?.captcha || "");
        setStoredCaptchaId(error.response?.data?.captchaId || "");
        showErrorToast(
          error.response?.data?.message || "Please enter valid credentials",
        );
      } else {
        showErrorToast(error.message || "Something went wrong");
      }

      console.log("Error during authentication:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (selectedUserType === "worker") {
      navigation.navigate("RegisterWorker");
    } else if (selectedUserType === "employer") {
      navigation.navigate("RegisterEmployer");
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.card}>
      <View style={styles.cardGlow} />

      <View style={styles.logoWrapper}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoCircle}>
            <Ionicons name="briefcase-outline" size={34} color="#fff" />
          </View>
        </View>
      </View>

      <Text style={styles.deptName}>Welcome / స్వాగతం</Text>
      <Text style={styles.subtitle}>
        Connecting Workers and Employers Digitally / కార్మికులు మరియు యజమానులను
        డిజిటల్‌గా అనుసంధానిస్తున్నాము
      </Text>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => setSelectedUserType("worker")}
        activeOpacity={0.85}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="person-outline" size={26} color="#1e3a5f" />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            I am a Worker{"\n"} నేను కార్మికుడిని
          </Text>{" "}
        </View>
        <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => setSelectedUserType("employer")}
        activeOpacity={0.85}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="business-outline" size={26} color="#1e3a5f" />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            I am an Employer {"\n"} నేను యజమానుడిని
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => setSelectedUserType("employer")}
        activeOpacity={0.85}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="business-outline" size={26} color="#1e3a5f" />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            Quick Access {"\n"} త్వరిత ప్రవేశం
          </Text>
          <TouchableOpacity style={styles.eshramButton} onPress={() => {}}>
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.eshramText}>e-Shram Registration</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
      </TouchableOpacity>
    </View>
  );

  const renderActionSelection = () => (
    <View style={styles.card}>
      <View style={styles.cardGlow} />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={goBackToRoleSelection}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#1e3a5f" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.logoWrapper}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoCircle}>
            <Ionicons
              name={
                selectedUserType === "worker"
                  ? "person-outline"
                  : "business-outline"
              }
              size={34}
              color="#fff"
            />
          </View>
        </View>
      </View>

      <Text style={styles.title}>
        Are you an existing{" "}
        {selectedUserType === "worker" ? "worker" : "employer"} ?
      </Text>

      <TouchableOpacity
        style={styles.actionButtonSecondary}
        onPress={handleRegister}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add-outline" size={20} color="#1e3a5f" />
        <Text style={styles.actionButtonSecondaryText}>
          New User{"\n"}Register for the first time
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButtonPrimary}
        onPress={() => {
          setSelectedAction("login");
          generateCaptcha();
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="log-in-outline" size={20} color="#fff" />
        <Text style={styles.actionButtonPrimaryText}>
          Existing User{"\n"}Login With Phone Number
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.card}>
      <View style={styles.cardGlow} />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={goBackToActionSelection}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#1e3a5f" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.logoWrapper}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoCircle}>
            <Ionicons
              name={
                selectedUserType === "worker"
                  ? "person-outline"
                  : "business-outline"
              }
              size={34}
              color="#fff"
            />
          </View>
        </View>
      </View>

      <Text style={styles.deptName}>Digital Labour Chowk</Text>
      <Text style={styles.title}>
        Login {selectedUserType === "worker" ? "Worker" : "Employer"}
      </Text>
      <Text style={styles.subtitle}>
        Sign in to access your{" "}
        {selectedUserType === "worker" ? "worker" : "employer"} account
      </Text>

      <View style={styles.fieldBlock}>
        <View
          style={[
            styles.inputWrapper,
            errors.username ? styles.inputWrapperError : null,
          ]}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color="#5f6f94"
            style={styles.leftIcon}
          />
          <TextInput
            placeholder="Enter User ID"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({ ...errors, username: "" });
            }}
            maxLength={18}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        {errors.username ? (
          <Text style={styles.errorText}>{errors.username}</Text>
        ) : null}
      </View>

      <View style={styles.fieldBlock}>
        <View
          style={[
            styles.inputWrapper,
            errors.password ? styles.inputWrapperError : null,
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#5f6f94"
            style={styles.leftIcon}
          />
          <TextInput
            placeholder="Enter Password"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#1e3a5f"
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
      </View>

      <View style={styles.fieldBlock}>
        <View style={styles.captchaRow}>
          <View
            style={[
              styles.captchaInputWrapper,
              errors.deptCaptcha ? styles.inputWrapperError : null,
            ]}
          >
            <TextInput
              placeholder="Captcha"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={deptCaptcha}
              onChangeText={(text) => {
                setDeptCaptcha(text);
                if (errors.deptCaptcha) {
                  setErrors({ ...errors, deptCaptcha: "" });
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.captchaBox}>
            {captchaImage ? (
              <Image
                source={{ uri: captchaImage }}
                style={styles.captchaImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.captchaPlaceholderText}>Captcha</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={generateCaptcha}
            style={styles.refreshBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={22} color="#1e3a5f" />
          </TouchableOpacity>
        </View>

        {errors.deptCaptcha ? (
          <Text style={styles.errorText}>{errors.deptCaptcha}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.loginButton,
          loading ? styles.loginButtonDisabled : null,
        ]}
        onPress={getLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.loginText}>
              Login {selectedUserType === "worker" ? "Worker" : "Employer"}
            </Text>
            <Ionicons
              name="arrow-forward-outline"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
        enabled
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Image source={labour_img} style={styles.backgroundImage} />

          <View style={styles.overlay} />
          <View style={styles.backgroundLayerTop} />
          <View style={styles.backgroundLayerMiddle} />
          <View style={styles.topDecorationOne} />
          <View style={styles.topDecorationTwo} />
          <View style={styles.bottomDecoration} />
          <View style={styles.bottomDecorationTwo} />

          <View style={styles.heroImageWrapper}>
            <Image
              source={labour_img}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroImageOverlay}>
              <Image
                source={amblem}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
              <Text style={styles.heroImageText}>
                Digital Labour Chowk{"\n"}డిజిటల్ లేబర్ చౌక్
              </Text>
              <Text style={styles.heroImageSubText}>
                Government of Andhra Pradesh
              </Text>
            </View>
          </View>

          {!selectedUserType
            ? renderRoleSelection()
            : !selectedAction
              ? renderActionSelection()
              : renderLoginForm()}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const CommonRegistrationForm = ({ navigation, type = "worker" }) => {
  const isWorker = type === "worker";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Refs for OTP inputs
  const otpInputs = useRef([]);
  const dispatch = useDispatch();

  // Validation schema using Yup
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required("Full name is required")
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name cannot exceed 50 characters")
      .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
      .trim(),

    email: Yup.string()
      .required("Email is required")
      .email("Enter a valid email")
      .trim()
      .lowercase(),

    mobileNumber: Yup.string()
      .required("Phone number is required")
      .matches(
        /^[6-9]\d{9}$/,
        "Enter a valid 10 digit phone number starting with 6-9",
      )
      .trim(),

    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .trim(),

    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match")
      .trim(),

    otp: Yup.array()
      .of(Yup.string().matches(/^\d$/, "Must be a number"))
      .length(6, "Please enter complete OTP")
      .test("is-complete", "Please enter complete OTP", (value) => {
        return value && value.every((digit) => digit && digit.length === 1);
      }),

    termsAccepted: Yup.boolean().oneOf(
      [true],
      "You must accept the terms and conditions to register",
    ),
  });

  // Formik hook
  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      otp: ["", "", "", "", "", ""],
      termsAccepted: false,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        // Validate OTP field before submission
        await formik.validateField('otp');
        
        if (formik.errors.otp) {
          showErrorToast(formik.errors.otp);
          setLoading(false);
          return;
        }

        // Combine OTP digits into a single string
        const otpString = values.otp.join("");

        const payload = {
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          mobileNumber: values.mobileNumber.trim(),
          password: values.password.trim(),
          confirmPassword: values.confirmPassword.trim(),
          otp: otpString,
          registrationId: `DL-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
          // userType: type,
          userType: type.toUpperCase(),
          agreeTerms: values.termsAccepted,
          // timestamp: new Date().toISOString(),
        };

        console.log(`${type} registration payload =>`, payload);

        // Fix: Make sure the API endpoint is correct and payload structure matches backend expectations
        const res = await commonAPICall(EMPLOYEEREG, payload, "post", dispatch);
        console.log("Registration response:", res);

        if (res?.status === 200 || res?.status === 201) {
          setShowOtpModal(false);
          showSuccessToast(
            `${isWorker ? "Worker" : "Employer"} registered successfully`
          );
          navigation.goBack();
        } else {
          throw new Error(res?.message || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showErrorToast(error?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    },
  });

  // Helper function to get field error
  const getFieldError = (fieldName) => {
    return (formik.touched[fieldName] || formik.submitCount > 0) &&
      formik.errors[fieldName]
      ? formik.errors[fieldName]
      : "";
  };

  // Handle phone number input
  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    formik.setFieldValue("mobileNumber", cleaned);
  };

  // Handle OTP input change
  const handleOtpChange = (text, index) => {
    const newOtp = [...formik.values.otp];

    // Allow only single digit
    if (text.length > 1) {
      text = text.charAt(text.length - 1);
    }

    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    newOtp[index] = text;
    formik.setFieldValue("otp", newOtp);

    // Clear OTP error when user starts typing
    if (formik.errors.otp) {
      formik.setFieldError("otp", undefined);
    }

    // Auto-focus next input
    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Handle OTP key press (backspace)
  const handleOtpKeyPress = (e, index) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      !formik.values.otp[index] &&
      index > 0
    ) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (text) => {
    const digits = text.replace(/\D/g, "").split("");
    if (digits.length === 6) {
      formik.setFieldValue("otp", digits);
    }
  };

  // Validate all fields before sending OTP
  const validateAllFields = async () => {
    const fieldsToValidate = [
      "fullName",
      "email",
      "mobileNumber",
      "password",
      "confirmPassword",
      "termsAccepted",
    ];

    // Set all fields as touched
    const touchedFields = {};
    fieldsToValidate.forEach((field) => {
      touchedFields[field] = true;
    });
    
    await formik.setTouched(touchedFields);

    // Trigger validation for all fields
    const errors = await formik.validateForm();
    
    // Check if there are any errors in the required fields
    const hasErrors = fieldsToValidate.some((field) => errors[field]);

    if (hasErrors) {
      // Show first error message
      const firstErrorField = fieldsToValidate.find(field => errors[field]);
      if (firstErrorField) {
        showErrorToast(errors[firstErrorField]);
      }
    }

    return !hasErrors;
  };

  // Send OTP - only enabled when terms are accepted
  const handleSendOtp = async () => {
    // First validate all fields
    const isValid = await validateAllFields();

    if (isValid && formik.values.termsAccepted) {
      try {
        setOtpLoading(true);
        const mobileNumber = formik.values.mobileNumber;
        const email = formik.values.email;

        console.log("Sending OTP to:", { phone: mobileNumber, email });

        // Fix: Make sure the API endpoint is correct
        // Option 1: If the API expects query parameters

        
      const url = `${EMPLOYEEREGOTP}${mobileNumber}&userType=${type.toUpperCase()}`
      console.log("uuuuuuuuuu",url)
        const getotp = await commonAPICall(
       url,
          {}, // Empty body for GET request
          "post", // or "get" depending on your API
          dispatch,
        );



        // Option 2: If the API expects a POST request with body
        // const getotp = await commonAPICall(
        //   EMPLOYEEREGOTP,
        //   {
        //     mobileNumber: mobileNumber,
        //     userType: type,
        //     email: email // Include if needed
        //   },
        //   "post",
        //   dispatch,
        // );

        console.log("OTP response:", getotp?.data);

        if (getotp?.status === 200 || getotp?.status === 201) {
          setOtpSent(true);
          setOtpTimer(60); // 60 seconds timer
          setShowOtpModal(true); // Show OTP modal
          showSuccessToast("OTP sent successfully");

          // Start timer countdown
          const timer = setInterval(() => {
            setOtpTimer((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          throw new Error(getotp?.message || "Failed to send OTP");
        }
      } catch (error) {
        console.error("OTP sending error:", error);
        showErrorToast(error?.message || "Failed to send OTP");
      } finally {
        setOtpLoading(false);
      }
    } else if (!formik.values.termsAccepted) {
      showErrorToast("Please accept terms and conditions to continue");
    }
  };

  // Reset OTP fields when modal closes
  const handleCloseModal = () => {
    setShowOtpModal(false);
    formik.setFieldValue("otp", ["", "", "", "", "", ""]);
    formik.setFieldTouched("otp", false);
    formik.setFieldError("otp", undefined);
    setOtpTimer(0);
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    
    try {
      setOtpLoading(true);
      const mobileNumber = formik.values.mobileNumber;
      const email = formik.values.email;

      console.log("Resending OTP to:", mobileNumber);
      
      // Fix: Make sure the API endpoint is correct for resend
      // Option 1: Query parameters

      const url = `${EMPLOYEEREGOTP}${mobileNumber}&userType=${type}`
      console.log("url",url)
      const getotp = await commonAPICall(
        url,
        {},
        "post",
        dispatch,
      );

      // Option 2: POST with body
      // const getotp = await commonAPICall(
      //   EMPLOYEEREGOTP,
      //   {
      //     mobileNumber: mobileNumber,
      //     userType: type
      //   },
      //   "post",
      //   dispatch,
      // );

      if (getotp?.status === 200 || getotp?.status === 201) {
        setOtpTimer(60);
        showSuccessToast("OTP resent successfully");
        
        const timer = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      showErrorToast(error?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Check if terms are accepted
  const isTermsAccepted = formik.values.termsAccepted;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={{
              uri: "https://labour.dev.nidhi.apcfss.in/files/labourdept/secondslide.jpeg",
            }}
            style={styles.backgroundImage}
          />

          <View style={styles.overlay} />
          <View style={styles.backgroundLayerTop} />
          <View style={styles.backgroundLayerMiddle} />
          <View style={styles.topDecorationOne} />
          <View style={styles.topDecorationTwo} />
          <View style={styles.bottomDecoration} />
          <View style={styles.bottomDecorationTwo} />

          <View style={styles.card}>
            <View style={styles.cardGlow} />

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#1e3a5f" />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.logoWrapper}>
              <View style={styles.logoOuterRing}>
                <View style={styles.logoCircle}>
                  <Ionicons
                    name={isWorker ? "person-outline" : "business-outline"}
                    size={34}
                    color="#fff"
                  />
                </View>
              </View>
            </View>

            <Text style={styles.deptName}>DEPARTMENT OF LABOUR</Text>
            <Text style={styles.title}>
              {isWorker ? "Worker Registration" : "Employer Registration"}
            </Text>
            <Text style={styles.subtitle}>
              Fill in the details to create your account
            </Text>

            {/* Full Name Field */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  getFieldError("fullName") ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder={
                    isWorker
                      ? "Enter worker full name"
                      : "Enter employer full name"
                  }
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.fullName}
                  onChangeText={(text) =>
                    formik.setFieldValue("fullName", text)
                  }
                  onBlur={() => formik.setFieldTouched("fullName", true)}
                />
              </View>
              {getFieldError("fullName") ? (
                <Text style={styles.errorText}>
                  {getFieldError("fullName")}
                </Text>
              ) : null}
            </View>

            {/* Email Field */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  getFieldError("email") ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder={
                    isWorker ? "Enter worker email" : "Enter employer email"
                  }
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.email}
                  onChangeText={formik.handleChange("email")}
                  onBlur={formik.handleBlur("email")}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {getFieldError("email") ? (
                <Text style={styles.errorText}>{getFieldError("email")}</Text>
              ) : null}
            </View>

            {/* Phone Number Field */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  getFieldError("mobileNumber")
                    ? styles.inputWrapperError
                    : null,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder={
                    isWorker
                      ? "Enter worker phone number"
                      : "Enter employer phone number"
                  }
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.mobileNumber}
                  onChangeText={handlePhoneChange}
                  onBlur={formik.handleBlur("mobileNumber")}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
              {getFieldError("mobileNumber") ? (
                <Text style={styles.errorText}>
                  {getFieldError("mobileNumber")}
                </Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  getFieldError("password") ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.password}
                  onChangeText={formik.handleChange("password")}
                  onBlur={formik.handleBlur("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#1e3a5f"
                  />
                </TouchableOpacity>
              </View>
              {getFieldError("password") ? (
                <Text style={styles.errorText}>
                  {getFieldError("password")}
                </Text>
              ) : null}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  getFieldError("confirmPassword")
                    ? styles.inputWrapperError
                    : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.confirmPassword}
                  onChangeText={formik.handleChange("confirmPassword")}
                  onBlur={formik.handleBlur("confirmPassword")}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={22}
                    color="#1e3a5f"
                  />
                </TouchableOpacity>
              </View>
              {getFieldError("confirmPassword") ? (
                <Text style={styles.errorText}>
                  {getFieldError("confirmPassword")}
                </Text>
              ) : null}
            </View>

            {/* Terms and Conditions Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxWrapper}
                onPress={() =>
                  formik.setFieldValue(
                    "termsAccepted",
                    !formik.values.termsAccepted,
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    formik.values.termsAccepted && styles.checkboxChecked,
                  ]}
                >
                  {formik.values.termsAccepted && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I accept the{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => {
                      // Navigate to Terms and Conditions screen
                      navigation.navigate("TermsAndConditions");
                    }}
                  >
                    Terms and Conditions
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => {
                      // Navigate to Privacy Policy screen
                      navigation.navigate("PrivacyPolicy");
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
              {getFieldError("termsAccepted") ? (
                <Text style={styles.errorText}>
                  {getFieldError("termsAccepted")}
                </Text>
              ) : null}
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[
                styles.sendOtpButton,
                (!isTermsAccepted || otpLoading) && styles.sendOtpButtonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={!isTermsAccepted || otpLoading}
              activeOpacity={0.85}
            >
              {otpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendOtpText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Ionicons name="lock-closed" size={24} color="#1e3a5f" />
                <Text style={styles.modalTitle}>Verify OTP</Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter the 6-digit code sent to {formik.values.mobileNumber}
            </Text>

            {/* OTP Input Fields */}
            <View style={styles.modalOtpContainer}>
              <View style={styles.otpInputsContainer}>
                {formik.values.otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      getFieldError("otp") ? styles.otpInputError : null,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    onPaste={(e) => handleOtpPaste(e.nativeEvent.text)}
                    keyboardType="number-pad"
                    maxLength={1}
                    onBlur={() => formik.setFieldTouched("otp", true)}
                    autoFocus={index === 0}
                    editable={!loading}
                  />
                ))}
              </View>

              {getFieldError("otp") ? (
                <Text style={styles.errorText}>{getFieldError("otp")}</Text>
              ) : null}

              {/* Resend OTP */}
              <View style={styles.resendOtpContainer}>
                <Text style={styles.resendOtpText}>Didn't receive OTP? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={otpTimer > 0 || otpLoading}
                >
                  <Text
                    style={[
                      styles.resendOtpLink,
                      otpTimer > 0 && styles.resendOtpDisabled,
                    ]}
                  >
                    Resend {otpTimer > 0 ? `(${otpTimer}s)` : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button inside Modal */}
            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                loading ? styles.submitButtonDisabled : null,
              ]}
              onPress={formik.handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Verify & Register</Text>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export const RegisterWorker = ({ navigation }) => {
  return <CommonRegistrationForm navigation={navigation} type="worker" />;
};

export const RegisterEmployer = ({ navigation }) => {
  return <CommonRegistrationForm navigation={navigation} type="employer" />;
};

export default LoginCommon;

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#1e3a5f",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    position: "relative",
    overflow: "hidden",
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.15,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30, 58, 95, 0.85)",
  },

  backgroundLayerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "#1e3a5f",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  backgroundLayerMiddle: {
    position: "absolute",
    top: "24%",
    left: -20,
    right: -20,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 50,
    transform: [{ rotate: "-6deg" }],
  },

  topDecorationOne: {
    position: "absolute",
    top: -35,
    right: -25,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  topDecorationTwo: {
    position: "absolute",
    top: 95,
    left: -48,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(173,216,255,0.16)",
  },

  bottomDecoration: {
    position: "absolute",
    bottom: 55,
    right: -45,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  bottomDecorationTwo: {
    position: "absolute",
    bottom: 10,
    left: -35,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(173,216,255,0.13)",
  },

  heroImageWrapper: {
    height: 160,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30, 58, 95, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },

  heroImageText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },

  heroImageSubText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    opacity: 0.9,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 24,
    shadowColor: "#0a1a2e",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    overflow: "hidden",
  },

  cardGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(30, 58, 95, 0.10)",
  },

  logoWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },

  logoOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(30, 58, 95, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#1e3a5f",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },

  deptName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: "#1e3a5f",
    marginBottom: 4,
    letterSpacing: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  fieldBlock: {
    marginBottom: 16,
  },

  inputWrapper: {
    minHeight: 56,
    backgroundColor: "#f8fbff",
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d7e3ff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  captchaInputWrapper: {
    flex: 1.2,
    minHeight: 56,
    backgroundColor: "#f8fbff",
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d7e3ff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  inputWrapperError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff6f6",
  },

  leftIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
    paddingVertical: 14,
  },

  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 6,
  },

  captchaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  captchaBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d7e3ff",
    backgroundColor: "#f8fbff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },

  captchaImage: {
    width: "100%",
    height: 42,
  },

  captchaPlaceholderText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 13,
  },

  refreshBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d7e3ff",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 2,
  },

  loginButton: {
    width: "100%",
    height: 58,
    backgroundColor: "#1e3a5f",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    flexDirection: "row",
    shadowColor: "#0f2a40",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
    borderWidth: 1,
    borderColor: "#2c4b75",
  },

  loginButtonDisabled: {
    opacity: 0.8,
  },

  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  errorText: {
    color: "#ef4444",
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 30,
  },

  optionCard: {
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: "#f8fbff",
    borderWidth: 1,
    borderColor: "#d7e3ff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eaf1ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  optionTextWrap: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 3,
  },

  optionSubTitle: {
    fontSize: 12,
    color: "#64748b",
  },

  actionButtonPrimary: {
    height: 56,
    backgroundColor: "#1e3a5f",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  actionButtonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  actionButtonSecondary: {
    height: 56,
    backgroundColor: "#eef4ff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d7e3ff",
    marginTop: 4,
  },

  actionButtonSecondaryText: {
    color: "#1e3a5f",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 14,
  },

  backBtnText: {
    color: "#1e3a5f",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  eshramButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e3a5f",
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 1,
  },

  eshramText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  termsContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#1e3a5f",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  checkboxChecked: {
    backgroundColor: "#1e3a5f",
    borderColor: "#1e3a5f",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#2d3a5e",
    lineHeight: 18,
  },

  termsLink: {
    color: "#1e3a5f",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  sendOtpButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  sendOtpText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  otpContainer: {
    marginBottom: 20,
    marginTop: 10,
  },

  otpLabel: {
    fontSize: 14,
    color: "#2d3a5e",
    marginBottom: 10,
    fontWeight: "500",
  },

  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1e3a5f",
    backgroundColor: "#f8fafc",
  },

  otpInputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },

  resendOtpContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
  },

  resendOtpText: {
    fontSize: 13,
    color: "#6b7280",
  },

  resendOtpLink: {
    fontSize: 13,
    color: "#1e3a5f",
    fontWeight: "600",
  },

  resendOtpDisabled: {
    color: "#9ca3af",
  },

  loginButtonHidden: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a5f",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
  },
  modalOtpContainer: {
    marginBottom: 24,
  },
  modalSubmitButton: {
    backgroundColor: "#1e3a5f",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  // Make sure these OTP input styles are defined
  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  otpInputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  resendOtpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resendOtpText: {
    fontSize: 14,
    color: "#64748b",
  },
  resendOtpLink: {
    fontSize: 14,
    color: "#1e3a5f",
    fontWeight: "600",
  },
  resendOtpDisabled: {
    color: "#94a3b8",
  },
});
