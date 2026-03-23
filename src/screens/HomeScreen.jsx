import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import Worker from "./Worker";
import Employer from "./Employer";
import { commonAPICall, DIGITALLABOURCHOWKDETAILS } from "../utils/utils";

const HomeScreen = ({ navigation }) => {
  const state = useSelector((state) => state.LoginReducer);
  const roleId = state.roleId;
  const [loading, setLoading] = useState(true);

  const safeParseArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const [workerData, setWorkerData] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  const [skills, setSkills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkerDetails = async () => {
    try {
      const res = await commonAPICall(
        DIGITALLABOURCHOWKDETAILS,
        {},
        "get",
        dispatch,
      );

      if (res?.status === 200) {
        const data = res?.data?.DigitalLabourChowkRegistration_Details || [];
         console.log("ddddddddddddddd",data)        
        if (data.length > 0) {
          const worker = data[0];
          setWorkerData(worker);
          setWorkHistory(safeParseArray(worker.work_history));
          setSkills(safeParseArray(worker.skills));
        } else {
          setWorkerData(null);
          setWorkHistory([]);
          setSkills([]);
        }
      }
    } catch (error) {
      console.log("Error fetching worker details:", error);
      setWorkerData(null);
      setWorkHistory([]);
      setSkills([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkerDetails();
  }, []);

  const dispatch = useDispatch();

  return (
    <>
      {roleId == 12 ? (
        <Worker
          skills={skills}
          workHistory={workHistory}
          workerData={workerData}
          loading={loading}
          refreshing={refreshing}
        />
      ) : (
        <Employer navigation={navigation}/>
      )}
    </>
  );
};

export default HomeScreen;
