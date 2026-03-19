import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import Worker from "./Worker";
import Employer from "./Employer";

const HomeScreen = ({ navigation }) => {
  const state = useSelector((state) => state.LoginReducer);
  const roleId = state.roleId;

  return (
    <SafeAreaView>{roleId == 12 ? <Worker /> : <Employer />}</SafeAreaView>
  );
};

export default HomeScreen;
