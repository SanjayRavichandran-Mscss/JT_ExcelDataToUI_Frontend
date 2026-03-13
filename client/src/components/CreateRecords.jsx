// import React, { useState, useEffect, useRef } from 'react';
// import { Plus, Edit, Trash2, X, Save, Loader2, Database, Beaker, Search, RotateCcw, Download, Upload } from 'lucide-react';
// import Select from 'react-select';

// const API_BASE = 'http://localhost:5000/api/sheet';

// const CreateRecords = () => {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   const [materialGrades, setMaterialGrades] = useState([]);
//   const [limits, setLimits] = useState({});

//   const [filters, setFilters] = useState({
//     tc_no: '',
//     heat_no: '',
//     size: '',
//     material_grade: ''
//   });

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [formData, setFormData] = useState({
//     tc_no: '', heat_no: '', size: '',
//     c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: '',
//     material_grade: ''
//   });

//   // Bulk states
//   const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
//   const [bulkFile, setBulkFile] = useState(null);
//   const [bulkValidating, setBulkValidating] = useState(false);
//   const [bulkUploading, setBulkUploading] = useState(false);
//   const [validationResults, setValidationResults] = useState([]);
//   const [allRowsValid, setAllRowsValid] = useState(false);
//   const [validationSummary, setValidationSummary] = useState({ total: 0, valid: 0, invalid: 0 });
//   const [componentCounts, setComponentCounts] = useState({ valid: 0, invalid: 0 });
//   const fileInputRef = useRef(null);

//   // All chemical components
//   const chemicalComponents = ['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Cu', 'Fe', 'Co'];

//   useEffect(() => {
//     fetchRecords();
//     fetchMaterialGrades();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [records, filters]);

//   useEffect(() => {
//     if (isModalOpen && formData.material_grade) {
//       fetchLimitsForGrade(formData.material_grade);
//     } else if (isModalOpen) {
//       setLimits({});
//     }
//   }, [formData.material_grade, isModalOpen]);

//   const fetchMaterialGrades = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/material-grades`);
//       const data = await res.json();
//       if (data.success) setMaterialGrades(data.grades || []);
//     } catch (err) {
//       console.error('Failed to load material grades:', err);
//     }
//   };

//   const fetchLimitsForGrade = async (grade) => {
//     try {
//       const res = await fetch(`${API_BASE}/limits-by-grade?material_grade=${encodeURIComponent(grade)}`);
//       const data = await res.json();
//       if (data.success) {
//         setLimits(data.limits || {});
//       } else {
//         setLimits({});
//       }
//     } catch (err) {
//       console.error('Failed to load limits:', err);
//       setLimits({});
//     }
//   };

//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/records`);
//       const data = await res.json();
//       if (data.success) {
//         setRecords(data.records || []);
//         setFilteredRecords(data.records || []);
//       }
//     } catch (err) {
//       setMessage({ text: 'Connection Error', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let result = [...records];
//     if (filters.tc_no.trim()) result = result.filter(r => r.tc_no?.toLowerCase().includes(filters.tc_no.toLowerCase().trim()));
//     if (filters.heat_no.trim()) result = result.filter(r => r.heat_no?.toLowerCase().includes(filters.heat_no.toLowerCase().trim()));
//     if (filters.size.trim()) result = result.filter(r => r.size?.toLowerCase().includes(filters.size.toLowerCase().trim()));
//     if (filters.material_grade.trim()) result = result.filter(r => r.material_grade?.toLowerCase().includes(filters.material_grade.toLowerCase().trim()));
//     setFilteredRecords(result);
//   };

//   const resetFilters = () => {
//     setFilters({ tc_no: '', heat_no: '', size: '', material_grade: '' });
//   };

//   // Single record handlers
//   const openModal = (record = null) => {
//     if (record) {
//       setEditingRecord(record);
//       setFormData({ ...record });
//     } else {
//       setEditingRecord(null);
//       setFormData({
//         tc_no: '', heat_no: '', size: '',
//         c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: '',
//         material_grade: ''
//       });
//       setLimits({});
//     }
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     setLimits({});
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleMaterialGradeChange = (selected) => {
//     setFormData(prev => ({
//       ...prev,
//       material_grade: selected ? selected.label : ''
//     }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const fields = ['c','cr','ni','mo','mn','si','s','p','cu','fe','co'];
//     for (const field of fields) {
//       const val = formData[field] ? parseFloat(formData[field]) : null;
//       const min = limits[`${field}_min`] ? parseFloat(limits[`${field}_min`]) : null;
//       const max = limits[`${field}_max`] ? parseFloat(limits[`${field}_max`]) : null;

//       if (val !== null && min !== null && max !== null && (val < min || val > max)) {
//         setMessage({
//           text: `${field.toUpperCase()} must be between ${min} and ${max} for ${formData.material_grade}`,
//           type: 'error'
//         });
//         setLoading(false);
//         return;
//       }
//     }

//     try {
//       const url = editingRecord
//         ? `${API_BASE}/records/${editingRecord.id}`
//         : `${API_BASE}/records`;
//       const method = editingRecord ? 'PUT' : 'POST';

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setMessage({ text: `Record ${editingRecord ? 'Updated' : 'Created'} Successfully`, type: 'success' });
//         closeModal();
//         fetchRecords();
//         setTimeout(() => setMessage({ text: '', type: '' }), 4000);
//       } else {
//         setMessage({ text: data.message || 'Save failed', type: 'error' });
//       }
//     } catch (err) {
//       setMessage({ text: 'Operation failed – network error', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this record?')) return;
//     try {
//       const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
//       if (res.ok) {
//         fetchRecords();
//       } else {
//         setMessage({ text: 'Delete failed – server error', type: 'error' });
//       }
//     } catch (err) {
//       setMessage({ text: 'Delete failed – network error', type: 'error' });
//     }
//   };

//   // Updated downloadTemplate function to download from assets folder
//   const downloadTemplate = () => {
//     try {
//       // Create a link element
//       const link = document.createElement('a');
      
//       // Path to your template file in assets
//       // Adjust this path based on your project structure
//       const templatePath = '/RecordsTemplate/RecordsTemplate.xlsx';
      
//       link.href = templatePath;
//       link.download = 'RecordsTemplate.xlsx';
      
//       // Append to body, click, and remove
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//       setMessage({ text: 'Template downloaded successfully', type: 'success' });
//       setTimeout(() => setMessage({ text: '', type: '' }), 3000);
//     } catch (error) {
//       console.error('Error downloading template:', error);
//       setMessage({ text: 'Failed to download template', type: 'error' });
//     }
//   };

// const handleFileSelected = async (e) => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   setBulkFile(file);
//   setValidationResults([]);
//   setAllRowsValid(false);
//   setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//   setComponentCounts({ valid: 0, invalid: 0 });
//   setBulkValidating(true);

//   const formData = new FormData();
//   formData.append('file', file);

//   try {
//     const res = await fetch(`${API_BASE}/bulk-validate`, {
//       method: 'POST',
//       body: formData
//     });

//     const data = await res.json();

//     if (res.ok && data.success) {
//       const processed = (data.validationResults || []).map(r => ({
//         ...r,
//         rowData: r.rowData || r.data || {}
//       }));

//       setValidationResults(processed);
//       setAllRowsValid(data.allValid || false);
//       setValidationSummary({
//         total: data.totalRows || 0,
//         valid: data.validCount || 0,
//         invalid: data.invalidCount || 0
//       });

//       // Count valid/invalid components
//       let v = 0, inv = 0;
//       processed.forEach(item => {
//         if (item.status === 'success') {
//           v += 11;
//         } else if (item.message) {
//           const errors = (item.message.match(/outside allowed range/g) || []).length;
//           inv += errors;
//           v += (11 - errors);
//         }
//       });
//       setComponentCounts({ valid: v, invalid: inv });
//     }
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setBulkValidating(false);
//   }
// };

//   const handleBulkUpload = async () => {
//     if (!bulkFile || !allRowsValid) {
//       setMessage({ text: 'Cannot upload: file missing or validation failed', type: 'error' });
//       return;
//     }

//     setBulkUploading(true);
//     setMessage({ text: '', type: '' });

//     const formData = new FormData();
//     formData.append('file', bulkFile);

//     try {
//       const res = await fetch(`${API_BASE}/bulk-records`, {
//         method: 'POST',
//         body: formData
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setMessage({
//           text: `Successfully imported ${data.insertedCount} record(s)`,
//           type: 'success'
//         });

//         await fetchRecords();

//         setIsBulkModalOpen(false);
//         setBulkFile(null);
//         setValidationResults([]);
//         setAllRowsValid(false);
//         setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//         setComponentCounts({ valid: 0, invalid: 0 });
//       } else {
//         setMessage({
//           text: data.message || 'Upload failed – check server logs',
//           type: 'error'
//         });
//       }
//     } catch (err) {
//       console.error('Upload network error:', err);
//       setMessage({ text: `Network error: ${err.message}`, type: 'error' });
//     } finally {
//       setBulkUploading(false);
//     }
//   };

//   // Function to parse error message and extract component details
//   const parseComponentError = (errorMsg) => {
//     const match = errorMsg.match(/([\d.]+) is outside allowed range \(([\d.-]+) – ([\d.-]+)\)/);
//     if (match) {
//       return {
//         value: match[1],
//         min: match[2],
//         max: match[3]
//       };
//     }
//     return null;
//   };

//   const gradeOptions = materialGrades.map(grade => ({
//     value: grade.id,
//     label: grade.material_grade
//   }));

//   const selectedGrade = gradeOptions.find(opt => opt.label === formData.material_grade) || null;

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-10">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-gray-800 pb-8 gap-6">
//           <div className="text-center md:text-left">
//             <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
//               <Database size={24} className="text-gray-700" />
//               <span className="text-sm font-bold uppercase tracking-widest text-gray-600">Inventory Ledger</span>
//             </div>
//             <h1 className="text-4xl font-extrabold tracking-tight text-black">Test Certificate Records</h1>
//           </div>

//           <div className="flex flex-wrap gap-4">
//             <button
//               onClick={downloadTemplate}
//               className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-700 transition shadow cursor-pointer"
//             >
//               <Download size={18} /> Download Template
//             </button>

//             <button
//               onClick={() => setIsBulkModalOpen(true)}
//               className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition shadow cursor-pointer"
//             >
//               <Upload size={18} /> Bulk Upload Excel
//             </button>

//             <button
//               onClick={() => openModal()}
//               className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md font-bold uppercase tracking-wide hover:bg-gray-900 transition shadow-lg cursor-pointer"
//             >
//               <Plus size={18} /> Add New Entry
//             </button>
//           </div>
//         </div>

//         {/* Message */}
//         {message.text && (
//           <div className={`mb-6 p-4 border-l-4 font-medium rounded-r-lg ${
//             message.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'
//           }`}>
//             {message.text}
//           </div>
//         )}

//         {/* Filter Section */}
//         <div className="mb-8 bg-white p-6 rounded-xl border shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2 text-gray-800">
//               <Search size={20} />
//               <h3 className="text-lg font-bold uppercase tracking-wide">Filter Records</h3>
//             </div>
//             <button
//               onClick={resetFilters}
//               className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black cursor-pointer"
//             >
//               <RotateCcw size={16} /> Reset
//             </button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {['tc_no', 'heat_no', 'size', 'material_grade'].map(key => (
//               <div key={key} className="relative">
//                 <input
//                   name={key}
//                   value={filters[key]}
//                   onChange={handleFilterChange}
//                   placeholder={`Filter ${key.replace('_', ' ').toUpperCase()}`}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black cursor-text"
//                 />
//                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1400px] text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-100 border-b">
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">TC No.</th>
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Heat No.</th>
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Size</th>
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Grade</th>
//                   <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">Chemical Composition (%)</th>
//                   <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {loading ? (
//                   <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></td></tr>
//                 ) : filteredRecords.length === 0 ? (
//                   <tr><td colSpan={6} className="py-20 text-center text-gray-500">
//                     {records.length === 0 ? "No records yet. Add or upload some." : "No matching records found."}
//                   </td></tr>
//                 ) : filteredRecords.map(r => (
//                   <tr key={r.id} className="hover:bg-gray-50">
//                     <td className="py-4 px-6 font-medium">{r.tc_no || '-'}</td>
//                     <td className="py-4 px-6">{r.heat_no || '-'}</td>
//                     <td className="py-4 px-6">{r.size || '-'}</td>
//                     <td className="py-4 px-6 font-medium">{r.material_grade || '-'}</td>
//                     <td className="py-4 px-6">
//                       <div className="space-y-2 text-xs font-mono">
//                         <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
//                           <div><b>C:</b> {r.c ?? '0.0000'}</div>
//                           <div><b>Cr:</b> {r.cr ?? '0.0000'}</div>
//                           <div><b>Ni:</b> {r.ni ?? '0.0000'}</div>
//                           <div><b>Mo:</b> {r.mo ?? '0.0000'}</div>
//                         </div>
//                         <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
//                           <div><b>Mn:</b> {r.mn ?? '0.0000'}</div>
//                           <div><b>Si:</b> {r.si ?? '0.0000'}</div>
//                           <div><b>S:</b> {r.s ?? '0.0000'}</div>
//                           <div><b>P:</b> {r.p ?? '0.0000'}</div>
//                         </div>
//                         <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
//                           <div><b>Cu:</b> {r.cu ?? '0.0000'}</div>
//                           <div><b>Fe:</b> {r.fe ?? '0.0000'}</div>
//                           <div><b>Co:</b> {r.co ?? '0.0000'}</div>
//                           <div className="opacity-0">-</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex justify-center gap-3">
//                         <button 
//                           onClick={() => openModal(r)} 
//                           className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
//                         >
//                           EDIT
//                         </button>
//                         <button 
//                           onClick={() => handleDelete(r.id)} 
//                           className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
//                         >
//                           DELETE
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Single Record Modal */}
//    {/* Single Record Modal - Full screen friendly + Material Grade first + per-field error */}
// {isModalOpen && (
//   <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
//     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl min-h-[80vh] md:min-h-auto max-h-[95vh] flex flex-col border border-gray-200">
      
//       {/* Header */}
//       <div className="flex justify-between items-center p-5 md:p-6 border-b bg-gray-50 rounded-t-2xl">
//         <h2 className="text-xl md:text-2xl font-bold text-gray-900">
//           {editingRecord ? 'Edit Record' : 'Add New Record'}
//         </h2>
//         <button
//           onClick={closeModal}
//           className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer"
//         >
//           <X size={28} className="text-gray-700 hover:text-black" />
//         </button>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 md:p-6">
//         <div className="space-y-6">

//           {/* Material Grade - Moved to FIRST position */}
//           <div className="bg-gray-50 p-5 rounded-xl border">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Material Grade <span className="text-red-600">*</span>
//             </label>
//             <Select
//               options={gradeOptions}
//               value={selectedGrade}
//               onChange={handleMaterialGradeChange}
//               placeholder="Select Material Grade"
//               className="basic-select"
//               classNamePrefix="select"
//               isClearable
//               isSearchable
//             />
//           </div>

//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 TC No. <span className="text-red-600">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="tc_no"
//                 value={formData.tc_no}
//                 onChange={handleInputChange}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Heat No. <span className="text-red-600">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="heat_no"
//                 value={formData.heat_no}
//                 onChange={handleInputChange}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Size <span className="text-red-600">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="size"
//                 value={formData.size}
//                 onChange={handleInputChange}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Chemical Composition */}
//           <div className="bg-gray-50 p-5 rounded-xl border">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Chemical Composition (%)
//             </h3>

//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//               {['c', 'cr', 'ni', 'mo', 'mn', 'si', 's', 'p', 'cu', 'fe', 'co'].map((elem) => {
//                 const label = elem.toUpperCase();
//                 const min = limits[`${elem}_min`];
//                 const max = limits[`${elem}_max`];
//                 const value = formData[elem] ? parseFloat(formData[elem]) : null;

//                 let error = null;
//                 if (value !== null && min !== undefined && max !== undefined) {
//                   if (value < parseFloat(min) || value > parseFloat(max)) {
//                     error = `Out of range (${min} – ${max})`;
//                   }
//                 }

//                 return (
//                   <div key={elem} className="space-y-1">
//                     <label className="block text-sm font-medium text-gray-700 uppercase">
//                       {label}
//                     </label>
//                     <input
//                       type="number"
//                       step="0.0001"
//                       name={elem}
//                       value={formData[elem] ?? ''}
//                       onChange={handleInputChange}
//                       placeholder={min && max ? `${min} – ${max}` : '-'}
//                       className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
//                         error
//                           ? 'border-red-500 bg-red-50 text-red-800'
//                           : 'border-gray-300'
//                       }`}
//                     />
//                     {error && (
//                       <p className="text-xs text-red-600 font-medium mt-1">
//                         {error}
//                       </p>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* Form Footer */}
//         <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-end gap-4 sticky bottom-0 bg-white py-4 px-2 -mx-5 md:-mx-6">
//           <button
//             type="button"
//             onClick={closeModal}
//             className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 min-w-[140px]"
//           >
//             {loading && <Loader2 className="animate-spin" size={18} />}
//             {editingRecord ? 'Update Record' : 'Save Record'}
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// )}

//         {/* Bulk Upload Modal */}
//     {/* Bulk Upload Modal */}
// {isBulkModalOpen && (
//   <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-0 md:p-6">
//     <div className="bg-white w-full h-full md:max-w-6xl md:max-h-[95vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
      
//       {/* Header */}
//       <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
//         <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Upload Multiple Records</h2>
//         <button
//           onClick={() => {
//             setIsBulkModalOpen(false);
//             setBulkFile(null);
//             setValidationResults([]);
//             setAllRowsValid(false);
//             setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//             setComponentCounts({ valid: 0, invalid: 0 });
//           }}
//           className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer"
//         >
//           <X size={32} className="text-gray-700 hover:text-black" />
//         </button>
//       </div>

//       {/* Content */}
//       <div className="flex-1 p-6 md:p-8 overflow-y-auto">
//         <div className="space-y-10">

//           {/* File Upload Area */}
//           <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 md:p-16 text-center bg-gray-50">
//             <Upload size={64} className="mx-auto text-gray-400 mb-6" />
//             <p className="text-xl md:text-2xl font-medium mb-3">Select or drop your Excel file here</p>
//             <p className="text-gray-500 mb-8">Supported formats: .xlsx, .xls</p>

//             <input
//               type="file"
//               ref={fileInputRef}
//               accept=".xlsx,.xls"
//               onChange={handleFileSelected}
//               className="hidden"
//             />

//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               disabled={bulkValidating}
//               className={`px-10 py-4 rounded-xl text-white font-medium text-lg cursor-pointer transition shadow-md ${
//                 bulkValidating 
//                   ? 'bg-gray-400 cursor-wait' 
//                   : 'bg-blue-600 hover:bg-blue-700'
//               }`}
//             >
//               {bulkValidating ? (
//                 <span className="flex items-center gap-3">
//                   <Loader2 className="animate-spin" size={24} /> Validating...
//                 </span>
//               ) : (
//                 'Choose Excel File'
//               )}
//             </button>

//             {bulkFile && (
//               <div className="mt-8 text-lg font-medium text-green-700">
//                 Selected: <span className="font-bold">{bulkFile.name}</span>
//               </div>
//             )}
//           </div>

//           {/* ──────────────────────────────────────────────── */}
//           {/* VALIDATION RESULTS */}
//           {/* ──────────────────────────────────────────────── */}
//      {validationResults.length > 0 && (
//   <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
    
//     {/* Summary – removed valid components count */}
//     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-wrap">
//       <h4 className="text-xl font-bold text-gray-900">Validation Results</h4>
//       <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
//         <div>
//           <span className="text-gray-600">Total rows:</span>{' '}
//           <strong>{validationSummary.total}</strong>
//         </div>
//         {/* <div>
//           <span className="text-gray-600">Valid rows:</span>{' '}
//           <strong className="text-green-700">{validationSummary.valid}</strong>
//         </div> */}
//         <div>
//           <span className="text-gray-600">Invalid rows:</span>{' '}
//           <strong className="text-red-700">{validationSummary.invalid}</strong>
//         </div>
//         <div>
//           <span className="text-gray-600">Invalid components:</span>{' '}
//           <strong className="text-red-700">{componentCounts.invalid}</strong>
//         </div>
//       </div>
//     </div>

//     {/* Per-row result cards – only show rows that have at least one invalid component */}
//     <div className="space-y-7">
//       {validationResults
//         .filter(item => {
//           // Only show rows that are invalid (have at least one failed component)
//           const failedCount = (item.message || '')
//             .split('|')
//             .filter(part => part.includes('outside allowed range') || part.includes('is required')).length;
//           return failedCount > 0;
//         })
//         .map((item, idx) => {
//           const rowData = item.rowData || item.data || {};

//           // Parse failed components
//           const failedComponents = new Set();
//           const errorInfo = {};

//           if (item.message && typeof item.message === 'string') {
//             const parts = item.message.split('|').map(p => p.trim()).filter(Boolean);
//             parts.forEach(part => {
//               const m = part.match(/([A-Za-z]+):\s*([\d.]+)\s*(?:is )?outside allowed range\s*\(?([\d.-]+)\s*[-–—]\s*([\d.-]+)\)?/i);
//               if (m) {
//                 const comp = m[1].toUpperCase();
//                 failedComponents.add(comp);
//                 errorInfo[comp] = {
//                   value: m[2],
//                   min:   m[3],
//                   max:   m[4]
//                 };
//               }
//               // Also catch missing/required fields if your backend sends them
//               const missingMatch = part.match(/([A-Za-z]+) is required/i);
//               if (missingMatch) {
//                 const comp = missingMatch[1].toUpperCase();
//                 failedComponents.add(comp);
//                 errorInfo[comp] = { value: '—', min: '—', max: '—' };
//               }
//             });
//           }

//           // Skip completely valid rows (should already be filtered, but double-check)
//           if (failedComponents.size === 0) return null;

//           return (
//             <div key={idx} className="border rounded-lg overflow-hidden shadow-sm bg-red-50/30">
//               {/* Row header – always red for rows shown here */}
//               <div className="px-5 py-3.5 font-bold flex justify-between items-center text-base sm:text-lg bg-red-50 text-red-900">
//                 <div>Row {item.row || (idx + 2)}</div>
//                 <div className="px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold bg-red-600 text-white">
//                   ✗ INVALID
//                 </div>
//               </div>

//               {/* Only show invalid components */}
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border-collapse">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="px-5 py-3.5 text-left font-semibold w-28">Component</th>
//                       <th className="px-5 py-3.5 text-left font-semibold w-32">Value</th>
//                       <th className="px-5 py-3.5 text-left font-semibold">Allowed Range</th>
//                       <th className="px-5 py-3.5 text-center font-semibold w-24">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {chemicalComponents
//                       .filter(comp => failedComponents.has(comp.toUpperCase()))
//                       .map(comp => {
//                         const upper = comp.toUpperCase();
//                         const lower = comp.toLowerCase();

//                         let rawValue =
//                           errorInfo[upper]?.value ??
//                           rowData[upper] ??
//                           rowData[lower] ??
//                           rowData[comp] ??
//                           '—';

//                         const displayValue =
//                           rawValue !== '—' && !isNaN(parseFloat(rawValue))
//                             ? Number(rawValue).toFixed(rawValue < 1 ? 4 : 2)
//                             : rawValue;

//                         const rangeStr = errorInfo[upper]
//                           ? `${errorInfo[upper].min} – ${errorInfo[upper].max}`
//                           : (limits[`${lower}_min`] && limits[`${lower}_max`])
//                             ? `${limits[`${lower}_min`]} – ${limits[`${lower}_max`]}`
//                             : '—';

//                         return (
//                           <tr key={comp} className="bg-red-50/20 hover:bg-red-50">
//                             <td className="px-5 py-3.5 font-medium uppercase tracking-wide">{comp}</td>
//                             <td className="px-5 py-3.5 font-mono tabular-nums">{displayValue}</td>
//                             <td className="px-5 py-3.5 font-mono tabular-nums text-gray-700">{rangeStr}</td>
//                             <td className="px-5 py-3.5 text-center text-2xl font-black">
//                               <span className="text-red-600">✗</span>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           );
//         })}
//     </div>

//     {validationResults.every(item => {
//       const failed = (item.message || '').includes('outside allowed range') || (item.message || '').includes('is required');
//       return !failed;
//     }) && (
//       <div className="text-center py-10 text-gray-500 italic">
//         All rows are valid – no issues found.
//       </div>
//     )}
//   </div>
// )}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="p-6 border-t bg-gray-50 flex justify-end gap-5">
//         <button
//           onClick={() => {
//             setIsBulkModalOpen(false);
//             setBulkFile(null);
//             setValidationResults([]);
//             setAllRowsValid(false);
//             setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//             setComponentCounts({ valid: 0, invalid: 0 });
//           }}
//           className="px-8 py-3 text-gray-700 hover:text-black font-medium text-lg"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={handleBulkUpload}
//           disabled={bulkUploading || !allRowsValid || !bulkFile}
//           className={`min-w-[220px] py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition ${
//             allRowsValid && bulkFile && !bulkUploading
//               ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
//               : 'bg-gray-400 text-white cursor-not-allowed opacity-75'
//           }`}
//         >
//           {bulkUploading && <Loader2 className="animate-spin" size={24} />}
//           {allRowsValid ? 'Upload All Records' : 'Fix Errors First'}
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//       </div>
//     </div>
//   );
// };

// export default CreateRecords;



















// import React, { useState, useEffect, useRef } from 'react';
// import { Plus, X, Loader2, Download, Upload, Search, RotateCcw } from 'lucide-react';
// import Select from 'react-select';

// const API_BASE = 'http://localhost:5000/api/sheet';

// const CreateRecords = () => {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   const [materialGrades, setMaterialGrades] = useState([]);
//   const [limits, setLimits] = useState({});

//   const [filters, setFilters] = useState({
//     tc_no: '',
//     traceability_no: '',
//     heat_no: '',
//     size: '',
//     material_grade: '',
//   });

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [formData, setFormData] = useState({
//     tc_no: '',
//     traceability_no: '',
//     heat_no: '',
//     size: '',
//     c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: '',
//     material_grade: '',
//   });
//   const [fieldErrors, setFieldErrors] = useState({});

//   // Bulk states
//   const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
//   const [bulkFile, setBulkFile] = useState(null);
//   const [bulkValidating, setBulkValidating] = useState(false);
//   const [bulkUploading, setBulkUploading] = useState(false);
//   const [validationResults, setValidationResults] = useState([]);
//   const [allRowsValid, setAllRowsValid] = useState(false);
//   const [validationSummary, setValidationSummary] = useState({ total: 0, valid: 0, invalid: 0 });
//   const [componentCounts, setComponentCounts] = useState({ valid: 0, invalid: 0 });
//   const fileInputRef = useRef(null);

//   const chemicalComponents = ['c', 'cr', 'ni', 'mo', 'mn', 'si', 's', 'p', 'cu', 'fe', 'co'];

//   useEffect(() => {
//     fetchRecords();
//     fetchMaterialGrades();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [records, filters]);

//   useEffect(() => {
//     if (isModalOpen && formData.material_grade) {
//       fetchLimitsForGrade(formData.material_grade);
//     } else if (isModalOpen) {
//       setLimits({});
//       setFieldErrors({});
//     }
//   }, [formData.material_grade, isModalOpen]);

//   // Live validation for single record modal
//   useEffect(() => {
//     if (!isModalOpen || !formData.material_grade) return;
//     validateChemicalFields();
//   }, [formData, limits, isModalOpen]);

//   const fetchMaterialGrades = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/material-grades`);
//       const data = await res.json();
//       if (data.success) setMaterialGrades(data.grades || []);
//     } catch (err) {
//       console.error('Failed to load material grades:', err);
//     }
//   };

//   const fetchLimitsForGrade = async (grade) => {
//     try {
//       const res = await fetch(`${API_BASE}/limits-by-grade?material_grade=${encodeURIComponent(grade)}`);
//       const data = await res.json();
//       if (data.success) {
//         setLimits(data.limits || {});
//       } else {
//         setLimits({});
//       }
//     } catch (err) {
//       console.error('Failed to load limits:', err);
//       setLimits({});
//     }
//   };

//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/records`);
//       const data = await res.json();
//       if (data.success) {
//         setRecords(data.records || []);
//         setFilteredRecords(data.records || []);
//       }
//     } catch (err) {
//       setMessage({ text: 'Connection Error', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let result = [...records];
//     if (filters.tc_no.trim()) {
//       result = result.filter(r => r.tc_no?.toLowerCase().includes(filters.tc_no.toLowerCase().trim()));
//     }
//     if (filters.traceability_no.trim()) {
//       result = result.filter(r => r.traceability_no?.toLowerCase().includes(filters.traceability_no.toLowerCase().trim()));
//     }
//     if (filters.heat_no.trim()) {
//       result = result.filter(r => r.heat_no?.toLowerCase().includes(filters.heat_no.toLowerCase().trim()));
//     }
//     if (filters.size.trim()) {
//       result = result.filter(r => r.size?.toLowerCase().includes(filters.size.toLowerCase().trim()));
//     }
//     if (filters.material_grade.trim()) {
//       result = result.filter(r => r.material_grade?.toLowerCase().includes(filters.material_grade.toLowerCase().trim()));
//     }
//     setFilteredRecords(result);
//   };

//   const resetFilters = () => {
//     setFilters({ tc_no: '', traceability_no: '', heat_no: '', size: '', material_grade: '' });
//   };

//   const openModal = (record = null) => {
//     if (record) {
//       setEditingRecord(record);
//       setFormData({ ...record });
//     } else {
//       setEditingRecord(null);
//       setFormData({
//         tc_no: '',
//         traceability_no: '',
//         heat_no: '',
//         size: '',
//         c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: '',
//         material_grade: '',
//       });
//       setLimits({});
//       setFieldErrors({});
//     }
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     setFieldErrors({});
//   };

//   const validateChemicalFields = () => {
//     const errors = {};
//     chemicalComponents.forEach((field) => {
//       const val = formData[field] ? parseFloat(formData[field]) : null;
//       const min = limits[`${field}_min`] ? parseFloat(limits[`${field}_min`]) : null;
//       const max = limits[`${field}_max`] ? parseFloat(limits[`${field}_max`]) : null;

//       if (val !== null && min !== null && max !== null && (val < min || val > max)) {
//         errors[field] = `Must be between ${min} – ${max}`;
//       }
//     });
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();

//     if (!formData.tc_no?.trim() || !formData.heat_no?.trim() || !formData.size?.trim() || !formData.material_grade?.trim()) {
//       setMessage({ text: 'TC No, Heat No, Size and Material Grade are required', type: 'error' });
//       return;
//     }

//     if (!validateChemicalFields()) {
//       setMessage({ text: 'Some chemical composition values are out of range', type: 'error' });
//       return;
//     }

//     setLoading(true);

//     try {
//       const url = editingRecord
//         ? `${API_BASE}/records/${editingRecord.id}`
//         : `${API_BASE}/records`;
//       const method = editingRecord ? 'PUT' : 'POST';

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setMessage({
//           text: `Record ${editingRecord ? 'Updated' : 'Created'} Successfully`,
//           type: 'success',
//         });
//         closeModal();
//         fetchRecords();
//         setTimeout(() => setMessage({ text: '', type: '' }), 4000);
//       } else {
//         setMessage({ text: data.message || 'Save failed', type: 'error' });
//       }
//     } catch (err) {
//       setMessage({ text: 'Network error – please try again', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleMaterialGradeChange = (selected) => {
//     setFormData((prev) => ({
//       ...prev,
//       material_grade: selected ? selected.label : '',
//     }));
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this record?')) return;
//     try {
//       const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
//       if (res.ok) {
//         fetchRecords();
//       } else {
//         setMessage({ text: 'Delete failed – server error', type: 'error' });
//       }
//     } catch (err) {
//       setMessage({ text: 'Delete failed – network error', type: 'error' });
//     }
//   };

//   const downloadTemplate = () => {
//     try {
//       const link = document.createElement('a');
//       link.href = '/RecordsTemplate/RecordsTemplate.xlsx';
//       link.download = 'RecordsTemplate.xlsx';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       setMessage({ text: 'Template downloaded successfully', type: 'success' });
//       setTimeout(() => setMessage({ text: '', type: '' }), 3000);
//     } catch (error) {
//       console.error('Error downloading template:', error);
//       setMessage({ text: 'Failed to download template', type: 'error' });
//     }
//   };

//   const handleFileSelected = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setBulkFile(file);
//     setValidationResults([]);
//     setAllRowsValid(false);
//     setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//     setComponentCounts({ valid: 0, invalid: 0 });
//     setBulkValidating(true);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const res = await fetch(`${API_BASE}/bulk-validate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         const processed = (data.validationResults || []).map(r => ({
//           ...r,
//           rowData: r.rowData || r.data || {}
//         }));

//         setValidationResults(processed);

//         // FIXED: Properly determine if all rows are valid
//         // Check each row for any error messages indicating invalid data
//         const hasInvalidRows = processed.some(item => {
//           if (!item.message) return false;
//           const msg = item.message.toLowerCase();
//           // Check for various error indicators
//           return msg.includes('outside allowed range') ||
//                  msg.includes('is required') ||
//                  msg.includes('error') ||
//                  msg.includes('invalid') ||
//                  msg.includes('missing') ||
//                  msg.includes('required');
//         });

//         // If no invalid rows found, all rows are valid
//         setAllRowsValid(!hasInvalidRows);

//         setValidationSummary({
//           total: data.totalRows || processed.length || 0,
//           valid: data.validCount || 0,
//           invalid: data.invalidCount || 0,
//         });

//         // Component count (your original logic)
//         let v = 0, inv = 0;
//         processed.forEach(item => {
//           if (item.status === 'success') {
//             v += 11;
//           } else if (item.message) {
//             const errors = (item.message.match(/outside allowed range/gi) || []).length;
//             inv += errors;
//             v += (11 - errors);
//           }
//         });
//         setComponentCounts({ valid: v, invalid: inv });
//       } else {
//         setMessage({ text: data.message || 'Validation failed', type: 'error' });
//       }
//     } catch (err) {
//       console.error('Validation error:', err);
//       setMessage({ text: 'Failed to validate file – network error', type: 'error' });
//     } finally {
//       setBulkValidating(false);
//     }
//   };

//   const handleBulkUpload = async () => {
//     if (!bulkFile || !allRowsValid) {
//       setMessage({ text: 'Cannot upload: file missing or validation failed', type: 'error' });
//       return;
//     }

//     setBulkUploading(true);
//     setMessage({ text: '', type: '' });

//     const formData = new FormData();
//     formData.append('file', bulkFile);

//     try {
//       const res = await fetch(`${API_BASE}/bulk-records`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setMessage({
//           text: `Successfully imported ${data.insertedCount || 0} record(s)`,
//           type: 'success',
//         });

//         await fetchRecords();

//         setIsBulkModalOpen(false);
//         setBulkFile(null);
//         setValidationResults([]);
//         setAllRowsValid(false);
//         setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//         setComponentCounts({ valid: 0, invalid: 0 });
//       } else {
//         setMessage({
//           text: data.message || 'Upload failed – check server logs',
//           type: 'error',
//         });
//       }
//     } catch (err) {
//       console.error('Upload network error:', err);
//       setMessage({ text: `Network error: ${err.message}`, type: 'error' });
//     } finally {
//       setBulkUploading(false);
//     }
//   };

//   const gradeOptions = materialGrades.map(grade => ({
//     value: grade.id,
//     label: grade.material_grade
//   }));

//   const selectedGrade = gradeOptions.find(opt => opt.label === formData.material_grade) || null;

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-10">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-gray-800 pb-8 gap-6">
//           <div className="text-center md:text-left">
//             <h1 className="text-4xl font-extrabold tracking-tight text-black">Test Certificate Records</h1>
//           </div>

//           <div className="flex flex-wrap gap-4">
//             <button
//               onClick={downloadTemplate}
//               className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-700 transition shadow cursor-pointer"
//             >
//               <Download size={18} /> Download Template
//             </button>

//             <button
//               onClick={() => setIsBulkModalOpen(true)}
//               className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition shadow cursor-pointer"
//             >
//               <Upload size={18} /> Bulk Upload Excel
//             </button>

//             <button
//               onClick={() => openModal()}
//               className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md font-bold uppercase tracking-wide hover:bg-gray-900 transition shadow-lg cursor-pointer"
//             >
//               <Plus size={18} /> Add New Entry
//             </button>
//           </div>
//         </div>

//         {/* Message */}
//         {message.text && (
//           <div className={`mb-6 p-4 border-l-4 font-medium rounded-r-lg ${
//             message.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'
//           }`}>
//             {message.text}
//           </div>
//         )}

//         {/* Filter Section */}
//         <div className="mb-8 bg-white p-6 rounded-xl border shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2 text-gray-800">
//               <Search size={20} />
//               <h3 className="text-lg font-bold uppercase tracking-wide">Filter Records</h3>
//             </div>
//             <button
//               onClick={resetFilters}
//               className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black cursor-pointer"
//             >
//               <RotateCcw size={16} /> Reset
//             </button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//             {['tc_no', 'traceability_no', 'heat_no', 'size', 'material_grade'].map(key => (
//               <div key={key} className="relative">
//                 <input
//                   name={key}
//                   value={filters[key]}
//                   onChange={handleFilterChange}
//                   placeholder={`Filter ${key.replace('_', ' ').toUpperCase()}`}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black cursor-text"
//                 />
//                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1600px] text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-100 border-b">
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">TC No.</th>
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Traceability No.</th>
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Heat No.</th>
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Size</th>
//                   <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Grade</th>
//                   <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">Chemical Composition (%)</th>
//                   <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {loading ? (
//                   <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></td></tr>
//                 ) : filteredRecords.length === 0 ? (
//                   <tr><td colSpan={7} className="py-20 text-center text-gray-500">
//                     {records.length === 0 ? "No records yet. Add or upload some." : "No matching records found."}
//                   </td></tr>
//                 ) : filteredRecords.map(r => (
//                   <tr key={r.id} className="hover:bg-gray-50">
//                     <td className="py-4 px-6 font-medium">{r.tc_no || '-'}</td>
//                     <td className="py-4 px-6">{r.traceability_no || '-'}</td>
//                     <td className="py-4 px-6">{r.heat_no || '-'}</td>
//                     <td className="py-4 px-6">{r.size || '-'}</td>
//                     <td className="py-4 px-6 font-medium">{r.material_grade || '-'}</td>
//                     <td className="py-4 px-6">
//                       <div className="space-y-2 text-xs font-mono">
//                         <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
//                           <div><b>C:</b> {r.c ?? '0.0000'}</div>
//                           <div><b>Cr:</b> {r.cr ?? '0.0000'}</div>
//                           <div><b>Ni:</b> {r.ni ?? '0.0000'}</div>
//                           <div><b>Mo:</b> {r.mo ?? '0.0000'}</div>
//                         </div>
//                         <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
//                           <div><b>Mn:</b> {r.mn ?? '0.0000'}</div>
//                           <div><b>Si:</b> {r.si ?? '0.0000'}</div>
//                           <div><b>S:</b> {r.s ?? '0.0000'}</div>
//                           <div><b>P:</b> {r.p ?? '0.0000'}</div>
//                         </div>
//                         <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
//                           <div><b>Cu:</b> {r.cu ?? '0.0000'}</div>
//                           <div><b>Fe:</b> {r.fe ?? '0.0000'}</div>
//                           <div><b>Co:</b> {r.co ?? '0.0000'}</div>
//                           <div className="opacity-0">-</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex justify-center gap-3">
//                         <button 
//                           onClick={() => openModal(r)} 
//                           className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
//                         >
//                           EDIT
//                         </button>
//                         <button 
//                           onClick={() => handleDelete(r.id)} 
//                           className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
//                         >
//                           DELETE
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Single Record Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-gray-200">
//               <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
//                 <h2 className="text-2xl font-bold text-gray-900">
//                   {editingRecord ? 'Edit Record' : 'Add New Record'}
//                 </h2>
//                 <button
//                   onClick={closeModal}
//                   className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer"
//                 >
//                   <X size={28} className="text-gray-700 hover:text-black" />
//                 </button>
//               </div>

//               <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
//                 <div className="space-y-7">
//                   <div className="bg-gray-50 p-5 rounded-xl border">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Material Grade <span className="text-red-600">*</span>
//                     </label>
//                     <Select
//                       options={gradeOptions}
//                       value={selectedGrade}
//                       onChange={handleMaterialGradeChange}
//                       placeholder="Select Material Grade"
//                       isClearable
//                       isSearchable
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         TC No. <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="tc_no"
//                         value={formData.tc_no}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Traceability No.
//                       </label>
//                       <input
//                         type="text"
//                         name="traceability_no"
//                         value={formData.traceability_no || ''}
//                         onChange={handleInputChange}
//                         maxLength={50}
//                         placeholder="Optional"
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Heat No. <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="heat_no"
//                         value={formData.heat_no}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Size <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="size"
//                         value={formData.size}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 p-6 rounded-xl border">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                       Chemical Composition (%)
//                     </h3>

//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
//                       {chemicalComponents.map((elem) => {
//                         const label = elem.toUpperCase();
//                         const error = fieldErrors[elem];

//                         return (
//                           <div key={elem} className="space-y-1">
//                             <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
//                               {label}
//                             </label>
//                             <input
//                               type="number"
//                               step="0.0001"
//                               name={elem}
//                               value={formData[elem] ?? ''}
//                               onChange={handleInputChange}
//                               placeholder={
//                                 limits[`${elem}_min`] && limits[`${elem}_max`]
//                                   ? `${limits[`${elem}_min`]} – ${limits[`${elem}_max`]}`
//                                   : '—'
//                               }
//                               className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
//                                 error ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                               }`}
//                             />
//                             {error && (
//                               <p className="text-xs text-red-600 font-medium mt-1">
//                                 {error}
//                               </p>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-end gap-4 sticky bottom-0 bg-white py-4 px-2 -mx-6">
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 min-w-[160px]"
//                   >
//                     {loading && <Loader2 className="animate-spin" size={18} />}
//                     {editingRecord ? 'Update Record' : 'Save Record'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Bulk Upload Modal */}
//         {isBulkModalOpen && (
//           <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 md:p-6">
//             <div className="bg-white w-full h-full md:w-[90vw] md:max-w-6xl md:max-h-[95vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
//               <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
//                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Bulk Upload Records</h2>
//                 <button
//                   onClick={() => {
//                     setIsBulkModalOpen(false);
//                     setBulkFile(null);
//                     setValidationResults([]);
//                     setAllRowsValid(false);
//                     setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//                     setComponentCounts({ valid: 0, invalid: 0 });
//                   }}
//                   className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer"
//                 >
//                   <X size={32} className="text-gray-700 hover:text-black" />
//                 </button>
//               </div>

//               <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-10">
//                 {/* File Upload Area */}
//                 <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 md:p-16 text-center bg-gray-50">
//                   <Upload size={64} className="mx-auto text-gray-400 mb-6" />
//                   <p className="text-xl md:text-2xl font-medium mb-3">Select or drop your Excel file here</p>
//                   <p className="text-gray-500 mb-8">Supported formats: .xlsx, .xls</p>

//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     accept=".xlsx,.xls"
//                     onChange={handleFileSelected}
//                     className="hidden"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={bulkValidating}
//                     className={`px-10 py-4 rounded-xl text-white font-medium text-lg cursor-pointer transition shadow-md ${
//                       bulkValidating
//                         ? 'bg-gray-400 cursor-wait'
//                         : 'bg-blue-600 hover:bg-blue-700'
//                     }`}
//                   >
//                     {bulkValidating ? (
//                       <span className="flex items-center gap-3">
//                         <Loader2 className="animate-spin" size={24} /> Validating...
//                       </span>
//                     ) : (
//                       'Choose Excel File'
//                     )}
//                   </button>

//                   {bulkFile && (
//                     <div className="mt-8 text-lg font-medium text-green-700">
//                       Selected: <span className="font-bold">{bulkFile.name}</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Validation Results */}
//                 {validationResults.length > 0 && (
//                   <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-wrap">
//                       <h4 className="text-xl font-bold text-gray-900">Validation Results</h4>
//                       <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
//                         <div>
//                           <span className="text-gray-600">Total rows:</span>{' '}
//                           <strong>{validationSummary.total}</strong>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Invalid rows:</span>{' '}
//                           <strong className="text-red-700">{validationSummary.invalid}</strong>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Invalid components:</span>{' '}
//                           <strong className="text-red-700">{componentCounts.invalid}</strong>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-6">
//                       {validationResults
//                         .filter(item => {
//                           const failedCount = (item.message || '')
//                             .split('|')
//                             .filter(part => part.includes('outside allowed range') || part.includes('is required')).length;
//                           return failedCount > 0;
//                         })
//                         .map((item, idx) => {
//                           const rowData = item.rowData || item.data || {};
//                           const failedComponents = new Set();
//                           const errorInfo = {};

//                           if (item.message && typeof item.message === 'string') {
//                             const parts = item.message.split('|').map(p => p.trim()).filter(Boolean);
//                             parts.forEach(part => {
//                               const m = part.match(/([A-Za-z]+):\s*([\d.]+)\s*(?:is )?outside allowed range\s*\(?([\d.-]+)\s*[-–—]\s*([\d.-]+)\)?/i);
//                               if (m) {
//                                 const comp = m[1].toUpperCase();
//                                 failedComponents.add(comp);
//                                 errorInfo[comp] = { value: m[2], min: m[3], max: m[4] };
//                               }
//                               const missingMatch = part.match(/([A-Za-z]+) is required/i);
//                               if (missingMatch) {
//                                 const comp = missingMatch[1].toUpperCase();
//                                 failedComponents.add(comp);
//                                 errorInfo[comp] = { value: '—', min: '—', max: '—' };
//                               }
//                             });
//                           }

//                           if (failedComponents.size === 0) return null;

//                           return (
//                             <div key={idx} className="border rounded-lg overflow-hidden shadow-sm bg-red-50/30">
//                               <div className="px-5 py-3.5 font-bold flex justify-between items-center text-base sm:text-lg bg-red-50 text-red-900">
//                                 <div>Row {item.row || (idx + 2)}</div>
//                                 <div className="px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold bg-red-600 text-white">
//                                   ✗ INVALID
//                                 </div>
//                               </div>

//                               <div className="overflow-x-auto">
//                                 <table className="w-full text-sm border-collapse">
//                                   <thead className="bg-gray-100">
//                                     <tr>
//                                       <th className="px-5 py-3.5 text-left font-semibold w-28">Component</th>
//                                       <th className="px-5 py-3.5 text-left font-semibold w-32">Value</th>
//                                       <th className="px-5 py-3.5 text-left font-semibold">Allowed Range</th>
//                                       <th className="px-5 py-3.5 text-center font-semibold w-24">Status</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody className="divide-y">
//                                     {chemicalComponents
//                                       .filter(comp => failedComponents.has(comp.toUpperCase()))
//                                       .map(comp => {
//                                         const upper = comp.toUpperCase();
//                                         const lower = comp.toLowerCase();

//                                         let rawValue =
//                                           errorInfo[upper]?.value ??
//                                           rowData[upper] ??
//                                           rowData[lower] ??
//                                           rowData[comp] ??
//                                           '—';

//                                         const displayValue =
//                                           rawValue !== '—' && !isNaN(parseFloat(rawValue))
//                                             ? Number(rawValue).toFixed(rawValue < 1 ? 4 : 2)
//                                             : rawValue;

//                                         const rangeStr = errorInfo[upper]
//                                           ? `${errorInfo[upper].min} – ${errorInfo[upper].max}`
//                                           : (limits[`${lower}_min`] && limits[`${lower}_max`])
//                                             ? `${limits[`${lower}_min`]} – ${limits[`${lower}_max`]}` : '—';

//                                         return (
//                                           <tr key={comp} className="bg-red-50/20 hover:bg-red-50">
//                                             <td className="px-5 py-3.5 font-medium uppercase tracking-wide">{comp}</td>
//                                             <td className="px-5 py-3.5 font-mono tabular-nums">{displayValue}</td>
//                                             <td className="px-5 py-3.5 font-mono tabular-nums text-gray-700">{rangeStr}</td>
//                                             <td className="px-5 py-3.5 text-center text-2xl font-black">
//                                               <span className="text-red-600">✗</span>
//                                             </td>
//                                           </tr>
//                                         );
//                                       })}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             </div>
//                           );
//                         })}
//                     </div>

//                     {validationResults.every(item => {
//                       const failed = (item.message || '').toLowerCase().includes('outside allowed range') ||
//                                      (item.message || '').toLowerCase().includes('is required');
//                       return !failed;
//                     }) && (
//                       <div className="text-center py-10 text-gray-500 italic">
//                         All rows are valid – no issues found.
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <div className="p-6 border-t bg-gray-50 flex justify-end gap-5">
//                 <button
//                   onClick={() => {
//                     setIsBulkModalOpen(false);
//                     setBulkFile(null);
//                     setValidationResults([]);
//                     setAllRowsValid(false);
//                     setValidationSummary({ total: 0, valid: 0, invalid: 0 });
//                     setComponentCounts({ valid: 0, invalid: 0 });
//                   }}
//                   className="px-8 py-3 text-gray-700 hover:text-black font-medium text-lg"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   onClick={handleBulkUpload}
//                   disabled={bulkUploading || !allRowsValid || !bulkFile}
//                   className={`min-w-[220px] py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition ${
//                     allRowsValid && bulkFile && !bulkUploading
//                       ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
//                       : 'bg-gray-400 text-white cursor-not-allowed opacity-75'
//                   }`}
//                 >
//                   {bulkUploading && <Loader2 className="animate-spin" size={24} />}
//                   {allRowsValid ? 'Upload All Records' : 'Fix Errors First'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateRecords;
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Loader2, Download, Upload, Search, RotateCcw } from 'lucide-react';
import Select from 'react-select';

const API_BASE = 'http://localhost:5000/api/sheet';

const CreateRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [materialGrades, setMaterialGrades] = useState([]);
  const [limits, setLimits] = useState({});
  const [filters, setFilters] = useState({
    tc_no: '',
    traceability_no: '',
    heat_no: '',
    size: '',
    material_grade: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    tc_no: '',
    traceability_no: '',
    heat_no: '',
    size: '',
    c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: '',
    material_grade: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Bulk states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkValidating, setBulkValidating] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [validationResults, setValidationResults] = useState([]);
  const [allRowsValid, setAllRowsValid] = useState(false);
  const [validationSummary, setValidationSummary] = useState({ total: 0, valid: 0, invalid: 0 });
  const [componentCounts, setComponentCounts] = useState({ valid: 0, invalid: 0 });

  const fileInputRef = useRef(null);
  const chemicalComponents = ['c', 'cr', 'ni', 'mo', 'mn', 'si', 's', 'p', 'cu', 'fe', 'co'];

  useEffect(() => {
    fetchRecords();
    fetchMaterialGrades();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filters]);

  useEffect(() => {
    if (isModalOpen && formData.material_grade) {
      fetchLimitsForGrade(formData.material_grade);
    } else if (isModalOpen) {
      setLimits({});
      setFieldErrors({});
    }
  }, [formData.material_grade, isModalOpen]);

  // Live validation in modal
  useEffect(() => {
    if (!isModalOpen || !formData.material_grade) return;
    validateChemicalFields();
  }, [formData, limits, isModalOpen]);

  const fetchMaterialGrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/material-grades`);
      const data = await res.json();
      if (data.success) setMaterialGrades(data.grades || []);
    } catch (err) {
      console.error('Failed to load material grades:', err);
    }
  };

  const fetchLimitsForGrade = async (grade) => {
    try {
      const res = await fetch(`${API_BASE}/limits-by-grade?material_grade=${encodeURIComponent(grade)}`);
      const data = await res.json();
      if (data.success) {
        setLimits(data.limits || {});
      } else {
        setLimits({});
      }
    } catch (err) {
      console.error('Failed to load limits:', err);
      setLimits({});
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/records`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setFilteredRecords(data.records || []);
      }
    } catch (err) {
      setMessage({ text: 'Connection Error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...records];
    if (filters.tc_no.trim()) {
      result = result.filter(r => r.tc_no?.toLowerCase().includes(filters.tc_no.toLowerCase().trim()));
    }
    if (filters.traceability_no.trim()) {
      result = result.filter(r => r.traceability_no?.toLowerCase().includes(filters.traceability_no.toLowerCase().trim()));
    }
    if (filters.heat_no.trim()) {
      result = result.filter(r => r.heat_no?.toLowerCase().includes(filters.heat_no.toLowerCase().trim()));
    }
    if (filters.size.trim()) {
      result = result.filter(r => r.size?.toLowerCase().includes(filters.size.toLowerCase().trim()));
    }
    if (filters.material_grade.trim()) {
      result = result.filter(r => r.material_grade?.toLowerCase().includes(filters.material_grade.toLowerCase().trim()));
    }
    setFilteredRecords(result);
  };

  const resetFilters = () => {
    setFilters({ tc_no: '', traceability_no: '', heat_no: '', size: '', material_grade: '' });
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ ...record });
    } else {
      setEditingRecord(null);
      setFormData({
        tc_no: '',
        traceability_no: '',
        heat_no: '',
        size: '',
        c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: '',
        material_grade: '',
      });
      setLimits({});
      setFieldErrors({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFieldErrors({});
  };

  const validateChemicalFields = () => {
    const errors = {};
    chemicalComponents.forEach((field) => {
      const val = formData[field] ? parseFloat(formData[field]) : null;
      const min = limits[`${field}_min`] ? parseFloat(limits[`${field}_min`]) : null;
      const max = limits[`${field}_max`] ? parseFloat(limits[`${field}_max`]) : null;
      if (val !== null && min !== null && max !== null && (val < min || val > max)) {
        errors[field] = `Must be between ${min} – ${max}`;
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.tc_no?.trim() || !formData.heat_no?.trim() || !formData.size?.trim() || !formData.material_grade?.trim()) {
      setMessage({ text: 'TC No, Heat No, Size and Material Grade are required', type: 'error' });
      return;
    }
    if (!validateChemicalFields()) {
      setMessage({ text: 'Some chemical composition values are out of range', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const url = editingRecord
        ? `${API_BASE}/records/${editingRecord.id}`
        : `${API_BASE}/records`;
      const method = editingRecord ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          text: `Record ${editingRecord ? 'Updated' : 'Created'} Successfully`,
          type: 'success',
        });
        closeModal();
        fetchRecords();
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: data.message || 'Save failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error – please try again', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterialGradeChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      material_grade: selected ? selected.label : '',
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRecords();
      } else {
        setMessage({ text: 'Delete failed – server error', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Delete failed – network error', type: 'error' });
    }
  };

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
      console.error('Error downloading template:', error);
      setMessage({ text: 'Failed to download template', type: 'error' });
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setValidationResults([]);
    setAllRowsValid(false);
    setValidationSummary({ total: 0, valid: 0, invalid: 0 });
    setComponentCounts({ valid: 0, invalid: 0 });
    setBulkValidating(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/bulk-validate`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        let processed = (data.validationResults || []).map(r => ({
          ...r,
          rowData: r.rowData || r.data || {}
        }));

        // FIX: Detect & correct shifted rows (common when size is split)
        processed = processed.map((item, idx) => {
          const row = item.rowData || {};
          let fixedRow = { ...row };

          // If 'c' looks like a size (contains 'mm' or number+mm), likely shifted
          if (row.c && (String(row.c).includes('mm') || /^\d+\.\d+\s*mm/.test(String(row.c)))) {
            console.warn(`Row ${item.row || idx + 2} seems shifted → fixing size column`);

            fixedRow.size = `${row.size || ''} ${row.c}`.trim();
            fixedRow.c = row.cr || '';
            fixedRow.cr = row.ni || '';
            fixedRow.ni = row.mo || '';
            fixedRow.mo = row.mn || '';
            fixedRow.mn = row.si || '';
            fixedRow.si = row.s || '';
            fixedRow.s = row.p || '';
            fixedRow.p = row.cu || '';
            fixedRow.cu = row.fe || '';
            fixedRow.fe = row.co || '';
            fixedRow.co = '';
          }

          return {
            ...item,
            rowData: fixedRow
          };
        });

        setValidationResults(processed);

        // Determine if all rows are now valid
        const hasInvalid = processed.some(item => {
          if (!item.message) return false;
          const msg = String(item.message).toLowerCase();
          return msg.includes('outside allowed range') ||
                 msg.includes('is required') ||
                 msg.includes('invalid') ||
                 msg.includes('error');
        });

        setAllRowsValid(!hasInvalid);

        setValidationSummary({
          total: data.totalRows || processed.length || 0,
          valid: data.validCount || processed.filter(r => !r.message).length,
          invalid: data.invalidCount || processed.filter(r => r.message).length,
        });

        // Component count
        let v = 0, inv = 0;
        processed.forEach(item => {
          if (!item.message) {
            v += 11;
          } else {
            const errors = (String(item.message).match(/outside allowed range/gi) || []).length;
            inv += errors;
            v += (11 - errors);
          }
        });
        setComponentCounts({ valid: v, invalid: inv });
      } else {
        setMessage({ text: data.message || 'Validation failed', type: 'error' });
      }
    } catch (err) {
      console.error('Validation error:', err);
      setMessage({ text: 'Failed to validate file – network error', type: 'error' });
    } finally {
      setBulkValidating(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile || !allRowsValid) {
      setMessage({ text: 'Cannot upload: file missing or validation failed', type: 'error' });
      return;
    }

    setBulkUploading(true);
    setMessage({ text: '', type: '' });

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
          text: `Successfully imported ${data.insertedCount || 0} record(s)`,
          type: 'success',
        });
        await fetchRecords();
        setIsBulkModalOpen(false);
        setBulkFile(null);
        setValidationResults([]);
        setAllRowsValid(false);
        setValidationSummary({ total: 0, valid: 0, invalid: 0 });
        setComponentCounts({ valid: 0, invalid: 0 });
      } else {
        setMessage({
          text: data.message || 'Upload failed – check server logs',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Upload network error:', err);
      setMessage({ text: `Network error: ${err.message}`, type: 'error' });
    } finally {
      setBulkUploading(false);
    }
  };

  const gradeOptions = materialGrades.map(grade => ({
    value: grade.id,
    label: grade.material_grade
  }));

  const selectedGrade = gradeOptions.find(opt => opt.label === formData.material_grade) || null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-gray-800 pb-8 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-black">Test Certificate Records</h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-700 transition shadow cursor-pointer"
            >
              <Download size={18} /> Download Template
            </button>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition shadow cursor-pointer"
            >
              <Upload size={18} /> Bulk Upload Excel
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md font-bold uppercase tracking-wide hover:bg-gray-900 transition shadow-lg cursor-pointer"
            >
              <Plus size={18} /> Add New Entry
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 border-l-4 font-medium rounded-r-lg ${
            message.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-8 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-800">
              <Search size={20} />
              <h3 className="text-lg font-bold uppercase tracking-wide">Filter Records</h3>
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black cursor-pointer"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {['tc_no', 'traceability_no', 'heat_no', 'size', 'material_grade'].map(key => (
              <div key={key} className="relative">
                <input
                  name={key}
                  value={filters[key]}
                  onChange={handleFilterChange}
                  placeholder={`Filter ${key.replace('_', ' ').toUpperCase()}`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black cursor-text"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">TC No.</th>
                  <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Traceability No.</th>
                  <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Heat No.</th>
                  <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Size</th>
                  <th className="py-4 px-6 font-bold uppercase text-sm text-gray-700">Grade</th>
                  <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">Chemical Composition (%)</th>
                  <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-gray-500">
                    {records.length === 0 ? "No records yet. Add or upload some." : "No matching records found."}
                  </td></tr>
                ) : filteredRecords.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{r.tc_no || '-'}</td>
                    <td className="py-4 px-6">{r.traceability_no || '-'}</td>
                    <td className="py-4 px-6">{r.heat_no || '-'}</td>
                    <td className="py-4 px-6">{r.size || '-'}</td>
                    <td className="py-4 px-6 font-medium">{r.material_grade || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-2 text-xs font-mono">
                        <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                          <div><b>C:</b> {r.c ?? '0.0000'}</div>
                          <div><b>Cr:</b> {r.cr ?? '0.0000'}</div>
                          <div><b>Ni:</b> {r.ni ?? '0.0000'}</div>
                          <div><b>Mo:</b> {r.mo ?? '0.0000'}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                          <div><b>Mn:</b> {r.mn ?? '0.0000'}</div>
                          <div><b>Si:</b> {r.si ?? '0.0000'}</div>
                          <div><b>S:</b> {r.s ?? '0.0000'}</div>
                          <div><b>P:</b> {r.p ?? '0.0000'}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                          <div><b>Cu:</b> {r.cu ?? '0.0000'}</div>
                          <div><b>Fe:</b> {r.fe ?? '0.0000'}</div>
                          <div><b>Co:</b> {r.co ?? '0.0000'}</div>
                          <div className="opacity-0">-</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openModal(r)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Single Record Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-gray-200">
              <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord ? 'Edit Record' : 'Add New Record'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer"
                >
                  <X size={28} className="text-gray-700 hover:text-black" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
                <div className="space-y-7">
                  <div className="bg-gray-50 p-5 rounded-xl border">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Grade <span className="text-red-600">*</span>
                    </label>
                    <Select
                      options={gradeOptions}
                      value={selectedGrade}
                      onChange={handleMaterialGradeChange}
                      placeholder="Select Material Grade"
                      isClearable
                      isSearchable
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TC No. <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="tc_no"
                        value={formData.tc_no}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Traceability No.
                      </label>
                      <input
                        type="text"
                        name="traceability_no"
                        value={formData.traceability_no || ''}
                        onChange={handleInputChange}
                        maxLength={50}
                        placeholder="Optional"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heat No. <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="heat_no"
                        value={formData.heat_no}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Chemical Composition (%)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                      {chemicalComponents.map((elem) => {
                        const label = elem.toUpperCase();
                        const error = fieldErrors[elem];
                        return (
                          <div key={elem} className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                              {label}
                            </label>
                            <input
                              type="number"
                              step="0.0001"
                              name={elem}
                              value={formData[elem] ?? ''}
                              onChange={handleInputChange}
                              placeholder={
                                limits[`${elem}_min`] && limits[`${elem}_max`]
                                  ? `${limits[`${elem}_min`]} – ${limits[`${elem}_max`]}` 
                                  : '—'
                              }
                              className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {error && (
                              <p className="text-xs text-red-600 font-medium mt-1">
                                {error}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-end gap-4 sticky bottom-0 bg-white py-4 px-2 -mx-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 min-w-[160px]"
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    {editingRecord ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 md:p-6">
            <div className="bg-white w-full h-full md:w-[90vw] md:max-w-6xl md:max-h-[95vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
              <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Bulk Upload Records</h2>
                <button
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setBulkFile(null);
                    setValidationResults([]);
                    setAllRowsValid(false);
                    setValidationSummary({ total: 0, valid: 0, invalid: 0 });
                    setComponentCounts({ valid: 0, invalid: 0 });
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition cursor-pointer"
                >
                  <X size={32} className="text-gray-700 hover:text-black" />
                </button>
              </div>

              <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-10">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 md:p-16 text-center bg-gray-50">
                  <Upload size={64} className="mx-auto text-gray-400 mb-6" />
                  <p className="text-xl md:text-2xl font-medium mb-3">Select or drop your Excel file here</p>
                  <p className="text-gray-500 mb-8">Supported formats: .xlsx, .xls</p>
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
                    className={`px-10 py-4 rounded-xl text-white font-medium text-lg cursor-pointer transition shadow-md ${
                      bulkValidating ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {bulkValidating ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={24} /> Validating...
                      </span>
                    ) : (
                      'Choose Excel File'
                    )}
                  </button>
                  {bulkFile && (
                    <div className="mt-8 text-lg font-medium text-green-700">
                      Selected: <span className="font-bold">{bulkFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Validation Results */}
                {validationResults.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-wrap">
                      <h4 className="text-xl font-bold text-gray-900">Validation Results</h4>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Total rows:</span>{' '}
                          <strong>{validationSummary.total}</strong>
                        </div>
                        <div>
                          <span className="text-gray-600">Invalid rows:</span>{' '}
                          <strong className="text-red-700">{validationSummary.invalid}</strong>
                        </div>
                        <div>
                          <span className="text-gray-600">Invalid components:</span>{' '}
                          <strong className="text-red-700">{componentCounts.invalid}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {validationResults
                        .filter(item => {
                          const msg = String(item.message || '').toLowerCase();
                          return msg.includes('outside allowed range') || 
                                 msg.includes('is required') ||
                                 msg.includes('invalid') ||
                                 msg.includes('error');
                        })
                        .map((item, idx) => {
                          const rowData = item.rowData || {};
                          const failedComponents = new Set();
                          const errorInfo = {};

                          if (item.message && typeof item.message === 'string') {
                            const parts = item.message.split('|').map(p => p.trim()).filter(Boolean);
                            parts.forEach(part => {
                              const m = part.match(/([A-Za-z]+):\s*([\d.]+)\s*(?:is )?outside allowed range\s*\(?([\d.-]+)\s*[-–—]\s*([\d.-]+)\)?/i);
                              if (m) {
                                const comp = m[1].toUpperCase();
                                failedComponents.add(comp);
                                errorInfo[comp] = { value: m[2], min: m[3], max: m[4] };
                              }
                              const missing = part.match(/([A-Za-z]+) is required/i);
                              if (missing) {
                                const comp = missing[1].toUpperCase();
                                failedComponents.add(comp);
                                errorInfo[comp] = { value: '—', min: '—', max: '—' };
                              }
                            });
                          }

                          if (failedComponents.size === 0) return null;

                          return (
                            <div key={idx} className="border rounded-lg overflow-hidden shadow-sm bg-red-50/30">
                              <div className="px-5 py-3.5 font-bold flex justify-between items-center text-base sm:text-lg bg-red-50 text-red-900">
                                <div>Row {item.row || (idx + 2)}</div>
                                <div className="px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold bg-red-600 text-white">
                                  ✗ INVALID
                                </div>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-5 py-3.5 text-left font-semibold w-28">Component</th>
                                      <th className="px-5 py-3.5 text-left font-semibold w-32">Value</th>
                                      <th className="px-5 py-3.5 text-left font-semibold">Allowed Range</th>
                                      <th className="px-5 py-3.5 text-center font-semibold w-24">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {chemicalComponents
                                      .filter(comp => failedComponents.has(comp.toUpperCase()))
                                      .map(comp => {
                                        const upper = comp.toUpperCase();
                                        const lower = comp.toLowerCase();
                                        let rawValue =
                                          errorInfo[upper]?.value ??
                                          rowData[upper] ??
                                          rowData[lower] ??
                                          rowData[comp] ??
                                          '—';
                                        const displayValue =
                                          rawValue !== '—' && !isNaN(parseFloat(rawValue))
                                            ? Number(rawValue).toFixed(rawValue < 1 ? 4 : 2)
                                            : rawValue;
                                        const rangeStr = errorInfo[upper]
                                          ? `${errorInfo[upper].min} – ${errorInfo[upper].max}`
                                          : (limits[`${lower}_min`] && limits[`${lower}_max`])
                                            ? `${limits[`${lower}_min`]} – ${limits[`${lower}_max`]}` : '—';

                                        return (
                                          <tr key={comp} className="bg-red-50/20 hover:bg-red-50">
                                            <td className="px-5 py-3.5 font-medium uppercase tracking-wide">{comp}</td>
                                            <td className="px-5 py-3.5 font-mono tabular-nums">{displayValue}</td>
                                            <td className="px-5 py-3.5 font-mono tabular-nums text-gray-700">{rangeStr}</td>
                                            <td className="px-5 py-3.5 text-center text-2xl font-black">
                                              <span className="text-red-600">✗</span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {validationResults.every(item => {
                      const msg = String(item.message || '').toLowerCase();
                      return !msg.includes('outside allowed range') && !msg.includes('is required');
                    }) && (
                      <div className="text-center py-10 text-gray-500 italic">
                        All rows are valid – ready to upload!
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-5">
                <button
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setBulkFile(null);
                    setValidationResults([]);
                    setAllRowsValid(false);
                    setValidationSummary({ total: 0, valid: 0, invalid: 0 });
                    setComponentCounts({ valid: 0, invalid: 0 });
                  }}
                  className="px-8 py-3 text-gray-700 hover:text-black font-medium text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={bulkUploading || !allRowsValid || !bulkFile}
                  className={`min-w-[220px] py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition ${
                    allRowsValid && bulkFile && !bulkUploading
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      : 'bg-gray-400 text-white cursor-not-allowed opacity-75'
                  }`}
                >
                  {bulkUploading && <Loader2 className="animate-spin" size={24} />}
                  {allRowsValid ? 'Upload All Records' : 'Fix Errors First'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRecords;