// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, X, Save, Loader2 } from 'lucide-react';

// const CreateRecords = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   // Modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [formData, setFormData] = useState({
//     tc_no: '',
//     heat_no: '',
//     size: '',
//     c: '',
//     cr: '',
//     ni: '',
//     mo: '',
//     mn: '',
//     si: '',
//     s: '',
//     p: '',
//     material_grade: ''
//   });

//   // Fetch all records on mount
//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   const fetchRecords = async () => {
//     setLoading(true);
//     setMessage({ text: '', type: '' });

//     try {
//       const res = await fetch('http://localhost:5000/api/sheet/records');
//       const data = await res.json();

//       if (data.success) {
//         setRecords(data.records || []);
//       } else {
//         setMessage({ text: data.message || 'Failed to load records', type: 'error' });
//       }
//     } catch (err) {
//       setMessage({ text: 'Could not connect to server', type: 'error' });
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open modal for create or edit
//   const openModal = (record = null) => {
//     if (record) {
//       setEditingRecord(record);
//       setFormData({ ...record });
//     } else {
//       setEditingRecord(null);
//       setFormData({
//         tc_no: '',
//         heat_no: '',
//         size: '',
//         c: '',
//         cr: '',
//         ni: '',
//         mo: '',
//         mn: '',
//         si: '',
//         s: '',
//         p: '',
//         material_grade: ''
//       });
//     }
//     setIsModalOpen(true);
//     setMessage({ text: '', type: '' });
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // Save (create or update)
//   const handleSave = async (e) => {
//     e.preventDefault();

//     if (!formData.tc_no.trim() || !formData.heat_no.trim() ||
//         !formData.size.trim() || !formData.material_grade.trim()) {
//       setMessage({ text: 'TC No, Heat No, Size, and Material Grade are required', type: 'error' });
//       return;
//     }

//     setLoading(true);

//     try {
//       const url = editingRecord
//         ? `http://localhost:5000/api/sheet/records/${editingRecord.id}`
//         : 'http://localhost:5000/api/sheet/records';

//       const method = editingRecord ? 'PUT' : 'POST';

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage({ text: data.message || 'Record saved successfully!', type: 'success' });
//         closeModal();
//         fetchRecords();
//       } else {
//         setMessage({ text: data.message || 'Failed to save record', type: 'error' });
//       }
//     } catch (err) {
//       setMessage({ text: 'Network error - server not reachable', type: 'error' });
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete record
//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this record?')) return;

//     setLoading(true);
//     try {
//       const res = await fetch(`http://localhost:5000/api/sheet/records/${id}`, {
//         method: 'DELETE'
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage({ text: data.message || 'Record deleted successfully', type: 'success' });
//         fetchRecords();
//       } else {
//         setMessage({ text: data.message || 'Failed to delete record', type: 'error' });
//       }
//     } catch (err) {
//       setMessage({ text: 'Network error', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header + Create Button */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Test Certificate Records</h1>
//             <p className="mt-2 text-gray-600">
//               Add, edit or delete TC entries below.
//             </p>
//           </div>

//           <button
//             onClick={() => openModal()}
//             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-sm"
//           >
//             <Plus size={20} /> Create New Record
//           </button>
//         </div>

//         {/* Feedback Message */}
//         {message.text && (
//           <div className={`mb-6 p-4 rounded-lg text-center font-medium border ${
//             message.type === 'success'
//               ? 'bg-green-100 text-green-800 border-green-300'
//               : 'bg-red-100 text-red-800 border-red-300'
//           }`}>
//             {message.text}
//           </div>
//         )}

//         {/* Records Table */}
//         {loading && records.length === 0 ? (
//           <div className="flex justify-center py-20">
//             <Loader2 className="animate-spin text-indigo-600" size={48} />
//           </div>
//         ) : (
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">TC No</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Heat No</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Size</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">C</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Cr</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Ni</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Mo</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Mn</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Si</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">S</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">P</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Material Grade</th>
//                   <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {records.length === 0 ? (
//                   <tr>
//                     <td colSpan={13} className="px-6 py-16 text-center text-gray-500 text-lg">
//                       No records found. Click "Create New Record" to add one.
//                     </td>
//                   </tr>
//                 ) : (
//                   records.map((record) => (
//                     <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.tc_no}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.heat_no}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.size}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.c || '-'}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.cr || '-'}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.ni || '-'}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.mo || '-'}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.mn || '-'}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.si || '-'}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.s || '-'}</td>
//                       <td className="px-6 py-4 text-center text-sm text-gray-600">{record.p || '-'}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {record.material_grade}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-center">
//                         <button
//                           onClick={() => openModal(record)}
//                           className="text-indigo-600 hover:text-indigo-800 mr-4 transition"
//                           title="Edit Record"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(record.id)}
//                           className="text-red-600 hover:text-red-800 transition"
//                           title="Delete Record"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* ─── Modal ──────────────────────────────────────────────── */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//               {/* Modal Header */}
//               <div className="flex justify-between items-center px-8 py-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
//                 <h2 className="text-2xl font-bold text-gray-900">
//                   {editingRecord ? 'Edit Record' : 'Create New Record'}
//                 </h2>
//                 <button
//                   onClick={closeModal}
//                   className="text-gray-600 hover:text-gray-900 transition"
//                 >
//                   <X size={28} />
//                 </button>
//               </div>

//               {/* Modal Form */}
//               <form onSubmit={handleSave} className="p-8 space-y-8">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       TC No <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                       name="tc_no"
//                       value={formData.tc_no}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                       placeholder="TC-001"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Heat No <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                       name="heat_no"
//                       value={formData.heat_no}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                       placeholder="H-12345"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Size <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                       name="size"
//                       value={formData.size}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                       placeholder="50 mm"
//                     />
//                   </div>
//                 </div>

//                 {/* Chemical Composition */}
//                 <div className="border-t pt-6">
//                   <label className="block text-lg font-semibold text-gray-800 mb-4">
//                     Chemical Composition (%)
//                   </label>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
//                     {['c', 'cr', 'ni', 'mo', 'mn', 'si', 's', 'p'].map((field) => (
//                       <div key={field}>
//                         <label className="block text-sm font-medium text-gray-600 mb-1 uppercase">
//                           {field.toUpperCase()}
//                         </label>
//                         <input
//                           name={field}
//                           value={formData[field]}
//                           onChange={handleInputChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                           placeholder="0.000"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Material Grade */}
//                 <div className="border-t pt-6">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Material Grade <span className="text-red-600">*</span>
//                   </label>
//                   <input
//                     name="material_grade"
//                     value={formData.material_grade}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                     placeholder="F53 (S32750) + NACE MR0175"
//                   />
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-end gap-4 pt-6 border-t">
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition shadow-md ${
//                       loading
//                         ? 'bg-indigo-400 cursor-not-allowed'
//                         : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
//                     }`}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 size={20} className="animate-spin" />
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <Save size={20} />
//                         {editingRecord ? 'Update Record' : 'Save Record'}
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateRecords;













import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Loader2, Database, Beaker } from 'lucide-react';

const CreateRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    tc_no: '', heat_no: '', size: '', c: '', cr: '', ni: '',
    mo: '', mn: '', si: '', s: '', p: '', material_grade: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/sheet/records');
      const data = await res.json();
      if (data.success) setRecords(data.records || []);
    } catch (err) {
      setMessage({ text: 'Connection Error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ ...record });
    } else {
      setEditingRecord(null);
      setFormData({
        tc_no: '', heat_no: '', size: '', c: '', cr: '', ni: '',
        mo: '', mn: '', si: '', s: '', p: '', material_grade: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingRecord 
        ? `http://localhost:5000/api/sheet/records/${editingRecord.id}` 
        : 'http://localhost:5000/api/sheet/records';
      const method = editingRecord ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage({ text: `Record ${editingRecord ? 'Updated' : 'Created'} Successfully`, type: 'success' });
        closeModal();
        fetchRecords();
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      setMessage({ text: 'Operation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await fetch(`http://localhost:5000/api/sheet/records/${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch (err) {
      setMessage({ text: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-black pb-8 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <Database size={24} className="text-gray-700" />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Inventory Ledger</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-black">Test Certificate Records</h1>
          </div>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <Plus size={20} /> Add New Entry
          </button>
        </div>

        {/* Feedback Message */}
        {message.text && (
          <div className={`mb-6 p-4 border-l-4 font-medium ${
            message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-4 text-sm font-bold uppercase text-gray-700">TC No.</th>
                <th className="py-4 px-4 text-sm font-bold uppercase text-gray-700">Heat No.</th>
                <th className="py-4 px-4 text-sm font-bold uppercase text-gray-700">Size</th>
                <th className="py-4 px-4 text-sm font-bold uppercase text-gray-700">Material Grade</th>
                <th className="py-4 px-4 text-center text-sm font-bold uppercase text-gray-700">Composition</th>
                <th className="py-4 px-4 text-center text-sm font-bold uppercase text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-medium">
                    No records found. Click "Add New Entry" to get started.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-4 text-base font-bold text-black">{record.tc_no}</td>
                    <td className="py-5 px-4 text-base text-gray-600">{record.heat_no}</td>
                    <td className="py-5 px-4 text-base text-gray-600">{record.size}</td>
                    <td className="py-5 px-4 text-base font-semibold text-gray-800">{record.material_grade}</td>
                    <td className="py-5 px-4 text-center">
                       <div className="inline-flex gap-2 text-xs font-mono bg-gray-100 p-2 rounded border border-gray-200">
                         <span>C:{record.c || '0'}</span>
                         <span className="text-gray-300">|</span>
                         <span>Ni:{record.ni || '0'}</span>
                         <span className="text-gray-300">|</span>
                         <span>Cr:{record.cr || '0'}</span>
                       </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => openModal(record)} 
                          className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm"
                          title="Edit Record"
                        >
                          <Edit size={14}/> EDIT
                        </button>
                        <button 
                          onClick={() => handleDelete(record.id)} 
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm"
                          title="Delete Record"
                        >
                          <Trash2 size={14}/> DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">
                  {editingRecord ? 'Edit Existing Record' : 'Register New Certificate'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">TC Number</label>
                    <input name="tc_no" value={formData.tc_no} onChange={handleInputChange} required className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-black focus:outline-none text-base" placeholder="e.g. TC-100" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Heat Number</label>
                    <input name="heat_no" value={formData.heat_no} onChange={handleInputChange} required className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-black focus:outline-none text-base" placeholder="e.g. H-552" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Size</label>
                    <input name="size" value={formData.size} onChange={handleInputChange} required className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-black focus:outline-none text-base" placeholder="e.g. 25mm" />
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4 text-gray-800">
                    <Beaker size={18} />
                    <label className="text-base font-bold uppercase tracking-wide">Chemical Analysis (%)</label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    {['c', 'cr', 'ni', 'mo', 'mn', 'si', 's', 'p'].map(field => (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs font-black uppercase text-gray-500">{field}</label>
                        <input name={field} value={formData[field]} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 focus:border-black focus:outline-none text-sm font-medium" placeholder="0.000" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-10">
                  <label className="text-sm font-bold text-gray-700 uppercase">Material Grade & Specification</label>
                  <input name="material_grade" value={formData.material_grade} onChange={handleInputChange} required className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-black focus:outline-none text-base font-medium" placeholder="e.g. ASTM A182 F51 / S31803" />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-bold uppercase text-gray-500 hover:text-black transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingRecord ? 'Update Changes' : 'Save New Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRecords;