import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { CheckCircle, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from './Assets/logo.png'; // Your real logo

const CreateNewSheet = () => {
  const [multiSheetData, setMultiSheetData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const formatExcelDate = (val) => {
    if (typeof val !== 'number' || val < 30000 || val > 60000) return val;
    const days = Math.floor(val - 25569);
    const date = new Date(days * 86400 * 1000);
    const dd = date.getUTCDate().toString().padStart(2, '0');
    const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const extractFromFirstSheet = (wb) => {
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    const get = (ref) => {
      const cell = ws[ref];
      if (!cell) return null;
      if (cell.t === 'n' && cell.v > 30000 && cell.v < 60000) {
        return formatExcelDate(cell.v);
      }
      return cell.v ?? null;
    };

    const headers = {
      formatNo: get('A1') || 'Format No.: ICCL/QC/R/14, Rev 01, Date: 01/04/2024',
      crNo: get('I1') || 'C.R. 2055012479',
      customerName: get('B4') || get('C4') || get('B3') || get('A3') || '',
      deliveryNoteNo: get('A9') || get('B8') || '',
      deliveryDate: get('B9') || get('C9') || '',
      poNo: get('D9') || get('E8') || '',
      poDate: get('E9') || get('F9') || '',
      certNo: '505TC/02/2026',
      certDate: todayDate,
    };

    let headerRow = -1;
    let qtyColIndex = -1;

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:ZZ200');

    for (let r = range.s.r; r <= range.e.r && r < 60; r++) {
      let rowText = '';
      for (let c = 0; c < 20; c++) {
        const val = get(XLSX.utils.encode_cell({ r, c }));
        if (val) rowText += ' ' + String(val).toUpperCase().replace(/\s+/g, ' ').trim();
      }

      if (
        (rowText.includes('SR NO') || rowText.includes('SR.NO') || rowText.includes('SR.NO.')) &&
        rowText.includes('DESCRIPTION') &&
        rowText.includes('QTY PCS')
      ) {
        headerRow = r;
        for (let c = 0; c < 20; c++) {
          const val = get(XLSX.utils.encode_cell({ r, c }));
          if (val && String(val).toUpperCase().includes('QTY PCS')) {
            qtyColIndex = c;
            break;
          }
        }
        break;
      }
    }

    let items = [];
    if (headerRow !== -1) {
      for (let r = headerRow + 1; r <= range.e.r; r++) {
        const row = [];
        for (let c = 0; c < 18; c++) {
          row.push(get(XLSX.utils.encode_cell({ r, c })) ?? '');
        }

        const firstContent = row.slice(0, 6).join('').trim();
        if (!firstContent) continue;

        if (
          String(row[0] || '').toUpperCase().includes('TOTAL') ||
          String(row[0] || '').includes('RECEIVED BY') ||
          String(row[0] || '').includes('NET WEIGHT') ||
          String(row[0] || '').includes('GROSS WEIGHT') ||
          String(row[0] || '').includes('NO OF') ||
          String(row[0] || '').includes('CARTON') ||
          String(row[0] || '').includes('PALLET')
        ) continue;

        const poLiValue = String(row[0] || '').trim();

        if (poLiValue && poLiValue !== '-' && !poLiValue.toUpperCase().includes('TOTAL')) {
          const qtyValue = qtyColIndex >= 0 ? String(row[qtyColIndex] || '').trim() : '';

          items.push({
            poLi:         poLiValue,
            itemSize:     String(row[1] || '').trim(),
            rawMtlSize:   '',
            tcNo:         '',
            traceability: String(row[2] || '').trim() || '',
            C:            '',
            Cr:           '',
            Ni:           '',
            Mo:           '',
            Mn:           '',
            Si:           '',
            S:            '',
            P:            '',
            qty:          qtyValue,
            matlConfTo:   '',
          });
        }
      }
    }

    return { sheetName, headers, items };
  };

  const processFile = (file) => {
    if (!/\.xlsx?$/.test(file.name)) {
      setMessage({ text: 'Only .xlsx / .xls allowed', type: 'error' });
      return;
    }

    setFileName(file.name);
    setMultiSheetData([]);
    setMessage({ text: 'Reading...', type: 'info' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: false });
        const data = extractFromFirstSheet(wb);
        setMultiSheetData([data]);

        const count = data.items.length;
        setMessage({ text: `Loaded ${count} row${count !== 1 ? 's' : ''}`, type: count > 0 ? 'success' : 'warning' });
      } catch (err) {
        console.error(err);
        setMessage({ text: 'Failed to read file', type: 'error' });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const updateItemField = (sheetIndex, itemIndex, field, value) => {
    const newData = [...multiSheetData];
    newData[sheetIndex].items[itemIndex][field] = value;
    setMultiSheetData(newData);
  };

  const fetchAndFillRow = async (sheetIndex, itemIndex, tcNoValue) => {
    const currentPoLi = multiSheetData[sheetIndex]?.items[itemIndex]?.poLi?.trim();

    if (!currentPoLi || currentPoLi === '-' || currentPoLi === '') {
      setMessage({ text: 'No PO L/I', type: 'warning' });
      return;
    }

    if (!tcNoValue?.trim()) {
      setMessage({ text: 'Enter TC No', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: `Fetching ${tcNoValue}...`, type: 'info' });

    try {
      const res = await fetch(`http://localhost:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(tcNoValue.trim())}`);
      const data = await res.json();

      if (data.success && data.record) {
        const record = data.record;
        const updatedData = [...multiSheetData];
        const sheetItems = [...updatedData[sheetIndex].items];
        const currentItem = { ...sheetItems[itemIndex] };

        currentItem.tcNo = record.tc_no || tcNoValue;
        currentItem.rawMtlSize = record.size || '';
        currentItem.C = record.c || '';
        currentItem.Cr = record.cr || '';
        currentItem.Ni = record.ni || '';
        currentItem.Mo = record.mo || '';
        currentItem.Mn = record.mn || '';
        currentItem.Si = record.si || '';
        currentItem.S = record.s || '';
        currentItem.P = record.p || '';
        currentItem.matlConfTo = record.material_grade || '';

        sheetItems[itemIndex] = currentItem;
        updatedData[sheetIndex] = { ...updatedData[sheetIndex], items: sheetItems };

        setMultiSheetData(updatedData);
        setMessage({ text: `Row ${itemIndex + 1} filled`, type: 'success' });
      } else {
        setMessage({ text: `No record found`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Fetch failed', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;

    setLoading(true);
    setMessage({ text: 'Generating PDF...', type: 'info' });

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.8,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 5;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Certificate_${todayDate}.pdf`);

      setMessage({ text: 'PDF downloaded', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'PDF failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        body { margin: 0; background: #ffffff; font-family: Arial, sans-serif; }
        .upload-fixed {
          position: sticky;
          top: 0;
          z-index: 100;
          background: white;
          border-bottom: 1px solid #000;
          padding: 15px 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        .upload-area {
          border: 2px dashed #000;
          border-radius: 8px;
          padding: 18px 40px;
          display: inline-block;
          background: #ffffff;
          transition: all 0.25s;
          cursor: pointer;
        }
        .upload-area:hover, .upload-area.drag-active {
          border-color: #000;
          background: #f5f5f5;
        }
        .certificate-container {
          width: 98%;
          max-width: 1450px;
          margin: 20px auto 40px;
          font-size: 13px;
          border: 2px solid #000;
          padding: 25px;
          background: white;
        }
        .header-white {
          border-bottom: 1px solid #000;
          padding: 8px 12px;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo { width: 100px; height: auto; }
        .company-title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin: 10px 0 4px;
          color: #000;
        }
        .arabic-title { font-size: 18px; display: block; margin-bottom: 4px; }
        .address-line { text-align: center; font-size: 11.5px; margin-bottom: 15px; line-height: 1.4; color: #000; }
        .main-title {
          text-align: center;
          font-size: 19px;
          font-weight: bold;
          margin: 15px 0;
          padding: 6px 0;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          color: #000;
        }
        .cert-row {
          display: flex;
          justify-content: flex-end;
          gap: 80px;
          font-weight: bold;
          margin: 10px 0 15px;
          font-size: 14px;
          color: #000;
        }
        .info-box {
          background: #ffffff;
          padding: 10px 15px;
          margin-bottom: 10px;
          font-size: 13px;
          border: 1px solid #000;
          border-radius: 4px;
          color: #000;
        }
        .customer-info, .po-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin: 15px 0;
          table-layout: auto;
        }
        .data-table th, .data-table td {
          border: 1px solid #000;
          padding: 7px 6px;
          text-align: center;
          vertical-align: middle;
          color: #000;
        }
        .data-table th {
          background: #f0f0f0;
          font-weight: bold;
          white-space: nowrap;
          font-size: 12.5px;
        }
        .data-table td {
          white-space: normal;
          word-break: break-word;
        }
        .tc-input-container {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
        }
        .tc-input {
          width: 85px;           /* fits 8 digits exactly */
          padding: 5px 6px;
          font-size: 12px;
          border: 1px solid #000;
          border-radius: 4px;
          box-sizing: border-box;
          text-align: center;
          background: white;
          color: #000;
        }
        .fetch-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          line-height: 1;
        }
        .shaded { background: #f8f8f8 !important; }
        .material-grade { background: #ffffff !important; text-align: left !important; padding-left: 10px !important; }
        .test-notes, .guarantee-section {
          margin: 20px 0;
          padding: 12px;
          border: 1px solid #000;
          background: #ffffff;
          color: #000;
        }
        .guarantee-section { display: flex; justify-content: space-between; align-items: flex-end; }
        .status-message {
          padding: 12px;
          border: 1px solid #000;
          border-radius: 6px;
          margin: 15px auto;
          text-align: center;
          font-weight: bold;
          max-width: 1450px;
          background: #ffffff;
          color: #000;
        }
        .success { border-color: #000; }
        .error { border-color: #000; }
        .info { border-color: #000; }

        @media print {
          .upload-fixed, .status-message { display: none !important; }
          .tc-input-container { display: none !important; }
        }
      `}</style>

      {/* Fixed upload area */}
      <div className="upload-fixed">
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleChange}
            style={{ display: 'none' }}
            id="excel-upload"
          />
          <label htmlFor="excel-upload">
            Upload Excel File (First sheet only)
          </label>
          {fileName && (
            <p style={{ marginTop: '8px', color: '#000', fontSize: '14px' }}>
              Loaded: {fileName}
            </p>
          )}
        </div>

        {multiSheetData.length > 0 && (
          <button
            onClick={downloadAsPDF}
            disabled={loading}
            style={{
              marginTop: '12px',
              padding: '8px 18px',
              fontSize: '14px',
              background: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Download size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Download PDF
          </button>
        )}
      </div>

      {message.text && (
        <div className={`status-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="certificate-container" ref={certificateRef}>
        <div className="header-white">
          <div>
            {multiSheetData[0]?.headers?.formatNo || 'Format No.: ICCL/QC/R/14, Rev 01, Date: 01/04/2024'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {multiSheetData[0]?.headers?.crNo || 'C.R. 2055012479'}
            <img src={logo} alt="ICCL Logo" className="logo" />
          </div>
        </div>

        <div className="company-title">
          <span className="arabic-title">شركة الآلات الدقيقة والتحكم المحدودة</span>
          Instrumentation & Controls Co. Ltd. (ICCL).
        </div>

        <div className="address-line">
          Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA<br />
          Email: info@icclksa.com Web: www.icclksa.com
        </div>

        <div className="main-title">MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE</div>

        <div className="cert-row">
          <div>CERT.NO. 505TC/02/2026</div>
          <div>DATE: {todayDate}</div>
        </div>

        <div className="info-box customer-info">
          <div><strong>CUSTOMER NAME</strong> {multiSheetData[0]?.headers?.customerName || '-'}</div>
        </div>

        <div className="info-box po-info">
          <div>
            <strong>Delivery Note No.:</strong> {multiSheetData[0]?.headers?.deliveryNoteNo || '-'}
            <strong style={{ marginLeft: '30px' }}>Date:</strong> {multiSheetData[0]?.headers?.deliveryDate || '-'}
          </div>
          <div>
            <strong>P.O.NO.</strong> {multiSheetData[0]?.headers?.poNo || '-'}
            <strong style={{ marginLeft: '30px' }}>P.O.Date:</strong> {multiSheetData[0]?.headers?.poDate || '-'}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>PO L/I</th>
              <th>Item & Size</th>
              <th>Raw Size</th>
              <th>T.C.No</th>
              <th>Traceability</th>
              <th>C</th>
              <th>Cr</th>
              <th>Ni</th>
              <th>Mo</th>
              <th>Mn</th>
              <th>Si</th>
              <th>S</th>
              <th>P</th>
              <th>Qty</th>
              <th>Material Conf. To</th>
            </tr>
          </thead>
          <tbody>
            {multiSheetData[0]?.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="shaded">{item.poLi || ''}</td>
                <td className="text-left shaded">{item.itemSize || ''}</td>
                <td className="value-display">{item.rawMtlSize || ''}</td>

                <td className="value-display" style={{ padding: '6px 4px' }}>
                  <div className="screen-only tc-input-container">
                    <input
                      type="text"
                      value={item.tcNo}
                      onChange={(e) => updateItemField(0, idx, 'tcNo', e.target.value)}
                      placeholder="TC No"
                      className="tc-input"
                    />
                    <button
                      type="button"
                      onClick={() => fetchAndFillRow(0, idx, item.tcNo)}
                      disabled={loading || !item.tcNo?.trim()}
                      className="fetch-btn"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle size={20} color="#000" />
                      )}
                    </button>
                  </div>
                </td>

                <td className="value-display">{item.traceability || ''}</td>
                <td className="value-display">{item.C || ''}</td>
                <td className="value-display">{item.Cr || ''}</td>
                <td className="value-display">{item.Ni || ''}</td>
                <td className="value-display">{item.Mo || ''}</td>
                <td className="value-display">{item.Mn || ''}</td>
                <td className="value-display">{item.Si || ''}</td>
                <td className="value-display">{item.S || ''}</td>
                <td className="value-display">{item.P || ''}</td>
                <td className="shaded value-display">{item.qty || ''}</td>
                <td className="value-display material-grade">{item.matlConfTo || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="test-notes">
          TEST: ABOVE FITTINGS ARE HYDRO TESTED AS PER REQUIREMENT WITHOUT ANY LEAKAGE.
        </div>

        <div className="guarantee-section">
          <div className="guarantee-text">
            WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS
            FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
          </div>
          <div className="for-company">
            FOR Instrumentation & Controls Co. Ltd
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNewSheet;