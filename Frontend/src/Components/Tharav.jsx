import { Routes, Route, useParams, useLocation } from "react-router-dom";
import Remarks from "./Remarks";
import Tharavopration from "./Tharavopration";

const Tharav = () => {
  const params = useParams();
  const meetingNumber = params.index;
  const location = useLocation();
  const meetingId = location.state?.meetingId || "N/A";

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Tharavopration meetingNumber={meetingNumber} meetingId={meetingId} />}
        />

        {/* Nested route for Remarks */}
        <Route
          path="remarks"
          element={<Remarks meetingNumber={meetingNumber} meetingId={meetingId} />}
        />
      </Routes>
    </>
  );
};

export default Tharav;