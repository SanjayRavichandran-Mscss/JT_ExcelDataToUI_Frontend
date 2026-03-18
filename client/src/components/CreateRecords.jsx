// // CreateRecords.jsx
// import React, { useState, useEffect } from 'react';
// import { Plus, X, Loader2, RotateCcw, Search, Upload } from 'lucide-react';
// import Select from 'react-select';
// import CreateBulkRecords from './CreateBulkRecords';

// const API_BASE = 'http://103.118.158.113.188:5000/api/sheet';

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

//   // State for bulk modal
//   const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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
//     setFilters({
//       tc_no: '',
//       traceability_no: '',
//       heat_no: '',
//       size: '',
//       material_grade: '',
//     });
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

//   const gradeOptions = materialGrades.map(grade => ({
//     value: grade.id,
//     label: grade.material_grade
//   }));

//   const selectedGrade = gradeOptions.find(opt => opt.label === formData.material_grade) || null;

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-10">
//       <div className="max-w-7xl mx-auto">
//         {/* Main Header */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-gray-800 pb-8 gap-6">
//           <div className="text-center md:text-left">
//             <h1 className="text-4xl font-extrabold tracking-tight text-black">Test Certificate Records</h1>
//           </div>
//           <div className="flex flex-wrap gap-4">
//             <button
//               onClick={() => setIsBulkModalOpen(true)}
//               className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition shadow cursor-pointer"
//             >
//               <Upload size={18} /> Bulk Upload
//             </button>
//             <button
//               onClick={() => openModal()}
//               className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md font-bold uppercase tracking-wide hover:bg-gray-900 transition shadow-lg cursor-pointer"
//             >
//               <Plus size={18} /> Add New Entry
//             </button>
//           </div>
//         </div>

//         {/* Global Message */}
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

//         {/* Records Table */}
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
//                     {records.length === 0 ? "No records yet. Add some." : "No matching records found."}
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
//                 {/* ... rest of single record form remains unchanged ... */}
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
//           <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
//             <div className="bg-white w-full max-w-6xl max-h-[96vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
     

//               {/* Bulk content – no extra header */}
//               <div className="flex-1 overflow-y-auto">
//                 <CreateBulkRecords
//                   onClose={() => setIsBulkModalOpen(false)}
//                   onRecordsAdded={() => {
//                     fetchRecords(); // refresh main table after successful bulk upload
//                     // Modal stays open – user closes manually with X
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateRecords;





















// CreateRecords.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, RotateCcw, Search, Upload } from 'lucide-react';
import Select from 'react-select';
import CreateBulkRecords from './CreateBulkRecords';

const API_BASE = 'http://103.118.158.113.188:5000/api/sheet';

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

  const [traceabilityUniqueStatus, setTraceabilityUniqueStatus] = useState({
    checking: false,
    isUnique: true,
    message: '',
  });

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const chemicalComponents = ['c', 'cr', 'ni', 'mo', 'mn', 'si', 's', 'p', 'cu', 'fe', 'co'];

  // ──────────────────────────────────────────────
  // Fetch data on mount
  // ──────────────────────────────────────────────
  useEffect(() => {
    fetchRecords();
    fetchMaterialGrades();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filters]);

  // ──────────────────────────────────────────────
  // Material grade → limits
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (isModalOpen && formData.material_grade) {
      fetchLimitsForGrade(formData.material_grade);
    } else if (isModalOpen) {
      setLimits({});
      setFieldErrors({});
    }
  }, [formData.material_grade, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || !formData.material_grade) return;
    validateChemicalFields();
  }, [formData, limits, isModalOpen]);

  // ──────────────────────────────────────────────
  // Traceability uniqueness check (with simple delay – no debounce library)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!isModalOpen) return;

    const value = formData.traceability_no?.trim() || '';

    // Clear previous status when field becomes empty
    if (!value) {
      setTraceabilityUniqueStatus({ checking: false, isUnique: true, message: '' });
      return;
    }

    // Set checking state
    setTraceabilityUniqueStatus((prev) => ({ ...prev, checking: true }));

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ traceability_no: value });
        if (editingRecord?.id) {
          params.append('exclude_id', editingRecord.id);
        }

        const res = await fetch(`${API_BASE}/check-traceability-unique?${params}`);
        const data = await res.json();

        if (data.success) {
          setTraceabilityUniqueStatus({
            checking: false,
            isUnique: data.isUnique,
            message: data.isUnique ? '' : 'This Traceability No is already in use.',
          });
        } else {
          setTraceabilityUniqueStatus({
            checking: false,
            isUnique: false,
            message: 'Error checking uniqueness',
          });
        }
      } catch (err) {
        setTraceabilityUniqueStatus({
          checking: false,
          isUnique: false,
          message: 'Network error',
        });
      }
    }, 600); // ≈ debounce delay

    return () => clearTimeout(timer);
  }, [formData.traceability_no, isModalOpen, editingRecord?.id]);

  // ──────────────────────────────────────────────
  // Core fetch functions (unchanged)
  // ──────────────────────────────────────────────
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
      result = result.filter((r) =>
        r.tc_no?.toLowerCase().includes(filters.tc_no.toLowerCase().trim())
      );
    }
    if (filters.traceability_no.trim()) {
      result = result.filter((r) =>
        r.traceability_no?.toLowerCase().includes(filters.traceability_no.toLowerCase().trim())
      );
    }
    if (filters.heat_no.trim()) {
      result = result.filter((r) =>
        r.heat_no?.toLowerCase().includes(filters.heat_no.toLowerCase().trim())
      );
    }
    if (filters.size.trim()) {
      result = result.filter((r) =>
        r.size?.toLowerCase().includes(filters.size.toLowerCase().trim())
      );
    }
    if (filters.material_grade.trim()) {
      result = result.filter((r) =>
        r.material_grade?.toLowerCase().includes(filters.material_grade.toLowerCase().trim())
      );
    }
    setFilteredRecords(result);
  };

  const resetFilters = () => {
    setFilters({
      tc_no: '',
      traceability_no: '',
      heat_no: '',
      size: '',
      material_grade: '',
    });
  };

  // ──────────────────────────────────────────────
  // Modal control
  // ──────────────────────────────────────────────
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
      setTraceabilityUniqueStatus({ checking: false, isUnique: true, message: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFieldErrors({});
    setTraceabilityUniqueStatus({ checking: false, isUnique: true, message: '' });
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

  const isFormValid = () => {
    const required = ['tc_no', 'heat_no', 'size', 'material_grade'];
    const allRequiredFilled = required.every((key) => formData[key]?.trim());

    const noChemicalErrors = Object.keys(fieldErrors).length === 0;
    const traceabilityOk =
      traceabilityUniqueStatus.isUnique && !traceabilityUniqueStatus.checking;

    return allRequiredFilled && noChemicalErrors && traceabilityOk;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setMessage({ text: 'Please correct the errors in the form', type: 'error' });
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

  const gradeOptions = materialGrades.map((grade) => ({
    value: grade.id,
    label: grade.material_grade,
  }));

  const selectedGrade = gradeOptions.find((opt) => opt.label === formData.material_grade) || null;

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
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
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition shadow cursor-pointer"
            >
              <Upload size={18} /> Bulk Upload
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md font-bold uppercase tracking-wide hover:bg-gray-900 transition shadow-lg cursor-pointer"
            >
              <Plus size={18} /> Add New Entry
            </button>
          </div>
        </div>

        {/* Global message */}
        {message.text && (
          <div
            className={`mb-6 p-4 border-l-4 font-medium rounded-r-lg ${
              message.type === 'success'
                ? 'bg-green-50 border-green-600 text-green-800'
                : 'bg-red-50 border-red-600 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filters */}
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
            {['tc_no', 'traceability_no', 'heat_no', 'size', 'material_grade'].map((key) => (
              <div key={key} className="relative">
                <input
                  name={key}
                  value={filters[key]}
                  onChange={handleFilterChange}
                  placeholder={`Filter ${key.replace('_', ' ').toUpperCase()}`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black cursor-text"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
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
                  <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">
                    Chemical Composition (%)
                  </th>
                  <th className="py-4 px-6 text-center font-bold uppercase text-sm text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto" size={32} />
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-500">
                      {records.length === 0 ? 'No records yet. Add some.' : 'No matching records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ────────────────────────────────────────────── */}
        {/* Add/Edit Modal */}
        {/* ────────────────────────────────────────────── */}
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
                  {/* Material Grade */}
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

                  {/* TC No + Traceability No */}
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
                        placeholder="Must be unique"
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                          traceabilityUniqueStatus.message
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {traceabilityUniqueStatus.checking && (
                        <p className="text-xs text-gray-500 mt-1">Checking...</p>
                      )}
                      {traceabilityUniqueStatus.message && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {traceabilityUniqueStatus.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Heat No + Size */}
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

                  {/* Chemical Composition */}
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
                              <p className="text-xs text-red-600 font-medium mt-1">{error}</p>
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
                    disabled={loading || !isFormValid()}
                    className={`px-8 py-3 text-white rounded-lg font-medium flex items-center justify-center gap-2 min-w-[160px] ${
                      isFormValid() && !loading
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    {editingRecord ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Modal */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-6xl max-h-[96vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
              <div className="flex-1 overflow-y-auto">
                <CreateBulkRecords
                  onClose={() => setIsBulkModalOpen(false)}
                  onRecordsAdded={() => {
                    fetchRecords();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRecords;