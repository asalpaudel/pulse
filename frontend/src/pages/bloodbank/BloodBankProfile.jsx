import InstitutionProfile from "../../components/InstitutionProfile";
import * as bloodBanksApi from "../../api/bloodbanks";

export default function BloodBankProfile() {
  return (
    <InstitutionProfile
      kind="Blood Bank"
      fetchFn={bloodBanksApi.getMyBloodBankProfile}
      updateFn={bloodBanksApi.updateMyBloodBankProfile}
    />
  );
}
