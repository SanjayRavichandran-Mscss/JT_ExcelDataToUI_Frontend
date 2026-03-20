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
  const [pressureLoading, setPressureLoading] = useState(false);

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
      const res = await fetch('http://103.118.158.188:5000/api/sheet/next-cert-number');
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

  // ====================== EXTRACT DATA FROM EXCEL ======================
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

        const traceabilityRaw = jobColIndex >= 0 
          ? String(get(XLSX.utils.encode_cell({ r, c: jobColIndex })) || '').trim() 
          : '';

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
          testPressure: null,           // Will be filled from size lookup only
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

  // ====================== PROCESS UPLOADED FILE ======================
  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const parsedData = extractFromFirstSheet(wb);

        console.log("=== ALL ITEM & SIZE FROM UPLOADED EXCEL ===");
        console.table(
          parsedData.items.map((item, index) => ({
            Row: index + 1,
            "PO L/I": item.poLi,
            "ITEM & SIZE": item.itemSize || "(Empty)",
            "Traceability": item.traceability || "-",
          }))
        );

        setMultiSheetData([parsedData]);
        fetchAllTraceabilityData(parsedData);
        fetchPressuresByItemSize(parsedData.items);   // ← This sets testPressure (Footer)
      } catch (err) {
        console.error('Error reading Excel:', err);
        alert('Failed to read Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ====================== FETCH TEST PRESSURE BASED ON ITEM & SIZE ONLY ======================
  const fetchPressuresByItemSize = async (items) => {
    const sizes = items.map(item => item.itemSize?.trim()).filter(Boolean);
    if (sizes.length === 0) return;

    setPressureLoading(true);

    try {
      const res = await fetch('http://103.118.158.188:5000/api/sheet/pressures/by-sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizes }),
      });

      const json = await res.json();

      if (json.success && json.pressures) {
        setMultiSheetData(prev => {
          if (!prev[0]) return prev;
          const updatedItems = prev[0].items.map(item => ({
            ...item,
            testPressure: json.pressures[item.itemSize?.trim()]?.test_pressure || null,
          }));

          const newData = [...prev];
          newData[0] = { ...newData[0], items: updatedItems };
          return newData;
        });

        // Update footer after pressure is set
        setTimeout(() => {
          setMultiSheetData(prev => {
            if (prev[0]?.items) updateHydroTestMessages(prev[0].items);
            return prev;
          });
        }, 100);
      }
    } catch (err) {
      console.error('Size-based pressure fetch failed:', err);
    } finally {
      setPressureLoading(false);
    }
  };

  // ====================== FETCH TRACEABILITY DATA ======================
  const fetchAllTraceabilityData = async (parsedData) => {
    const traceabilityList = parsedData.items
      .map(item => item.traceability?.trim())
      .filter(t => t && t.length > 0);

    if (traceabilityList.length === 0) return;

    setBatchLoading(true);

    try {
      const params = new URLSearchParams();
      traceabilityList.forEach(t => params.append('traceability_nos', t));

      const res = await fetch(`http://103.118.158.188:5000/api/sheet/records/by-traceabilities?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.records?.length > 0) {
        const recordsMap = new Map(
          json.records.map(r => [r.traceability_no?.trim()?.toUpperCase() || '', r])
        );

        setMultiSheetData(prev => {
          if (!prev[0]) return prev;
          const updatedItems = prev[0].items.map(item => {
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
              // testPressure is NOT touched here
            };
          });

          const newData = [...prev];
          newData[0] = { ...newData[0], items: updatedItems };
          return newData;
        });
      }
    } catch (err) {
      console.error('Batch fetch failed:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  // ====================== TC No CHANGE - PRESERVE testPressure ======================
  const handleTcNoChange = async (itemIndex, tcNoValue) => {
    const updatedData = [...multiSheetData];
    if (!updatedData[0]) return;

    const items = updatedData[0].items;
    const item = items[itemIndex];
    const oldTestPressure = item.testPressure;   // ← CRITICAL: Preserve footer pressure

    item.tcNo = tcNoValue.trim();

    if (!tcNoValue.trim()) {
      Object.assign(item, {
        rawMtlSize: '', 
        C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
        matlConfTo: '', 
        workingPressure: null,
        testPressure: oldTestPressure,   // Restore
      });
      setMultiSheetData(updatedData);
      updateHydroTestMessages(items);
      return;
    }

    try {
      const res = await fetch(`http://103.118.158.188:5000/api/sheet/records/by-tc?tc_no=${encodeURIComponent(tcNoValue.trim())}`);
      const json = await res.json();

      if (json.success && json.record) {
        const r = json.record;
        Object.assign(item, {
          rawMtlSize: r.size || '',
          C: r.c || '', 
          Cr: r.cr || '', 
          Ni: r.ni || '', 
          Mo: r.mo || '',
          Mn: r.mn || '', 
          Si: r.si || '', 
          S: r.s || '', 
          P: r.p || '',
          Cu: r.cu || '', 
          Fe: r.fe || '', 
          Co: r.co || '',
          matlConfTo: r.material_grade || '',
          workingPressure: r.working_pressure || null,
          testPressure: oldTestPressure,        // ← Preserve testPressure (Footer)
        });
      } else {
        Object.assign(item, {
          rawMtlSize: '', 
          C: '', Cr: '', Ni: '', Mo: '', Mn: '', Si: '', S: '', P: '', Cu: '', Fe: '', Co: '',
          matlConfTo: '', 
          workingPressure: null,
          testPressure: oldTestPressure,
        });
      }

      setMultiSheetData(updatedData);
      updateHydroTestMessages(items);
    } catch (err) {
      console.error('TC lookup failed:', err);
      item.testPressure = oldTestPressure;   // Restore on error
      setMultiSheetData(updatedData);
      updateHydroTestMessages(items);
    }
  };

  // ====================== UPDATE HYDRO TEST MESSAGES (Footer) ======================
  // const updateHydroTestMessages = (items) => {
  //   if (!items?.length) {
  //     setHydroTestMessages([]);
  //     return;
  //   }

  //   const pressureGroups = {};

  //   items
  //     .filter((item) => item.poLi && item.testPressure)
  //     .forEach((item) => {
  //       const key = item.testPressure;
  //       if (!pressureGroups[key]) {
  //         pressureGroups[key] = { testPressure: item.testPressure, poLis: [] };
  //       }
  //       pressureGroups[key].poLis.push(item.poLi);
  //     });

  //   const messages = Object.values(pressureGroups).map((group) => {
  //     const poLis = group.poLis.sort((a, b) => parseFloat(a) - parseFloat(b));
  //     let poLiText = poLis.length === 1 
  //       ? poLis[0] 
  //       : poLis.every((n, i, arr) => i === 0 || Number(n) === Number(arr[i-1]) + 0.1)
  //         ? `${poLis[0]} to ${poLis[poLis.length - 1]}`
  //         : poLis.join(' & ');

  //     return {
  //       full: `TEST: ABOVE FITTINGS (L/I: ${poLiText}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${group.testPressure} WITHOUT ANY LEAKAGE.`,
  //       poLiPart: poLiText,
  //       pressurePart: group.testPressure,
  //     };
  //   });

  //   setHydroTestMessages(messages);
  // };




  // ====================== UPDATE HYDRO TEST MESSAGES (Footer) ======================
const updateHydroTestMessages = (items) => {
  if (!items?.length) {
    setHydroTestMessages([]);
    return;
  }

  const groups = {};

  items
    .filter((item) => item.poLi && item.testPressure)
    .forEach((item) => {
      const isValve = item.itemSize && item.itemSize.toLowerCase().includes('valve');

      // 👇 KEY NOW INCLUDES TYPE (VALVE / FITTING)
      const key = `${item.testPressure}_${isValve ? 'VALVE' : 'FITTING'}`;

      if (!groups[key]) {
        groups[key] = {
          testPressure: item.testPressure,
          poLis: [],
          type: isValve ? 'VALVE' : 'FITTING',
        };
      }

      groups[key].poLis.push(item.poLi);
    });

  const messages = Object.values(groups).map((group) => {
    const poLis = group.poLis.sort((a, b) => parseFloat(a) - parseFloat(b));

    let poLiText = poLis.length === 1
      ? poLis[0]
      : poLis.every((n, i, arr) => i === 0 || Number(n) === Number(arr[i - 1]) + 0.1)
        ? `${poLis[0]} to ${poLis[poLis.length - 1]}`
        : poLis.join(' & ');

    //  DIFFERENT MESSAGE BASED ON TYPE
    const fullMessage = group.type === 'VALVE'
      ? `TEST: ABOVE (L/I: ${poLiText}) VALVES ARE 100% HYDRO TESTED AT ${group.testPressure} WITHOUT ANY LEAKAGE.`
      : `TEST: ABOVE FITTINGS (L/I: ${poLiText}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${group.testPressure} WITHOUT ANY LEAKAGE.`;

    return {
      full: fullMessage,
      poLiPart: poLiText,
      pressurePart: group.testPressure,
    };
  });

  setHydroTestMessages(messages);
};

// Replace the handleHydroMessagePartChange function with this updated version
const handleHydroMessagePartChange = (msgIndex, field, newValue) => {
  setHydroTestMessages(prev => {
    const updated = [...prev];
    const msg = { ...updated[msgIndex] };
    
    if (field === 'full') {
      // If editing the full message, update the full text and parse the parts
      msg.full = newValue;
      
      // Try to extract the parts from the full message
      const liMatch = newValue.match(/\(L\/I:\s*([^)]+)\)/);
      const pressureMatch = newValue.match(/AT\s+(.+?)\s+WITHOUT/);
      
      msg.poLiPart = liMatch ? liMatch[1].trim() : msg.poLiPart;
      msg.pressurePart = pressureMatch ? pressureMatch[1].trim() : msg.pressurePart;
    } else if (field === 'poLi') {
      msg.poLiPart = newValue;
      msg.full = `TEST: ABOVE FITTINGS (L/I: ${msg.poLiPart}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${msg.pressurePart} WITHOUT ANY LEAKAGE.`;
    } else if (field === 'pressure') {
      msg.pressurePart = newValue;
      msg.full = `TEST: ABOVE FITTINGS (L/I: ${msg.poLiPart}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${msg.pressurePart} WITHOUT ANY LEAKAGE.`;
    }
    
    updated[msgIndex] = msg;
    return updated;
  });
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
      test_line_items: hydroTestMessages.map(m => m.full),
      items: data.items.map((item) => ({
        po_lineitem_no: item.poLi,
        item_size: item.itemSize,
        raw_material_size: item.rawMtlSize,
        tc_no: item.tcNo,
        traceability_no: item.traceability,
        qty_pcs: item.qty,
        material_grade: item.matlConfTo,
        c: item.C, cr: item.Cr, ni: item.Ni, mo: item.Mo,
        mn: item.Mn, si: item.Si, s: item.S, p: item.P,
        cu: item.Cu, fe: item.Fe, co: item.Co
      })),
    };

    try {
      const response = await fetch('http://103.118.158.188:5000/api/sheet/create-certificate', {
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

const formatChemicalValue = (value) => {
  if (value === undefined || value === null || value === '') return '---';

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '---';

  // Always show 3 decimal places (including 0 values)
  return numValue.toFixed(3);
};

  const displayValue = (value) => {
    if (value === undefined || value === null || value === '') return '—';
    return value;
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

// Function to extract bracket content and format for display
const formatItemSizeWithBracket = (itemSize) => {
  if (!itemSize) return '—';
  
  // Extract content within brackets
  const bracketRegex = /\(([^)]+)\)/g;
  const matches = [];
  let match;
  
  while ((match = bracketRegex.exec(itemSize)) !== null) {
    matches.push(match[1]);
  }
  
  // If bracket content found, format it on a separate line
  if (matches.length > 0) {
    // Remove bracket content from main text and clean up
    let mainText = itemSize.replace(/\s*\([^)]+\)\s*/g, '').trim();
    // If mainText is empty after removing brackets, use the bracket content as main
    if (!mainText && matches.length > 0) {
      return (
        <>
          {matches.join(', ')}
        </>
      );
    }
    return (
      <>
        {mainText}<br />
        <span style={{ fontSize: '9px', color: '#666' }}>({matches.join(', ')})</span>
      </>
    );
  }
  
  return itemSize;
};


  const styles = {
    reportContainer: { width: '1200px', margin: '0 auto', backgroundColor: 'white', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' },
    page: { width: '1200px', minHeight: '780px', border: '2px solid #000', backgroundColor: 'white', boxSizing: 'border-box' },
    table: {  borderCollapse: 'collapse', tableLayout: 'fixed' },
    cell: { border: '1px solid #000', padding: '10px 4px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word', fontFamily: 'Arial, sans-serif' },
    chemicalcell: { border: '1px solid #000', padding: '10px',width: '2px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word', fontFamily: 'Arial, sans-serif' },
    tracecell: { fontSize: '10px', border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word' },
    bold: { fontWeight: 'bold' },
    textLeft: { textAlign: 'left', paddingLeft: '8px' },
    textRight: { textAlign: 'right', paddingRight: '8px' },
    arabic: { fontSize: '18px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
    companyTitle: { fontSize: '18px', fontWeight: 'bold' },
    address: { fontWeight: 'normal', fontSize: '9px', marginTop: '2px', display: 'block' },
    nestedTable: { border: 'none', width: '100%', height: '30px', borderCollapse: 'collapse' },
    nestedCell: { border: 'none', padding: '8px 9px', borderLeft: '1px solid #000', textAlign: 'left' },
    signatureImg: { width: '220px', display: 'block', margin: '12px auto 0 auto' },
    input: { width: '100%', fontSize: '11px', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', background: 'transparent' },
    inlineInput: { background: 'transparent', border: 'none', fontSize: 'inherit', color: 'inherit', padding: '1px 3px', margin: '0 2px', minWidth: '50px', textAlign: 'center', outline: 'none' },
  };

  const items = multiSheetData[0]?.items || [];
  const hData = multiSheetData[0]?.headers || {};

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input type="file" ref={fileInputRef} onChange={(e) => processFile(e.target.files?.[0])} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
            {fileName || "Upload Excel"}
          </button>

          {multiSheetData.length > 0 && (
            <button onClick={handleSubmitCertificate} disabled={submitLoading}
              style={{ padding: '10px 25px', cursor: submitLoading ? 'not-allowed' : 'pointer', background: '#28a745', color: '#fff', borderRadius: '4px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', opacity: submitLoading ? 0.6 : 1 }}>
              <Save size={16} style={{ marginRight: '8px' }} />
              {submitLoading ? 'Saving...' : 'Submit'}
            </button>
          )}

          {(batchLoading || pressureLoading) && (
            <span style={{ color: '#007bff', fontStyle: 'italic' }}>
              {pressureLoading ? 'Fetching Test Pressures...' : 'Loading material data from traceability...'}
            </span>
          )}
        </div>

        <div>
          <span style={{ fontWeight: 'bold' }}>Select Signature:</span>
          <label style={{ marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <input type="radio" name="sig" value={0} checked={selectedSign === 0} onChange={(e) => setSelectedSign(Number(e.target.value))} /> None
          </label>
          <label style={{ marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <input type="radio" name="sig" value={1} checked={selectedSign === 1} onChange={(e) => setSelectedSign(Number(e.target.value))} /> Sign 1
          </label>
          <label style={{ marginLeft: '15px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <input type="radio" name="sig" value={2} checked={selectedSign === 2} onChange={(e) => setSelectedSign(Number(e.target.value))} /> Sign 2
          </label>
        </div>
      </div>

      {/* Certificate Layout */}
      <div style={{ overflowX: 'auto', padding: '12px 0' }} ref={certificateRef}>
        <div style={styles.reportContainer}>
          <div style={styles.page}>
            <table style={styles.table}>
              <tbody>
                {/* Header Section */}
                <tr>
                  <td colSpan="13" style={{ ...styles.cell, ...styles.textLeft, borderBottom: 'none', borderRight: 'none', fontSize: '10px' }}>
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
                  <td colSpan="20" style={{ ...styles.cell, padding: '6px 15px' }}>
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
                  <td colSpan="15" style={{ ...styles.cell, ...styles.bold, fontSize: '14px' }}>
                    MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
                  </td>
                  <td colSpan="5" style={{ padding: 0, border: '1px solid #000' }}>
                    <table style={styles.nestedTable}>
                      <tbody>
                        <tr>
                          <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold', borderLeft: 'none', textAlign: 'right', width: '165px' }}>
                            CERT.NO.:
                          </td>
                          <td style={{ ...styles.nestedCell, borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                            {certNo}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ ...styles.nestedCell, fontWeight: 'bold', borderLeft: 'none', textAlign: 'right' }}>
                            DATE:
                          </td>
                          <td style={{ ...styles.nestedCell, fontWeight: 'bold' }}>
                            {getFormattedDate(todayDate)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td colSpan="4" style={{ ...styles.cell, ...styles.bold, ...styles.textRight }}>CUSTOMER NAME</td>
                  <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, ...styles.bold }}>
                    {displayValue(hData.customerName)}
                  </td>
                  <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Delivery Note No.:</td>
                  <td colSpan="2" style={{ ...styles.cell, ...styles.bold, textAlign: 'left', fontSize: '13px', paddingLeft: '10px' }}>
                    {displayValue(hData.deliveryNoteNo)}
                  </td>
                </tr>

                <tr>
                  <td colSpan="4" style={{ ...styles.cell, ...styles.bold, ...styles.textRight }}>P.O.NO.</td>
                  <td colSpan="5" style={{ ...styles.cell, ...styles.textLeft }}>{displayValue(hData.poNo)}</td>
                  <td colSpan="2" style={{ ...styles.cell, ...styles.bold }}>P.O.Date:</td>
                  <td colSpan="4" style={styles.cell}>{displayValue(hData.poDate)}</td>
                  <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'right' }}>Date:</td>
                  <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft }}>{displayValue(hData.deliveryDate)}</td>
                </tr>

                {/* Items Header */}
                <tr style={styles.bold}>
                  <td rowSpan='2' style={{ ...styles.cell, width: '38px' }}>PO<br />L/I</td>
                  <td colSpan="3" rowSpan="2" style={{ ...styles.cell, width: '200px' }}>ITEM & SIZE</td>
                  <td rowSpan="2" style={{ ...styles.cell, width: '82px' }}>RAW<br />MTL. SIZE</td>
                  <td rowSpan="2" style={{ ...styles.cell, width: '60px' }}>T.C.NO.</td>
                  <td rowSpan="2" style={{ ...styles.tracecell, width: '81px' }}>Traceability<br />no-</td>
                  <td colSpan="11" style={{ ...styles.chemicalcell }}>CHEMICAL COMPOSITION %</td>
                  <td rowSpan='2' style={{ ...styles.cell, width: '38px' }}>QTY<br />PCS</td>
                  <td rowSpan='2' style={{ ...styles.cell, width: '126px' }}>MATL.<br />Conf.To</td>
                </tr>

                <tr style={{ ...styles.bold, fontSize: '10px' }}>
                  {['C','Cr','Ni','Mo','Mn','Si','S','P','Cu','Fe','Co'].map(c => (
                    <td key={c} style={{ ...styles.cell, width: '55px' }}>{c}</td>
                  ))}
                </tr>

                {/* Data Rows */}
                {items.map((item, idx) => (
                  <tr key={idx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <td style={styles.cell}>{item.poLi}</td>
                    <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft,}}>
                      {/* {displayValue(item.itemSize)} */}
                        {formatItemSizeWithBracket(item.itemSize)}

                    </td>
                    <td style={styles.cell}>{displayValue(item.rawMtlSize)}</td>
                    <td style={styles.cell}>
                      <input
                        style={styles.input}
                        value={item.tcNo || ''}
                        onChange={(e) => handleTcNoChange(idx, e.target.value)}
                        placeholder="Enter TC No"
                      />
                    </td>
                    <td style={styles.tracecell}>
                      <div style={{ ...styles.input, backgroundColor: '#f8f9fa', pointerEvents: 'none' }}>
                        {displayValue(item.traceability)}
                      </div>
                    </td>
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
                    <td style={styles.cell}>{displayValue(item.qty)}</td>
                    <td style={{ ...styles.cell, ...styles.textLeft }}>{displayValue(item.matlConfTo)}</td>
                  </tr>
                ))}

                {/* Hydro Test Messages */}
             {/* Hydro Test Messages - Simple version with only full textarea */}
{/* Hydro Test Messages */}
{hydroTestMessages.length > 0 && (
  <tr>
    <td colSpan="20" style={{ 
      ...styles.cell, 
      textAlign: 'left', 
      padding: '20px 16px', 
      whiteSpace: 'pre-line', 
      lineHeight: '1.55',
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
    }}>
      {hydroTestMessages.map((msgObj, i) => (
        <div key={i} style={{ marginBottom: i < hydroTestMessages.length - 1 ? '28px' : '0' }}>
          <input
            style={{
              ...styles.inlineInput,
              width: '100%',
              fontSize: '11px',
              border: 'none',
              background: 'transparent',
              padding: '2px 4px',
              margin: 0,
              textAlign: 'left',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            value={msgObj.full}
            onChange={(e) => handleHydroMessagePartChange(i, 'full', e.target.value)}
          />
        </div>
      ))}
    </td>
  </tr>
)}

                {/* Footer */}
                <tr>
                  <td colSpan="12" style={{ ...styles.cell, textAlign: 'left', padding: '12px 10px', fontSize: '11px' }}>
                    <span style={styles.bold}>
                      WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS <br />
                      FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
                    </span>
                  </td>
                  <td colSpan="8" style={{ ...styles.cell, height: '158px', verticalAlign: 'top', padding: '12px', textAlign: 'center' }}>
                    <div style={styles.bold}>FOR Instrumentation & Controls Co. Ltd</div>
                    {selectedSign === 1 && <img src={sign1} alt="Signature 1" style={styles.signatureImg} crossOrigin="anonymous" />}
                    {selectedSign === 2 && <img src={sign2} alt="Signature 2" style={styles.signatureImg} crossOrigin="anonymous" />}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewSheet;