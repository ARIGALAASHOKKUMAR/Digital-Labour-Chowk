import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { commonAPICall, LOGIN_END_POINT, GENERATE_CAPTCHA } from '../utils/utils';
import { login } from '../actions';
import { showErrorToast, showSuccessToast } from '../utils/showToast';
import { useNavigation } from '@react-navigation/native';


const LoginCommon = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaImage, setCaptchaImage] = useState('');
  const [storedCaptchaId, setStoredCaptchaId] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const navigation = useNavigation()

  // Validation Schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Username is required')
      .min(4, 'Username must be at least 4 characters')
      .max(18, 'Username must be less than 18 characters'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    captcha: Yup.string()
      .required('Captcha is required')
      .length(6, 'Captcha must be exactly 6 characters'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      captcha: '',
    },
    validationSchema,
    onSubmit: handleLogin,
  });

  // Generate Captcha
  const generateCaptcha = async () => {
    try {
      const response = await commonAPICall(GENERATE_CAPTCHA, {}, 'get', dispatch);
      setCaptchaImage(response?.data?.captcha || '');
      setStoredCaptchaId(response?.data?.captchaId || '');
    } catch (error) {
      console.log('Captcha error:', error);
    }
  };

  useEffect(()=>{
    generateCaptcha()
  },[])

  // Handle Login
  async function handleLogin(values) {
    setShowErrors(true);
    
    try {
      setLoading(true);
      
      const payload = {
        username: values.username.trim(),
        password: btoa(values.password), // Base64 encode password
        deptCaptcha: values.captcha.trim(),
        storedCaptchaId: storedCaptchaId,
        latitude: null,
        longitude: null,
        loginSource: 'mobile',
      };

      const response = await commonAPICall(LOGIN_END_POINT, payload, 'post', dispatch);

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
        let welcomeMsg = currentTime >= 5 && currentTime < 12 
          ? 'Good morning! Welcome to Marine Discharge' 
          : currentTime >= 12 && currentTime < 18 
          ? 'Good afternoon! Welcome to Marine Discharge' 
          : 'Good evening! Welcome to Marine Discharge';

        showSuccessToast(welcomeMsg);
        navigation.navigate('HOME');
      }
    } catch (error) {
      if (error.response) {
        setCaptchaImage(error.response?.data?.captcha || '');
        setStoredCaptchaId(error.response?.data?.captchaId || '');
        showErrorToast(error.response?.data?.message || 'Please enter valid credentials');
      } else {
        showErrorToast(error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle Forgot Password
  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Please contact your administrator');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0a2a4a" />
      
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Decoration */}
          <View style={styles.backgroundLayer} />
          <View style={styles.topDecoration} />
          <View style={styles.bottomDecoration} />

          {/* Card */}
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="water-outline" size={40} color="#fff" />
              </View>
            </View>

            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.titleText}>Marine Discharge</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>

            {/* Username */}
            <View style={styles.fieldBlock}>
              <View style={[
                styles.inputWrapper,
                showErrors && formik.errors.username && styles.inputWrapperError
              ]}>
                <Ionicons name="person-outline" size={20} color="#5f6f94" style={styles.leftIcon} />
                <TextInput
                  placeholder="User Name"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.username}
                  onChangeText={formik.handleChange('username')}
                  onBlur={formik.handleBlur('username')}
                  maxLength={18}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              {showErrors && formik.errors.username && (
                <Text style={styles.errorText}>{formik.errors.username}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldBlock}>
              <View style={[
                styles.inputWrapper,
                showErrors && formik.errors.password && styles.inputWrapperError
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#5f6f94" style={styles.leftIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.password}
                  onChangeText={formik.handleChange('password')}
                  onBlur={formik.handleBlur('password')}
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
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color="#1e3a5f" 
                  />
                </TouchableOpacity>
              </View>
              {showErrors && formik.errors.password && (
                <Text style={styles.errorText}>{formik.errors.password}</Text>
              )}
            </View>

            {/* Captcha */}
            <View style={styles.fieldBlock}>
              <View style={styles.captchaRow}>
                <View style={[
                  styles.captchaInputWrapper,
                  showErrors && formik.errors.captcha && styles.inputWrapperError
                ]}>
                  <TextInput
                    placeholder="Captcha"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    value={formik.values.captcha}
                    onChangeText={formik.handleChange('captcha')}
                    onBlur={formik.handleBlur('captcha')}
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
              {showErrors && formik.errors.captcha && (
                <Text style={styles.errorText}>{formik.errors.captcha}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={formik.handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginText}>LOGIN</Text>
                  <Ionicons name="arrow-forward-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a2a4a',
  },
  flexOne: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 42, 74, 0.9)',
  },
  topDecoration: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0a2a4a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0a2a4a',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  inputWrapper: {
    minHeight: 52,
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d7e3ff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  captchaInputWrapper: {
    flex: 1.2,
    minHeight: 52,
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d7e3ff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff6f6',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    paddingVertical: 12,
  },
  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 6,
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  captchaBox: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d7e3ff',
    backgroundColor: '#f8fbff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  captchaImage: {
    width: '100%',
    height: 40,
  },
  captchaPlaceholderText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 13,
  },
  refreshBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#eef4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d7e3ff',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0a2a4a',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#0a2a4a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#0a2a4a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.8,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoginCommon;