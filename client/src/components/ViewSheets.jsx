// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Loader2, ChevronDown, ChevronUp, Download, Edit, Trash2, Plus, Save, ArrowLeft, Search, X 
// } from 'lucide-react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import logo from './Assets/logo.png';
// import sign1 from './Assets/Signatures/sign1.png';
// import sign2 from './Assets/Signatures/sign2.png';

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
//     // Apply filter whenever sheets or filterText changes
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

//   const downloadPDF = async (certNo) => {
//     if (!certificateRef.current) return;
//     try {
//       const canvas = await html2canvas(certificateRef.current, {
//         scale: 2.5,
//         useCORS: true,
//         logging: false,
//       });
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const width = pdf.internal.pageSize.getWidth();
//       const height = (canvas.height * width) / canvas.width;
//       pdf.addImage(imgData, 'PNG', 0, 0, width, height);
//       pdf.save(`Certificate_${certNo.replace(/\//g, '-')}.pdf`);
//     } catch (err) {
//       console.error("PDF generation failed:", err);
//     }
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

//     // Fix date format for input type="date"
//     const formatDateForInput = (dateStr) => {
//       if (!dateStr) return '';
//       const date = new Date(dateStr);
//       if (isNaN(date.getTime())) return '';
//       return date.toISOString().split('T')[0];
//     };

//     setEditingCertificate(data);
//     setEditForm({
//       cert_no: data.cert_no || '',
//       cert_date: formatDateForInput(data.cert_date),
//       delivery_note_no: data.delivery_note_no || '',
//       delivery_date: formatDateForInput(data.delivery_date),
//       customer_name: data.customer_name || '',
//       po_no: data.po_no || '',
//       po_date: formatDateForInput(data.po_date),
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
//           id: null,
//           po_lineitem_no: '',
//           item_size: '',
//           raw_material_size: '',
//           tc_no: '',
//           traceability_no: '',
//           qty_pcs: '',
//           material_grade: '',
//           c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: ''
//         }
//       ]
//     }));
//   };

//   const removeItemRow = (index) => {
//     if (window.confirm("Remove this item?")) {
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

//   const clearFilter = () => {
//     setFilterText('');
//   };

//   if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={48} /></div>;
//   if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
//           Material Test Certificates
//         </h1>

//         {/* Filter Bar */}
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
//           {filteredSheets.length === 0 && !loading ? (
//             <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
//               {filterText 
//                 ? "No certificates match your search" 
//                 : "No certificates found"}
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
//                     <span className="text-sm text-gray-500">Items: {sheet.item_count}</span>
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
//                             onClick={() => downloadPDF(sheet.cert_no)}
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

//                         <CertificateLayout data={sheetDetails[sheet.id]} ref={certificateRef} />
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
//         <div className="fixed inset-0 bg-white z-50 flex flex-col">
//           {/* Top Bar */}
//           <div className="border-b px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
//             <button 
//               onClick={() => setEditModalOpen(false)}
//               className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
//             >
//               <ArrowLeft size={24} /> Back
//             </button>
//             <h2 className="text-xl font-bold text-gray-900">
//               Edit Certificate {editForm.cert_no ? `– ${editForm.cert_no}` : ''}
//             </h2>
//             <div className="w-10"></div> {/* spacer for balance */}
//           </div>

//           {/* Content */}
//           <div className="flex-1 overflow-y-auto p-6 md:p-10">
//             <div className="max-w-5xl mx-auto space-y-12">

//               {/* Header Section */}
//               <div>
//                 <h3 className="text-2xl font-bold mb-6 text-gray-900">Certificate Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {[
//                     { label: 'Certificate No', name: 'cert_no', type: 'text' },
//                     { label: 'Certificate Date', name: 'cert_date', type: 'date' },
//                     { label: 'Customer Name', name: 'customer_name', type: 'text' },
//                     { label: 'P.O. Number', name: 'po_no', type: 'text' },
//                     { label: 'P.O. Date', name: 'po_date', type: 'date' },
//                     { label: 'Delivery Note No', name: 'delivery_note_no', type: 'text' },
//                     { label: 'Delivery Date', name: 'delivery_date', type: 'date' },
//                   ].map(f => (
//                     <div key={f.name} className="flex flex-col">
//                       <label className="text-sm font-medium text-gray-700 mb-2">{f.label}</label>
//                       <input
//                         type={f.type}
//                         name={f.name}
//                         value={editForm[f.name] || ''}
//                         onChange={handleEditHeaderChange}
//                         className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Items Section */}
//               <div>
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-2xl font-bold text-gray-900">Items</h3>
//                   <button
//                     onClick={addNewItemRow}
//                     className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm"
//                   >
//                     <Plus size={20} /> Add New Item
//                   </button>
//                 </div>

//                 <div className="space-y-10">
//                   {editForm.items.map((item, idx) => (
//                     <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative">
//                       <button
//                         onClick={() => removeItemRow(idx)}
//                         className="absolute top-5 right-5 text-red-600 hover:text-red-800"
//                       >
//                         <Trash2 size={22} />
//                       </button>

//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//                         {[
//                           { label: 'PO Line Item No', field: 'po_lineitem_no' },
//                           { label: 'Item & Size', field: 'item_size' },
//                           { label: 'Raw Material Size', field: 'raw_material_size' },
//                           { label: 'T.C. No', field: 'tc_no' },
//                           { label: 'Traceability No', field: 'traceability_no' },
//                           { label: 'Quantity (Pcs)', field: 'qty_pcs' },
//                           { label: 'Material Grade / Conf. To', field: 'material_grade' },
//                         ].map(f => (
//                           <div key={f.field} className="flex flex-col">
//                             <label className="text-sm font-medium text-gray-700 mb-2">{f.label}</label>
//                             <input
//                               value={item[f.field] || ''}
//                               onChange={e => handleItemChange(idx, f.field, e.target.value)}
//                               className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
//                             />
//                           </div>
//                         ))}
//                       </div>

//                       {/* Chemical Composition - Two Column Table */}
//                       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                         <div className="bg-gray-100 px-5 py-3 font-medium text-gray-800">
//                           Chemical Composition (%)
//                         </div>
//                         <div className="divide-y divide-gray-200">
//                           {[
//                             { label: '(C)', field: 'c' },
//                             { label: '(Cr)', field: 'cr' },
//                             { label: '(Ni)', field: 'ni' },
//                             { label: '(Mo)', field: 'mo' },
//                             { label: '(Mn)', field: 'mn' },
//                             { label: '(Si)', field: 'si' },
//                             { label: '(S)', field: 's' },
//                             { label: '(P)', field: 'p' },
//                           ].map(({ label, field }) => (
//                             <div key={field} className="flex border-b last:border-b-0">
//                               <div className="w-1/2 px-5 py-3 font-medium text-gray-700 bg-gray-50">
//                                 {label}
//                               </div>
//                               <div className="w-1/2 px-5 py-3">
//                                 <input
//                                   value={item[field] || ''}
//                                   onChange={e => handleItemChange(idx, field, e.target.value)}
//                                   className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//                                   placeholder="—"
//                                 />
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   {editForm.items.length === 0 && (
//                     <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-xl">
//                       No items added yet. Click "Add New Item" to begin.
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Save / Cancel */}
//               <div className="flex justify-end gap-4 pt-8 border-t">
//                 <button
//                   onClick={() => setEditModalOpen(false)}
//                   className="px-10 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={saveUpdatedCertificate}
//                   className="flex items-center gap-2 px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow font-medium"
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

// const CertificateLayout = React.forwardRef(({ data }, ref) => {
//   const todayLikeFormat = data.cert_date
//     ? new Date(data.cert_date).toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: 'short',
//         year: '2-digit',
//       }).replace(/ /g, '-')
//     : '—';

//   const styles = {
//     reportContainer: {
//       width: '1100px',
//       margin: '0 auto',
//       border: '2px solid #000',
//       backgroundColor: 'white',
//       fontFamily: 'Arial, sans-serif',
//       fontSize: '11px',
//       color: '#000',
//     },
//     table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
//     cell: {
//       border: '1px solid #000',
//       padding: '4px 3px',
//       textAlign: 'center',
//       verticalAlign: 'middle',
//       wordWrap: 'break-word',
//     },
//     bold: { fontWeight: 'bold' },
//     textLeft: { textAlign: 'left', paddingLeft: '10px' },
//     textRight: { textAlign: 'right', paddingRight: '8px' },
//     companyTitle: { fontSize: '18px', fontWeight: 'bold' },
//     arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 6px' },
//     address: { fontSize: '9px', marginTop: '3px' },
//     nestedTable: { width: '100%', height: '100%', borderCollapse: 'collapse' },
//     nestedCell: {
//       padding: '8px 6px',
//       borderLeft: '1px solid #000',
//       textAlign: 'left',
//       fontWeight: 'bold',
//     },
//     signatureImg: { width: '130px', display: 'block', margin: '16px auto 0' },
//   };

//   // Determine which signature to show
//   let signatureImage = null;
//   if (data.signature === 1) {
//     signatureImage = sign1;
//   } else if (data.signature === 2) {
//     signatureImage = sign2;
//   }

//   return (
//     <div style={{ overflowX: 'auto', padding: '10px 0' }}>
//       <div style={styles.reportContainer} ref={ref}>
//         <table style={styles.table}>
//           <tbody>
//             <tr>
//               <td
//                 colSpan={9}
//                 style={{
//                   ...styles.cell,
//                   ...styles.textLeft,
//                   borderBottom: 'none',
//                   borderRight: 'none',
//                   fontSize: '10px',
//                 }}
//               >
//                 Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024
//               </td>
//               <td
//                 colSpan={5}
//                 style={{
//                   ...styles.cell,
//                   ...styles.textRight,
//                   borderBottom: 'none',
//                   borderLeft: 'none',
//                   fontSize: '10px',
//                 }}
//               >
//                 C.R. 2055012479
//               </td>
//               <td rowSpan={2} style={{ ...styles.cell, width: '110px' }}>
//                 <img src={logo} alt="ICCL Logo" style={{ width: '90px', display: 'block', margin: '0 auto' }} />
//               </td>
//             </tr>

//             <tr>
//               <td colSpan={14} style={{ ...styles.cell, padding: '8px 16px' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <span style={styles.companyTitle}>
//                     Instrumentation & Controls Co. Ltd. (ICCL).
//                   </span>
//                   <span style={styles.arabic}>شركة الآلات الدقيقة والتحكم المحدودة</span>
//                   <div style={styles.address}>
//                     Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA
//                   </div>
//                 </div>
//               </td>
//             </tr>

//             <tr>
//               <td
//                 colSpan={11}
//                 style={{
//                   ...styles.cell,
//                   ...styles.bold,
//                   fontSize: '14px',
//                   height: '50px',
//                 }}
//               >
//                 MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
//               </td>
//               <td colSpan={4} style={{ padding: 0, border: '1px solid #000' }}>
//                 <table style={styles.nestedTable}>
//                   <tbody>
//                     <tr>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000' }}>
//                         CERT.NO.:
//                       </td>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000' }}>
//                         {data.cert_no || '—'}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td style={styles.nestedCell}>DATE:</td>
//                       <td style={styles.nestedCell}>{todayLikeFormat}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td colSpan={2} style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>
//                 CUSTOMER NAME
//               </td>
//               <td colSpan={9} style={{ ...styles.cell, ...styles.textLeft }}>
//                 {data.customer_name || '—'}
//               </td>
//               <td colSpan={2} style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>
//                 Delivery Note No.:
//               </td>
//               <td colSpan={2} style={{ ...styles.cell, textAlign: 'left' }}>
//                 {data.delivery_note_no || '—'}
//               </td>
//             </tr>

//             <tr>
//               <td colSpan={2} style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>
//                 P.O.NO.
//               </td>
//               <td colSpan={4} style={{ ...styles.cell, ...styles.textLeft }}>
//                 {data.po_no || '—'}
//               </td>
//               <td colSpan={2} style={{ ...styles.cell, ...styles.bold }}>
//                 P.O.Date:
//               </td>
//               <td colSpan={3} style={styles.cell}>
//                 {data.po_date || '—'}
//               </td>
//               <td colSpan={2} style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>
//                 Date:
//               </td>
//               <td colSpan={2} style={styles.cell}>
//                 {data.delivery_date || '—'}
//               </td>
//             </tr>

//             <tr style={styles.bold}>
//               <td style={{ ...styles.cell, width: '38px' }}>PO<br />L/I</td>
//               <td style={{ ...styles.cell, width: '235px' }}>ITEM & SIZE</td>
//               <td style={{ ...styles.cell, width: '82px' }}>RAW<br />MTL. SIZE</td>
//               <td style={{ ...styles.cell, width: '92px' }}>T.C.NO.</td>
//               <td style={{ ...styles.cell, width: '88px' }}>Traceability<br />no-</td>
//               <td colSpan={8} style={styles.cell}>CHEMICAL COMPOSITION %</td>
//               <td style={{ ...styles.cell, width: '48px' }}>QTY<br />PCS</td>
//               <td style={{ ...styles.cell, width: '145px' }}>MATL.<br />Conf.To</td>
//             </tr>

//             <tr style={{ ...styles.bold, fontSize: '10px' }}>
//               <td colSpan={5} style={styles.cell}></td>
//               {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P'].map((el) => (
//                 <td key={el} style={{ ...styles.cell, width: '52px' }}>
//                   {el}
//                 </td>
//               ))}
//               <td colSpan={2} style={styles.cell}></td>
//             </tr>

//             {data.items?.map((item, idx) => (
//               <tr key={idx}>
//                 <td style={styles.cell}>{item.po_lineitem_no || '—'}</td>
//                 <td style={{ ...styles.cell, ...styles.textLeft, fontWeight: 'bold' }}>
//                   {item.item_size || '—'}
//                 </td>
//                 <td style={styles.cell}>{item.raw_material_size || '—'}</td>
//                 <td style={styles.cell}>{item.tc_no || '—'}</td>
//                 <td style={styles.cell}>{item.traceability_no || '—'}</td>
//                 <td style={styles.cell}>{item.c || ''}</td>
//                 <td style={styles.cell}>{item.cr || ''}</td>
//                 <td style={styles.cell}>{item.ni || ''}</td>
//                 <td style={styles.cell}>{item.mo || ''}</td>
//                 <td style={styles.cell}>{item.mn || ''}</td>
//                 <td style={styles.cell}>{item.si || ''}</td>
//                 <td style={styles.cell}>{item.s || ''}</td>
//                 <td style={styles.cell}>{item.p || ''}</td>
//                 <td style={styles.cell}>{item.qty_pcs || '—'}</td>
//                 <td style={{ ...styles.cell, ...styles.textLeft }}>
//                   {item.material_grade || '—'}
//                 </td>
//               </tr>
//             ))}

//             <tr>
//               <td colSpan={15} style={{ ...styles.cell, textAlign: 'left', padding: '12px' }}>
//                 TEST: ABOVE FITTINGS ARE HYDRO TESTED MAKING A SAMPLE LOOP AT REQUIRED PRESSURE WITHOUT ANY LEAKAGE.
//               </td>
//             </tr>

//             <tr>
//               <td colSpan={9} style={{ ...styles.cell, textAlign: 'left', padding: '12px' }}>
//                 <span style={styles.bold}>
//                   WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS
//                 </span>
//               </td>
//               <td
//                 colSpan={6}
//                 style={{
//                   ...styles.cell,
//                   height: '140px',
//                   verticalAlign: 'top',
//                   padding: '12px',
//                   textAlign: 'center',
//                 }}
//               >
//                 <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
                
//                 {/* Conditional signature display */}
//                 {signatureImage && (
//                   <img 
//                     src={signatureImage} 
//                     alt="Authorized Signature" 
//                     style={styles.signatureImg} 
//                     crossOrigin="anonymous" // helps with html2canvas
//                   />
//                 )}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// });

// export default ViewSheets;




























import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, ChevronDown, ChevronUp, Download, Edit, Trash2, Plus, Save, ArrowLeft, Search, X 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from './Assets/logo.png';
import sign1 from './Assets/Signatures/sign1.png';
import sign2 from './Assets/Signatures/sign2.png';

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
    // Apply filter whenever sheets or filterText changes
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

  const downloadPDF = async (certNo) => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Certificate_${certNo.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
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

    // Fix date format for input type="date"
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    setEditingCertificate(data);
    setEditForm({
      cert_no: data.cert_no || '',
      cert_date: formatDateForInput(data.cert_date),
      delivery_note_no: data.delivery_note_no || '',
      delivery_date: formatDateForInput(data.delivery_date),
      customer_name: data.customer_name || '',
      po_no: data.po_no || '',
      po_date: formatDateForInput(data.po_date),
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
          id: null,
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
    if (window.confirm("Remove this item?")) {
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
        // Refresh detail view
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

  const clearFilter = () => {
    setFilterText('');
  };

  // Helper function to format chemical values - replace 0 or 0.000 with "-"
  const formatChemicalValue = (value) => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value);
    // Check if it's 0 or 0.000 (considering floating point precision)
    if (numValue === 0 || Math.abs(numValue) < 0.0001) {
      return '-';
    }
    return value;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={48} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Material Test Certificates
        </h1>

        {/* Filter Bar */}
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
          {filteredSheets.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
              {filterText 
                ? "No certificates match your search" 
                : "No certificates found"}
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
                    <span className="text-sm text-gray-500">Items: {sheet.item_count}</span>
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
                            onClick={() => downloadPDF(sheet.cert_no)}
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

                        <CertificateLayout data={sheetDetails[sheet.id]} ref={certificateRef} formatChemicalValue={formatChemicalValue} />
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
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Top Bar */}
          <div className="border-b px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-lg font-medium"
            >
              <ArrowLeft size={24} /> Back
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Edit Certificate {editForm.cert_no ? `– ${editForm.cert_no}` : ''}
            </h2>
            <div className="w-10"></div> {/* spacer for balance */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-12">

              {/* Header Section */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Certificate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Certificate No', name: 'cert_no', type: 'text' },
                    { label: 'Certificate Date', name: 'cert_date', type: 'date' },
                    { label: 'Customer Name', name: 'customer_name', type: 'text' },
                    { label: 'P.O. Number', name: 'po_no', type: 'text' },
                    { label: 'P.O. Date', name: 'po_date', type: 'date' },
                    { label: 'Delivery Note No', name: 'delivery_note_no', type: 'text' },
                    { label: 'Delivery Date', name: 'delivery_date', type: 'date' },
                  ].map(f => (
                    <div key={f.name} className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                      <input
                        type={f.type}
                        name={f.name}
                        value={editForm[f.name] || ''}
                        onChange={handleEditHeaderChange}
                        className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Items</h3>
                  <button
                    onClick={addNewItemRow}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm"
                  >
                    <Plus size={20} /> Add New Item
                  </button>
                </div>

                <div className="space-y-10">
                  {editForm.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative">
                      <button
                        onClick={() => removeItemRow(idx)}
                        className="absolute top-5 right-5 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={22} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

                      {/* Chemical Composition - Updated with Cu, Fe, Co */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-5 py-3 font-medium text-gray-800">
                          Chemical Composition (%)
                        </div>
                        <div className="divide-y divide-gray-200">
                          {[
                            { label: 'Carbon (C)', field: 'c' },
                            { label: 'Chromium (Cr)', field: 'cr' },
                            { label: 'Nickel (Ni)', field: 'ni' },
                            { label: 'Molybdenum (Mo)', field: 'mo' },
                            { label: 'Manganese (Mn)', field: 'mn' },
                            { label: 'Silicon (Si)', field: 'si' },
                            { label: 'Sulfur (S)', field: 's' },
                            { label: 'Phosphorus (P)', field: 'p' },
                            { label: 'Copper (Cu)', field: 'cu' },
                            { label: 'Iron (Fe)', field: 'fe' },
                            { label: 'Cobalt (Co)', field: 'co' },
                          ].map(({ label, field }) => (
                            <div key={field} className="flex border-b last:border-b-0">
                              <div className="w-1/2 px-5 py-3 font-medium text-gray-700 bg-gray-50">
                                {label}
                              </div>
                              <div className="w-1/2 px-5 py-3">
                                <input
                                  value={item[field] || ''}
                                  onChange={e => handleItemChange(idx, field, e.target.value)}
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder="—"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {editForm.items.length === 0 && (
                    <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-xl">
                      No items added yet. Click "Add New Item" to begin.
                    </div>
                  )}
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex justify-end gap-4 pt-8 border-t">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-10 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveUpdatedCertificate}
                  className="flex items-center gap-2 px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow font-medium"
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
  const todayLikeFormat = data.cert_date
    ? new Date(data.cert_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      }).replace(/ /g, '-')
    : '—';

  const styles = {
    reportContainer: {
      width: '1200px',
      margin: '0 auto',
      border: '2px solid #000',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#000',
    },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    cell: {
      border: '1px solid #000',
      padding: '4px 3px',
      textAlign: 'center',
      verticalAlign: 'middle',
      wordWrap: 'break-word',
    },
    bold: { fontWeight: 'bold' },
    textLeft: { textAlign: 'left', paddingLeft: '10px' },
    textRight: { textAlign: 'right', paddingRight: '8px' },
    companyTitle: { fontSize: '18px', fontWeight: 'bold' },
    arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 6px' },
    address: { fontSize: '9px', marginTop: '3px' },
    nestedTable: { width: '100%', height: '100%', borderCollapse: 'collapse' },
    nestedCell: {
      padding: '8px 6px',
      borderLeft: '1px solid #000',
      textAlign: 'left',
      fontWeight: 'bold',
    },
    signatureImg: { width: '130px', display: 'block', margin: '16px auto 0' },
  };

  // Determine which signature to show
  let signatureImage = null;
  if (data.signature === 1) {
    signatureImage = sign1;
  } else if (data.signature === 2) {
    signatureImage = sign2;
  }

  return (
    <div style={{ overflowX: 'auto', padding: '10px 0' }}>
      <div style={styles.reportContainer} ref={ref}>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td
                colSpan={12}
                style={{
                  ...styles.cell,
                  ...styles.textLeft,
                  borderBottom: 'none',
                  borderRight: 'none',
                  fontSize: '10px',
                }}
              >
                Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024
              </td>
              <td
                colSpan={5}
                style={{
                  ...styles.cell,
                  ...styles.textRight,
                  borderBottom: 'none',
                  borderLeft: 'none',
                  fontSize: '10px',
                }}
              >
                C.R. 2055012479
              </td>
              <td rowSpan={2} style={{ ...styles.cell, width: '110px' }}>
                <img src={logo} alt="ICCL Logo" style={{ width: '90px', display: 'block', margin: '0 auto' }} />
              </td>
            </tr>

            <tr>
              <td colSpan={18} style={{ ...styles.cell, padding: '8px 16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={styles.companyTitle}>
                    Instrumentation & Controls Co. Ltd. (ICCL).
                  </span>
                  <span style={styles.arabic}>شركة الآلات الدقيقة والتحكم المحدودة</span>
                  <div style={styles.address}>
                    Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td
                colSpan={13}
                style={{
                  ...styles.cell,
                  ...styles.bold,
                  fontSize: '14px',
                  height: '50px',
                }}
              >
                MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
              </td>
              <td colSpan={5} style={{ padding: 0, border: '1px solid #000' }}>
                <table style={styles.nestedTable}>
                  <tbody>
                    <tr>
                      <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000' }}>
                        CERT.NO.:
                      </td>
                      <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000' }}>
                        {data.cert_no || '—'}
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.nestedCell}>DATE:</td>
                      <td style={styles.nestedCell}>{todayLikeFormat}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>
                CUSTOMER NAME
              </td>
              <td colSpan="10" style={{ ...styles.cell, ...styles.textLeft }}>
                {data.customer_name || '—'}
              </td>
              <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>
                Delivery Note No.:
              </td>
              <td colSpan="2" style={{ ...styles.cell, textAlign: 'left' }}>
                {data.delivery_note_no || '—'}
              </td>
            </tr>

            <tr>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>
                P.O.NO.
              </td>
              <td colSpan="4" style={{ ...styles.cell, ...styles.textLeft }}>
                {data.po_no || '—'}
              </td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>
                P.O.Date:
              </td>
              <td colSpan="3" style={styles.cell}>
                {data.po_date || '—'}
              </td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>
                Date:
              </td>
              <td colSpan="2" style={styles.cell}>
                {data.delivery_date || '—'}
              </td>
            </tr>

            <tr style={styles.bold}>
              <td style={{ ...styles.cell, width: '35px' }}>PO<br />L/I</td>
              <td style={{ ...styles.cell, width: '200px' }}>ITEM & SIZE</td>
              <td style={{ ...styles.cell, width: '70px' }}>RAW<br />MTL. SIZE</td>
              <td style={{ ...styles.cell, width: '70px' }}>T.C.NO.</td>
              <td style={{ ...styles.cell, width: '70px' }}>Traceability<br />no-</td>
              <td colSpan="11" style={styles.cell}>CHEMICAL COMPOSITION %</td>
              <td style={{ ...styles.cell, width: '45px' }}>QTY<br />PCS</td>
              <td style={{ ...styles.cell, width: '120px' }}>MATL.<br />Conf.To</td>
            </tr>

            <tr style={{ ...styles.bold, fontSize: '10px' }}>
              <td colSpan="5" style={styles.cell}></td>
              {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Cu', 'Fe', 'Co'].map((el) => (
                <td key={el} style={{ ...styles.cell, width: '40px' }}>
                  {el}
                </td>
              ))}
              <td colSpan="2" style={styles.cell}></td>
            </tr>

            {data.items?.map((item, idx) => (
              <tr key={idx}>
                <td style={styles.cell}>{item.po_lineitem_no || '—'}</td>
                <td style={{ ...styles.cell, ...styles.textLeft, fontWeight: 'bold' }}>
                  {item.item_size || '—'}
                </td>
                <td style={styles.cell}>{item.raw_material_size || '—'}</td>
                <td style={styles.cell}>{item.tc_no || '—'}</td>
                <td style={styles.cell}>{item.traceability_no || '—'}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.c) : item.c || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.cr) : item.cr || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.ni) : item.ni || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.mo) : item.mo || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.mn) : item.mn || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.si) : item.si || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.s) : item.s || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.p) : item.p || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.cu) : item.cu || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.fe) : item.fe || ''}</td>
                <td style={styles.cell}>{formatChemicalValue ? formatChemicalValue(item.co) : item.co || ''}</td>
                <td style={styles.cell}>{item.qty_pcs || '—'}</td>
                <td style={{ ...styles.cell, ...styles.textLeft }}>
                  {item.material_grade || '—'}
                </td>
              </tr>
            ))}

            <tr>
              <td colSpan="18" style={{ ...styles.cell, textAlign: 'left', padding: '12px' }}>
                TEST: ABOVE FITTINGS ARE HYDRO TESTED MAKING A SAMPLE LOOP AT REQUIRED PRESSURE WITHOUT ANY LEAKAGE.
              </td>
            </tr>

            <tr>
              <td colSpan="11" style={{ ...styles.cell, textAlign: 'left', padding: '12px' }}>
                <span style={styles.bold}>
                  WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS
                </span>
              </td>
              <td
                colSpan="7"
                style={{
                  ...styles.cell,
                  height: '140px',
                  verticalAlign: 'top',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
                
                {/* Conditional signature display */}
                {signatureImage && (
                  <img 
                    src={signatureImage} 
                    alt="Authorized Signature" 
                    style={styles.signatureImg} 
                    crossOrigin="anonymous" // helps with html2canvas
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default ViewSheets;