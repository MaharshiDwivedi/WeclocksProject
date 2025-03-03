import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SMCSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schools-with-smc');
        setSchools(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schools:', err);
        setError('Failed to fetch schools');
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Schools with SMC Meetings</h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School ID
              </th>
              <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schools.map((school) => (
              <tr key={school.school_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {school.school_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {school.school_name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SMCSchools;