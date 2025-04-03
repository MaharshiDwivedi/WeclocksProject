import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DownloadIcon, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { generateAOFinancialReportPDF } from './AOGenPDF';

const AOGenReport = ({ onClose }) => {
  const { t } = useTranslation();
  const [financialYear, setFinancialYear] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  const financialYearOptions = [
    { value: '', label: t('-- Select Year --'), disabled: true },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026' },
  ];

  const generateReport = useCallback(async (year) => {
    if (!year) return;

    setIsGenerating(true);

    Swal.fire({
      title: t('Generating report...'),
      text: t('Please wait while we generate your report'),
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const newPdfBlob = await generateAOFinancialReportPDF(year);
      setPdfBlob(newPdfBlob);
      
      Swal.fire({
        icon: 'success',
        title: t('Success'),
        text: t('Report generated successfully'),
        timer:1000
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || t('Failed to generate report');
      Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: errorMessage,
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [t]);

  useEffect(() => {
    if (financialYear) {
      generateReport(financialYear);
    }
  }, [financialYear, generateReport]);

  const handleDownload = useCallback(() => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ITDP_AllSchools_Report_${financialYear.replace(/-/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pdfBlob, financialYear]);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-[90%] sm:max-w-md shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              {t('Generate All Schools Financial Report')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
            aria-label={t('Close')}
            disabled={isGenerating}
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="mb-5">
          <label htmlFor="financial-year" className="block text-sm font-medium text-gray-700 mb-2">
            {t('Financial Year')}
          </label>
          <select
            id="financial-year"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white hover:border-gray-300 transition-colors"
            disabled={isGenerating}
          >
            {financialYearOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors text-sm border border-gray-200"
            disabled={isGenerating}
          >
            {t('Cancel')}
          </button>

          <button
            onClick={handleDownload}
            disabled={!pdfBlob || isGenerating}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm shadow-sm hover:shadow-md"
          >
            <DownloadIcon size={16} className="sm:w-4 sm:h-4" />
            {t('Download Report')}
          </button>
        </div>
      </div>
    </div>
  );
};

AOGenReport.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default AOGenReport;