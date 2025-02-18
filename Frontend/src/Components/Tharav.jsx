import React from 'react';
import { useParams } from 'react-router-dom';

const Tharav = () => {
  const { index } = useParams();
  // Dummy meeting data (replace with your actual data source)
  const meetings = [
        {
          date: "2025-02-17",
          members: [
            {
              name: "Jayraj Kalsariya",
              role: "Principal Ex (प्राचार्य माजी) | अध्यक्ष",
            },
            {
              name: "Mayur Wagh",
              role: "Parent Representative (पालक प्रतिनिधी) | सदस्य",
            },
            { name: "Nitin Dube", role: "Member" },
          ],
          address: "123 Main St",
          photo: null,
        },
        {
          date: "2025-02-10",
          members: [
            {
              name: "Jayraj Kalsariya",
              role: "Principal Ex (प्राचार्य माजी) | अध्यक्ष",
            },
            {
              name: "Mayur Wagh",
              role: "Parent Representative (पालक प्रतिनिधी) | सदस्य",
            },
          ],
          address: "456 Oak Ave",
          photo: null,
        },
      ];

  const meeting = meetings[index];

  if (!meeting) {
    return <div>Meeting not found</div>;
  }

  return (<>
    <h6 className='text-4xl'>THARAV COMING SOON ....<br/>( I KNOW YE HEADING UPAR AAYEGI, BUT AB BAAD ME DEKHUNGA BYE!, abhi bhot dikkate hain)</h6>
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        Meeting No: {parseInt(index) + 1}
      </h1>
      <div className="mb-2">
        <strong>Date:</strong> {meeting.date}
      </div>
      <div className="mb-2">
        <strong>Address:</strong> {meeting.address}
      </div>
      {/* Add your Tharav (resolutions) content here */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Resolutions:</h2>
        <p>Content of resolutions will be displayed here.</p>
      </div>
    </div>
    </>
  );
};

export default Tharav;
