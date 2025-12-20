// import React, { useState } from 'react';
// import * as XLSX from 'xlsx';

// const MainLayout = () => {
//   const [tableData, setTableData] = useState([]);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const data = new Uint8Array(event.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });

//       const sheetName = 'records';
//       if (!workbook.SheetNames.includes(sheetName)) {
//         alert('Sheet named "records" not found in the Excel file!');
//         return;
//       }

//       const worksheet = workbook.Sheets[sheetName];

//       const rawData = XLSX.utils.sheet_to_json(worksheet, { 
//         header: 1, 
//         defval: '',
//         blankrows: false,
//         raw: false
//       });

//       const rows = rawData.slice(1);

//       const cleanedData = rows.map((row) => {
//         return {
//           'S.no': row[0] || '',
//           'tc no': row[1] || '',
//           'heat no': row[2] || '',
//           size: row[3] || '',
//           C: row[4] || '',
//           Cr: row[5] || '',
//           Ni: row[6] || '',
//           Mo: row[7] || '',
//           Mn: row[8] || '',
//           Si: row[9] || '',
//           S: row[10] || '',
//           P: row[11] || '',
//           'Material Grade': row[12] || ''
//         };
//       }).filter(row => 
//         row['S.no'] || row['tc no'] || row['heat no'] || row.size || row['Material Grade']
//       );

//       setTableData(cleanedData);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   // Download function - exports the currently displayed table data as Excel
//   const handleDownload = () => {
//     if (tableData.length === 0) {
//       alert('No data to download. Please upload an Excel file first.');
//       return;
//     }

//     // Prepare data with headers
//     const exportData = [
//       ['S.no', 'tc no', 'heat no', 'size', 'C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Material Grade'],
//       ...tableData.map(row => [
//         row['S.no'],
//         row['tc no'],
//         row['heat no'],
//         row.size,
//         row.C,
//         row.Cr,
//         row.Ni,
//         row.Mo,
//         row.Mn,
//         row.Si,
//         row.S,
//         row.P,
//         row['Material Grade']
//       ])
//     ];

//     const worksheet = XLSX.utils.aoa_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'records');

//     // Generate file and trigger download
//     XLSX.writeFile(workbook, 'Material_Testing_Report_Data.xlsx');
//   };

//   return (
//     <>
//       <style jsx>{`
//         .certificate-container {
//           width: 95%;
//           max-width: 1300px;
//           margin: 30px auto;
//           font-family: Arial, Helvetica, sans-serif;
//           font-size: 11.5px;
//           border: 2px solid #000;
//           padding: 15px;
//           background-color: #fff;
//           box-sizing: border-box;
//         }

//         .controls-section {
//           text-align: center;
//           margin-bottom: 30px;
//           padding: 15px;
//           background-color: #f8f9fa;
//           border: 1px dashed #000;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           gap: 30px;
//         }

//         .controls-section button {
//           padding: 10px 20px;
//           font-size: 16px;
//           background-color: #007bff;
//           color: white;
//           border: none;
//           border-radius: 5px;
//           cursor: pointer;
//         }

//         .controls-section button:hover {
//           background-color: #0056b3;
//         }

//         .upload-part {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         }

//         .upload-part input {
//           margin-top: 10px;
//           padding: 8px;
//           font-size: 14px;
//         }

//         .header-bar {
//           background-color: #d4edda;
//           padding: 10px 15px;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-weight: bold;
//           margin-bottom: 12px;
//           border-bottom: 1px solid #000;
//         }

//         .logo {
//           width: 110px;
//           height: auto;
//         }

//         .company-name {
//           text-align: center;
//           font-size: 21px;
//           font-weight: bold;
//           margin: 12px 0;
//         }

//         .arabic-name {
//           font-size: 19px;
//           margin-right: 15px;
//         }

//         .address {
//           text-align: center;
//           font-size: 11px;
//           margin-bottom: 18px;
//         }

//         .title {
//           text-align: center;
//           font-size: 19px;
//           font-weight: bold;
//           margin: 20px 0 15px 0;
//         }

//         .cert-info-bar {
//           display: flex;
//           justify-content: flex-end;
//           gap: 80px;
//           font-size: 14px;
//           font-weight: bold;
//           margin-bottom: 12px;
//         }

//         .highlight {
//           background-color: yellow;
//           padding: 3px 10px;
//         }

//         .info-section {
//           background-color: #e6f2ff;
//           padding: 8px 15px;
//           margin-bottom: 8px;
//           font-size: 13px;
//         }

//         .customer-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }

//         .delivery-po-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }

//         .delivery-part {
//           display: flex;
//           gap: 60px;
//         }

//         .po-part {
//           display: flex;
//           gap: 80px;
//         }

//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 11px;
//           margin-top: 15px;
//           margin-bottom: 20px;
//         }

//         .data-table th,
//         .data-table td {
//           border: 1px solid #000;
//           padding: 7px 5px;
//           text-align: center;
//           vertical-align: middle;
//         }

//         .data-table th {
//           background-color: #c0e0c0;
//           font-weight: bold;
//         }

//         .text-left {
//           text-align: left !important;
//           padding-left: 12px !important;
//         }

//         .shaded {
//           background-color: #e6e6e6 !important;
//         }

//         .light-blue-row {
//           background-color: #f0f8ff;
//         }

//         .material-grade {
//           background-color: #fff3cd !important;
//         }

//         .test-notes {
//           background-color: #e6f3ff;
//           padding: 12px 15px;
//           border: 1px solid #000;
//           margin-bottom: 10px;
//           line-height: 1.6;
//           font-size: 12px;
//         }

//         .guarantee-section {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-end;
//           background-color: #d4edda;
//           padding: 15px 20px;
//           border: 1px solid #000;
//           min-height: 80px;
//           font-size: 13px;
//           font-weight: bold;
//         }

//         .guarantee-text {
//           flex: 1;
//           line-height: 1.6;
//         }

//         .for-company {
//           text-align: right;
//           white-space: nowrap;
//           margin-left: 20px;
//         }
//       `}</style>

//       <div className="certificate-container">
//         {/* Controls Section: Upload + Download Button */}
//         <div className="controls-section">
//           <div className="upload-part">
//             <h3>Upload Excel File (Sheet: "records")</h3>
//             <input
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={handleFileUpload}
//             />
//           </div>

//           <button onClick={handleDownload}>
//             Download Excel
//           </button>
//         </div>

//         {/* Top Header */}
//         <div className="header-bar">
//           <div>Format No. ICCL/QC/R/14, Rev.01 ,Date: 01/04/2024</div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//             C.R. 2055012479
//             <img
//               src="https://via.placeholder.com/110x80/FF0000/FFFFFF?text=ICCL+LOGO"
//               alt="ICCL Logo"
//               className="logo"
//             />
//           </div>
//         </div>

//         {/* Company Name */}
//         <div className="company-name">
//           <span className="arabic-name">شركة الآلات الدقيقة والتحكم المحدودة</span>
//           Instrumentation & Controls Co. Ltd. (ICCL)
//         </div>

//         {/* Address */}
//         <div className="address">
//           Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA
//           <br />
//           Email: info@icclksa.com Web: www.icclksa.com
//         </div>

//         {/* Title */}
//         <div className="title">MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE</div>

//         {/* Cert No & Date */}
//         <div className="cert-info-bar">
//           <div>CERT.NO. <span className="highlight">505TC/07/2025</span></div>
//           <div>DATE <span className="highlight">23-Jul-25</span></div>
//         </div>

//         {/* Customer */}
//         <div className="info-section customer-row">
//           <div><strong>CUSTOMER NAME</strong> Flowserve Abahsain Flow Control Co Ltd</div>
//         </div>

//         {/* Delivery & PO */}
//         <div className="info-section delivery-po-row">
//           <div className="delivery-part">
//             <div><strong>Delivery Note No.:</strong> 27462D</div>
//             <div><strong>Date:</strong> 23-Jul-25</div>
//           </div>
//           <div className="po-part">
//             <div><strong>P.O.NO.</strong> 4543241</div>
//             <div><strong>P.O.Date:</strong> 26-Feb-25</div>
//           </div>
//         </div>

//         {/* Dynamic Table */}
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th rowSpan="2">S.no</th>
//               <th rowSpan="2">tc no</th>
//               <th rowSpan="2">heat no</th>
//               <th rowSpan="2">size</th>
//               <th colSpan="8">chemical comp</th>
//               <th rowSpan="2">Material Grade</th>
//             </tr>
//             <tr>
//               <th>C</th>
//               <th>Cr</th>
//               <th>Ni</th>
//               <th>Mo</th>
//               <th>Mn</th>
//               <th>Si</th>
//               <th>S</th>
//               <th>P</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableData.length === 0 ? (
//               <tr>
//                 <td colSpan="13" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
//                   No data loaded. Please upload an Excel file with sheet name "records".
//                 </td>
//               </tr>
//             ) : (
//               tableData.map((row, index) => (
//                 <tr key={index} className={index % 2 === 1 ? 'light-blue-row' : ''}>
//                   <td className="shaded">{row['S.no']}</td>
//                   <td className="shaded">{row['tc no']}</td>
//                   <td>{row['heat no']}</td>
//                   <td className="text-left">
//                     {String(row.size || '').split('\n').map((line, i) => (
//                       <span key={i}>{line}<br /></span>
//                     ))}
//                   </td>
//                   <td>{row.C}</td>
//                   <td>{row.Cr}</td>
//                   <td>{row.Ni}</td>
//                   <td>{row.Mo}</td>
//                   <td>{row.Mn}</td>
//                   <td>{row.Si}</td>
//                   <td>{row.S}</td>
//                   <td>{row.P}</td>
//                   <td className="material-grade text-left">
//                     {String(row['Material Grade'] || '').split('\n').map((line, i) => (
//                       <span key={i}>{line}<br /></span>
//                     ))}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>

//         {/* Test Notes */}
//         <div className="test-notes">
//           TEST: ABOVE FITTINGS (I/I: 1,2,4) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 9000 PSI WITHOUT ANY LEAKAGE.<br />
//           TEST: ABOVE FITTINGS (I/I: 3,5,8,9) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 6750 PSI WITHOUT ANY LEAKAGE.<br />
//           TEST: ABOVE FITTINGS (I/I: 7) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 3000 PSI WITHOUT ANY LEAKAGE.
//         </div>

//         {/* Guarantee Section */}
//         <div className="guarantee-section">
//           <div className="guarantee-text">
//             WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS<br />
//             FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
//           </div>
//           <div className="for-company">
//             FOR Instrumentation & Controls Co. Ltd
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MainLayout;






















import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import logo from './Assets/logo.png'; // Import the logo

const MainLayout = () => {
  const [tableData, setTableData] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const [recordsFileName, setRecordsFileName] = useState('');
  const [invoiceFileName, setInvoiceFileName] = useState('');

  const recordsWorkbookRef = useRef(null);
  const invoiceWorkbookRef = useRef(null);

  // Upload Records Excel
  const handleRecordsUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRecordsFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = 'records';
      if (!workbook.SheetNames.includes(sheetName)) {
        alert('Sheet named "records" not found in the file!');
        return;
      }

      recordsWorkbookRef.current = workbook;

      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
      });
      const rows = rawData.slice(1);

      const cleanedData = rows
        .map((row) => ({
          'PO L/I': row[0] || '',
          'ITEM & SIZE': row[1] || '',
          'RAW MTL. SIZE': row[2] || '',
          'T.C NO.': row[3] || '',
          'Traceability no.': row[4] || '',
          C: row[5] !== undefined && row[5] !== '' ? Number(row[5]) : '',
          Cr: row[6] !== undefined && row[6] !== '' ? Number(row[6]) : '',
          Ni: row[7] !== undefined && row[7] !== '' ? Number(row[7]) : '',
          Mo: row[8] !== undefined && row[8] !== '' ? Number(row[8]) : '',
          Mn: row[9] !== undefined && row[9] !== '' ? Number(row[9]) : '',
          Si: row[10] !== undefined && row[10] !== '' ? Number(row[10]) : '',
          S: row[11] !== undefined && row[11] !== '' ? Number(row[11]) : '',
          P: row[12] !== undefined && row[12] !== '' ? Number(row[12]) : '',
          'QTY Pcs': row[13] || '',
          'MATL. Conf. To': row[14] || '',
        }))
        .filter(
          (row) =>
            row['PO L/I'] ||
            row['ITEM & SIZE'] ||
            row['MATL. Conf. To']
        );

      setTableData(cleanedData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Upload TaxInvoice Excel
  const handleInvoiceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setInvoiceFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = 'TaxInvoice';
      if (!workbook.SheetNames.includes(sheetName)) {
        alert('Sheet named "TaxInvoice" not found in the file!');
        return;
      }

      invoiceWorkbookRef.current = workbook;

      const ws = workbook.Sheets[sheetName];

      const extracted = {
        formNo:
          ws['A1']?.v ||
          'Format No.: ICCL/QC/R/14, Rev 01, Date: 01/04/2024',
        cr: ws['I1']?.v || 'C.R. 2055012479',
        certNo: ws['I7']?.v || '505TC/07/2025',
        certDate: ws['I8']?.v || '23-Jul-25',
        customerName:
          ws['B10']?.v || 'Flowserve Abahsain Flow Control Co Ltd',
        poNo: ws['B11']?.v || '4543241',
        poDate: ws['F11']?.v || '26-Feb-25',
        deliveryNoteNo: ws['I10']?.v || '27462D',
        deliveryDate: ws['I11']?.v || '23-Jul-25',
      };

      setHeaderData(extracted);
    };
    reader.readAsArrayBuffer(file);
  };

  // Download all sheets
  const handleDownloadAll = () => {
    if (!recordsWorkbookRef.current && !invoiceWorkbookRef.current) {
      alert('Please upload at least one Excel file to download.');
      return;
    }

    const newWorkbook = XLSX.utils.book_new();

    if (recordsWorkbookRef.current) {
      recordsWorkbookRef.current.SheetNames.forEach((name) => {
        XLSX.utils.book_append_sheet(
          newWorkbook,
          recordsWorkbookRef.current.Sheets[name],
          name
        );
      });
    }

    if (invoiceWorkbookRef.current) {
      invoiceWorkbookRef.current.SheetNames.forEach((name) => {
        XLSX.utils.book_append_sheet(
          newWorkbook,
          invoiceWorkbookRef.current.Sheets[name],
          name
        );
      });
    }

    XLSX.writeFile(
      newWorkbook,
      'Combined_Material_Certificate_Data.xlsx'
    );
  };

  return (
    <>
      <style jsx>{`
        .certificate-container {
          width: 95%;
          max-width: 1300px;
          margin: 30px auto;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11.5px;
          border: 2px solid #000;
          padding: 15px;
          background-color: #fff;
          box-sizing: border-box;
        }

        .controls-section {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border: 1px dashed #000;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 40px;
          align-items: center;
        }

        .upload-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 300px;
        }

        .upload-group h3 {
          margin-bottom: 10px;
        }

        .upload-group input {
          padding: 8px;
          font-size: 14px;
        }

        .upload-group small {
          margin-top: 8px;
          color: #28a745;
          font-weight: bold;
        }

        .controls-section button {
          padding: 12px 30px;
          font-size: 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .controls-section button:hover {
          background-color: #c82333;
        }

        /* combined header block (format, company, logo, cert) */
        .top-header-block {
          display: grid;
          grid-template-columns: 1.5fr 3fr 1.2fr 1.1fr;
          grid-template-rows: auto auto auto;
          background-color: #d4edda;
          border-bottom: 1px solid #000;
        }

        .top-header-format {
          grid-column: 1 / 3;
          padding: 4px 8px;
          font-weight: bold;
          font-size: 11px;
        }

        .top-header-cr {
          grid-column: 3 / 5;
          padding: 4px 8px;
          text-align: right;
          font-weight: bold;
          font-size: 11px;
        }

        .top-header-company {
          grid-column: 1 / 4;
          padding: 6px 8px 0 8px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
        }

        .top-header-company-ar {
          display: block;
          font-size: 16px;
          margin-top: 2px;
        }

        .top-header-address {
          grid-column: 1 / 4;
          padding: 2px 8px 6px 8px;
          text-align: center;
          font-size: 11px;
        }

        .top-header-logo {
          grid-column: 4 / 5;
          grid-row: 2 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .logo {
          width: 80px;
          height: auto;
        }

        .cert-info-bar {
          display: flex;
          justify-content: flex-end;
          gap: 80px;
          font-size: 14px;
          font-weight: bold;
          margin: 8px 0 12px 0;
        }

        .highlight {
          background-color: yellow;
          padding: 3px 10px;
        }

        .title {
          text-align: center;
          font-size: 19px;
          font-weight: bold;
          margin: 10px 0 15px 0;
          background-color: #d4edda;
          padding: 6px 0;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
        }

        .info-section {
          background-color: #e6f2ff;
          padding: 8px 15px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .customer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .delivery-po-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .delivery-part {
          display: flex;
          gap: 60px;
        }

        .po-part {
          display: flex;
          gap: 60px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin: 15px 0 20px 0;
        }

        .data-table th,
        .data-table td {
          border: 1px solid #000;
          padding: 7px 5px;
          text-align: center;
          vertical-align: middle;
        }

        .data-table th {
          background-color: #c0e0c0;
          font-weight: bold;
        }

        .text-left {
          text-align: left !important;
          padding-left: 12px !important;
        }

        .shaded {
          background-color: #e6e6e6 !important;
        }

        .light-blue-row {
          background-color: #f0f8ff;
        }

        .material-grade {
          background-color: #fff3cd !important;
        }

        .test-notes {
          background-color: #e6f3ff;
          padding: 12px 15px;
          border: 1px solid #000;
          margin-bottom: 10px;
          line-height: 1.6;
          font-size: 12px;
        }

        .guarantee-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          background-color: #d4edda;
          padding: 15px 20px;
          border: 1px solid #000;
          min-height: 80px;
          font-size: 13px;
          font-weight: bold;
        }

        .guarantee-text {
          flex: 1;
          line-height: 1.6;
        }

        .for-company {
          text-align: right;
          white-space: nowrap;
          margin-left: 20px;
        }
      `}</style>

      <div className="certificate-container">
        {/* Controls */}
        <div className="controls-section">
          <div className="upload-group">
            <h3>
              1. Upload Records Excel
              <br />
              (Sheet: "records")
            </h3>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleRecordsUpload}
            />
            {recordsFileName && (
              <small>Loaded: {recordsFileName}</small>
            )}
          </div>

          <div className="upload-group">
            <h3>
              2. Upload Tax Invoice Excel
              <br />
              (Sheet: "TaxInvoice")
            </h3>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleInvoiceUpload}
            />
            {invoiceFileName && (
              <small>Loaded: {invoiceFileName}</small>
            )}
          </div>

          <button onClick={handleDownloadAll}>Download All Sheets</button>
        </div>

        {/* Combined header block (format + company + logo) */}
        <div className="top-header-block">
          <div className="top-header-format">{headerData.formNo}</div>
          <div className="top-header-cr">{headerData.cr}</div>

          <div className="top-header-company">
            Instrumentation & Controls Co. Ltd. (ICCL).
            <span className="top-header-company-ar">
              شركة الآلات الدقيقة والتحكم المحدودة
            </span>
          </div>

          <div className="top-header-address">
            Lot #56, Block #02, Section G,Support Industries, Jubail 2,
            P.O. Box No. 11300, Jubail – 31961 KSA
            {' '}
            Email:info@icclksa.com,Web:www.icclksa.com
          </div>

          <div className="top-header-logo">
            <img src={logo} alt="ICCL Logo" className="logo" />
          </div>
        </div>

        {/* Title bar in same green band area (next row) */}
        <div className="title">
          MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
        </div>

        {/* Cert No & Date - yellow on right, same as sample */}
        <div className="cert-info-bar">
          <div>
            CERT.NO. <span className="highlight">{headerData.certNo}</span>
          </div>
          <div>
            DATE: <span className="highlight">{headerData.certDate}</span>
          </div>
        </div>

        {/* Customer Name - Light Blue */}
        <div className="info-section customer-row">
          <div>
            <strong>CUSTOMER NAME</strong> {headerData.customerName}
          </div>
          <div>
            <strong>Delivery Note No.:</strong>{' '}
            {headerData.deliveryNoteNo}
          </div>
        </div>

        {/* P.O. and Dates - Light Blue */}
        <div className="info-section delivery-po-row">
          <div className="po-part">
            <div>
              <strong>P.O.NO.</strong> {headerData.poNo}
            </div>
            <div>
              <strong>P.O.Date:</strong> {headerData.poDate}
            </div>
          </div>
          <div>
            <strong>Date:</strong> {headerData.deliveryDate}
          </div>
        </div>

        {/* Table - Exact Match */}
        <table className="data-table">
          <thead>
            <tr>
              <th rowSpan="2">PO L/I</th>
              <th rowSpan="2">ITEM & SIZE</th>
              <th rowSpan="2">RAW MTL. SIZE</th>
              <th rowSpan="2">T.C NO.</th>
              <th rowSpan="2">Traceability no.</th>
              <th colSpan="8">CHEMICAL COMPOSITION %</th>
              <th rowSpan="2">QTY Pcs</th>
              <th rowSpan="2">MATL. Conf. To</th>
            </tr>
            <tr>
              <th>C</th>
              <th>Cr</th>
              <th>Ni</th>
              <th>Mo</th>
              <th>Mn</th>
              <th>Si</th>
              <th>S</th>
              <th>P</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td
                  colSpan="15"
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#999',
                  }}
                >
                  Upload the "records" Excel file to display table data.
                </td>
              </tr>
            ) : (
              tableData.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 1 ? 'light-blue-row' : ''}
                >
                  <td className="shaded">{row['PO L/I']}</td>
                  <td className="text-left shaded">
                    {String(row['ITEM & SIZE'] || '')
                      .split('\n')
                      .map((l, i) => (
                        <span key={i}>
                          {l}
                          <br />
                        </span>
                      ))}
                  </td>
                  <td className="text-left">
                    {String(row['RAW MTL. SIZE'] || '')
                      .split('\n')
                      .map((l, i) => (
                        <span key={i}>
                          {l}
                          <br />
                        </span>
                      ))}
                  </td>
                  <td>{row['T.C NO.']}</td>
                  <td>{row['Traceability no.']}</td>
                  <td>
                    {typeof row.C === 'number' ? row.C.toFixed(3) : row.C}
                  </td>
                  <td>
                    {typeof row.Cr === 'number'
                      ? row.Cr.toFixed(3)
                      : row.Cr}
                  </td>
                  <td>
                    {typeof row.Ni === 'number'
                      ? row.Ni.toFixed(3)
                      : row.Ni}
                  </td>
                  <td>
                    {typeof row.Mo === 'number'
                      ? row.Mo.toFixed(3)
                      : row.Mo}
                  </td>
                  <td>
                    {typeof row.Mn === 'number'
                      ? row.Mn.toFixed(3)
                      : row.Mn}
                  </td>
                  <td>
                    {typeof row.Si === 'number'
                      ? row.Si.toFixed(3)
                      : row.Si}
                  </td>
                  <td>
                    {typeof row.S === 'number'
                      ? row.S.toFixed(4)
                      : row.S}
                  </td>
                  <td>
                    {typeof row.P === 'number'
                      ? row.P.toFixed(4)
                      : row.P}
                  </td>
                  <td className="shaded">{row['QTY Pcs']}</td>
                  <td className="text-left material-grade">
                    {String(row['MATL. Conf. To'] || '')
                      .split('\n')
                      .map((l, i) => (
                        <span key={i}>
                          {l}
                          <br />
                        </span>
                      ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Test Notes */}
        <div className="test-notes">
          TEST: ABOVE FITTINGS (I/I: 1,2,4) ARE HYDRO TESTED MAKING A SAMPLE
          LOOP AT 9000 PSI WITHOUT ANY LEAKAGE.
          <br />
          TEST: ABOVE FITTINGS (I/I: 3,5,8,9) ARE HYDRO TESTED MAKING A
          SAMPLE LOOP AT 6750 PSI WITHOUT ANY LEAKAGE.
          <br />
          TEST: ABOVE FITTINGS (I/I: 7) ARE HYDRO TESTED MAKING A SAMPLE
          LOOP AT 3000 PSI WITHOUT ANY LEAKAGE.
        </div>

        {/* Guarantee Section */}
        <div className="guarantee-section">
          <div className="guarantee-text">
            WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT
            FOR 12 MONTHS
            <br />
            FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION
            WHICHEVER IS EARLIER
          </div>
          <div className="for-company">
            FOR Instrumentation & Controls Co. Ltd
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
