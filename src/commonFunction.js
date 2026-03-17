import { NEWMANDALS, NEWVILLAGES } from "./utils/utils";

export const NewVillages = async (e, setVillage, dispatch, districtCode) => {
  dispatch(showLoader());
  try {
    if (!e) {
      setVillage([]);
  dispatch(hideLoader());
      return;
    }

    const response = await myAxios.get(
      NEWVILLAGES + "distCode=" + districtCode + "&mandalCode=" + e,
    );
    if (response.data) {
      setVillage(response.data.Villages);
    } else {
      setVillage([]);
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }

  dispatch(hideLoader());
};

export const GetNewMandals = async (e, setMandal, setVillage, dispatch) => {
  dispatch(showLoader());
  try {
    if (!e) {
      setMandal([]);
      setVillage([]);
  dispatch(hideLoader());
      return;
    }
    const response = await myAxios.get(NEWMANDALS + "zoneCode=" + e);
    if (response.data) {
      setMandal(response.data.Regions);
      setVillage([]);
    } else {
      setMandal({});
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }

  dispatch(hideLoader());
};

export const new_dist = [
  { dist_code: "", dist_name: "--select--" },
  { dist_code: 749, dist_name: "NTR" },
  { dist_code: 505, dist_name: "EAST GODAVARI" },
  { dist_code: 503, dist_name: "CHITTOOR" },
  { dist_code: 506, dist_name: "GUNTUR" },
  { dist_code: 748, dist_name: "ELURU" },
  { dist_code: 746, dist_name: "KAKINADA" },
  { dist_code: 523, dist_name: "WEST GODAVARI" },
  { dist_code: 521, dist_name: "VIZIANAGARAM" },
  { dist_code: 502, dist_name: "ANANTAPUR" },
  { dist_code: 753, dist_name: "ANNAMAYYA" },
  { dist_code: 750, dist_name: "BAPATLA" },
  { dist_code: 517, dist_name: "PRAKASAM" },
  { dist_code: 744, dist_name: "ANAKAPALLI" },
  { dist_code: 511, dist_name: "KURNOOL" },
  { dist_code: 752, dist_name: "TIRUPATI" },
  { dist_code: 519, dist_name: "SRIKAKULAM" },
  { dist_code: 510, dist_name: "KRISHNA" },
  { dist_code: 755, dist_name: "NANDYAL" },
  { dist_code: 751, dist_name: "PALNADU" },
  { dist_code: 515, dist_name: "SPSR NELLORE" },
  { dist_code: 520, dist_name: "VISAKHAPATANAM" },
  { dist_code: 754, dist_name: "SRI SATHYA SAI" },
  { dist_code: 743, dist_name: "PARVATHIPURAM MANYAM" },
  { dist_code: 745, dist_name: "ALLURI SITHARAMA RAJU" },
  { dist_code: 747, dist_name: "DR.B.R.AMBEDKAR KONASEEMA" },
  { dist_code: 504, dist_name: "Y.S.R.Kadapa" },
];

export const profileMenu = [
    {
      id: 1,
      title: "Basic Details",
      icon: "person-outline",
      value: "basic_details",
    },
    {
      id: 2,
      title: "Identity & Verification",
      icon: "card-outline",
      value: "identity_verification",
    },
    {
      id: 3,
      title: "Location Information",
      icon: "location-outline",
      value: "location_information",
    },
    {
      id: 4,
      title: "Skill Details",
      icon: "construct-outline",
      value: "skill_details",
    },
    {
      id: 5,
      title: "Experience / Work Experience",
      icon: "briefcase-outline",
      value: "work_experience",
    },
    {
      id: 99,
      title: "Work Details",
      icon: "briefcase-outline",
      value: "work_details",
    },
    {
      id: 6,
      title: "Education",
      icon: "school-outline",
      value: "education",
    },
    {
      id: 7,
      title: "Help",
      icon: "help-circle-outline",
      value: "help",
    },
  ];