import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = 'http://103.118.158.188:5000/api/sheet';   // Change back to your IP

const CreateBulkRecords = ({ onClose = () => {}, onRecordsAdded = () => {} }) => {
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkValidating, setBulkValidating] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [validationResults, setValidationResults] = useState([]);
  const [duplicateErrors, setDuplicateErrors] = useState([]);
  const [allRowsValid, setAllRowsValid] = useState(false);
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    valid: 0,
    invalid: 0
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const fileInputRef = useRef(null);

  // Download Template
  const downloadTemplate = () => {
    try {
      const link = document.createElement('a');
      link.href = '/RecordsTemplate/RecordsTemplate.xlsx';
      link.download = 'RecordsTemplate.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage({ text: 'Template downloaded successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: 'Failed to download template', type: 'error' });
    }
  };

  const parseErrorMessage = (msg) => {
    if (!msg || typeof msg !== 'string') return { missing: [], outOfRange: [] };
    const missing = [];
    const outOfRange = [];
    const parts = msg.split('|').map(p => p.trim());
    
    parts.forEach(part => {
      if (part.toLowerCase().includes('required')) {
        const match = part.match(/([A-Za-z\s_]+?)(?:\s+is)?\s+required/i);
        if (match?.[1]) missing.push(match[1].trim());
      } else {
        outOfRange.push(part);
      }
    });
    return { missing, outOfRange };
  };

  // Main File Handler
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset everything
    setBulkFile(file);
    setValidationResults([]);
    setDuplicateErrors([]);
    setAllRowsValid(false);
    setValidationSummary({ total: 0, valid: 0, invalid: 0 });
    setMessage({ text: '', type: '' });
    setBulkValidating(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/bulk-validate`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ 
          text: data.message || `Server Error (${res.status}): ${data.error || 'Check server logs'}`,
          type: 'error' 
        });
        return;
      }

      if (data.success) {
        const processed = (data.validationResults || []).map(r => ({
          ...r,
          rowData: r.rowData || {}
        }));

        setValidationResults(processed);

        const invalidCount = processed.filter(r => r.message?.trim()).length;

        setValidationSummary({
          total: data.totalRows || processed.length,
          valid: data.validCount || processed.length - invalidCount,
          invalid: invalidCount
        });

        if (invalidCount === 0) {
          const traceabilityList = processed
            .map(r => r.rowData?.traceability_no?.trim())
            .filter(Boolean);

          if (traceabilityList.length > 0) {
            await checkBulkTraceabilityUniqueness(traceabilityList, processed);
          } else {
            setAllRowsValid(true);
            setMessage({ text: '✓ All rows are valid and ready to import!', type: 'success' });
          }
        } else {
          setAllRowsValid(false);
          setMessage({ text: `✗ Found ${invalidCount} invalid row(s)`, type: 'error' });
        }
      } else {
        setMessage({ text: data.message || 'Validation failed', type: 'error' });
      }
    } catch (err) {
      console.error('Frontend Error:', err);
      setMessage({ 
        text: 'Failed to connect to server or network error occurred', 
        type: 'error' 
      });
    } finally {
      setBulkValidating(false);
    }
  };

  const checkBulkTraceabilityUniqueness = async (traceabilityNos, processedRows) => {
    try {
      const res = await fetch(`${API_BASE}/check-traceability-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traceability_nos: traceabilityNos })
      });

      const data = await res.json();

      if (data.success) {
        const duplicates = data.duplicates || [];
        const dupErrors = [];

        processedRows.forEach((row, idx) => {
          const trNo = row.rowData?.traceability_no?.trim();
          if (trNo && duplicates.includes(trNo)) {
            dupErrors.push({
              row: row.row || (idx + 2),
              value: trNo,
            });
          }
        });

        setDuplicateErrors(dupErrors);
        const isValid = dupErrors.length === 0;
        setAllRowsValid(isValid);

        if (isValid) {
          setMessage({ text: '✓ All rows are valid and unique — Ready to import!', type: 'success' });
        } else {
          setMessage({ text: `${dupErrors.length} duplicate traceability number(s) found`, type: 'error' });
        }
      }
    } catch (err) {
      console.error(err);
      setAllRowsValid(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile || !allRowsValid) return;

    setBulkUploading(true);
    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const res = await fetch(`${API_BASE}/bulk-records`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          text: data.message || `Successfully imported ${data.insertedCount || 0} record(s)`,
          type: 'success'
        });
        setTimeout(() => {
          onRecordsAdded();
          onClose();
        }, 1500);
      } else {
        setMessage({ 
          text: data.message || data.error || 'Upload failed', 
          type: 'error' 
        });
      }
    } catch (err) {
      setMessage({ text: 'Network error during upload', type: 'error' });
    } finally {
      setBulkUploading(false);
    }
  };

  const clearAll = () => {
    setBulkFile(null);
    setValidationResults([]);
    setDuplicateErrors([]);
    setAllRowsValid(false);
    setValidationSummary({ total: 0, valid: 0, invalid: 0 });
    setMessage({ text: '', type: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center pb-4 border-b sticky top-0 bg-white z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Bulk Upload Test Certificates
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
          <X size={28} className="text-gray-600 hover:text-black" />
        </button>
      </div>

      {message.text && (
        <div className={`p-4 border-l-4 rounded-r-lg font-medium flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' 
                                   : 'bg-red-50 border-red-600 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="text-center">
        <button onClick={downloadTemplate} className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium shadow transition">
          <Download size={20} /> Download Template (.xlsx)
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gray-50 hover:border-blue-400 transition">
        <Upload size={72} className="mx-auto text-gray-400 mb-6" />
        <p className="text-2xl font-medium mb-2">Drop your file here or click to browse</p>
        <p className="text-gray-500 mb-8">Only .xlsx and .xls files are supported</p>

        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.xls"
          onChange={handleFileSelected}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={bulkValidating}
          className={`px-12 py-5 rounded-xl text-white font-bold text-lg shadow-md transition min-w-[280px] ${
            bulkValidating ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {bulkValidating ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" size={24} /> Validating...
            </span>
          ) : (
            'Select Excel File'
          )}
        </button>

        {bulkFile && (
          <div className="mt-6 text-lg font-medium text-green-700">
            Selected: <span className="font-bold">{bulkFile.name}</span>
          </div>
        )}
      </div>

      {/* Validation Summary */}
      {validationResults.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-xl border">
          <h3 className="text-xl font-bold mb-4">Validation Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 text-sm">Total Rows</p>
              <p className="text-3xl font-bold">{validationSummary.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 text-sm">Valid</p>
              <p className="text-3xl font-bold text-green-600">{validationSummary.valid}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 text-sm">Invalid</p>
              <p className="text-3xl font-bold text-red-600">{validationSummary.invalid}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t sticky bottom-0 bg-white py-4">
        <button onClick={clearAll} className="px-8 py-3 border border-gray-400 rounded-lg hover:bg-gray-100">
          Clear All
        </button>

        <button
          onClick={handleBulkUpload}
          disabled={bulkUploading || !allRowsValid || !bulkFile}
          className={`min-w-[260px] py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition ${
            allRowsValid && bulkFile && !bulkUploading
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          {bulkUploading && <Loader2 className="animate-spin" size={24} />}
          {bulkUploading ? 'Uploading...' : allRowsValid ? 'Upload Valid Records' : 'Fix Errors First'}
        </button>
      </div>
    </div>
  );
};

export default CreateBulkRecords;

