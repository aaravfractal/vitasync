import { EmergencyNearby } from "./nearby";
import { EmergencyActions, EmergencyFooter } from "./actions";

export default function Emergency() {
  return <EmergencyNearby actions={<EmergencyActions />} footer={<EmergencyFooter />} />;
}
