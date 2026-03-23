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
              {/* <Stack.Screen name="ProfileUpdate" component={ProfileUpdate} /> */}

              <Stack.Screen name="ProfileUpdate">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="ProfileUpdate"
                  >
                    <ProfileUpdate {...props} />
                  </SiteLayout>
                )}
              </Stack.Screen>
              <Stack.Screen name="ChangePassword">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="ChangePassword"
                  >
                    <ChangePassword {...props} />
                  </SiteLayout>
                )}
              </Stack.Screen>
              {/* Protected HOME Screen */}
              <Stack.Screen name="HOME">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="HOME"
                    scrollEnabled={false}
                  >
                    <SessionChecking navigation={props.navigation}>
                      <HomeScreen {...props} />
                    </SessionChecking>
                  </SiteLayout>
                )}
              </Stack.Screen>
              <Stack.Screen name="FindJob">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="FindJob"
                    scrollEnabled={false}
                  >
                    <SessionChecking navigation={props.navigation}>
                      <JobSearchScreen {...props} />
                    </SessionChecking>
                  </SiteLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="WorkerSearch">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="WorkerSearch"
                    scrollEnabled={false}
                  >
                    <SessionChecking navigation={props.navigation}>
                      <JobSearchScreen {...props} />
                    </SessionChecking>
                  </SiteLayout>
                )}
              </Stack.Screen>
              <Stack.Screen name="AppliedJob">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="AppliedJob"
                    scrollEnabled={false}
                  >
                    <SessionChecking navigation={props.navigation}>
                      <AppliedJobs {...props} />
                    </SessionChecking>
                  </SiteLayout>
                )}
              </Stack.Screen>
              <Stack.Screen name="JobPosting">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="JobPosting"
                    scrollEnabled={false}
                  >
                    <SessionChecking navigation={props.navigation}>
                      <PostJob {...props} />
                    </SessionChecking>
                  </SiteLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="EmployerJob">
                {(props) => (
                  <SiteLayout
                    navigation={props.navigation}
                    currentScreenName="EmployerJob"
                    scrollEnabled={false}
                  >
                    <SessionChecking navigation={props.navigation}>
                      <Workerposetdjobs {...props} />
                    </SessionChecking>
                  </SiteLayout>
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
}
