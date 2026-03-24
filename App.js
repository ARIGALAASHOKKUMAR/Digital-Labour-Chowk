import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";

import { persistedStore, store } from "./src/reducers/allReducers";
import SessionChecking from "./src/sitelayout/SessionChecking";
import SiteLayout from "./src/sitelayout/SiteLayout";
import IncidentReporting from "./src/hanuman/IncidentReporting";
import ChangePassword from "./src/sitelayout/ChangePassword";
import ProfileUpdate from "./src/sitelayout/ProfileUpdate";
import Toast from "react-native-toast-message";
import ModalPopup from "./src/sitelayout/ModalPopup";
import Overlay from "./src/sitelayout/Overlay";
import LoginCommon, {
  RegisterEmployer,
  RegisterWorker,
} from "./src/screens/LoginCommon";
import { ToastProvider } from "react-native-sprinkle-toast";
import JobSearchScreen from "./src/screens/JobSearch";
import AppliedJobs from "./src/screens/AppliedJobs";
import PostJob from "./src/screens/PostJob";
import Workerposetdjobs from "./src/screens/Workerposetdjobs";
import JobDetailsScreen from "./src/screens/JobDetailsScreen";
import MapScreen from "./src/screens/MapScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <ToastProvider>
          <NavigationContainer>
            <ModalPopup />
            <Overlay />
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{ headerShown: false }}
            >
              {/* Login Screen */}
              <Stack.Screen name="Login" component={LoginCommon} />
              <Stack.Screen name="RegisterWorker" component={RegisterWorker} />
              <Stack.Screen
                name="RegisterEmployer"
                component={RegisterEmployer}
              />
              <Stack.Screen
                name="IncidentReporting"
                component={IncidentReporting}
              />

              <Stack.Screen name="ProfileUpdate">
                {(props) => (
                  // <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="ProfileUpdate"
                    >
                      <ProfileUpdate {...props} />
                    </SiteLayout>
                  // </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="ChangePassword">
                {(props) => (
                  // <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="ChangePassword"
                    >
                      <ChangePassword {...props} />
                    </SiteLayout>
                  // </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="HOME">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="HOME"
                      scrollEnabled={false}
                    >
                      <HomeScreen {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="FindJob">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="FindJob"
                      scrollEnabled={false}
                    >
                      <JobSearchScreen {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="WorkerSearch">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="WorkerSearch"
                      scrollEnabled={false}
                    >
                      <JobSearchScreen {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="AppliedJob">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="AppliedJob"
                      scrollEnabled={false}
                    >
                      <AppliedJobs {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>
              <Stack.Screen name="MapView">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="MapView"
                      scrollEnabled={false}
                    >
                      <MapScreen {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="JobPosting">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="JobPosting"
                      scrollEnabled={false}
                    >
                      <PostJob {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="EmployerJob">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="EmployerJob"
                      scrollEnabled={false}
                    >
                      <Workerposetdjobs {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>

              <Stack.Screen name="EmploJobDetailsyerJob">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="JobDetails"
                      scrollEnabled={false}
                    >
                      <JobDetailsScreen {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
}
