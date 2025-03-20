import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import DataTable from 'react-data-table-component';

const SMCSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    const fetchSchools = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schools-with-smc', {
          timeout: 5000 // Add timeout to prevent hanging
        });
        
        if (mounted) {
          setSchools(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching schools:', err);
          setError(err.response?.data?.message || 'Failed to fetch schools');
          setLoading(false);
        }
      }
    };
    fetchSchools();
    // Cleanup function to prevent memory leaks
    return () => {
      mounted = false;
    };
  }, []);

  // Define columns for DataTable
  const columns = [
    {
      name: t('schoolId'),
      selector: row => row.school_id,
      sortable: true,
    },
    {
      name: t('schoolName'),
      selector: row => row.school_name,
      sortable: true,
      wrap: true,
      grow: 2,
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    headCells: {
      style: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      },
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#f3f4f6',
          transition: 'all 0.2s',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  // Empty state
  if (schools.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        {t('noSchoolsFound')}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 realfont2">
        {t("Schools with SMC Meetings")}
      </h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={schools}
          customStyles={customStyles}
          pagination
          highlightOnHover
          responsive
          striped
          noHeader
        />
      </div>
    </div>
  );
};

export default SMCSchools;