import Tharavopration from "./Tharavopration";
import { Routes, Route } from "react-router-dom";
import Remarks from "./Remarks";

const Tharav = () => {
  return (
    <>
      <Routes>
        {/* Route for Tharavopration */}
        <Route path="/" element={<Tharavopration />} />
        
        {/* Nested route for Remarks */}
        <Route path="remarks" element={<Remarks />} />
      </Routes>
    </>
  );
};

export default Tharav;