// CreateBulkRecords.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Download } from 'lucide-react';

const API_BASE = 'http://103.118.158.113.188:5000/api/sheet';

const CreateBulkRecords = ({ onClose = () => {}, onRecordsAdded = () => {} }) => {
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkValidating, setBulkValidating] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [validationResults, setValidationResults] = useState([]);      // format + range errors
  const [duplicateErrors, setDuplicateErrors] = useState([]);         // ← NEW: traceability duplicates
  const [allRowsValid, setAllRowsValid] = useState(false);
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    valid: 0,
    invalid: 0
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const fileInputRef = useRef(null);
  const chemicalComponents = ['c', 'cr', 'ni', 'mo', 'mn', 'si', 's', 'p', 'cu', 'fe', 'co'];

  // ─── Download template ────────────────────────────────────────
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

  // ─── File selected → validate format + range ──────────────────
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setValidationResults([]);
    setDuplicateErrors([]);
    setAllRowsValid(false);
    setValidationSummary({ total: 0, valid: 0, invalid: 0 });
    setBulkValidating(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/bulk-validate`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const processed = (data.validationResults || []).map(r => ({
          ...r,
          rowData: r.rowData || {}
        }));

        setValidationResults(processed);

        const formatInvalidCount = processed.filter(r => r.message?.trim()).length;

        setValidationSummary({
          total: data.totalRows || processed.length,
          valid: data.validCount || processed.length - formatInvalidCount,
          invalid: data.invalidCount || formatInvalidCount
        });

        // If there are format errors → stop here
        if (formatInvalidCount > 0) {
          setAllRowsValid(false);
          return;
        }

        // Collect traceability numbers from valid rows
        const traceabilityList = processed
          .filter(r => !r.message?.trim())           // only valid format rows
          .map(r => r.rowData?.traceability_no || '')
          .filter(Boolean);

        if (traceabilityList.length === 0) {
          setAllRowsValid(true); // no traceability → auto valid
          return;
        }

        // Check duplicates in DB
        await checkBulkTraceabilityUniqueness(traceabilityList, processed);
      } else {
        setMessage({ text: data.message || 'Validation failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to validate file', type: 'error' });
    } finally {
      setBulkValidating(false);
    }
  };

  // ─── Check uniqueness for all traceability numbers ────────────
  const checkBulkTraceabilityUniqueness = async (nos, processedRows) => {
    try {
      const res = await fetch(`${API_BASE}/check-traceability-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traceability_nos: nos })
      });

      const data = await res.json();

      if (data.success) {
        const duplicates = data.duplicates || [];

        // Map duplicates back to row numbers
        const dupErrors = [];
        processedRows.forEach((row, idx) => {
          const trNo = row.rowData?.traceability_no?.trim();
          if (trNo && duplicates.includes(trNo)) {
            dupErrors.push({
              row: row.row || (idx + 2),
              value: trNo,
              message: `Duplicate traceability_no: ${trNo} already exists`
            });
          }
        });

        setDuplicateErrors(dupErrors);
        setAllRowsValid(dupErrors.length === 0);
      } else {
        setDuplicateErrors([]);
        setAllRowsValid(false);
        setMessage({ text: 'Failed to check uniqueness', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setDuplicateErrors([]);
      setAllRowsValid(false);
      setMessage({ text: 'Uniqueness check failed', type: 'error' });
    }
  };

  // ─── Upload only if everything is valid ───────────────────────
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
          text: `Imported ${data.insertedCount || 0} record(s) successfully`,
          type: 'success'
        });
        onRecordsAdded();
        // Reset form
        setBulkFile(null);
        setValidationResults([]);
        setDuplicateErrors([]);
        setAllRowsValid(false);
        setValidationSummary({ total: 0, valid: 0, invalid: 0 });
      } else {
        setMessage({ text: data.message || 'Upload failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error during upload', type: 'error' });
    } finally {
      setBulkUploading(false);
    }
  };

  // ─── Helper to parse existing validation messages ─────────────
  const parseErrorMessage = (msg) => {
    if (!msg || typeof msg !== 'string') return { missing: [], outOfRange: [] };
    const missing = [];
    const outOfRange = [];
    msg.split('|').map(p => p.trim()).forEach(part => {
      if (part.toLowerCase().includes('required')) {
        const m = part.match(/([A-Za-z\s]+?)(?:\s+is)?\s+required/i);
        if (m?.[1]) missing.push(m[1].trim());
      } else if (part.includes('outside') || part.includes('out of range')) {
        const m = part.match(/([A-Za-z]+):\s*([\d.]+)\s*(?:is )?outside.*\(([\d.-]+)\s*[-–—]\s*([\d.-]+)\)/i);
        if (m) {
          outOfRange.push({
            comp: m[1].toUpperCase(),
            value: m[2],
            min: m[3],
            max: m[4]
          });
        }
      }
    });
    return { missing, outOfRange };
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Bulk Upload Test Certificates
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={28} className="text-gray-600 hover:text-black" />
        </button>
      </div>

      {message.text && (
        <div className={`p-4 border-l-4 rounded-r-lg font-medium ${
          message.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Download Template */}
      <div className="text-center">
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium shadow transition"
        >
          <Download size={20} /> Download Template (.xlsx)
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gray-50">
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
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={bulkValidating}
          className={`px-12 py-5 rounded-xl text-white font-bold text-lg shadow-md transition min-w-[280px] ${
            bulkValidating ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
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
            File selected: <span className="font-bold">{bulkFile.name}</span>
          </div>
        )}
      </div>

      {/* Validation + Duplicates Results */}
      {(validationResults.length > 0 || duplicateErrors.length > 0) && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="text-xl font-bold mb-4">Validation Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-gray-600">Total rows</p>
                <p className="text-3xl font-bold">{validationSummary.total}</p>
              </div>
              <div>
                <p className="text-gray-600">Format Valid</p>
                <p className={`text-3xl font-bold ${validationSummary.invalid > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {validationSummary.valid}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Unique Traceability</p>
                <p className={`text-3xl font-bold ${duplicateErrors.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {validationSummary.total - duplicateErrors.length}
                </p>
              </div>
            </div>
          </div>

          {/* Format + Range Errors */}
          {validationResults.map((item, idx) => {
            if (!item.message?.trim()) return null;
            const { missing, outOfRange } = parseErrorMessage(item.message);

            return (
              <div key={`format-${idx}`} className="border rounded-lg overflow-hidden bg-red-50/30 shadow-sm">
                <div className="px-6 py-4 bg-red-50 flex justify-between items-center">
                  <h4 className="font-bold text-lg text-red-900">Row {item.row || (idx + 2)} — Format/Range Error</h4>
                  <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-semibold">
                    INVALID
                  </span>
                </div>
                <div className="p-6">
                  {missing.length > 0 && (
                    <div className="mb-6">
                      <p className="font-semibold text-red-800 mb-2">Missing required fields:</p>
                      <ul className="list-disc pl-6 space-y-1 text-red-700">
                        {missing.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {outOfRange.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Component</th>
                            <th className="px-4 py-3 text-left font-semibold">Your Value</th>
                            <th className="px-4 py-3 text-left font-semibold">Allowed Range</th>
                            <th className="px-4 py-3 text-center font-semibold w-20">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {outOfRange.map((err, i) => (
                            <tr key={i} className="hover:bg-red-50">
                              <td className="px-4 py-3 font-medium uppercase">{err.comp}</td>
                              <td className="px-4 py-3 font-mono">{err.value}</td>
                              <td className="px-4 py-3 font-mono text-gray-700">{err.min} – {err.max}</td>
                              <td className="px-4 py-3 text-center text-2xl text-red-600 font-black">✗</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Duplicate Traceability Errors */}
          {duplicateErrors.map((err, idx) => (
            <div key={`dup-${idx}`} className="border rounded-lg overflow-hidden bg-orange-50/40 shadow-sm">
              <div className="px-6 py-4 bg-orange-50 flex justify-between items-center">
                <h4 className="font-bold text-lg text-orange-900">
                  Row {err.row} — Duplicate Traceability No
                </h4>
                <span className="px-4 py-1.5 bg-orange-600 text-white rounded-full text-sm font-semibold">
                  DUPLICATE
                </span>
              </div>
              <div className="p-6 text-orange-800">
                <p className="font-medium">
                  Traceability No <strong className="font-mono">{err.value}</strong> already exists in the database.
                </p>
                <p className="mt-2 text-sm">Please correct this value or remove the row.</p>
              </div>
            </div>
          ))}

          {validationResults.every(r => !r.message?.trim()) && duplicateErrors.length === 0 && (
            <div className="text-center py-12 text-2xl font-bold text-green-700 bg-green-50 rounded-xl border border-green-200">
              ✓ All rows are valid & unique — ready to import!
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
        <button
          onClick={() => {
            setBulkFile(null);
            setValidationResults([]);
            setDuplicateErrors([]);
            setAllRowsValid(false);
            setValidationSummary({ total: 0, valid: 0, invalid: 0 });
            setMessage({ text: '', type: '' });
          }}
          className="px-8 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 font-medium"
        >
          Clear All
        </button>

        <button
          onClick={handleBulkUpload}
          disabled={bulkUploading || !allRowsValid || !bulkFile}
          className={`min-w-[260px] py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow transition ${
            allRowsValid && bulkFile && !bulkUploading
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              : 'bg-gray-400 text-white cursor-not-allowed opacity-70'
          }`}
        >
          {bulkUploading && <Loader2 className="animate-spin" size={24} />}
          {allRowsValid ? 'Upload Valid Records' : 'Fix Errors First'}
        </button>
      </div>
    </div>
  );
};

export default CreateBulkRecords;