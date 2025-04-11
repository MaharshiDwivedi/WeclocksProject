import { Routes, Route, useParams, useLocation, Navigate } from "react-router-dom";
import Remarks from "./Remarks";
import Tharavopration from "./Tharavopration";

const Tharav = () => {
  const params = useParams();
  const meetingNumber = params.index;
  const location = useLocation();
  
  // Get the state from location or use default values
  const state = location.state || {};
  const meetingId = state.meetingId || "N/A";
  const tharavData = state.tharavData || {};

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Tharavopration 
              meetingNumber={meetingNumber} 
              meetingId={meetingId} 
              tharavData={tharavData}
            />
          }
        />
        <Route
          path="remarks"
          element={
            location.state ? 
              <Remarks 
                meetingNumber={meetingNumber} 
                meetingId={meetingId} 
                {...location.state}
              /> : 
              <Navigate to={`/home/meetings/tharav/${meetingNumber}`} />
          }
        />
      </Routes>
    </>
  );
};

export default Tharav;