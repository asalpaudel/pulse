import InstitutionProfile from "../../components/InstitutionProfile";
import * as hospitalsApi from "../../api/hospitals";

export default function HospitalProfile() {
  return (
    <InstitutionProfile
      kind="Hospital"
      fetchFn={hospitalsApi.getMyHospitalProfile}
      updateFn={hospitalsApi.updateMyHospitalProfile}
    />
  );
}
