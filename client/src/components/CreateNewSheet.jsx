// import React, { useState, useRef } from 'react';
// import * as XLSX from 'xlsx';
// import { Download, Save } from 'lucide-react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import logo from './Assets/logo.png';

// // Import Signatures
// import sign1 from './Assets/Signatures/sign1.png';
// import sign2 from './Assets/Signatures/sign2.png';

// const CreateNewSheet = () => {
//   const [multiSheetData, setMultiSheetData] = useState([]);
//   const [fileName, setFileName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [selectedSign, setSelectedSign] = useState('none'); // 'none', 'sign1', 'sign2'
//   const certificateRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const getTodayDate = () => {
//     const today = new Date();
//     const day = today.getDate().toString().padStart(2, '0');
//     const month = today.toLocaleString('default', { month: 'short' });
//     const year = today.getFullYear().toString().slice(-2);
//     return `${day}-${month}-${year}`;
//   };

//   const todayDate = getTodayDate();

//   const formatExcelDate = (val) => {
//     if (typeof val !== 'number' || val < 30000 || val > 60000) return val;
//     const days = Math.floor(val - 25569);
//     const date = new Date(days * 86400 * 1000);
//     const dd = date.getUTCDate().toString().padStart(2, '0');
//     const month = date.toLocaleString('default', { month: 'short' });
//     const yy = date.getUTCFullYear().toString().slice(-2);
//     return `${dd}-${month}-${yy}`;
//   };

//   const extractFromFirstSheet = (wb) => {
//     const sheetName = wb.SheetNames[0];
//     const ws = wb.Sheets[sheetName];
//     const get = (ref) => {
//       const cell = ws[ref];
//       if (!cell) return null;
//       if (cell.t === 'n' && cell.v > 30000 && cell.v < 60000) return formatExcelDate(cell.v);
//       return cell.v ?? null;
//     };

//     const headers = {
//       formatNo: 'Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024',
//       crNo: 'C.R. 2055012479',
//       companyTitleEn: 'Instrumentation & Controls Co. Ltd. (ICCL).',
//       companyTitleAr: 'شركة الآلات الدقيقة والتحكم المحدودة',
//       address: 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA',
//       customerName: get('B4') || get('C4') || get('B3') || 'Flowserve Abahsain Flow Control Co Ltd',
//       deliveryNoteNo: get('A9') || '-',
//       deliveryDate: get('C9') || '-',
//       poNo: get('D9') || '-',
//       poDate: get('F9') || '-',
//       certNo: '505TC/02/2026' // Default or based on logic
//     };

//     let headerRow = -1;
//     let descColIndex = -1;
//     let jobColIndex = -1;
//     let qtyColIndex = -1;

//     const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:ZZ200');

//     for (let r = range.s.r; r <= range.e.r && r < 60; r++) {
//       let foundHeader = false;
//       for (let c = 0; c < 20; c++) {
//         const val = String(get(XLSX.utils.encode_cell({ r, c })) || '').toUpperCase();
//         if (val.includes('DESCRIPTION')) { descColIndex = c; foundHeader = true; }
//         if (val.includes('JOB NO')) { jobColIndex = c; }
//         if (val.includes('QTY')) { qtyColIndex = c; }
//       }
//       if (foundHeader) { headerRow = r; break; }
//     }

//     let items = [];
//     if (headerRow !== -1) {
//       for (let r = headerRow + 1; r <= range.e.r; r++) {
//         const poLiValue = get(XLSX.utils.encode_cell({ r, c: 0 }));
//         const isNumeric = poLiValue !== null && !isNaN(parseFloat(poLiValue)) && isFinite(poLiValue);
//         if (!isNumeric) continue;

//         items.push({
//           poLi: String(poLiValue).trim(),
//           itemSize: descColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: descColIndex })) || '').trim() : '',
//           traceability: jobColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: jobColIndex })) || '').trim() : '',
//           rawMtlSize: '',
//           tcNo: '',
//           C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '',
//           qty: qtyColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: qtyColIndex })) || '').trim() : '',
//           matlConfTo: '',
//         });
//       }
//     }
//     return { headers, items };
//   };

//   const processFile = (file) => {
//     if (!file) return;
//     setFileName(file.name);
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const wb = XLSX.read(e.target.result, { type: 'array' });
//         const data = extractFromFirstSheet(wb);
//         setMultiSheetData([data]);
//       } catch (err) { console.error('Error reading Excel', err); }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const handleTcNoChange = async (sheetIndex, itemIndex, tcNoValue) => {
//     const updatedData = [...multiSheetData];
//     updatedData[sheetIndex].items[itemIndex].tcNo = tcNoValue;

//     if (!tcNoValue.trim()) {
//       updatedData[sheetIndex].items[itemIndex] = {
//         ...updatedData[sheetIndex].items[itemIndex],
//         rawMtlSize: '', C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', matlConfTo: ''
//       };
//       setMultiSheetData(updatedData);
//       return;
//     }

//     setMultiSheetData(updatedData);

//     try {
//       const res = await fetch(`http://localhost:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(tcNoValue.trim())}`);
//       const data = await res.json();

//       if (data.success && data.record) {
//         const finalData = [...multiSheetData];
//         const record = data.record;
//         finalData[sheetIndex].items[itemIndex] = {
//           ...finalData[sheetIndex].items[itemIndex],
//           rawMtlSize: record.size || '',
//           C: record.c || '', Cr: record.cr || '', Ni: record.ni || '', Mo: record.mo || '',
//           Mn: record.mn || '', Si: record.si || '', S: record.s || '', P: record.p || '',
//           matlConfTo: record.material_grade || '',
//         };
//         setMultiSheetData(finalData);
//       } else {
//         const finalData = [...multiSheetData];
//         finalData[sheetIndex].items[itemIndex] = {
//           ...finalData[sheetIndex].items[itemIndex],
//           rawMtlSize: '', C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', matlConfTo: ''
//         };
//         setMultiSheetData(finalData);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // --- UPDATED SUBMIT FUNCTION ---
//   const handleSubmitCertificate = async () => {
//     if (multiSheetData.length === 0) return;

//     setSubmitLoading(true);
//     const data = multiSheetData[0];

//     // Map selectedSign to number
//     let signatureValue = 0;
//     if (selectedSign === 'sign1') signatureValue = 1;
//     if (selectedSign === 'sign2') signatureValue = 2;   // ← change to 3 if you want

//     const payload = {
//       cert_no: data.headers.certNo,
//       cert_date: todayDate,
//       delivery_note_no: data.headers.deliveryNoteNo,
//       delivery_date: data.headers.deliveryDate,
//       customer_name: data.headers.customerName,
//       po_no: data.headers.poNo,
//       po_date: data.headers.poDate,
//       signature: signatureValue,                    // ← NEW FIELD
//       items: data.items.map(item => ({
//         po_lineitem_no: item.poLi,
//         item_size: item.itemSize,
//         raw_material_size: item.rawMtlSize,
//         tc_no: item.tcNo,
//         traceability_no: item.traceability,
//         qty_pcs: item.qty,
//         material_grade: item.matlConfTo,
//         c: item.C,
//         cr: item.Cr,
//         ni: item.Ni,
//         mo: item.Mo,
//         mn: item.Mn,
//         si: item.Si,
//         s: item.S,
//         p: item.P
//       }))
//     };

//     try {
//       const response = await fetch('http://localhost:5000/api/sheet/create-certificate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert('Certificate stored in database successfully!');
//       } else {
//         alert('Failed to store: ' + (result.error || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Submit error:', error);
//       alert('Network error while saving certificate');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const downloadAsPDF = async () => {
//     if (!certificateRef.current) return;
//     setLoading(true);
//     try {
//       const canvas = await html2canvas(certificateRef.current, { scale: 2.5, useCORS: true });
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const width = pdf.internal.pageSize.getWidth();
//       const height = (canvas.height * width) / canvas.width;
//       pdf.addImage(imgData, 'PNG', 0, 0, width, height);
//       pdf.save(`MTR_${fileName || 'Report'}.pdf`);
//     } catch (err) { console.error(err); }
//     finally { setLoading(false); }
//   };

//   const styles = {
//     body: { fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' },
//     topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#f8f9fa', borderBottom: '1px solid #ddd' },
//     reportContainer: { width: '1100px', margin: '20px auto', border: '2px solid #000', backgroundColor: 'white' },
//     table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
//     cell: { border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
//     bold: { fontWeight: 'bold' },
//     textLeft: { textAlign: 'left', paddingLeft: '10px' },
//     textRight: { textAlign: 'right', paddingRight: '8px' },
//     arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
//     companyTitle: { fontSize: '18px', fontWeight: 'bold' },
//     address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
//     nestedTable: { border: 'none', width: '100%', height: '100%', borderCollapse: 'collapse' },
//     nestedCell: { border: 'none', padding: '10px 5px', borderLeft: '1px solid #000', textAlign: 'left' },
//     input: { width: '100%', fontSize: '12px', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', background: 'transparent' },
//     radioLabel: { marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
//     signatureImg: { width: '120px', display: 'block', margin: '10px auto 0 auto' },
//     submitBtn: { padding: '10px 25px', cursor: 'pointer', background: '#28a745', color: '#fff', marginLeft: '10px', borderRadius: '4px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }
//   };

//   const hData = multiSheetData[0]?.headers;

//   return (
//     <div style={styles.body}>
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           <input type="file" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} style={{ display: 'none' }} />
//           <button onClick={() => fileInputRef.current.click()} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
//             {fileName ? fileName : "Upload Excel"}
//           </button>

//           {/* SUBMIT BUTTON */}
//           {multiSheetData.length > 0 && (
//             <button 
//               onClick={handleSubmitCertificate} 
//               disabled={submitLoading}
//               style={{
//                 ...styles.submitBtn, 
//                 opacity: submitLoading ? 0.6 : 1, 
//                 cursor: submitLoading ? 'not-allowed' : 'pointer'
//               }}
//             >
//               <Save size={16} style={{ marginRight: '8px' }} />
//               {submitLoading ? 'Saving...' : 'Submit'}
//             </button>
//           )}
//         </div>

//         <div>
//           <span style={{ fontWeight: 'bold' }}>Select Signature:</span>
//           <label style={styles.radioLabel}>
//             <input 
//               type="radio" 
//               name="sig" 
//               value="none" 
//               checked={selectedSign === 'none'} 
//               onChange={(e) => setSelectedSign(e.target.value)} 
//             /> none
//           </label>
//           <label style={styles.radioLabel}>
//             <input 
//               type="radio" 
//               name="sig" 
//               value="sign1" 
//               checked={selectedSign === 'sign1'} 
//               onChange={(e) => setSelectedSign(e.target.value)} 
//             /> JUNAID KHAN
//           </label>
//           <label style={styles.radioLabel}>
//             <input 
//               type="radio" 
//               name="sig" 
//               value="sign2" 
//               checked={selectedSign === 'sign2'} 
//               onChange={(e) => setSelectedSign(e.target.value)} 
//             /> SAIKIRAN
//           </label>
//         </div>
//       </div>

//       <div className="report-container" style={styles.reportContainer} ref={certificateRef}>
//         <table style={styles.table}>
//           <tbody>
//             <tr>
//               <td colSpan="9" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
//                 {hData ? hData.formatNo : 'Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024'}
//               </td>
//               <td colSpan="5" style={{ ...styles.cell, ...styles.textRight, borderBottom: 'none', borderLeft: 'none', fontSize: '10px' }}>
//                 {hData ? hData.crNo : 'C.R. 2055012479'}
//               </td>
//               <td rowSpan="2" style={{ ...styles.cell, width: '110px' }}>
//                 <img src={logo} alt="ICCL" style={{ width: '90px', display: 'block', margin: '0 auto' }} />
//               </td>
//             </tr>
//             <tr>
//               <td colSpan="14" style={{ ...styles.cell, padding: '5px 15px' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <span style={styles.companyTitle}>
//                     {hData ? hData.companyTitleEn : 'Instrumentation & Controls Co. Ltd. (ICCL).'}
//                   </span>
//                   <span style={styles.arabic}>
//                     {hData ? hData.companyTitleAr : 'شركة الآلات الدقيقة والتحكم المحدودة'}
//                   </span>
//                   <div style={styles.address}>
//                     {hData ? hData.address : 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA'}
//                   </div>
//                 </div>
//               </td>
//             </tr>
//             <tr>
//               <td colSpan="11" style={{ ...styles.cell, ...styles.bold, fontSize: '14px', height: '50px' }}>MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE</td>
//               <td colSpan="4" style={{ padding: 0, border: '1px solid #000' }}>
//                 <table style={styles.nestedTable}>
//                   <tbody>
//                     <tr>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>CERT.NO.:</td>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>{hData ? hData.certNo : '505TC/02/2026'}</td>
//                     </tr>
//                     <tr>
//                       <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>DATE:</td>
//                       <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>{todayDate}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </td>
//             </tr>
//             <tr>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>CUSTOMER NAME</td>
//               <td colSpan="9" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.customerName}</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>Delivery Note No.:</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px' }}>{hData?.deliveryNoteNo}</td>
//             </tr>
//             <tr>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>P.O.NO.</td>
//               <td colSpan="4" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.poNo}</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
//               <td colSpan="3" style={styles.cell}>{hData?.poDate}</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>Date:</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.deliveryDate}</td>
//             </tr>
//             <tr style={styles.bold}>
//               <td style={{ ...styles.cell, width: '35px' }}>PO<br />L/1</td>
//               <td style={{ ...styles.cell, width: '230px' }}>ITEM & SIZE</td>
//               <td style={{ ...styles.cell, width: '80px' }}>RAW<br />MTL. SIZE</td>
//               <td style={{ ...styles.cell, width: '90px' }}>T.C.NO.</td>
//               <td style={{ ...styles.cell, width: '85px' }}>Traceability<br />no-</td>
//               <td colSpan="8" style={styles.cell}>CHEMICAL COMPOSITION %</td>
//               <td style={{ ...styles.cell, width: '45px' }}>QTY<br />PCS</td>
//               <td style={{ ...styles.cell, width: '140px' }}>MATL.<br />Conf.To</td>
//             </tr>
//             <tr style={{ ...styles.bold, fontSize: '10px' }}>
//               <td colSpan="5" style={styles.cell}></td>
//               {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P'].map(c => <td key={c} style={{ ...styles.cell, width: '50px' }}>{c}</td>)}
//               <td colSpan="2" style={styles.cell}></td>
//             </tr>
//             {multiSheetData[0]?.items?.map((item, idx) => (
//               <tr key={idx}>
//                 <td style={styles.cell}>{item.poLi}</td>
//                 <td style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>{item.itemSize}</td>
//                 <td style={styles.cell}>{item.rawMtlSize}</td>
//                 <td style={styles.cell}>
//                   <input
//                     style={styles.input}
//                     placeholder=""
//                     value={item.tcNo}
//                     onChange={(e) => handleTcNoChange(0, idx, e.target.value)}
//                   />
//                 </td>
//                 <td style={styles.cell}>{item.traceability}</td>
//                 <td style={styles.cell}>{item.C}</td>
//                 <td style={styles.cell}>{item.Cr}</td>
//                 <td style={styles.cell}>{item.Ni}</td>
//                 <td style={styles.cell}>{item.Mo}</td>
//                 <td style={styles.cell}>{item.Mn}</td>
//                 <td style={styles.cell}>{item.Si}</td>
//                 <td style={styles.cell}>{item.S}</td>
//                 <td style={styles.cell}>{item.P}</td>
//                 <td style={styles.cell}>{item.qty}</td>
//                 <td style={{ ...styles.cell, ...styles.textLeft }}>{item.matlConfTo}</td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan="15" style={{ ...styles.cell, textAlign: 'left', padding: '10px' }}>
//                 TEST: ABOVE FITTINGS ARE HYDRO TESTED MAKING A SAMPLE LOOP AT REQUIRED PRESSURE WITHOUT ANY LEAKAGE.
//               </td>
//             </tr>
//             <tr>
//               <td colSpan="9" style={{ ...styles.cell, textAlign: 'left', padding: '10px' }}>
//                 <span style={styles.bold}>WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS</span>
//               </td>
//               <td colSpan="6" style={{ ...styles.cell, height: '140px', verticalAlign: 'top', padding: '10px', textAlign: 'center' }}>
//                 <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
//                 {selectedSign === 'sign1' && (
//                   <img src={sign1} alt="Signature 1" style={styles.signatureImg} />
//                 )}
//                 {selectedSign === 'sign2' && (
//                   <img src={sign2} alt="Signature 2" style={styles.signatureImg} />
//                 )}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CreateNewSheet;






















import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Download, Save } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from './Assets/logo.png';

// Import Signatures
import sign1 from './Assets/Signatures/sign1.png';
import sign2 from './Assets/Signatures/sign2.png';

const CreateNewSheet = () => {
  const [multiSheetData, setMultiSheetData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState('none'); // 'none', 'sign1', 'sign2'
  const certificateRef = useRef(null);
  const fileInputRef = useRef(null);

  const getTodayDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = today.toLocaleString('default', { month: 'short' });
    const year = today.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  const todayDate = getTodayDate();

  const formatExcelDate = (val) => {
    if (typeof val !== 'number' || val < 30000 || val > 60000) return val;
    const days = Math.floor(val - 25569);
    const date = new Date(days * 86400 * 1000);
    const dd = date.getUTCDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const yy = date.getUTCFullYear().toString().slice(-2);
    return `${dd}-${month}-${yy}`;
  };

  const extractFromFirstSheet = (wb) => {
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const get = (ref) => {
      const cell = ws[ref];
      if (!cell) return null;
      if (cell.t === 'n' && cell.v > 30000 && cell.v < 60000) return formatExcelDate(cell.v);
      return cell.v ?? null;
    };

    const headers = {
      formatNo: 'Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024',
      crNo: 'C.R. 2055012479',
      companyTitleEn: 'Instrumentation & Controls Co. Ltd. (ICCL).',
      companyTitleAr: 'شركة الآلات الدقيقة والتحكم المحدودة',
      address: 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA',
      customerName: get('B4') || get('C4') || get('B3') || 'Flowserve Abahsain Flow Control Co Ltd',
      deliveryNoteNo: get('A9') || '-',
      deliveryDate: get('C9') || '-',
      poNo: get('D9') || '-',
      poDate: get('F9') || '-',
      certNo: '505TC/02/2026' // Default or based on logic
    };

    let headerRow = -1;
    let descColIndex = -1;
    let jobColIndex = -1;
    let qtyColIndex = -1;

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:ZZ200');

    for (let r = range.s.r; r <= range.e.r && r < 60; r++) {
      let foundHeader = false;
      for (let c = 0; c < 20; c++) {
        const val = String(get(XLSX.utils.encode_cell({ r, c })) || '').toUpperCase();
        if (val.includes('DESCRIPTION')) { descColIndex = c; foundHeader = true; }
        if (val.includes('JOB NO')) { jobColIndex = c; }
        if (val.includes('QTY')) { qtyColIndex = c; }
      }
      if (foundHeader) { headerRow = r; break; }
    }

    let items = [];
    if (headerRow !== -1) {
      for (let r = headerRow + 1; r <= range.e.r; r++) {
        const poLiValue = get(XLSX.utils.encode_cell({ r, c: 0 }));
        const isNumeric = poLiValue !== null && !isNaN(parseFloat(poLiValue)) && isFinite(poLiValue);
        if (!isNumeric) continue;

        items.push({
          poLi: String(poLiValue).trim(),
          itemSize: descColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: descColIndex })) || '').trim() : '',
          traceability: jobColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: jobColIndex })) || '').trim() : '',
          rawMtlSize: '',
          tcNo: '',
          C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
          qty: qtyColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: qtyColIndex })) || '').trim() : '',
          matlConfTo: '',
        });
      }
    }
    return { headers, items };
  };

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const data = extractFromFirstSheet(wb);
        setMultiSheetData([data]);
      } catch (err) { console.error('Error reading Excel', err); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTcNoChange = async (sheetIndex, itemIndex, tcNoValue) => {
    const updatedData = [...multiSheetData];
    updatedData[sheetIndex].items[itemIndex].tcNo = tcNoValue;

    if (!tcNoValue.trim()) {
      updatedData[sheetIndex].items[itemIndex] = {
        ...updatedData[sheetIndex].items[itemIndex],
        rawMtlSize: '', C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '', matlConfTo: ''
      };
      setMultiSheetData(updatedData);
      return;
    }

    setMultiSheetData(updatedData);

    try {
      const res = await fetch(`http://localhost:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(tcNoValue.trim())}`);
      const data = await res.json();

      if (data.success && data.record) {
        const finalData = [...multiSheetData];
        const record = data.record;
        finalData[sheetIndex].items[itemIndex] = {
          ...finalData[sheetIndex].items[itemIndex],
          rawMtlSize: record.size || '',
          C: record.c || '', Cr: record.cr || '', Ni: record.ni || '', Mo: record.mo || '',
          Mn: record.mn || '', Si: record.si || '', S: record.s || '', P: record.p || '',
          Cu: record.cu || '', Fe: record.fe || '', Co: record.co || '',
          matlConfTo: record.material_grade || '',
        };
        setMultiSheetData(finalData);
      } else {
        const finalData = [...multiSheetData];
        finalData[sheetIndex].items[itemIndex] = {
          ...finalData[sheetIndex].items[itemIndex],
          rawMtlSize: '', C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '', matlConfTo: ''
        };
        setMultiSheetData(finalData);
      }
    } catch (err) {
      console.error(err);
    }
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

  // --- UPDATED SUBMIT FUNCTION ---
  const handleSubmitCertificate = async () => {
    if (multiSheetData.length === 0) return;

    setSubmitLoading(true);
    const data = multiSheetData[0];

    // Map selectedSign to number
    let signatureValue = 0;
    if (selectedSign === 'sign1') signatureValue = 1;
    if (selectedSign === 'sign2') signatureValue = 2;   // ← change to 3 if you want

    const payload = {
      cert_no: data.headers.certNo,
      cert_date: todayDate,
      delivery_note_no: data.headers.deliveryNoteNo,
      delivery_date: data.headers.deliveryDate,
      customer_name: data.headers.customerName,
      po_no: data.headers.poNo,
      po_date: data.headers.poDate,
      signature: signatureValue,                    // ← NEW FIELD
      items: data.items.map(item => ({
        po_lineitem_no: item.poLi,
        item_size: item.itemSize,
        raw_material_size: item.rawMtlSize,
        tc_no: item.tcNo,
        traceability_no: item.traceability,
        qty_pcs: item.qty,
        material_grade: item.matlConfTo,
        c: item.C,
        cr: item.Cr,
        ni: item.Ni,
        mo: item.Mo,
        mn: item.Mn,
        si: item.Si,
        s: item.S,
        p: item.P,
        cu: item.Cu,
        fe: item.Fe,
        co: item.Co
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/sheet/create-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        alert('Certificate stored in database successfully!');
      } else {
        alert('Failed to store: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Network error while saving certificate');
    } finally {
      setSubmitLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2.5, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`MTR_${fileName || 'Report'}.pdf`);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const styles = {
    body: { fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' },
    topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#f8f9fa', borderBottom: '1px solid #ddd' },
    reportContainer: { width: '1200px', margin: '20px auto', border: '2px solid #000', backgroundColor: 'white' },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    cell: { border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
    bold: { fontWeight: 'bold' },
    textLeft: { textAlign: 'left', paddingLeft: '10px' },
    textRight: { textAlign: 'right', paddingRight: '8px' },
    arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
    companyTitle: { fontSize: '18px', fontWeight: 'bold' },
    address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
    nestedTable: { border: 'none', width: '100%', height: '100%', borderCollapse: 'collapse' },
    nestedCell: { border: 'none', padding: '10px 5px', borderLeft: '1px solid #000', textAlign: 'left' },
    input: { width: '100%', fontSize: '12px', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', background: 'transparent' },
    radioLabel: { marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    signatureImg: { width: '120px', display: 'block', margin: '10px auto 0 auto' },
    submitBtn: { padding: '10px 25px', cursor: 'pointer', background: '#28a745', color: '#fff', marginLeft: '10px', borderRadius: '4px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }
  };

  const hData = multiSheetData[0]?.headers;

  return (
    <div style={styles.body}>
      <div style={styles.topNav}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="file" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current.click()} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
            {fileName ? fileName : "Upload Excel"}
          </button>

          {/* SUBMIT BUTTON */}
          {multiSheetData.length > 0 && (
            <button 
              onClick={handleSubmitCertificate} 
              disabled={submitLoading}
              style={{
                ...styles.submitBtn, 
                opacity: submitLoading ? 0.6 : 1, 
                cursor: submitLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} style={{ marginRight: '8px' }} />
              {submitLoading ? 'Saving...' : 'Submit'}
            </button>
          )}
          
          {/* DOWNLOAD PDF BUTTON */}
          {multiSheetData.length > 0 && (
            <button 
              onClick={downloadAsPDF} 
              disabled={loading}
              style={{
                ...styles.submitBtn,
                background: '#dc3545',
                marginLeft: '10px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <Download size={16} style={{ marginRight: '8px' }} />
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          )}
        </div>

        <div>
          <span style={{ fontWeight: 'bold' }}>Select Signature:</span>
          <label style={styles.radioLabel}>
            <input 
              type="radio" 
              name="sig" 
              value="none" 
              checked={selectedSign === 'none'} 
              onChange={(e) => setSelectedSign(e.target.value)} 
            /> none
          </label>
          <label style={styles.radioLabel}>
            <input 
              type="radio" 
              name="sig" 
              value="sign1" 
              checked={selectedSign === 'sign1'} 
              onChange={(e) => setSelectedSign(e.target.value)} 
            /> JUNAID KHAN
          </label>
          <label style={styles.radioLabel}>
            <input 
              type="radio" 
              name="sig" 
              value="sign2" 
              checked={selectedSign === 'sign2'} 
              onChange={(e) => setSelectedSign(e.target.value)} 
            /> SAIKIRAN
          </label>
        </div>
      </div>

      <div className="report-container" style={styles.reportContainer} ref={certificateRef}>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td colSpan="12" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
                {hData ? hData.formatNo : 'Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024'}
              </td>
              <td colSpan="5" style={{ ...styles.cell, ...styles.textRight, borderBottom: 'none', borderLeft: 'none', fontSize: '10px' }}>
                {hData ? hData.crNo : 'C.R. 2055012479'}
              </td>
              <td rowSpan="2" style={{ ...styles.cell, width: '110px' }}>
                <img src={logo} alt="ICCL" style={{ width: '90px', display: 'block', margin: '0 auto' }} />
              </td>
            </tr>
            <tr>
              <td colSpan="18" style={{ ...styles.cell, padding: '5px 15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={styles.companyTitle}>
                    {hData ? hData.companyTitleEn : 'Instrumentation & Controls Co. Ltd. (ICCL).'}
                  </span>
                  <span style={styles.arabic}>
                    {hData ? hData.companyTitleAr : 'شركة الآلات الدقيقة والتحكم المحدودة'}
                  </span>
                  <div style={styles.address}>
                    {hData ? hData.address : 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA'}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan="13" style={{ ...styles.cell, ...styles.bold, fontSize: '14px', height: '50px' }}>MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE</td>
              <td colSpan="5" style={{ padding: 0, border: '1px solid #000' }}>
                <table style={styles.nestedTable}>
                  <tbody>
                    <tr>
                      <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>CERT.NO.:</td>
                      <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>{hData ? hData.certNo : '505TC/02/2026'}</td>
                    </tr>
                    <tr>
                      <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>DATE:</td>
                      <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>{todayDate}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>CUSTOMER NAME</td>
              <td colSpan="10" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.customerName}</td>
              <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>Delivery Note No.:</td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px' }}>{hData?.deliveryNoteNo}</td>
            </tr>
            <tr>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>P.O.NO.</td>
              <td colSpan="4" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.poNo}</td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
              <td colSpan="3" style={styles.cell}>{hData?.poDate}</td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left' }}>Date:</td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.deliveryDate}</td>
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
              {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Cu', 'Fe', 'Co'].map(c => (
                <td key={c} style={{ ...styles.cell, width: '40px' }}>{c}</td>
              ))}
              <td colSpan="2" style={styles.cell}></td>
            </tr>
            {multiSheetData[0]?.items?.map((item, idx) => (
              <tr key={idx}>
                <td style={styles.cell}>{item.poLi}</td>
                <td style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>{item.itemSize}</td>
                <td style={styles.cell}>{item.rawMtlSize}</td>
                <td style={styles.cell}>
                  <input
                    style={styles.input}
                    placeholder=""
                    value={item.tcNo}
                    onChange={(e) => handleTcNoChange(0, idx, e.target.value)}
                  />
                </td>
                <td style={styles.cell}>{item.traceability}</td>
                <td style={styles.cell}>{formatChemicalValue(item.C)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Cr)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Ni)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Mo)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Mn)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Si)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.S)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.P)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Cu)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Fe)}</td>
                <td style={styles.cell}>{formatChemicalValue(item.Co)}</td>
                <td style={styles.cell}>{item.qty}</td>
                <td style={{ ...styles.cell, ...styles.textLeft }}>{item.matlConfTo}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="18" style={{ ...styles.cell, textAlign: 'left', padding: '10px' }}>
                TEST: ABOVE FITTINGS ARE HYDRO TESTED MAKING A SAMPLE LOOP AT REQUIRED PRESSURE WITHOUT ANY LEAKAGE.
              </td>
            </tr>
            <tr>
              <td colSpan="11" style={{ ...styles.cell, textAlign: 'left', padding: '10px' }}>
                <span style={styles.bold}>WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS</span>
              </td>
              <td colSpan="7" style={{ ...styles.cell, height: '140px', verticalAlign: 'top', padding: '10px', textAlign: 'center' }}>
                <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
                {selectedSign === 'sign1' && (
                  <img src={sign1} alt="Signature 1" style={styles.signatureImg} />
                )}
                {selectedSign === 'sign2' && (
                  <img src={sign2} alt="Signature 2" style={styles.signatureImg} />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateNewSheet;