import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";

import { persistedStore, store } from "./reducers/allReducers";
import SessionChecking from "./sitelayout/SessionChecking";
import SiteLayout from "./sitelayout/SiteLayout";
import ChangePassword from "./sitelayout/ChangePassword";
import ProfileUpdate from "./sitelayout/ProfileUpdate";
import ModalPopup from "./sitelayout/ModalPopup";
import Overlay from "./sitelayout/Overlay";
import LoginCommon, {
  RegisterEmployer,
  RegisterWorker,
} from "./screens/LoginCommon";
import { ToastProvider } from "react-native-sprinkle-toast";
import JobSearchScreen from "./screens/JobSearch";
import AppliedJobs from "./screens/AppliedJobs";
import PostJob from "./screens/PostJob";
import Workerposetdjobs from "./screens/Workerposetdjobs";
import JobDetailsScreen from "./screens/JobDetailsScreen";
import MapScreen from "./screens/MapScreen";
import WelfareScreens from "./screens/WelfareScreens";
import DistImage from "./screens/DistImage";
import WorkerRegistration from "./screens/WorkerRegistrationForm";

const Stack = createNativeStackNavigator();

export default function Routes() {
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
                      <WorkerRegistration {...props} />
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
              <Stack.Screen name="AddAgency">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="AddAgency"
                      scrollEnabled={false}
                    >
                      <DistImage {...props} />
                    </SiteLayout>
                  </SessionChecking>
                )}
              </Stack.Screen>
              <Stack.Screen name="Welfarescreen">
                {(props) => (
                  <SessionChecking navigation={props.navigation}>
                    <SiteLayout
                      navigation={props.navigation}
                      currentScreenName="Welfarescreen"
                      scrollEnabled={false}
                    >
                      <WelfareScreens {...props} />
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
