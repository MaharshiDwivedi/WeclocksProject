import { Plus } from "lucide-react";

const Meetings = () => {
  return (
    <>
    <div className="h-screen pt-1 flex flex-col absolute mt-[60px]">
      <h2 className="text-4xl font-bold text-center">SMC Meetings</h2>
      </div>
      
      <div className="mb-[400px] flex justify-start pl-4 pr-4 mr-[1200px]"> 

      
        <button className="flex items-center text-white bg-blue-950 pl-2 pr-2 rounded-[3px] pb-1 text-2xl ">
          <Plus className="mr-2" />
          New Meeting
        </button>
      </div>
      </>
    
  );
};

export default Meetings;
