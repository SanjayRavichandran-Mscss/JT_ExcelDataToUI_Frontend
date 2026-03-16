// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Loader2, ChevronDown, ChevronUp, Download, Edit, Trash2,
//   Search, X, ArrowLeft, Plus, Save
// } from 'lucide-react';
// import html2pdf from 'html2pdf.js';
// import logo from './Assets/logo.png';
// import sign1 from './Assets/Signatures/sign1.jpeg';
// import sign2 from './Assets/Signatures/sign2.jpeg';

// const ViewSheets = () => {
//   const [sheets, setSheets] = useState([]);
//   const [filteredSheets, setFilteredSheets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [expandedId, setExpandedId] = useState(null);
//   const [sheetDetails, setSheetDetails] = useState({});
//   const [filterText, setFilterText] = useState('');
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [editingCertificate, setEditingCertificate] = useState(null);

//   const [editForm, setEditForm] = useState({
//     cert_no: '',
//     cert_date: '',
//     delivery_note_no: '',
//     delivery_date: '',
//     customer_name: '',
//     po_no: '',
//     po_date: '',
//     signature: 0,
//     items: [],
//   });

//   const certificateRef = useRef(null);

//   useEffect(() => {
//     fetchSummary();
//   }, []);

//   useEffect(() => {
//     if (!filterText.trim()) {
//       setFilteredSheets(sheets);
//       return;
//     }
//     const lowerFilter = filterText.toLowerCase().trim();
//     const filtered = sheets.filter(sheet =>
//       (sheet.cert_no || '').toLowerCase().includes(lowerFilter) ||
//       (sheet.customer_name || '').toLowerCase().includes(lowerFilter)
//     );
//     setFilteredSheets(filtered);
//   }, [sheets, filterText]);

//   const fetchSummary = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('http://localhost:5000/api/sheet/get-all-certificates');
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || 'Failed to fetch');
//       setSheets(data.certificates || []);
//       setFilteredSheets(data.certificates || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleAccordion = async (id) => {
//     if (expandedId === id) {
//       setExpandedId(null);
//       return;
//     }
//     setExpandedId(id);
//     if (!sheetDetails[id]) {
//       try {
//         const res = await fetch(`http://localhost:5000/api/sheet/get-certificate/${id}`);
//         const result = await res.json();
//         if (result.success) {
//           setSheetDetails(prev => ({ ...prev, [id]: result.data }));
//         }
//       } catch (err) {
//         console.error("Failed to load details:", err);
//       }
//     }
//   };

//   const handleDownloadPDF = (certNo) => {
//     const element = certificateRef.current;
//     if (!element) {
//       console.error("Certificate element not found");
//       alert("Cannot generate PDF — content not rendered");
//       return;
//     }

//     const opt = {
//       margin:       [8, 6, 8, 6],
//       filename:     `Certificate_${(certNo || "unknown").replace(/\//g, "-")}.pdf`,
//       image:        { type: 'jpeg', quality: 0.94 },
//       html2canvas:  {
//         scale:          2.0,
//         useCORS:        true,
//         logging:        false,
//         scrollX:        0,
//         scrollY:        0,
//         windowWidth:    1250,
//         windowHeight:   900,
//         letterRendering: true,
//         allowTaint:     false,
//         onclone: (clonedDoc) => {
//           const style = clonedDoc.createElement('style');
//           style.innerHTML = `
//             @page { size: A4 landscape; margin: 6mm 8mm; }
//             body { font-size: 11px !important; }
//           `;
//           clonedDoc.head.appendChild(style);

//           const images = clonedDoc.querySelectorAll('img');
//           return Promise.all(
//             Array.from(images).map(img => 
//               img.complete ? Promise.resolve() : 
//               new Promise(r => { img.onload = r; img.onerror = r; })
//             )
//           );
//         }
//       },
//       jsPDF: {
//         unit:       'mm',
//         format:     'a4',
//         orientation: 'landscape'
//       },
//       pagebreak: { 
//         mode:      ['avoid-all', 'css', 'legacy'],
//         before:    '.page-break-before',
//         after:     '.page-break-after',
//         avoid:     ['tr', '.signature-section', '.keep-together']
//       }
//     };

//     html2pdf()
//       .set(opt)
//       .from(element)
//       .save()
//       .catch(err => {
//         console.error("PDF generation failed:", err);
//         alert("PDF export failed. Check console.");
//       });
//   };

//   const handleDelete = async (id, certNo) => {
//     if (!window.confirm(`Delete certificate ${certNo}?`)) return;
//     try {
//       const res = await fetch(`http://localhost:5000/api/sheet/delete-certificate/${id}`, { method: 'DELETE' });
//       const result = await res.json();
//       if (result.success) {
//         setSheets(prev => prev.filter(s => s.id !== id));
//         if (expandedId === id) setExpandedId(null);
//         alert('Deleted successfully');
//       } else {
//         alert('Delete failed: ' + (result.error || 'Unknown error'));
//       }
//     } catch (err) {
//       alert('Network error during delete');
//     }
//   };

//   // ───────────────────────────────────────────────
//   //  New helper: convert backend date → "06-Jul-25"
//   // ───────────────────────────────────────────────
//   const formatDateForEdit = (dateStr) => {
//     if (!dateStr) return '';
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return '';

//     const day   = date.getDate().toString().padStart(2, '0');
//     const month = date.toLocaleString('en-US', { month: 'short' });
//     const year  = date.getFullYear().toString().slice(-2);

//     return `${day}-${month}-${year}`;
//   };

//   const openEditModal = async (id) => {
//     let data = sheetDetails[id];
//     if (!data) {
//       try {
//         const res = await fetch(`http://localhost:5000/api/sheet/get-certificate/${id}`);
//         const json = await res.json();
//         if (json.success) data = json.data;
//         else {
//           alert('Could not load data');
//           return;
//         }
//       } catch (err) {
//         alert('Failed to load certificate for editing');
//         return;
//       }
//     }

//     setEditingCertificate(data);
//     setEditForm({
//       cert_no: data.cert_no || '',
//       cert_date: formatDateForEdit(data.cert_date),
//       delivery_note_no: data.delivery_note_no || '',
//       delivery_date: formatDateForEdit(data.delivery_date),
//       customer_name: data.customer_name || '',
//       po_no: data.po_no || '',
//       po_date: formatDateForEdit(data.po_date),
//       signature: data.signature ?? 0,
//       items: data.items ? data.items.map(item => ({ ...item })) : [],
//     });
//     setEditModalOpen(true);
//   };

//   const handleEditHeaderChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleItemChange = (index, field, value) => {
//     setEditForm(prev => {
//       const newItems = [...prev.items];
//       newItems[index] = { ...newItems[index], [field]: value };
//       return { ...prev, items: newItems };
//     });
//   };

//   const addNewItemRow = () => {
//     setEditForm(prev => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         {
//           po_lineitem_no: '',
//           item_size: '',
//           raw_material_size: '',
//           tc_no: '',
//           traceability_no: '',
//           qty_pcs: '',
//           material_grade: '',
//           c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: ''
//         }
//       ]
//     }));
//   };

//   const removeItemRow = (index) => {
//     if (window.confirm("Remove this item row?")) {
//       setEditForm(prev => ({
//         ...prev,
//         items: prev.items.filter((_, i) => i !== index)
//       }));
//     }
//   };

//   const saveUpdatedCertificate = async () => {
//     if (!editingCertificate?.id) return;

//     try {
//       const res = await fetch(`http://localhost:5000/api/sheet/update-certificate/${editingCertificate.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editForm)
//       });
//       const result = await res.json();
//       if (result.success) {
//         alert('Certificate updated successfully');
//         setEditModalOpen(false);
//         fetchSummary();
//         // Refresh detail view
//         const freshRes = await fetch(`http://localhost:5000/api/sheet/get-certificate/${editingCertificate.id}`);
//         const fresh = await freshRes.json();
//         if (fresh.success) {
//           setSheetDetails(prev => ({
//             ...prev,
//             [editingCertificate.id]: fresh.data
//           }));
//         }
//       } else {
//         alert('Update failed: ' + (result.error || 'Unknown error'));
//       }
//     } catch (err) {
//       alert('Network error while saving');
//     }
//   };

//   const clearFilter = () => setFilterText('');

// const formatChemicalValue = (value) => {
//   if (value === undefined || value === null || value === '') return '---';
  
//   const numValue = parseFloat(value);
//   if (isNaN(numValue)) return '---';
  
//   // Zero or very small values → show as '-'
//   if (numValue === 0 || Math.abs(numValue) < 0.0001) return '-';
  
//   // Show number with exactly 3 decimal places (only if needed)
//   // toFixed(3) will always show 3 decimals, but we trim trailing zeros
//   const formatted = numValue.toFixed(3);
//   return formatted.replace(/\.?0+$/, '');   // remove trailing .000 or .500 → .5
// };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <Loader2 className="animate-spin" size={48} />
//     </div>
//   );

//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center text-red-600">
//       Error: {error}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-[1400px] mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
//           Material Test Certificates
//         </h1>

//         {/* Filter */}
//         <div className="mb-8 bg-white p-4 rounded-lg shadow border border-gray-200">
//           <div className="relative max-w-xl mx-auto">
//             <div className="flex items-center gap-3">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                 <input
//                   type="text"
//                   value={filterText}
//                   onChange={(e) => setFilterText(e.target.value)}
//                   placeholder="Search by Certificate No. or Customer Name..."
//                   className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {filterText && (
//                   <button
//                     onClick={clearFilter}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
//                   >
//                     <X size={18} />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           {filteredSheets.length === 0 ? (
//             <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
//               {filterText ? "No certificates match your search" : "No certificates found"}
//             </div>
//           ) : (
//             filteredSheets.map(sheet => (
//               <div key={sheet.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
//                 <div
//                   onClick={() => toggleAccordion(sheet.id)}
//                   className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50"
//                 >
//                   <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//                     <span className="text-xl font-bold text-indigo-700">{sheet.cert_no}</span>
//                     <span className="text-gray-500">•</span>
//                     <span className="font-medium text-gray-700">{sheet.customer_name}</span>
//                   </div>
//                   <div className="flex items-center gap-6">
//                     <span className="text-sm text-gray-500">Items: {sheet.item_count || 0}</span>
//                     {expandedId === sheet.id ? <ChevronUp /> : <ChevronDown />}
//                   </div>
//                 </div>

//                 {expandedId === sheet.id && (
//                   <div className="p-6 border-t bg-gray-50">
//                     {!sheetDetails[sheet.id] ? (
//                       <div className="flex justify-center py-12">
//                         <Loader2 className="animate-spin text-indigo-600" size={36} />
//                       </div>
//                     ) : (
//                       <>
//                         <div className="flex flex-wrap justify-end gap-4 mb-6">
//                           <button
//                             onClick={() => openEditModal(sheet.id)}
//                             className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
//                           >
//                             <Edit size={18} /> Edit
//                           </button>
//                           <button
//                             onClick={() => handleDownloadPDF(sheet.cert_no)}
//                             className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900"
//                           >
//                             <Download size={18} /> PDF
//                           </button>
//                           <button
//                             onClick={() => handleDelete(sheet.id, sheet.cert_no)}
//                             className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700"
//                           >
//                             <Trash2 size={18} /> Delete
//                           </button>
//                         </div>

//                         <CertificateLayout
//                           data={sheetDetails[sheet.id]}
//                           ref={certificateRef}
//                           formatChemicalValue={formatChemicalValue}
//                         />
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* ─── FULL SCREEN EDIT MODAL ─────────────────────────────────────────────── */}
//       {editModalOpen && (
//         <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
//           {/* Top Bar */}
//           <div className="border-b px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
//             <button
//               onClick={() => setEditModalOpen(false)}
//               className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
//             >
//               <ArrowLeft size={24} /> Back
//             </button>
//             <h2 className="text-xl font-bold text-gray-900">
//               Edit Certificate {editForm.cert_no ? ` – ${editForm.cert_no}` : ''}
//             </h2>
//             <div className="w-10"></div>
//           </div>

//           {/* Scrollable Content */}
//           <div className="flex-1 overflow-y-auto p-6 md:p-10">
//             <div className="max-w-6xl mx-auto space-y-14 pb-20">

//               {/* Header Fields */}
//               <section>
//                 <h3 className="text-2xl font-bold mb-6 text-gray-900">Certificate Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {[
//                     { label: 'Certificate No', name: 'cert_no', type: 'text' },
//                     { label: 'Certificate Date', name: 'cert_date', type: 'text', placeholder: '06-Jul-25' },
//                     { label: 'Customer Name', name: 'customer_name', type: 'text' },
//                     { label: 'P.O. Number', name: 'po_no', type: 'text' },
//                     { label: 'P.O. Date', name: 'po_date', type: 'text', placeholder: '06-Jul-25' },
//                     { label: 'Delivery Note No', name: 'delivery_note_no', type: 'text' },
//                     { label: 'Delivery Date', name: 'delivery_date', type: 'text', placeholder: '06-Jul-25' },
//                   ].map(field => (
//                     <div key={field.name} className="flex flex-col">
//                       <label className="text-sm font-medium text-gray-700 mb-2">{field.label}</label>
//                       <input
//                         type={field.type || 'text'}
//                         name={field.name}
//                         value={editForm[field.name] || ''}
//                         onChange={handleEditHeaderChange}
//                         placeholder={field.placeholder || ''}
//                         pattern={field.type === 'text' && field.placeholder ? "\\d{2}-[A-Za-z]{3}-\\d{2}" : undefined}
//                         title={field.placeholder ? "Format: dd-MMM-yy (e.g. 06-Jul-25)" : undefined}
//                         className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </section>

//               {/* Items Section */}
//               <section>
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-2xl font-bold text-gray-900">Items / Line Items</h3>
//                   <button
//                     onClick={addNewItemRow}
//                     className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors"
//                   >
//                     <Plus size={20} /> Add New Item
//                   </button>
//                 </div>

//                 {editForm.items.length === 0 ? (
//                   <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-xl bg-gray-50">
//                     No items added yet. Click "Add New Item" to start.
//                   </div>
//                 ) : (
//                   <div className="space-y-10">
//                     {editForm.items.map((item, idx) => (
//                       <div
//                         key={idx}
//                         className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative shadow-sm"
//                       >
//                         <button
//                           onClick={() => removeItemRow(idx)}
//                           className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors"
//                           title="Remove this item"
//                         >
//                           <Trash2 size={22} />
//                         </button>

//                         {/* General Item Fields */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                           {[
//                             { label: 'PO Line Item No', field: 'po_lineitem_no' },
//                             { label: 'Item & Size', field: 'item_size' },
//                             { label: 'Raw Material Size', field: 'raw_material_size' },
//                             { label: 'T.C. No', field: 'tc_no' },
//                             { label: 'Traceability No', field: 'traceability_no' },
//                             { label: 'Quantity (Pcs)', field: 'qty_pcs' },
//                             { label: 'Material Grade / Conf. To', field: 'material_grade' },
//                           ].map(f => (
//                             <div key={f.field} className="flex flex-col">
//                               <label className="text-sm font-medium text-gray-700 mb-2">{f.label}</label>
//                               <input
//                                 value={item[f.field] || ''}
//                                 onChange={e => handleItemChange(idx, f.field, e.target.value)}
//                                 className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
//                               />
//                             </div>
//                           ))}
//                         </div>

//                         {/* Chemical Composition */}
//                         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                           <div className="bg-gray-100 px-5 py-3 font-medium text-gray-800 border-b">
//                             Chemical Composition (%)
//                           </div>
//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-200">
//                             {[
//                               { label: 'C', field: 'c' },
//                               { label: 'Cr', field: 'cr' },
//                               { label: 'Ni', field: 'ni' },
//                               { label: 'Mo', field: 'mo' },
//                               { label: 'Mn', field: 'mn' },
//                               { label: 'Si', field: 'si' },
//                               { label: 'S', field: 's' },
//                               { label: 'P', field: 'p' },
//                               { label: 'Cu', field: 'cu' },
//                               { label: 'Fe', field: 'fe' },
//                               { label: 'Co', field: 'co' },
//                             ].map(({ label, field }) => (
//                               <div key={field} className="flex flex-col p-4">
//                                 <span className="text-sm font-medium text-gray-700 mb-2">{label}</span>
//                                 <input
//                                   value={item[field] || ''}
//                                   onChange={e => handleItemChange(idx, field, e.target.value)}
//                                   className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-center"
//                                   placeholder="—"
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </section>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-4 pt-8 border-t sticky bottom-0 bg-white py-4 -mx-6 md:-mx-10 px-6 md:px-10">
//                 <button
//                   onClick={() => setEditModalOpen(false)}
//                   className="px-10 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={saveUpdatedCertificate}
//                   className="flex items-center gap-2 px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow font-medium transition-colors"
//                 >
//                   <Save size={18} /> Save Certificate
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CertificateLayout = React.forwardRef(({ data, formatChemicalValue }, ref) => {
//   const getFormattedDate = (dateStr) => {
//     if (!dateStr) return '—';
//     const date = new Date(dateStr);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = date.toLocaleString('default', { month: 'short' });
//     const year = date.getFullYear().toString().slice(-2);
//     return `${day}-${month}-${year}`;
//   };

//   const displayValue = (value) => {
//     if (value === undefined || value === null || value === '') return '---';
//     return value;
//   };

//   const processedItems = React.useMemo(() => {
//     if (!data?.items?.length) return [];

//     const result = [];
//     let currentPo = null;
//     let counter = 0;

//     data.items.forEach((item) => {
//       const po = item.po_lineitem_no || '—';

//       if (po === currentPo && po !== '—') {
//         counter++;
//         result.push({
//           ...item,
//           displayPo: `${po}.${counter}`
//         });
//       } else {
//         currentPo = po;
//         counter = 0;
//         result.push({
//           ...item,
//           displayPo: po
//         });
//       }
//     });

//     return result;
//   }, [data?.items]);

//   const styles = {
//     reportContainer: {
//       width: '1200px',
//       margin: '0 auto',
//       backgroundColor: 'white',
//       fontFamily: 'Arial, sans-serif',
//       fontSize: '11px',
//       color: '#000',
//     },
//     page: {
//       width: '1200px',
//       minHeight: '780px',
//       border: '2px solid #000',
//       backgroundColor: 'white',
//       marginBottom: '12px',
//       boxSizing: 'border-box',
//     },
//     table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
//     cell: {
//       border: '1px solid #000',
//       padding: '10px 4px',
//       textAlign: 'center',
//       verticalAlign: 'middle',
//       wordWrap: 'break-word',
//     },
//     tracecell: {
//       fontSize: '10px',
//       border: '1px solid #000',
//       padding: '4px 3px',
//       textAlign: 'center',
//       verticalAlign: 'middle',
//       wordWrap: 'break-word',
//     },
//     bold: { fontWeight: 'bold' },
//     textLeft: { textAlign: 'left', paddingLeft: '8px' },
//     textRight: { textAlign: 'right', paddingRight: '8px' },
//     arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
//     companyTitle: { fontSize: '18px', fontWeight: 'bold' },
//     address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
//     nestedTable: { border: 'none', width: '100%', height: '30px', borderCollapse: 'collapse' },
//     nestedCell: { border: 'none', padding: '8px 9px', borderLeft: '1px solid #000', textAlign: 'left' },
//     signatureImg: { width: '160px', display: 'block', margin: '12px auto 0 auto' },
//   };

//   let signatureImage = null;
//   if (data.signature === 1) signatureImage = sign1;
//   if (data.signature === 2) signatureImage = sign2;

//   let testMessages = [];
//   if (data.test_line_items) {
//     if (Array.isArray(data.test_line_items)) {
//       testMessages = data.test_line_items;
//     } else if (typeof data.test_line_items === 'string') {
//       try {
//         const parsed = JSON.parse(data.test_line_items);
//         if (Array.isArray(parsed)) testMessages = parsed;
//         else testMessages = [data.test_line_items];
//       } catch {
//         testMessages = [data.test_line_items];
//       }
//     }
//   }

//   const HeaderSection = () => (
//     <table style={styles.table}>
//       <tbody>
//         <tr>
//           <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
//             Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024
//           </td>
//           <td colSpan="6" style={{ ...styles.cell, ...styles.textRight, borderBottom: 'none', borderLeft: 'none', fontSize: '10px' }}>
//             C.R. 2055012479
//           </td>
//           <td rowSpan="2" style={{ ...styles.cell, width: '110px' }}>
//             <img src={logo} alt="ICCL" style={{ width: '90px', display: 'block', margin: '0 auto' }} crossOrigin="anonymous" />
//           </td>
//         </tr>

//         <tr>
//           <td colSpan="17" style={{ ...styles.cell, padding: '6px 15px' }}>
//             <div style={{ textAlign: 'center' }}>
//               <span style={styles.companyTitle}>Instrumentation & Controls Co. Ltd. (ICCL).</span>
//               <span style={styles.arabic}>شركة الآلات الدقيقة والتحكم المحدودة</span>
//               <div style={styles.address}>
//                 Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA  
//                 Email:info@icclksa.com , Web:www.icclksa.com
//               </div>
//             </div>
//           </td>
//         </tr>

//         <tr>
//           <td colSpan="13" style={{ ...styles.cell, ...styles.bold, fontSize: '14px' }}>
//             MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
//           </td>
//           <td colSpan="5" style={{ padding: 0, border: '1px solid #000' }}>
//             <table style={styles.nestedTable}>
//               <tbody>
//                 <tr>
//                   <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold', borderLeft: 'none', textAlign: 'right', width: '191px'}}>
//                     CERT.NO.:
//                   </td>
//                   <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>
//                     {data.cert_no || '—'}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td style={{ ...styles.nestedCell, fontWeight: 'bold', borderLeft: 'none', textAlign: 'right' }}>
//                     DATE:
//                   </td>
//                   <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>
//                     {getFormattedDate(data.cert_date)}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </td>
//         </tr>

//         <tr>
//           <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textRight }}>CUSTOMER NAME</td>
//           <td colSpan="10" style={{ ...styles.cell, ...styles.textLeft, ...styles.bold }}>
//             {displayValue(data.customer_name)}
//           </td>
//           <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Delivery Note No.:</td>
//           <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px', paddingLeft: '10px' }}>
//             {displayValue(data.delivery_note_no)}
//           </td>
//         </tr>

//         <tr>
//           <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textRight }}>P.O.NO.</td>
//           <td colSpan="5" style={{ ...styles.cell, ...styles.textLeft }}>{displayValue(data.po_no)}</td>
//           <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
//           <td colSpan="3" style={styles.cell}>{displayValue(data.po_date)}</td>
//           <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Date:</td>
//           <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{displayValue(data.delivery_date)}</td>
//         </tr>
//       </tbody>
//     </table>
//   );

//   const ItemsHeaderRow = () => (
//     <>
//       <tr style={styles.bold}>
//         <td style={{ ...styles.cell, width: '38px' }}>PO<br />L/1</td>
//         <td style={{ ...styles.cell, width: '153.5px' }}>ITEM & SIZE</td>
//         <td style={{ ...styles.cell, width: '82px' }}>RAW<br />MTL. SIZE</td>
//         <td style={{ ...styles.cell, width: '60px' }}>T.C.NO.</td>
//         <td style={{ ...styles.tracecell, width: '81px' }}>Traceability<br />no-</td>
//         <td colSpan="11" style={{ ...styles.cell}}>CHEMICAL COMPOSITION %</td>
//         <td style={{ ...styles.cell, width: '48px' }}>QTY<br />PCS</td>
//         <td style={{ ...styles.cell, width: '126px' }}>MATL.<br />Conf.To</td>
//       </tr>

//       <tr style={{ ...styles.bold, fontSize: '10px' }}>
//         <td colSpan="5" style={{ ...styles.cell}}></td>
//         {['C','Cr','Ni','Mo','Mn','Si','S','P','Cu','Fe','Co'].map(c => (
//           <td key={c} style={{ ...styles.cell, width: '55px' }}>{c}</td>
//         ))}
//         <td colSpan="2" style={styles.cell}></td>
//       </tr>
//     </>
//   );

//   const FooterSection = () => (
//     <table style={styles.table}>
//       <tbody>
//         <tr>
//           <td colSpan="11" style={{ ...styles.cell, textAlign: 'left', padding: '12px 10px', fontSize: '11px' }}>
//             <span style={styles.bold}>
//               WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS <br />
//               FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
//             </span>
//           </td>
//           <td colSpan="7" style={{ ...styles.cell, height: '158px', verticalAlign: 'top', padding: '12px', textAlign: 'center' }}>
//             <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
//             {signatureImage && (
//               <img
//                 src={signatureImage}
//                 alt="Signature"
//                 style={styles.signatureImg}
//                 crossOrigin="anonymous"
//               />
//             )}
//           </td>
//         </tr>
//       </tbody>
//     </table>
//   );

//   return (
//     <div style={{ overflowX: 'auto', padding: '12px 0' }} ref={ref}>
//       <div style={styles.reportContainer}>
//         <div style={styles.page}>
//           <HeaderSection />

//           <table style={styles.table}>
//             <tbody>
//               <ItemsHeaderRow />

//               {processedItems.map((item, idx) => (
//                 <tr
//                   key={idx}
//                   className="item-row"
//                   style={{
//                     pageBreakInside: 'avoid',
//                     breakInside: 'avoid',
//                   }}
//                 >
//                   <td style={styles.cell}>{item.displayPo}</td>
//                   <td style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>
//                     {displayValue(item.item_size)}
//                   </td>
//                   <td style={styles.cell}>{displayValue(item.raw_material_size)}</td>
//                   <td style={styles.cell}>{displayValue(item.tc_no)}</td>
//                   <td style={styles.tracecell}>{displayValue(item.traceability_no)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.c)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.cr)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.ni)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.mo)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.mn)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.si)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.s)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.p)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.cu)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.fe)}</td>
//                   <td style={styles.cell}>{formatChemicalValue(item.co)}</td>
//                   <td style={styles.cell}>{displayValue(item.qty_pcs)}</td>
//                   <td style={{ ...styles.cell, ...styles.textLeft }}>
//                     {displayValue(item.material_grade)}
//                   </td>
//                 </tr>
//               ))}

//               {testMessages.length > 0 && (
//                 <tr>
//                   <td
//                     colSpan="18"
//                     style={{
//                       ...styles.cell,
//                       textAlign: 'left',
//                       padding: '20px 16px',
//                       whiteSpace: 'pre-line',
//                       lineHeight: '1.55',
//                       pageBreakInside: 'avoid',
//                       breakInside: 'avoid',
//                     }}
//                   >
//                     {testMessages.map((msg, i) => (
//                       <div key={i} style={{ marginBottom: i < testMessages.length - 1 ? '28px' : '0' }}>
//                         {msg}
//                       </div>
//                     ))}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: 'auto' }}>
//             <FooterSection />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// export default ViewSheets;













































import React, { useState, useEffect, useRef } from 'react';
import {
  Loader2, ChevronDown, ChevronUp, Download, Edit, Trash2,
  Search, X, ArrowLeft, Plus, Save
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import logo from './Assets/logo.png';
import sign1 from './Assets/Signatures/sign1.jpeg';
import sign2 from './Assets/Signatures/sign2.jpeg';

const ViewSheets = () => {
  const [sheets, setSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [sheetDetails, setSheetDetails] = useState({});
  const [filterText, setFilterText] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);

  const [editForm, setEditForm] = useState({
    cert_no: '',
    cert_date: '',
    delivery_note_no: '',
    delivery_date: '',
    customer_name: '',
    po_no: '',
    po_date: '',
    signature: 0,
    items: [],
  });

  const certificateRef = useRef(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (!filterText.trim()) {
      setFilteredSheets(sheets);
      return;
    }
    const lowerFilter = filterText.toLowerCase().trim();
    const filtered = sheets.filter(sheet =>
      (sheet.cert_no || '').toLowerCase().includes(lowerFilter) ||
      (sheet.customer_name || '').toLowerCase().includes(lowerFilter)
    );
    setFilteredSheets(filtered);
  }, [sheets, filterText]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sheet/get-all-certificates');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      setSheets(data.certificates || []);
      setFilteredSheets(data.certificates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!sheetDetails[id]) {
      try {
        const res = await fetch(`http://localhost:5000/api/sheet/get-certificate/${id}`);
        const result = await res.json();
        if (result.success) {
          setSheetDetails(prev => ({ ...prev, [id]: result.data }));
        }
      } catch (err) {
        console.error("Failed to load details:", err);
      }
    }
  };

  const handleDownloadPDF = (certNo) => {
    const element = certificateRef.current;
    if (!element) {
      console.error("Certificate element not found");
      alert("Cannot generate PDF — content not rendered");
      return;
    }

    const opt = {
      margin:       [8, 6, 8, 6],
      filename:     `Certificate_${(certNo || "unknown").replace(/\//g, "-")}.pdf`,
      image:        { type: 'jpeg', quality: 0.94 },
      html2canvas:  {
        scale:          2.0,
        useCORS:        true,
        logging:        false,
        scrollX:        0,
        scrollY:        0,
        windowWidth:    1250,
        windowHeight:   900,
        letterRendering: true,
        allowTaint:     false,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            @page { size: A4 landscape; margin: 6mm 8mm; }
            body { font-size: 11px !important; }
          `;
          clonedDoc.head.appendChild(style);

          const images = clonedDoc.querySelectorAll('img');
          return Promise.all(
            Array.from(images).map(img => 
              img.complete ? Promise.resolve() : 
              new Promise(r => { img.onload = r; img.onerror = r; })
            )
          );
        }
      },
      jsPDF: {
        unit:       'mm',
        format:     'a4',
        orientation: 'landscape'
      },
      pagebreak: { 
        mode:      ['avoid-all', 'css', 'legacy'],
        before:    '.page-break-before',
        after:     '.page-break-after',
        avoid:     ['tr', '.signature-section', '.keep-together']
      }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .catch(err => {
        console.error("PDF generation failed:", err);
        alert("PDF export failed. Check console.");
      });
  };

  const handleDelete = async (id, certNo) => {
    if (!window.confirm(`Delete certificate ${certNo}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sheet/delete-certificate/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setSheets(prev => prev.filter(s => s.id !== id));
        if (expandedId === id) setExpandedId(null);
        alert('Deleted successfully');
      } else {
        alert('Delete failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error during delete');
    }
  };

  const formatDateForEdit = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const day   = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year  = date.getFullYear().toString().slice(-2);

    return `${day}-${month}-${year}`;
  };

  const openEditModal = async (id) => {
    let data = sheetDetails[id];
    if (!data) {
      try {
        const res = await fetch(`http://localhost:5000/api/sheet/get-certificate/${id}`);
        const json = await res.json();
        if (json.success) data = json.data;
        else {
          alert('Could not load data');
          return;
        }
      } catch (err) {
        alert('Failed to load certificate for editing');
        return;
      }
    }

    setEditingCertificate(data);
    setEditForm({
      cert_no: data.cert_no || '',
      cert_date: formatDateForEdit(data.cert_date),
      delivery_note_no: data.delivery_note_no || '',
      delivery_date: formatDateForEdit(data.delivery_date),
      customer_name: data.customer_name || '',
      po_no: data.po_no || '',
      po_date: formatDateForEdit(data.po_date),
      signature: data.signature ?? 0,
      items: data.items ? data.items.map(item => ({ ...item })) : [],
    });
    setEditModalOpen(true);
  };

  const handleEditHeaderChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setEditForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addNewItemRow = () => {
    setEditForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          po_lineitem_no: '',
          item_size: '',
          raw_material_size: '',
          tc_no: '',
          traceability_no: '',
          qty_pcs: '',
          material_grade: '',
          c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: ''
        }
      ]
    }));
  };

  const removeItemRow = (index) => {
    if (window.confirm("Remove this item row?")) {
      setEditForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const saveUpdatedCertificate = async () => {
    if (!editingCertificate?.id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/sheet/update-certificate/${editingCertificate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const result = await res.json();
      if (result.success) {
        alert('Certificate updated successfully');
        setEditModalOpen(false);
        fetchSummary();
        const freshRes = await fetch(`http://localhost:5000/api/sheet/get-certificate/${editingCertificate.id}`);
        const fresh = await freshRes.json();
        if (fresh.success) {
          setSheetDetails(prev => ({
            ...prev,
            [editingCertificate.id]: fresh.data
          }));
        }
      } else {
        alert('Update failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while saving');
    }
  };

  const clearFilter = () => setFilterText('');

  const formatChemicalValue = (value) => {
    if (value === undefined || value === null || value === '') return '---';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '---';
    
    if (numValue === 0 || Math.abs(numValue) < 0.0001) return '-';
    
    const formatted = numValue.toFixed(3);
    return formatted.replace(/\.?0+$/, '');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" size={48} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Material Test Certificates
        </h1>

        {/* Filter */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="relative max-w-xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Search by Certificate No. or Customer Name..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {filterText && (
                  <button
                    onClick={clearFilter}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredSheets.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
              {filterText ? "No certificates match your search" : "No certificates found"}
            </div>
          ) : (
            filteredSheets.map(sheet => (
              <div key={sheet.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div
                  onClick={() => toggleAccordion(sheet.id)}
                  className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="text-xl font-bold text-indigo-700">{sheet.cert_no}</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-medium text-gray-700">{sheet.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500">Items: {sheet.item_count || 0}</span>
                    {expandedId === sheet.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {expandedId === sheet.id && (
                  <div className="p-6 border-t bg-gray-50">
                    {!sheetDetails[sheet.id] ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-indigo-600" size={36} />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap justify-end gap-4 mb-6">
                          <button
                            onClick={() => openEditModal(sheet.id)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
                          >
                            <Edit size={18} /> Edit
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(sheet.cert_no)}
                            className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900"
                          >
                            <Download size={18} /> PDF
                          </button>
                          <button
                            onClick={() => handleDelete(sheet.id, sheet.cert_no)}
                            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700"
                          >
                            <Trash2 size={18} /> Delete
                          </button>
                        </div>

                        <CertificateLayout
                          data={sheetDetails[sheet.id]}
                          ref={certificateRef}
                          formatChemicalValue={formatChemicalValue}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── FULL SCREEN EDIT MODAL ─────────────────────────────────────────────── */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="border-b px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
            <button
              onClick={() => setEditModalOpen(false)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
            >
              <ArrowLeft size={24} /> Back
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Edit Certificate {editForm.cert_no ? ` – ${editForm.cert_no}` : ''}
            </h2>
            <div className="w-10"></div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-14 pb-20">

              {/* Header Fields */}
              <section>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Certificate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Certificate No', name: 'cert_no', type: 'text' },
                    { label: 'Certificate Date', name: 'cert_date', type: 'text', placeholder: '06-Jul-25' },
                    { label: 'Customer Name', name: 'customer_name', type: 'text' },
                    { label: 'P.O. Number', name: 'po_no', type: 'text' },
                    { label: 'P.O. Date', name: 'po_date', type: 'text', placeholder: '06-Jul-25' },
                    { label: 'Delivery Note No', name: 'delivery_note_no', type: 'text' },
                    { label: 'Delivery Date', name: 'delivery_date', type: 'text', placeholder: '06-Jul-25' },
                  ].map(field => (
                    <div key={field.name} className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={editForm[field.name] || ''}
                        onChange={handleEditHeaderChange}
                        placeholder={field.placeholder || ''}
                        pattern={field.type === 'text' && field.placeholder ? "\\d{2}-[A-Za-z]{3}-\\d{2}" : undefined}
                        title={field.placeholder ? "Format: dd-MMM-yy (e.g. 06-Jul-25)" : undefined}
                        className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Signature Selection - NEW */}
              <section>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Signature</h3>
                <div className="flex flex-wrap gap-8">
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="signature"
                      value={0}
                      checked={editForm.signature === 0}
                      onChange={() => setEditForm(prev => ({ ...prev, signature: 0 }))}
                      className="mb-2"
                    />
                    <div className="text-center">
                      <div className="text-gray-700 font-medium">None</div>
                    </div>
                  </label>

                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="signature"
                      value={1}
                      checked={editForm.signature === 1}
                      onChange={() => setEditForm(prev => ({ ...prev, signature: 1 }))}
                      className="mb-2"
                    />
                    <div className="text-center">
                      <img
                        src={sign1}
                        alt="Signature 1"
                        className="w-32 h-auto border border-gray-300 rounded shadow-sm"
                      />
                      <div className="mt-2 text-gray-700 font-medium">Sign 1</div>
                    </div>
                  </label>

                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="signature"
                      value={2}
                      checked={editForm.signature === 2}
                      onChange={() => setEditForm(prev => ({ ...prev, signature: 2 }))}
                      className="mb-2"
                    />
                    <div className="text-center">
                      <img
                        src={sign2}
                        alt="Signature 2"
                        className="w-32 h-auto border border-gray-300 rounded shadow-sm"
                      />
                      <div className="mt-2 text-gray-700 font-medium">Sign 2</div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Items Section */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Items / Line Items</h3>
                  <button
                    onClick={addNewItemRow}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors"
                  >
                    <Plus size={20} /> Add New Item
                  </button>
                </div>

                {editForm.items.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-xl bg-gray-50">
                    No items added yet. Click "Add New Item" to start.
                  </div>
                ) : (
                  <div className="space-y-10">
                    {editForm.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative shadow-sm"
                      >
                        <button
                          onClick={() => removeItemRow(idx)}
                          className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors"
                          title="Remove this item"
                        >
                          <Trash2 size={22} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                          {[
                            { label: 'PO Line Item No', field: 'po_lineitem_no' },
                            { label: 'Item & Size', field: 'item_size' },
                            { label: 'Raw Material Size', field: 'raw_material_size' },
                            { label: 'T.C. No', field: 'tc_no' },
                            { label: 'Traceability No', field: 'traceability_no' },
                            { label: 'Quantity (Pcs)', field: 'qty_pcs' },
                            { label: 'Material Grade / Conf. To', field: 'material_grade' },
                          ].map(f => (
                            <div key={f.field} className="flex flex-col">
                              <label className="text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                              <input
                                value={item[f.field] || ''}
                                onChange={e => handleItemChange(idx, f.field, e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gray-100 px-5 py-3 font-medium text-gray-800 border-b">
                            Chemical Composition (%)
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-200">
                            {[
                              { label: 'C', field: 'c' },
                              { label: 'Cr', field: 'cr' },
                              { label: 'Ni', field: 'ni' },
                              { label: 'Mo', field: 'mo' },
                              { label: 'Mn', field: 'mn' },
                              { label: 'Si', field: 'si' },
                              { label: 'S', field: 's' },
                              { label: 'P', field: 'p' },
                              { label: 'Cu', field: 'cu' },
                              { label: 'Fe', field: 'fe' },
                              { label: 'Co', field: 'co' },
                            ].map(({ label, field }) => (
                              <div key={field} className="flex flex-col p-4">
                                <span className="text-sm font-medium text-gray-700 mb-2">{label}</span>
                                <input
                                  value={item[field] || ''}
                                  onChange={e => handleItemChange(idx, field, e.target.value)}
                                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                  placeholder="—"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-8 border-t sticky bottom-0 bg-white py-4 -mx-6 md:-mx-10 px-6 md:px-10">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-10 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveUpdatedCertificate}
                  className="flex items-center gap-2 px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow font-medium transition-colors"
                >
                  <Save size={18} /> Save Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CertificateLayout = React.forwardRef(({ data, formatChemicalValue }, ref) => {
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  const displayValue = (value) => {
    if (value === undefined || value === null || value === '') return '---';
    return value;
  };

  const processedItems = React.useMemo(() => {
    if (!data?.items?.length) return [];

    const result = [];
    let currentPo = null;
    let counter = 0;

    data.items.forEach((item) => {
      const po = item.po_lineitem_no || '—';

      if (po === currentPo && po !== '—') {
        counter++;
        result.push({
          ...item,
          displayPo: `${po}.${counter}`
        });
      } else {
        currentPo = po;
        counter = 0;
        result.push({
          ...item,
          displayPo: po
        });
      }
    });

    return result;
  }, [data?.items]);

  const styles = {
    reportContainer: {
      width: '1200px',
      margin: '0 auto',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#000',
    },
    page: {
      width: '1200px',
      minHeight: '780px',
      border: '2px solid #000',
      backgroundColor: 'white',
      marginBottom: '12px',
      boxSizing: 'border-box',
    },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    cell: {
      border: '1px solid #000',
      padding: '10px 4px',
      textAlign: 'center',
      verticalAlign: 'middle',
      wordWrap: 'break-word',
    },
    tracecell: {
      fontSize: '10px',
      border: '1px solid #000',
      padding: '4px 3px',
      textAlign: 'center',
      verticalAlign: 'middle',
      wordWrap: 'break-word',
    },
    bold: { fontWeight: 'bold' },
    textLeft: { textAlign: 'left', paddingLeft: '8px' },
    textRight: { textAlign: 'right', paddingRight: '8px' },
    arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
    companyTitle: { fontSize: '18px', fontWeight: 'bold' },
    address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
    nestedTable: { border: 'none', width: '100%', height: '30px', borderCollapse: 'collapse' },
    nestedCell: { border: 'none', padding: '8px 9px', borderLeft: '1px solid #000', textAlign: 'left' },
    signatureImg: { width: '160px', display: 'block', margin: '12px auto 0 auto' },
  };

  let signatureImage = null;
  if (data.signature === 1) signatureImage = sign1;
  if (data.signature === 2) signatureImage = sign2;

  let testMessages = [];
  if (data.test_line_items) {
    if (Array.isArray(data.test_line_items)) {
      testMessages = data.test_line_items;
    } else if (typeof data.test_line_items === 'string') {
      try {
        const parsed = JSON.parse(data.test_line_items);
        if (Array.isArray(parsed)) testMessages = parsed;
        else testMessages = [data.test_line_items];
      } catch {
        testMessages = [data.test_line_items];
      }
    }
  }

  const HeaderSection = () => (
    <table style={styles.table}>
      <tbody>
        <tr>
          <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
            Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024
          </td>
          <td colSpan="6" style={{ ...styles.cell, ...styles.textRight, borderBottom: 'none', borderLeft: 'none', fontSize: '10px' }}>
            C.R. 2055012479
          </td>
          <td rowSpan="2" style={{ ...styles.cell, width: '110px' }}>
            <img src={logo} alt="ICCL" style={{ width: '90px', display: 'block', margin: '0 auto' }} crossOrigin="anonymous" />
          </td>
        </tr>

        <tr>
          <td colSpan="17" style={{ ...styles.cell, padding: '6px 15px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={styles.companyTitle}>Instrumentation & Controls Co. Ltd. (ICCL).</span>
              <span style={styles.arabic}>شركة الآلات الدقيقة والتحكم المحدودة</span>
              <div style={styles.address}>
                Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA  
                Email:info@icclksa.com , Web:www.icclksa.com
              </div>
            </div>
          </td>
        </tr>

        <tr>
          <td colSpan="13" style={{ ...styles.cell, ...styles.bold, fontSize: '14px' }}>
            MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
          </td>
          <td colSpan="5" style={{ padding: 0, border: '1px solid #000' }}>
            <table style={styles.nestedTable}>
              <tbody>
                <tr>
                  <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold', borderLeft: 'none', textAlign: 'right', width: '191px'}}>
                    CERT.NO.:
                  </td>
                  <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                    {data.cert_no || '—'}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.nestedCell, fontWeight: 'bold', borderLeft: 'none', textAlign: 'right' }}>
                    DATE:
                  </td>
                  <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>
                    {getFormattedDate(data.cert_date)}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        <tr>
          <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textRight }}>CUSTOMER NAME</td>
          <td colSpan="10" style={{ ...styles.cell, ...styles.textLeft, ...styles.bold }}>
            {displayValue(data.customer_name)}
          </td>
          <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Delivery Note No.:</td>
          <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px', paddingLeft: '10px' }}>
            {displayValue(data.delivery_note_no)}
          </td>
        </tr>

        <tr>
          <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textRight }}>P.O.NO.</td>
          <td colSpan="5" style={{ ...styles.cell, ...styles.textLeft }}>{displayValue(data.po_no)}</td>
          <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
          <td colSpan="3" style={styles.cell}>{displayValue(data.po_date)}</td>
          <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Date:</td>
          <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{displayValue(data.delivery_date)}</td>
        </tr>
      </tbody>
    </table>
  );

  const ItemsHeaderRow = () => (
    <>
      <tr style={styles.bold}>
        <td style={{ ...styles.cell, width: '38px' }}>PO<br />L/1</td>
        <td style={{ ...styles.cell, width: '153.5px' }}>ITEM & SIZE</td>
        <td style={{ ...styles.cell, width: '82px' }}>RAW<br />MTL. SIZE</td>
        <td style={{ ...styles.cell, width: '60px' }}>T.C.NO.</td>
        <td style={{ ...styles.tracecell, width: '81px' }}>Traceability<br />no-</td>
        <td colSpan="11" style={{ ...styles.cell}}>CHEMICAL COMPOSITION %</td>
        <td style={{ ...styles.cell, width: '48px' }}>QTY<br />PCS</td>
        <td style={{ ...styles.cell, width: '126px' }}>MATL.<br />Conf.To</td>
      </tr>

      <tr style={{ ...styles.bold, fontSize: '10px' }}>
        <td colSpan="5" style={{ ...styles.cell}}></td>
        {['C','Cr','Ni','Mo','Mn','Si','S','P','Cu','Fe','Co'].map(c => (
          <td key={c} style={{ ...styles.cell, width: '55px' }}>{c}</td>
        ))}
        <td colSpan="2" style={styles.cell}></td>
      </tr>
    </>
  );

  const FooterSection = () => (
    <table style={styles.table}>
      <tbody>
        <tr>
          <td colSpan="11" style={{ ...styles.cell, textAlign: 'left', padding: '12px 10px', fontSize: '11px' }}>
            <span style={styles.bold}>
              WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS <br />
              FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
            </span>
          </td>
          <td colSpan="7" style={{ ...styles.cell, height: '158px', verticalAlign: 'top', padding: '12px', textAlign: 'center' }}>
            <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
            {signatureImage && (
              <img
                src={signatureImage}
                alt="Signature"
                style={styles.signatureImg}
                crossOrigin="anonymous"
              />
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div style={{ overflowX: 'auto', padding: '12px 0' }} ref={ref}>
      <div style={styles.reportContainer}>
        <div style={styles.page}>
          <HeaderSection />

          <table style={styles.table}>
            <tbody>
              <ItemsHeaderRow />

              {processedItems.map((item, idx) => (
                <tr
                  key={idx}
                  className="item-row"
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}
                >
                  <td style={styles.cell}>{item.displayPo}</td>
                  <td style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>
                    {displayValue(item.item_size)}
                  </td>
                  <td style={styles.cell}>{displayValue(item.raw_material_size)}</td>
                  <td style={styles.cell}>{displayValue(item.tc_no)}</td>
                  <td style={styles.tracecell}>{displayValue(item.traceability_no)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.c)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.cr)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.ni)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.mo)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.mn)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.si)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.s)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.p)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.cu)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.fe)}</td>
                  <td style={styles.cell}>{formatChemicalValue(item.co)}</td>
                  <td style={styles.cell}>{displayValue(item.qty_pcs)}</td>
                  <td style={{ ...styles.cell, ...styles.textLeft }}>
                    {displayValue(item.material_grade)}
                  </td>
                </tr>
              ))}

              {testMessages.length > 0 && (
                <tr>
                  <td
                    colSpan="18"
                    style={{
                      ...styles.cell,
                      textAlign: 'left',
                      padding: '20px 16px',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.55',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                    }}
                  >
                    {testMessages.map((msg, i) => (
                      <div key={i} style={{ marginBottom: i < testMessages.length - 1 ? '28px' : '0' }}>
                        {msg}
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: 'auto' }}>
            <FooterSection />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ViewSheets;