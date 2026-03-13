// import React, { useState, useRef, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import { Save } from 'lucide-react';
// import logo from './Assets/logo.png';

// // Import Signatures
// import sign1 from './Assets/Signatures/sign1.jpeg';
// import sign2 from './Assets/Signatures/sign2.jpeg';

// const CreateNewSheet = () => {
//   const [multiSheetData, setMultiSheetData] = useState([]);
//   const [fileName, setFileName] = useState('');
//   const [submitLoading, setSubmitLoading] = useState(false);
  
//   // 0 = none, 1 = sign1, 2 = sign2
//   const [selectedSign, setSelectedSign] = useState(0);
  
//   const [hydroTestMessages, setHydroTestMessages] = useState([]);
//   const [certNo, setCertNo] = useState('505TC/02/2026');

//   const certificateRef = useRef(null);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     fetchNextCertNumber();
//   }, []);

//   const fetchNextCertNumber = async () => {
//     try {
//       const res = await fetch('http://103.118.158.113.188:5000/api/sheet/next-cert-number');
//       const json = await res.json();
//       if (json.success && json.nextCertNo) {
//         setCertNo(json.nextCertNo);
//       }
//     } catch (err) {
//       console.error('Failed to fetch next certificate number:', err);
//     }
//   };

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
//       address: 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA Email:info@icclksa.com , Web: www.icclksa.com',
//       customerName: get('B4') || get('C4') || get('B3') || 'Flowserve Abahsain Flow Control Co Ltd',
//       deliveryNoteNo: get('A9') || '-',
//       deliveryDate: get('C9') || '-',
//       poNo: get('D9') || '-',
//       poDate: get('F9') || '-',
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

//         const traceabilityRaw = jobColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: jobColIndex })) || '').trim() : '';

//         const traceParts = traceabilityRaw.split('/').map(p => p.trim()).filter(Boolean);

//         items.push({
//           poLi: String(poLiValue).trim(),
//           itemSize: descColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: descColIndex })) || '').trim() : '',
//           traceability: traceParts[0] || '',
//           rawMtlSize: '',
//           tcNo: '',
//           C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//           qty: qtyColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: qtyColIndex })) || '').trim() : '',
//           matlConfTo: '',
//           workingPressure: null,
//           testPressure: null,
//         });

//         for (let i = 1; i < traceParts.length; i++) {
//           items.push({
//             poLi: `${poLiValue}.${i}`,
//             itemSize: items[items.length - 1].itemSize,
//             traceability: traceParts[i],
//             rawMtlSize: '',
//             tcNo: '',
//             C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//             qty: items[items.length - 1].qty,
//             matlConfTo: '',
//             workingPressure: null,
//             testPressure: null,
//           });
//         }
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
//         setTimeout(() => updateHydroTestMessages(data.items), 300);
//       } catch (err) {
//         console.error('Error reading Excel', err);
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const handleTcNoChange = async (sheetIndex, itemIndex, tcNoValue) => {
//     const updatedData = [...multiSheetData];
//     updatedData[sheetIndex].items[itemIndex].tcNo = tcNoValue.trim();

//     if (!tcNoValue.trim()) {
//       updatedData[sheetIndex].items[itemIndex] = {
//         ...updatedData[sheetIndex].items[itemIndex],
//         rawMtlSize: '', C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//         matlConfTo: '',
//         workingPressure: null,
//         testPressure: null,
//       };
//       setMultiSheetData(updatedData);
//       updateHydroTestMessages(updatedData[sheetIndex].items);
//       return;
//     }

//     try {
//       const res = await fetch(`http://103.118.158.113.188:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(tcNoValue.trim())}`);
//       const json = await res.json();

//       if (json.success && json.record) {
//         const r = json.record;
//         updatedData[sheetIndex].items[itemIndex] = {
//           ...updatedData[sheetIndex].items[itemIndex],
//           rawMtlSize: r.size || '',
//           C: r.c || '', Cr: r.cr || '', Ni: r.ni || '', Mo: r.mo || '',
//           Mn: r.mn || '', Si: r.si || '', S: r.s || '', P: r.p || '',
//           Cu: r.cu || '', Fe: r.fe || '', Co: r.co || '',
//           matlConfTo: r.material_grade || '',
//           workingPressure: r.working_pressure || null,
//           testPressure: r.test_pressure || null,
//         };
//       } else {
//         updatedData[sheetIndex].items[itemIndex] = {
//           ...updatedData[sheetIndex].items[itemIndex],
//           rawMtlSize: '', C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//           matlConfTo: '',
//           workingPressure: null,
//           testPressure: null,
//         };
//       }

//       setMultiSheetData(updatedData);
//       updateHydroTestMessages(updatedData[sheetIndex].items);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const updateHydroTestMessages = (items) => {
//     if (!items?.length) {
//       setHydroTestMessages([]);
//       return;
//     }

//     const pressureGroups = {};

//     items
//       .filter((item) => item.poLi && (item.testPressure || item.workingPressure))
//       .forEach((item) => {
//         const key = `${item.testPressure || '0'}_${item.workingPressure || '0'}`;
//         if (!pressureGroups[key]) {
//           pressureGroups[key] = {
//             testPressure: item.testPressure,
//             workingPressure: item.workingPressure,
//             poLis: [],
//           };
//         }
//         pressureGroups[key].poLis.push(item.poLi);
//       });

//     const messages = Object.values(pressureGroups).map((group) => {
//       const poLis = group.poLis.sort((a, b) => parseFloat(a) - parseFloat(b));
//       let poLiText;

//       if (poLis.length === 1) {
//         poLiText = poLis[0];
//       } else {
//         const nums = poLis.map(Number);
//         const isSeq = nums.every((n, i) => i === 0 || n === nums[i - 1] + 0.1);
//         poLiText = isSeq
//           ? `${poLis[0]} to ${poLis[poLis.length - 1]}`
//           : poLis.join(' & ');
//       }

//       const pressure = group.workingPressure
//         ? `${group.workingPressure}`
//         : 'REQUIRED PRESSURE';

//       return `TEST: ABOVE FITTINGS (L/I: ${poLiText}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${pressure} WITHOUT ANY LEAKAGE.`;
//     });

//     setHydroTestMessages(messages);
//   };

//   const handleSubmitCertificate = async () => {
//     if (multiSheetData.length === 0) return;
//     setSubmitLoading(true);
//     const data = multiSheetData[0];

//     const payload = {
//       cert_no: certNo,
//       cert_date: todayDate,
//       delivery_note_no: data.headers.deliveryNoteNo,
//       delivery_date: data.headers.deliveryDate,
//       customer_name: data.headers.customerName,
//       po_no: data.headers.poNo,
//       po_date: data.headers.poDate,
//       signature: selectedSign,
//       test_line_items: hydroTestMessages,          // ← NOW SENDING TEST MESSAGES
//       items: data.items.map((item) => ({
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
//         p: item.P,
//         cu: item.Cu,
//         fe: item.Fe,
//         co: item.Co
//       })),
//     };

//     try {
//       const response = await fetch('http://103.118.158.113.188:5000/api/sheet/create-certificate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert('Certificate stored in database successfully!');
//         fetchNextCertNumber();
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

//   const styles = {
//     body: { fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' },
//     topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#f8f9fa', borderBottom: '1px solid #ddd' },
//     reportContainer: { width: '1200px', margin: '20px auto', border: '2px solid #000', backgroundColor: 'white' },
//     table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
//     cell: { border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
//     tracecell: { fontSize: '10px', border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
//     bold: { fontWeight: 'bold' },
//     textLeft: { textAlign: 'left', paddingLeft: '10px' },
//     textRight: { textAlign: 'right', paddingRight: '8px' },
//     arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
//     companyTitle: { fontSize: '18px', fontWeight: 'bold' },
//     address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
//     nestedTable: { border: 'none', width: '100%', height: '100%', borderCollapse: 'collapse' },
//     nestedCell: { border: 'none', padding: '10px 9px', borderLeft: '1px solid #000', textAlign: 'left' },
//     input: { width: '100%', fontSize: '12px', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', background: 'transparent' },
//     radioLabel: { marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
//     signatureImg: { width: '160px', display: 'block', margin: '10px auto 0 auto' },
//     submitBtn: { padding: '10px 25px', cursor: 'pointer', background: '#28a745', color: '#fff', marginLeft: '10px', borderRadius: '4px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }
//   };

//   const displayChem = (value) => (value && value.trim() ? value : '---');

//   const items = multiSheetData[0]?.items || [];
//   const hData = multiSheetData[0]?.headers || {};

//   return (
//     <div style={styles.body}>
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           <input type="file" ref={fileInputRef} onChange={(e) => processFile(e.target.files?.[0])} style={{ display: 'none' }} />
//           <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
//             {fileName || "Upload Excel"}
//           </button>

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
//               value={0}
//               checked={selectedSign === 0}
//               onChange={(e) => setSelectedSign(Number(e.target.value))}
//             />
//             None
//           </label>
//           <label style={styles.radioLabel}>
//             <input
//               type="radio"
//               name="sig"
//               value={1}
//               checked={selectedSign === 1}
//               onChange={(e) => setSelectedSign(Number(e.target.value))}
//             />
//             Sign 1
//           </label>
//           <label style={styles.radioLabel}>
//             <input
//               type="radio"
//               name="sig"
//               value={2}
//               checked={selectedSign === 2}
//               onChange={(e) => setSelectedSign(Number(e.target.value))}
//             />
//             Sign 2
//           </label>
//         </div>
//       </div>

//       <div className="report-container" style={styles.reportContainer} ref={certificateRef}>
//         <table style={styles.table}>
//           <tbody>
//             <tr>
//               <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
//                 {hData?.formatNo || 'Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024'}
//               </td>
//               <td colSpan="6" style={{ ...styles.cell, ...styles.textRight, borderBottom: 'none', borderLeft: 'none', fontSize: '10px' }}>
//                 {hData?.crNo || 'C.R. 2055012479'}
//               </td>
//               <td rowSpan="2" style={{ ...styles.cell, width: '110px' }}>
//                 <img src={logo} alt="ICCL" style={{ width: '90px', display: 'block', margin: '0 auto' }} />
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="17" style={{ ...styles.cell, padding: '5px 15px' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <span style={styles.companyTitle}>
//                     {hData?.companyTitleEn || 'Instrumentation & Controls Co. Ltd. (ICCL).'}
//                   </span>
//                   <span style={styles.arabic}>
//                     {hData?.companyTitleAr || 'شركة الآلات الدقيقة والتحكم المحدودة'}
//                   </span>
//                   <div style={styles.address}>
//                     {hData?.address || 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA , Email:info@icclksa.com , Web: www.icclksa.com'}
//                   </div>
//                 </div>
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="13" style={{ ...styles.cell, ...styles.bold, fontSize: '14px', height: '50px' }}>
//                 MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
//               </td>
//               <td colSpan="5" style={{ padding: 0, border: '1px solid #000' }}>
//                 <table style={styles.nestedTable}>
//                   <tbody>
//                     <tr>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold', borderLeft: '0px solid #000', textAlign: 'right', width: '191px' }}>
//                         CERT.NO.:
//                       </td>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>
//                         {certNo}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td style={{ ...styles.nestedCell, fontWeight: 'bold', borderLeft: '0px solid #000', textAlign: 'right' }}>
//                         DATE:
//                       </td>
//                       <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>
//                         {todayDate}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>CUSTOMER NAME</td>
//               <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, ...styles.bold }}>
//                 {hData?.customerName}
//               </td>
//               <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>
//                 Delivery Note No.:
//               </td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px', paddingLeft: '10px' }}>
//                 {hData?.deliveryNoteNo}
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>P.O.NO.</td>
//               <td colSpan="6" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.poNo}</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
//               <td colSpan="3" style={styles.cell}>{hData?.poDate}</td>
//               <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Date:</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.deliveryDate}</td>
//             </tr>

//             <tr style={styles.bold}>
//               <td style={{ ...styles.cell, width: '35px' }}>PO<br />L/1</td>
//               <td style={{ ...styles.cell, width: '280px' }}>ITEM & SIZE</td>
//               <td style={{ ...styles.cell, width: '80px' }}>RAW<br />MTL. SIZE</td>
//               <td style={{ ...styles.cell, width: '90px' }}>T.C.NO.</td>
//               <td style={{ ...styles.tracecell, width: '90px' }}>Traceability<br />no-</td>
//               <td colSpan="11" style={styles.cell}>CHEMICAL COMPOSITION %</td>
//               <td style={{ ...styles.cell, width: '45px' }}>QTY<br />PCS</td>
//               <td style={{ ...styles.cell, width: '140px' }}>MATL.<br />Conf.To</td>
//             </tr>

//             <tr style={{ ...styles.bold, fontSize: '10px' }}>
//               <td colSpan="5" style={styles.cell}></td>
//               {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Cu', 'Fe', 'Co'].map(c => (
//                 <td key={c} style={{ ...styles.cell, width: '50px' }}>{c}</td>
//               ))}
//               <td colSpan="2" style={styles.cell}></td>
//             </tr>

//             {items.map((item, idx) => (
//               <tr key={idx}>
//                 <td style={styles.cell}>{item.poLi}</td>
//                 <td style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>{item.itemSize}</td>
//                 <td style={styles.cell}>{item.rawMtlSize || '---'}</td>
//                 <td style={styles.cell}>
//                   <input
//                     style={styles.input}
//                     value={item.tcNo || ''}
//                     onChange={(e) => handleTcNoChange(0, idx, e.target.value)}
//                   />
//                 </td>
//                 <td style={styles.tracecell}>
//                   <div style={styles.inputReadonly}>{item.traceability || '—'}</div>
//                 </td>
//                 <td style={styles.cell}>{displayChem(item.C)}</td>
//                 <td style={styles.cell}>{displayChem(item.Cr)}</td>
//                 <td style={styles.cell}>{displayChem(item.Ni)}</td>
//                 <td style={styles.cell}>{displayChem(item.Mo)}</td>
//                 <td style={styles.cell}>{displayChem(item.Mn)}</td>
//                 <td style={styles.cell}>{displayChem(item.Si)}</td>
//                 <td style={styles.cell}>{displayChem(item.S)}</td>
//                 <td style={styles.cell}>{displayChem(item.P)}</td>
//                 <td style={styles.cell}>{displayChem(item.Cu)}</td>
//                 <td style={styles.cell}>{displayChem(item.Fe)}</td>
//                 <td style={styles.cell}>{displayChem(item.Co)}</td>
//                 <td style={styles.cell}>{item.qty || '—'}</td>
//                 <td style={{ ...styles.cell, ...styles.textLeft }}>{item.matlConfTo || '---'}</td>
//               </tr>
//             ))}

//             {hydroTestMessages.length > 0 && (
//               <tr>
//                 <td colSpan="18" style={{ ...styles.cell, textAlign: 'left', padding: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
//                   {hydroTestMessages.map((msg, i) => (
//                     <React.Fragment key={i}>
//                       {msg}
//                       {i < hydroTestMessages.length - 1 && (
//                         <>
//                           <br /><br />
//                         </>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </td>
//               </tr>
//             )}

//             <tr>
//               <td colSpan="11" style={{ ...styles.cell, textAlign: 'left', padding: '10px' }}>
//                 <span style={styles.bold}>
//                   WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS <br />
//                   FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
//                 </span>
//               </td>
//               <td colSpan="7" style={{ ...styles.cell, height: '160px', verticalAlign: 'top', padding: '10px', textAlign: 'center' }}>
//                 <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
//                 {selectedSign === 1 && (
//                   <img src={sign1} alt="Signature 1" style={styles.signatureImg} />
//                 )}
//                 {selectedSign === 2 && (
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















// import React, { useState, useRef, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import { Save } from 'lucide-react';
// import logo from './Assets/logo.png';

// // Import Signatures
// import sign1 from './Assets/Signatures/sign1.jpeg';
// import sign2 from './Assets/Signatures/sign2.jpeg';

// const CreateNewSheet = () => {
//   const [multiSheetData, setMultiSheetData] = useState([]);
//   const [fileName, setFileName] = useState('');
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [batchLoading, setBatchLoading] = useState(false);

//   const [selectedSign, setSelectedSign] = useState(0);
//   const [hydroTestMessages, setHydroTestMessages] = useState([]);
//   const [certNo, setCertNo] = useState('505TC/02/2026');

//   const certificateRef = useRef(null);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     fetchNextCertNumber();
//   }, []);

//   const fetchNextCertNumber = async () => {
//     try {
//       const res = await fetch('http://103.118.158.113.188:5000/api/sheet/next-cert-number');
//       const json = await res.json();
//       if (json.success && json.nextCertNo) {
//         setCertNo(json.nextCertNo);
//       }
//     } catch (err) {
//       console.error('Failed to fetch next certificate number:', err);
//     }
//   };

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
//       address: 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA Email:info@icclksa.com , Web: www.icclksa.com',
//       customerName: get('B4') || get('C4') || get('B3') || 'Flowserve Abahsain Flow Control Co Ltd',
//       deliveryNoteNo: get('A9') || '-',
//       deliveryDate: get('C9') || '-',
//       poNo: get('D9') || '-',
//       poDate: get('F9') || '-',
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

//         const traceabilityRaw = jobColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: jobColIndex })) || '').trim() : '';
//         const traceParts = traceabilityRaw.split('/').map(p => p.trim()).filter(Boolean);

//         items.push({
//           poLi: String(poLiValue).trim(),
//           itemSize: descColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: descColIndex })) || '').trim() : '',
//           traceability: traceParts[0] || '',
//           rawMtlSize: '',
//           tcNo: '',
//           C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//           qty: qtyColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: qtyColIndex })) || '').trim() : '',
//           matlConfTo: '',
//           workingPressure: null,
//           testPressure: null,
//         });

//         for (let i = 1; i < traceParts.length; i++) {
//           items.push({
//             poLi: `${poLiValue}.${i}`,
//             itemSize: items[items.length - 1].itemSize,
//             traceability: traceParts[i],
//             rawMtlSize: '',
//             tcNo: '',
//             C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//             qty: items[items.length - 1].qty,
//             matlConfTo: '',
//             workingPressure: null,
//             testPressure: null,
//           });
//         }
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
//         const parsedData = extractFromFirstSheet(wb);

//         // Set initial state (shows table structure)
//         setMultiSheetData([parsedData]);

//         // Show initial (empty) hydro test messages
//         updateHydroTestMessages(parsedData.items);

//         // Fetch data using the fresh parsed object
//         fetchAllTraceabilityData(parsedData);
//       } catch (err) {
//         console.error('Error reading Excel:', err);
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const fetchAllTraceabilityData = async (parsedData) => {
//     const traceabilityList = parsedData.items
//       .map(item => item.traceability?.trim())
//       .filter(t => t && t.length > 0);

//     // Console log extracted traceability numbers
//     console.groupCollapsed("=== Extracted Traceability Numbers from Excel ===");
//     console.log("Count:", traceabilityList.length);
//     console.log("List:", traceabilityList);
//     console.table(traceabilityList.map((t, idx) => ({ "#": idx + 1, Traceability: t })));
//     console.groupEnd();

//     if (traceabilityList.length === 0) return;

//     setBatchLoading(true);

//     try {
//       const params = new URLSearchParams();
//       traceabilityList.forEach(t => params.append('traceability_nos', t));

//       const res = await fetch(
//         `http://103.118.158.113.188:5000/api/sheet/records/by-traceabilities?${params.toString()}`
//       );

//       const json = await res.json();

//       console.groupCollapsed("=== Batch API Response ===");
//       console.log("Status:", res.status, res.statusText);
//       console.log("Full Response:", json);
//       console.groupEnd();

//       if (json.success && json.records?.length > 0) {
//         console.groupCollapsed("=== Matched Records (Traceability → Data) ===");

//         const recordsMap = new Map(
//           json.records.map(r => [r.traceability_no?.trim()?.toUpperCase() || '', r])
//         );

//         traceabilityList.forEach((trace, idx) => {
//           const key = trace.toUpperCase();
//           const record = recordsMap.get(key);

//           console.group(`#${idx + 1} - Traceability: ${trace}`);

//           if (record) {
//             console.log("MATCH FOUND ✓");
//             console.table([{
//               "TC No": record.tc_no || "—",
//               "Traceability": record.traceability_no,
//               "Size": record.size || "—",
//               "Material Grade": record.material_grade || "—",
//               "C": record.c || "—",
//               "Cr": record.cr || "—",
//               "Ni": record.ni || "—",
//               "Mo": record.mo || "—",
//               "Mn": record.mn || "—",
//               "Si": record.si || "—",
//               "S": record.s || "—",
//               "P": record.p || "—",
//               "Cu": record.cu || "—",
//               "Fe": record.fe || "—",
//               "Co": record.co || "—",
//             }]);
//           } else {
//             console.warn("NO MATCH FOUND ✗");
//           }
//           console.groupEnd();
//         });

//         console.groupEnd();

//         // Update UI rows with fetched data
//         setMultiSheetData(prev => {
//           const newData = prev.length > 0 ? [...prev] : [{ ...parsedData }];
//           newData[0] = {
//             ...newData[0],
//             items: newData[0].items.map(item => {
//               const traceKey = item.traceability?.trim()?.toUpperCase();
//               if (!traceKey || !recordsMap.has(traceKey)) return item;

//               const r = recordsMap.get(traceKey);
//               return {
//                 ...item,
//                 tcNo: r.tc_no || item.tcNo || '',
//                 rawMtlSize: r.size || '',
//                 C: r.c || '', Cr: r.cr || '', Ni: r.ni || '', Mo: r.mo || '',
//                 Mn: r.mn || '', Si: r.si || '', S: r.s || '', P: r.p || '',
//                 Cu: r.cu || '', Fe: r.fe || '', Co: r.co || '',
//                 matlConfTo: r.material_grade || '',
//               };
//             })
//           };
//           return newData;
//         });

//         // Update hydro test messages after data is filled
//         setTimeout(() => {
//           setMultiSheetData(prev => {
//             if (prev[0]?.items) {
//               updateHydroTestMessages(prev[0].items);
//             }
//             return prev;
//           });
//         }, 0);
//       } else {
//         console.warn("No matching records returned from server");
//       }
//     } catch (err) {
//       console.error('Batch fetch failed:', err);
//     } finally {
//       setBatchLoading(false);
//     }
//   };

//   const handleTcNoChange = async (sheetIndex, itemIndex, tcNoValue) => {
//     const updatedData = [...multiSheetData];
//     const item = updatedData[sheetIndex].items[itemIndex];

//     item.tcNo = tcNoValue.trim();

//     if (!tcNoValue.trim()) {
//       Object.assign(item, {
//         rawMtlSize: '',
//         C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//         matlConfTo: '',
//       });
//       setMultiSheetData(updatedData);
//       updateHydroTestMessages(updatedData[sheetIndex].items);
//       return;
//     }

//     try {
//       const res = await fetch(
//         `http://103.118.158.113.188:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(tcNoValue.trim())}`
//       );
//       const json = await res.json();

//       if (json.success && json.record) {
//         const r = json.record;
//         Object.assign(item, {
//           rawMtlSize: r.size || '',
//           C: r.c || '', Cr: r.cr || '', Ni: r.ni || '', Mo: r.mo || '',
//           Mn: r.mn || '', Si: r.si || '', S: r.s || '', P: r.p || '',
//           Cu: r.cu || '', Fe: r.fe || '', Co: r.co || '',
//           matlConfTo: r.material_grade || '',
//         });
//       } else {
//         Object.assign(item, {
//           rawMtlSize: '',
//           C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
//           matlConfTo: '',
//         });
//       }

//       setMultiSheetData(updatedData);
//       updateHydroTestMessages(updatedData[sheetIndex].items);
//     } catch (err) {
//       console.error('TC lookup failed:', err);
//     }
//   };

//   const updateHydroTestMessages = (items) => {
//     if (!items?.length) {
//       setHydroTestMessages([]);
//       return;
//     }

//     const pressureGroups = {};

//     items
//       .filter((item) => item.poLi && (item.testPressure || item.workingPressure))
//       .forEach((item) => {
//         const key = `${item.testPressure || '0'}_${item.workingPressure || '0'}`;
//         if (!pressureGroups[key]) {
//           pressureGroups[key] = {
//             testPressure: item.testPressure,
//             workingPressure: item.workingPressure,
//             poLis: [],
//           };
//         }
//         pressureGroups[key].poLis.push(item.poLi);
//       });

//     const messages = Object.values(pressureGroups).map((group) => {
//       const poLis = group.poLis.sort((a, b) => parseFloat(a) - parseFloat(b));
//       let poLiText;

//       if (poLis.length === 1) {
//         poLiText = poLis[0];
//       } else {
//         const nums = poLis.map(Number);
//         const isSeq = nums.every((n, i) => i === 0 || n === nums[i - 1] + 0.1);
//         poLiText = isSeq
//           ? `${poLis[0]} to ${poLis[poLis.length - 1]}`
//           : poLis.join(' & ');
//       }

//       const pressure = group.workingPressure
//         ? `${group.workingPressure}`
//         : 'REQUIRED PRESSURE';

//       return `TEST: ABOVE FITTINGS (L/I: ${poLiText}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${pressure} WITHOUT ANY LEAKAGE.`;
//     });

//     setHydroTestMessages(messages);
//   };

//   const handleSubmitCertificate = async () => {
//     if (multiSheetData.length === 0) return;
//     setSubmitLoading(true);
//     const data = multiSheetData[0];

//     const payload = {
//       cert_no: certNo,
//       cert_date: todayDate,
//       delivery_note_no: data.headers.deliveryNoteNo,
//       delivery_date: data.headers.deliveryDate,
//       customer_name: data.headers.customerName,
//       po_no: data.headers.poNo,
//       po_date: data.headers.poDate,
//       signature: selectedSign,
//       test_line_items: hydroTestMessages, // ← Footer messages included in payload
//       items: data.items.map((item) => ({
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
//         p: item.P,
//         cu: item.Cu,
//         fe: item.Fe,
//         co: item.Co
//       })),
//     };

//     try {
//       const response = await fetch('http://103.118.158.113.188:5000/api/sheet/create-certificate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert('Certificate stored in database successfully!');
//         fetchNextCertNumber();
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

//   const styles = {
//     body: { fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' },
//     topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#f8f9fa', borderBottom: '1px solid #ddd' },
//     reportContainer: { width: '1200px', margin: '20px auto', border: '2px solid #000', backgroundColor: 'white' },
//     table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
//     cell: { border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
//     tracecell: { fontSize: '10px', border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
//     bold: { fontWeight: 'bold' },
//     textLeft: { textAlign: 'left', paddingLeft: '10px' },
//     textRight: { textAlign: 'right', paddingRight: '8px' },
//     arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
//     companyTitle: { fontSize: '18px', fontWeight: 'bold' },
//     address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
//     nestedTable: { border: 'none', width: '100%', height: '100%', borderCollapse: 'collapse' },
//     nestedCell: { border: 'none', padding: '10px 9px', borderLeft: '1px solid #000', textAlign: 'left' },
//     input: { width: '100%', fontSize: '12px', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', background: 'transparent' },
//     radioLabel: { marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
//     signatureImg: { width: '160px', display: 'block', margin: '10px auto 0 auto' },
//     submitBtn: { padding: '10px 25px', cursor: 'pointer', background: '#28a745', color: '#fff', marginLeft: '10px', borderRadius: '4px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }
//   };

//   const displayChem = (value) => (value && value.trim() ? value : '---');

//   const items = multiSheetData[0]?.items || [];
//   const hData = multiSheetData[0]?.headers || {};

//   return (
//     <div style={styles.body}>
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={(e) => processFile(e.target.files?.[0])}
//             style={{ display: 'none' }}
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
//           >
//             {fileName || "Upload Excel"}
//           </button>

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

//           {batchLoading && (
//             <span style={{ color: '#007bff', fontStyle: 'italic' }}>
//               Loading material data from traceability...
//             </span>
//           )}
//         </div>

//         <div>
//           <span style={{ fontWeight: 'bold' }}>Select Signature:</span>
//           <label style={styles.radioLabel}>
//             <input
//               type="radio"
//               name="sig"
//               value={0}
//               checked={selectedSign === 0}
//               onChange={(e) => setSelectedSign(Number(e.target.value))}
//             />
//             None
//           </label>
//           <label style={styles.radioLabel}>
//             <input
//               type="radio"
//               name="sig"
//               value={1}
//               checked={selectedSign === 1}
//               onChange={(e) => setSelectedSign(Number(e.target.value))}
//             />
//             Sign 1
//           </label>
//           <label style={styles.radioLabel}>
//             <input
//               type="radio"
//               name="sig"
//               value={2}
//               checked={selectedSign === 2}
//               onChange={(e) => setSelectedSign(Number(e.target.value))}
//             />
//             Sign 2
//           </label>
//         </div>
//       </div>

//       <div className="report-container" style={styles.reportContainer} ref={certificateRef}>
//         <table style={styles.table}>
//           <tbody>
//             <tr>
//               <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
//                 {hData?.formatNo || 'Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024'}
//               </td>
//               <td colSpan="6" style={{ ...styles.cell, ...styles.textRight, borderBottom: 'none', borderLeft: 'none', fontSize: '10px' }}>
//                 {hData?.crNo || 'C.R. 2055012479'}
//               </td>
//               <td rowSpan="2" style={{ ...styles.cell, width: '110px' }}>
//                 <img src={logo} alt="ICCL" style={{ width: '90px', display: 'block', margin: '0 auto' }} />
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="17" style={{ ...styles.cell, padding: '5px 15px' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <span style={styles.companyTitle}>
//                     {hData?.companyTitleEn || 'Instrumentation & Controls Co. Ltd. (ICCL).'}
//                   </span>
//                   <span style={styles.arabic}>
//                     {hData?.companyTitleAr || 'شركة الآلات الدقيقة والتحكم المحدودة'}
//                   </span>
//                   <div style={styles.address}>
//                     {hData?.address || 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA , Email:info@icclksa.com , Web: www.icclksa.com'}
//                   </div>
//                 </div>
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="13" style={{ ...styles.cell, ...styles.bold, fontSize: '14px', height: '50px' }}>
//                 MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
//               </td>
//               <td colSpan="5" style={{ padding: 0, border: '1px solid #000' }}>
//                 <table style={styles.nestedTable}>
//                   <tbody>
//                     <tr>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold', borderLeft: '0px solid #000', textAlign: 'right', width: '191px' }}>
//                         CERT.NO.:
//                       </td>
//                       <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>
//                         {certNo}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td style={{ ...styles.nestedCell, fontWeight: 'bold', borderLeft: '0px solid #000', textAlign: 'right' }}>
//                         DATE:
//                       </td>
//                       <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>
//                         {todayDate}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>CUSTOMER NAME</td>
//               <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, ...styles.bold }}>
//                 {hData?.customerName}
//               </td>
//               <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>
//                 Delivery Note No.:
//               </td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px', paddingLeft: '10px' }}>
//                 {hData?.deliveryNoteNo}
//               </td>
//             </tr>

//             <tr>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>P.O.NO.</td>
//               <td colSpan="6" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.poNo}</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
//               <td colSpan="3" style={styles.cell}>{hData?.poDate}</td>
//               <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Date:</td>
//               <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.deliveryDate}</td>
//             </tr>

//             <tr style={styles.bold}>
//               <td style={{ ...styles.cell, width: '35px' }}>PO<br />L/1</td>
//               <td style={{ ...styles.cell, width: '280px' }}>ITEM & SIZE</td>
//               <td style={{ ...styles.cell, width: '80px' }}>RAW<br />MTL. SIZE</td>
//               <td style={{ ...styles.cell, width: '90px' }}>T.C.NO.</td>
//               <td style={{ ...styles.tracecell, width: '90px' }}>Traceability<br />no-</td>
//               <td colSpan="11" style={styles.cell}>CHEMICAL COMPOSITION %</td>
//               <td style={{ ...styles.cell, width: '45px' }}>QTY<br />PCS</td>
//               <td style={{ ...styles.cell, width: '140px' }}>MATL.<br />Conf.To</td>
//             </tr>

//             <tr style={{ ...styles.bold, fontSize: '10px' }}>
//               <td colSpan="5" style={styles.cell}></td>
//               {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Cu', 'Fe', 'Co'].map(c => (
//                 <td key={c} style={{ ...styles.cell, width: '50px' }}>{c}</td>
//               ))}
//               <td colSpan="2" style={styles.cell}></td>
//             </tr>

//             {items.map((item, idx) => (
//               <tr key={idx}>
//                 <td style={styles.cell}>{item.poLi}</td>
//                 <td style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>{item.itemSize}</td>
//                 <td style={styles.cell}>{item.rawMtlSize || '---'}</td>

//                 <td style={styles.cell}>
//                   <input
//                     style={styles.input}
//                     value={item.tcNo || ''}
//                     onChange={(e) => handleTcNoChange(0, idx, e.target.value)}
//                     placeholder="Enter TC No"
//                   />
//                 </td>

//                 <td style={styles.tracecell}>
//                   <div style={{ ...styles.input, backgroundColor: '#f8f9fa', pointerEvents: 'none' }}>
//                     {item.traceability || '—'}
//                   </div>
//                 </td>

//                 <td style={styles.cell}>{displayChem(item.C)}</td>
//                 <td style={styles.cell}>{displayChem(item.Cr)}</td>
//                 <td style={styles.cell}>{displayChem(item.Ni)}</td>
//                 <td style={styles.cell}>{displayChem(item.Mo)}</td>
//                 <td style={styles.cell}>{displayChem(item.Mn)}</td>
//                 <td style={styles.cell}>{displayChem(item.Si)}</td>
//                 <td style={styles.cell}>{displayChem(item.S)}</td>
//                 <td style={styles.cell}>{displayChem(item.P)}</td>
//                 <td style={styles.cell}>{displayChem(item.Cu)}</td>
//                 <td style={styles.cell}>{displayChem(item.Fe)}</td>
//                 <td style={styles.cell}>{displayChem(item.Co)}</td>
//                 <td style={styles.cell}>{item.qty || '—'}</td>
//                 <td style={{ ...styles.cell, ...styles.textLeft }}>{item.matlConfTo || '---'}</td>
//               </tr>
//             ))}

//             {/* Footer - Hydro Test Messages (now included) */}
//             {hydroTestMessages.length > 0 && (
//               <tr>
//                 <td colSpan="18" style={{ ...styles.cell, textAlign: 'left', padding: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
//                   {hydroTestMessages.map((msg, i) => (
//                     <React.Fragment key={i}>
//                       {msg}
//                       {i < hydroTestMessages.length - 1 && (
//                         <>
//                           <br /><br />
//                         </>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </td>
//               </tr>
//             )}

//             <tr>
//               <td colSpan="11" style={{ ...styles.cell, textAlign: 'left', padding: '10px' }}>
//                 <span style={styles.bold}>
//                   WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS <br />
//                   FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
//                 </span>
//               </td>
//               <td colSpan="7" style={{ ...styles.cell, height: '160px', verticalAlign: 'top', padding: '10px', textAlign: 'center' }}>
//                 <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
//                 {selectedSign === 1 && (
//                   <img src={sign1} alt="Signature 1" style={styles.signatureImg} />
//                 )}
//                 {selectedSign === 2 && (
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


import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Save } from 'lucide-react';
import logo from './Assets/logo.png';

// Import Signatures
import sign1 from './Assets/Signatures/sign1.jpeg';
import sign2 from './Assets/Signatures/sign2.jpeg';

const CreateNewSheet = () => {
  const [multiSheetData, setMultiSheetData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const [selectedSign, setSelectedSign] = useState(0);
  const [hydroTestMessages, setHydroTestMessages] = useState([]);
  const [certNo, setCertNo] = useState('505TC/02/2026');

  const certificateRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchNextCertNumber();
  }, []);

  const fetchNextCertNumber = async () => {
    try {
      const res = await fetch('http://103.118.158.113.188:5000/api/sheet/next-cert-number');
      const json = await res.json();
      if (json.success && json.nextCertNo) {
        setCertNo(json.nextCertNo);
      }
    } catch (err) {
      console.error('Failed to fetch next certificate number:', err);
    }
  };

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
      address: 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA Email:info@icclksa.com , Web: www.icclksa.com',
      customerName: get('B4') || get('C4') || get('B3') || 'Flowserve Abahsain Flow Control Co Ltd',
      deliveryNoteNo: get('A9') || '-',
      deliveryDate: get('C9') || '-',
      poNo: get('D9') || '-',
      poDate: get('F9') || '-',
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

        const traceabilityRaw = jobColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: jobColIndex })) || '').trim() : '';
        const traceParts = traceabilityRaw.split('/').map(p => p.trim()).filter(Boolean);

        items.push({
          poLi: String(poLiValue).trim(),
          itemSize: descColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: descColIndex })) || '').trim() : '',
          traceability: traceParts[0] || '',
          rawMtlSize: '',
          tcNo: '',
          C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
          qty: qtyColIndex >= 0 ? String(get(XLSX.utils.encode_cell({ r, c: qtyColIndex })) || '').trim() : '',
          matlConfTo: '',
          workingPressure: null,
          testPressure: null,
        });

        for (let i = 1; i < traceParts.length; i++) {
          items.push({
            poLi: `${poLiValue}.${i}`,
            itemSize: items[items.length - 1].itemSize,
            traceability: traceParts[i],
            rawMtlSize: '',
            tcNo: '',
            C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
            qty: items[items.length - 1].qty,
            matlConfTo: '',
            workingPressure: null,
            testPressure: null,
          });
        }
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
        const parsedData = extractFromFirstSheet(wb);

        setMultiSheetData([parsedData]);
        updateHydroTestMessages(parsedData.items);
        fetchAllTraceabilityData(parsedData);
      } catch (err) {
        console.error('Error reading Excel:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const fetchAllTraceabilityData = async (parsedData) => {
    const traceabilityList = parsedData.items
      .map(item => item.traceability?.trim())
      .filter(t => t && t.length > 0);

    console.groupCollapsed("=== Extracted Traceability Numbers from Excel ===");
    console.log("Count:", traceabilityList.length);
    console.log("List:", traceabilityList);
    console.table(traceabilityList.map((t, idx) => ({ "#": idx + 1, Traceability: t })));
    console.groupEnd();

    if (traceabilityList.length === 0) return;

    setBatchLoading(true);

    try {
      const params = new URLSearchParams();
      traceabilityList.forEach(t => params.append('traceability_nos', t));

      const url = `http://103.118.158.113.188:5000/api/sheet/records/by-traceabilities?${params.toString()}`;
      console.log("Fetching traceability batch from:", url);

      const res = await fetch(url);
      const json = await res.json();

      console.groupCollapsed("=== Batch API Response (traceability) ===");
      console.log("Status:", res.status, res.statusText);
      console.log("Full Response:", JSON.stringify(json, null, 2));
      console.groupEnd();

      if (json.success && json.records?.length > 0) {
        console.groupCollapsed("=== Matched Records from Traceability ===");

        const recordsMap = new Map(
          json.records.map(r => [r.traceability_no?.trim()?.toUpperCase() || '', r])
        );

        traceabilityList.forEach((trace, idx) => {
          const key = trace.toUpperCase();
          const record = recordsMap.get(key);

          console.group(`#${idx + 1} - Traceability: ${trace}`);

          if (record) {
            console.log("MATCH FOUND ✓");
            console.table([{
              "TC No": record.tc_no || "—",
              "Traceability": record.traceability_no,
              "Size": record.size || "—",
              "Material Grade": record.material_grade || "—",
              "C": record.c || "—",
              "Cr": record.cr || "—",
              "Ni": record.ni || "—",
              "Mo": record.mo || "—",
              "Mn": record.mn || "—",
              "Si": record.si || "—",
              "S": record.s || "—",
              "P": record.p || "—",
              "Cu": record.cu || "—",
              "Fe": record.fe || "—",
              "Co": record.co || "—",
            }]);
          } else {
            console.warn("NO MATCH FOUND ✗");
          }
          console.groupEnd();
        });

        console.groupEnd();

        // Step 1: Update rows with chemical/material data
        let updatedItems = parsedData.items.map(item => {
          const traceKey = item.traceability?.trim()?.toUpperCase();
          if (!traceKey || !recordsMap.has(traceKey)) return item;

          const r = recordsMap.get(traceKey);
          return {
            ...item,
            tcNo: r.tc_no || item.tcNo || '',
            rawMtlSize: r.size || '',
            C: r.c || '', Cr: r.cr || '', Ni: r.ni || '', Mo: r.mo || '',
            Mn: r.mn || '', Si: r.si || '', S: r.s || '', P: r.p || '',
            Cu: r.cu || '', Fe: r.fe || '', Co: r.co || '',
            matlConfTo: r.material_grade || '',
          };
        });

        // Step 2: For every row that now has a tcNo, trigger single /by-tc fetch for pressure
        const tcNoPromises = updatedItems
          .map(async (item, index) => {
            if (item.tcNo?.trim()) {
              try {
                const tcRes = await fetch(
                  `http://103.118.158.113.188:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(item.tcNo.trim())}`
                );
                const tcJson = await tcRes.json();

                if (tcJson.success && tcJson.record) {
                  const r = tcJson.record;
                  updatedItems[index] = {
                    ...updatedItems[index],
                    workingPressure: r.working_pressure || null,
                    testPressure: r.test_pressure || null,
                  };
                  console.log(`Pressure fetched for TC ${item.tcNo}:`, {
                    working: r.working_pressure,
                    test: r.test_pressure,
                  });
                }
              } catch (err) {
                console.error(`Failed to fetch pressure for TC ${item.tcNo}:`, err);
              }
            }
          });

        // Wait for all pressure fetches to complete
        await Promise.all(tcNoPromises);

        // Step 3: Update state with final items (chemicals + pressures)
        setMultiSheetData(prev => {
          const newData = prev.length > 0 ? [...prev] : [{ ...parsedData }];
          newData[0] = {
            ...newData[0],
            items: updatedItems,
          };
          return newData;
        });

        // Step 4: Update hydro test messages
        setTimeout(() => {
          setMultiSheetData(prev => {
            if (prev[0]?.items) {
              updateHydroTestMessages(prev[0].items);
            }
            return prev;
          });
        }, 0);
      } else {
        console.warn("No matching records returned from server");
      }
    } catch (err) {
      console.error('Batch fetch failed:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleTcNoChange = async (sheetIndex, itemIndex, tcNoValue) => {
    const updatedData = [...multiSheetData];
    const item = updatedData[sheetIndex].items[itemIndex];

    item.tcNo = tcNoValue.trim();

    if (!tcNoValue.trim()) {
      Object.assign(item, {
        rawMtlSize: '',
        C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
        matlConfTo: '',
        workingPressure: null,
        testPressure: null,
      });
      setMultiSheetData(updatedData);
      updateHydroTestMessages(updatedData[sheetIndex].items);
      return;
    }

    try {
      const res = await fetch(
        `http://103.118.158.113.188:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(tcNoValue.trim())}`
      );
      const json = await res.json();

      if (json.success && json.record) {
        const r = json.record;
        Object.assign(item, {
          rawMtlSize: r.size || '',
          C: r.c || '', Cr: r.cr || '', Ni: r.ni || '', Mo: r.mo || '',
          Mn: r.mn || '', Si: r.si || '', S: r.s || '', P: r.p || '',
          Cu: r.cu || '', Fe: r.fe || '', Co: r.co || '',
          matlConfTo: r.material_grade || '',
          workingPressure: r.working_pressure || null,
          testPressure: r.test_pressure || null,
        });
      } else {
        Object.assign(item, {
          rawMtlSize: '',
          C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
          matlConfTo: '',
          workingPressure: null,
          testPressure: null,
        });
      }

      setMultiSheetData(updatedData);
      updateHydroTestMessages(updatedData[sheetIndex].items);
    } catch (err) {
      console.error('TC lookup failed:', err);
    }
  };

  const updateHydroTestMessages = (items) => {
    if (!items?.length) {
      setHydroTestMessages([]);
      return;
    }

    const pressureGroups = {};

    items
      .filter((item) => item.poLi && (item.testPressure || item.workingPressure))
      .forEach((item) => {
        const key = `${item.testPressure || '0'}_${item.workingPressure || '0'}`;
        if (!pressureGroups[key]) {
          pressureGroups[key] = {
            testPressure: item.testPressure,
            workingPressure: item.workingPressure,
            poLis: [],
          };
        }
        pressureGroups[key].poLis.push(item.poLi);
      });

    const messages = Object.values(pressureGroups).map((group) => {
      const poLis = group.poLis.sort((a, b) => parseFloat(a) - parseFloat(b));
      let poLiText;

      if (poLis.length === 1) {
        poLiText = poLis[0];
      } else {
        const nums = poLis.map(Number);
        const isSeq = nums.every((n, i) => i === 0 || n === nums[i - 1] + 0.1);
        poLiText = isSeq
          ? `${poLis[0]} to ${poLis[poLis.length - 1]}`
          : poLis.join(' & ');
      }

      const pressure = group.workingPressure
        ? `${group.workingPressure}`
        : 'REQUIRED PRESSURE';

      return `TEST: ABOVE FITTINGS (L/I: ${poLiText}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${pressure} WITHOUT ANY LEAKAGE.`;
    });

    setHydroTestMessages(messages);
  };

  const handleSubmitCertificate = async () => {
    if (multiSheetData.length === 0) return;
    setSubmitLoading(true);
    const data = multiSheetData[0];

    const payload = {
      cert_no: certNo,
      cert_date: todayDate,
      delivery_note_no: data.headers.deliveryNoteNo,
      delivery_date: data.headers.deliveryDate,
      customer_name: data.headers.customerName,
      po_no: data.headers.poNo,
      po_date: data.headers.poDate,
      signature: selectedSign,
      test_line_items: hydroTestMessages,
      items: data.items.map((item) => ({
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
      })),
    };

    try {
      const response = await fetch('http://103.118.158.113.188:5000/api/sheet/create-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        alert('Certificate stored in database successfully!');
        fetchNextCertNumber();
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

  const styles = {
    body: { fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' },
    topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#f8f9fa', borderBottom: '1px solid #ddd' },
    reportContainer: { width: '1200px', margin: '20px auto', border: '2px solid #000', backgroundColor: 'white' },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    cell: { border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
    tracecell: { fontSize: '10px', border: '1px solid #000', padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
    bold: { fontWeight: 'bold' },
    textLeft: { textAlign: 'left', paddingLeft: '10px' },
    textRight: { textAlign: 'right', paddingRight: '8px' },
    arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
    companyTitle: { fontSize: '18px', fontWeight: 'bold' },
    address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
    nestedTable: { border: 'none', width: '100%', height: '100%', borderCollapse: 'collapse' },
    nestedCell: { border: 'none', padding: '10px 9px', borderLeft: '1px solid #000', textAlign: 'left' },
    input: { width: '100%', fontSize: '12px', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', background: 'transparent' },
    radioLabel: { marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    signatureImg: { width: '160px', display: 'block', margin: '10px auto 0 auto' },
    submitBtn: { padding: '10px 25px', cursor: 'pointer', background: '#28a745', color: '#fff', marginLeft: '10px', borderRadius: '4px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }
  };

  const displayChem = (value) => (value && value.trim() ? value : '---');

  const items = multiSheetData[0]?.items || [];
  const hData = multiSheetData[0]?.headers || {};

  return (
    <div style={styles.body}>
      <div style={styles.topNav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => processFile(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {fileName || "Upload Excel"}
          </button>

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

          {batchLoading && (
            <span style={{ color: '#007bff', fontStyle: 'italic' }}>
              Loading material data from traceability...
            </span>
          )}
        </div>

        <div>
          <span style={{ fontWeight: 'bold' }}>Select Signature:</span>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="sig"
              value={0}
              checked={selectedSign === 0}
              onChange={(e) => setSelectedSign(Number(e.target.value))}
            />
            None
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="sig"
              value={1}
              checked={selectedSign === 1}
              onChange={(e) => setSelectedSign(Number(e.target.value))}
            />
            Sign 1
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="sig"
              value={2}
              checked={selectedSign === 2}
              onChange={(e) => setSelectedSign(Number(e.target.value))}
            />
            Sign 2
          </label>
        </div>
      </div>

      <div className="report-container" style={styles.reportContainer} ref={certificateRef}>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
                {hData?.formatNo || 'Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024'}
              </td>
              <td colSpan="6" style={{ ...styles.cell, ...styles.textRight, borderBottom: 'none', borderLeft: 'none', fontSize: '10px' }}>
                {hData?.crNo || 'C.R. 2055012479'}
              </td>
              <td rowSpan="2" style={{ ...styles.cell, width: '110px' }}>
                <img src={logo} alt="ICCL" style={{ width: '90px', display: 'block', margin: '0 auto' }} />
              </td>
            </tr>

            <tr>
              <td colSpan="17" style={{ ...styles.cell, padding: '5px 15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={styles.companyTitle}>
                    {hData?.companyTitleEn || 'Instrumentation & Controls Co. Ltd. (ICCL).'}
                  </span>
                  <span style={styles.arabic}>
                    {hData?.companyTitleAr || 'شركة الآلات الدقيقة والتحكم المحدودة'}
                  </span>
                  <div style={styles.address}>
                    {hData?.address || 'Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA , Email:info@icclksa.com , Web: www.icclksa.com'}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan="13" style={{ ...styles.cell, ...styles.bold, fontSize: '14px', height: '50px' }}>
                MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
              </td>
              <td colSpan="5" style={{ padding: 0, border: '1px solid #000' }}>
                <table style={styles.nestedTable}>
                  <tbody>
                    <tr>
                      <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold', borderLeft: '0px solid #000', textAlign: 'right', width: '191px' }}>
                        CERT.NO.:
                      </td>
                      <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                        {certNo}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...styles.nestedCell, fontWeight: 'bold', borderLeft: '0px solid #000', textAlign: 'right' }}>
                        DATE:
                      </td>
                      <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>
                        {todayDate}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>CUSTOMER NAME</td>
              <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, ...styles.bold }}>
                {hData?.customerName}
              </td>
              <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>
                Delivery Note No.:
              </td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px', paddingLeft: '10px' }}>
                {hData?.deliveryNoteNo}
              </td>
            </tr>

            <tr>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>P.O.NO.</td>
              <td colSpan="6" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.poNo}</td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
              <td colSpan="3" style={styles.cell}>{hData?.poDate}</td>
              <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Date:</td>
              <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{hData?.deliveryDate}</td>
            </tr>

            <tr style={styles.bold}>
              <td style={{ ...styles.cell, width: '35px' }}>PO<br />L/1</td>
              <td style={{ ...styles.cell, width: '280px' }}>ITEM & SIZE</td>
              <td style={{ ...styles.cell, width: '80px' }}>RAW<br />MTL. SIZE</td>
              <td style={{ ...styles.cell, width: '90px' }}>T.C.NO.</td>
              <td style={{ ...styles.tracecell, width: '90px' }}>Traceability<br />no-</td>
              <td colSpan="11" style={styles.cell}>CHEMICAL COMPOSITION %</td>
              <td style={{ ...styles.cell, width: '45px' }}>QTY<br />PCS</td>
              <td style={{ ...styles.cell, width: '140px' }}>MATL.<br />Conf.To</td>
            </tr>

            <tr style={{ ...styles.bold, fontSize: '10px' }}>
              <td colSpan="5" style={styles.cell}></td>
              {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Cu', 'Fe', 'Co'].map(c => (
                <td key={c} style={{ ...styles.cell, width: '50px' }}>{c}</td>
              ))}
              <td colSpan="2" style={styles.cell}></td>
            </tr>

            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={styles.cell}>{item.poLi}</td>
                <td style={{ ...styles.cell, ...styles.bold, ...styles.textLeft }}>{item.itemSize}</td>
                <td style={styles.cell}>{item.rawMtlSize || '---'}</td>

                <td style={styles.cell}>
                  <input
                    style={styles.input}
                    value={item.tcNo || ''}
                    onChange={(e) => handleTcNoChange(0, idx, e.target.value)}
                    placeholder="Enter TC No"
                  />
                </td>

                <td style={styles.tracecell}>
                  <div style={{ ...styles.input, backgroundColor: '#f8f9fa', pointerEvents: 'none' }}>
                    {item.traceability || '—'}
                  </div>
                </td>

                <td style={styles.cell}>{displayChem(item.C)}</td>
                <td style={styles.cell}>{displayChem(item.Cr)}</td>
                <td style={styles.cell}>{displayChem(item.Ni)}</td>
                <td style={styles.cell}>{displayChem(item.Mo)}</td>
                <td style={styles.cell}>{displayChem(item.Mn)}</td>
                <td style={styles.cell}>{displayChem(item.Si)}</td>
                <td style={styles.cell}>{displayChem(item.S)}</td>
                <td style={styles.cell}>{displayChem(item.P)}</td>
                <td style={styles.cell}>{displayChem(item.Cu)}</td>
                <td style={styles.cell}>{displayChem(item.Fe)}</td>
                <td style={styles.cell}>{displayChem(item.Co)}</td>
                <td style={styles.cell}>{item.qty || '—'}</td>
                <td style={{ ...styles.cell, ...styles.textLeft }}>{item.matlConfTo || '---'}</td>
              </tr>
            ))}

            {/* Hydro Test Messages Footer */}
            {hydroTestMessages.length > 0 && (
              <tr>
                <td colSpan="18" style={{ ...styles.cell, textAlign: 'left', padding: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {hydroTestMessages.map((msg, i) => (
                    <React.Fragment key={i}>
                      {msg}
                      {i < hydroTestMessages.length - 1 && (
                        <>
                          <br /><br />
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </td>
              </tr>
            )}

            <tr>
              <td colSpan="11" style={{ ...styles.cell, textAlign: 'left', padding: '10px' }}>
                <span style={styles.bold}>
                  WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS <br />
                  FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
                </span>
              </td>
              <td colSpan="7" style={{ ...styles.cell, height: '160px', verticalAlign: 'top', padding: '10px', textAlign: 'center' }}>
                <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
                {selectedSign === 1 && (
                  <img src={sign1} alt="Signature 1" style={styles.signatureImg} />
                )}
                {selectedSign === 2 && (
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