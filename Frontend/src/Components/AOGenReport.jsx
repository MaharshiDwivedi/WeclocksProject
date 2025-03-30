import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadIcon, X } from 'lucide-react';
import { generateAOFinancialReportPDF } from './AOGenPDF';
import axios from 'axios';

const AOGenReport = ({ onClose }) => {
  const { t } = useTranslation();
  const [financialYear, setFinancialYear] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const financialYearOptions = [
    { value: '', label: t('-- Select Year --'), disabled: true },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026' },
  ];

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleGenerate = useCallback(async () => {
    if (!financialYear) {
      setError(t('Please select financial year'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusMessage(t('Generating report...'));

    try {
      const pdfBlob = await generateAOFinancialReportPDF(financialYear);
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
      setReportGenerated(true);
      setStatusMessage(t('Report generated successfully'));
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || t('Failed to generate report');
      setError(errorMessage);
      setStatusMessage('');
    } finally {
      setIsGenerating(false);
    }
  }, [financialYear, t]);

  const handleDownload = useCallback(() => {
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `ITDP_AllSchools_Report_${financialYear.replace(/-/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  }, [downloadUrl, financialYear, onClose]);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {t('Generate All Schools Financial Report')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={t('Close')}
            disabled={isGenerating}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="financial-year" className="block text-sm font-medium text-gray-700 mb-2">
            {t('Financial Year')}
          </label>
          <select
            id="financial-year"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            disabled={isGenerating || reportGenerated}
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

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm" role="alert">
            {error}
          </div>
        )}

        {statusMessage && !error && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded-md text-sm" role="status">
            {statusMessage}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            disabled={isGenerating}
          >
            {t('Cancel')}
          </button>

          {reportGenerated ? (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <DownloadIcon size={18} />
              {t('Download Report')}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block animate-spin">↻</span>
                  {t('Generating...')}
                </>
              ) : (
                t('Generate Report')
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AOGenReport;