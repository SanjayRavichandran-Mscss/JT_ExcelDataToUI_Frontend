import React, { useState, useEffect, useRef } from 'react';
import {
  Loader2, ChevronDown, ChevronUp, Download, Edit, Trash2,
  Search, X, ArrowLeft, Plus, Save, FileText
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import logo from './Assets/logo.png';
import sign1 from './Assets/Signatures/sign1.jpeg';
import sign2 from './Assets/Signatures/sign2.jpeg';

// ─────────────────────────────────────────────
//  Utility: render a DOM element → PDF bytes
// ─────────────────────────────────────────────
const elementToPdfBytes = (element, orientation = 'portrait', singlePage = false) =>
  new Promise((resolve, reject) => {
    const opt = {
      margin: singlePage ? [4, 4, 4, 4] : [8, 8, 8, 8],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: singlePage ? 1.5 : 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        ...(singlePage && { windowHeight: 1122 }),
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation,
      },
      pagebreak: singlePage
        ? { mode: ['css', 'legacy'] }   // ← was {} which also crashes; needs a valid mode
        : { mode: ['css', 'legacy'] },  // ← was undefined which caused your error
    };
    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf('arraybuffer')
      .then(resolve)
      .catch(reject);
  });

// ─────────────────────────────────────────────
//  Utility: fetch a remote PDF → bytes
// ─────────────────────────────────────────────
const fetchPdfBytes = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.arrayBuffer();
};

// ─────────────────────────────────────────────
//  Utility: merge multiple ArrayBuffers of PDFs
//           and stamp page numbers bottom-center
// ─────────────────────────────────────────────
const mergePdfsWithPageNumbers = async (pdfBuffers) => {
  const merged = await PDFDocument.create();
  const font = await merged.embedFont(StandardFonts.Helvetica);

  for (const buffer of pdfBuffers) {
    const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = src.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      // Serialize just this page to check if it's blank
      const singlePageDoc = await PDFDocument.create();
      const [copiedPage] = await singlePageDoc.copyPages(src, [i]);
      singlePageDoc.addPage(copiedPage);
      const singleBytes = await singlePageDoc.save();

      // Blank pages are very small (<2KB). Threshold is generous to be safe.
      if (singleBytes.byteLength < 2000) continue; // skip blank

      const [pageForMerge] = await merged.copyPages(src, [i]);
      merged.addPage(pageForMerge);
    }
  }

  // Stamp page numbers
  const pages = merged.getPages();
  const total = pages.length;
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const label = `${i + 1} / ${total}`;
    const fontSize = 9;
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    page.drawText(label, {
      x: (width - textWidth) / 2,
      y: 14,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return merged.save();
};

// ─────────────────────────────────────────────
//  Utility: trigger browser download
// ─────────────────────────────────────────────
const downloadBytes = (bytes, filename) => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ═══════════════════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════════════════
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
  const [inspectionCertificates, setInspectionCertificates] = useState([]);
  const [loadingInspections, setLoadingInspections] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

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
    test_line_items: [],
  });

  // Refs for hidden off-screen render containers
  const mtrRef = useRef(null);
  const cocRef = useRef(null);

  // Checkbox states – order in PDF is always: Guarantee → Inspection → CoC
  const [includeGuarantee, setIncludeGuarantee] = useState(true);
  const [includeInspections, setIncludeInspections] = useState(false);
  const [includeCoC, setIncludeCoC] = useState(false);

  useEffect(() => { fetchSummary(); }, []);

  useEffect(() => {
    if (!filterText.trim()) { setFilteredSheets(sheets); return; }
    const lf = filterText.toLowerCase().trim();
    setFilteredSheets(sheets.filter(s =>
      (s.cert_no || '').toLowerCase().includes(lf) ||
      (s.customer_name || '').toLowerCase().includes(lf)
    ));
  }, [sheets, filterText]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://136.109.165.80:5000/api/sheet/get-all-certificates');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setSheets(data.certificates || []);
      setFilteredSheets(data.certificates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionCertificates = async (certificateId) => {
    setLoadingInspections(true);
    try {
      const res = await fetch(`http://136.109.165.80:5000/api/sheet/get-inspection-certificates?certificate_id=${certificateId}`);
      const data = await res.json();
      setInspectionCertificates(data.success ? (data.inspection_certificates || []) : []);
    } catch (err) {
      console.error('Failed to fetch inspection certificates:', err);
      setInspectionCertificates([]);
    } finally {
      setLoadingInspections(false);
    }
  };

  const toggleAccordion = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setInspectionCertificates([]);
      return;
    }
    setExpandedId(id);
    if (!sheetDetails[id]) {
      try {
        const res = await fetch(`http://136.109.165.80:5000/api/sheet/get-certificate/${id}`);
        const result = await res.json();
        if (result.success) setSheetDetails(prev => ({ ...prev, [id]: result.data }));
      } catch (err) {
        console.error('Failed to load details:', err);
      }
    }
    await fetchInspectionCertificates(id);
  };

  // ─────────────────────────────────────────────
  //  MAIN DOWNLOAD HANDLER
  //  Order: Guarantee → Inspection(s) → CoC
  // ─────────────────────────────────────────────
  const handleDownloadPDF = async (certNo) => {
    if (!includeGuarantee && !includeInspections && !includeCoC) {
      alert('Please select at least one certificate type to download.');
      return;
    }
    if (includeInspections && inspectionCertificates.length === 0) {
      alert('No inspection certificates found for this entry.');
      return;
    }

    setPdfGenerating(true);
    try {
      const buffers = [];

      // 1) Guarantee Certificate (landscape HTML → PDF)
      if (includeGuarantee && mtrRef.current) {
        const bytes = await elementToPdfBytes(mtrRef.current, 'landscape');
        buffers.push(bytes);
      }

      // 2) Inspection Certificate PDFs (already .pdf files – just fetch)
      if (includeInspections && inspectionCertificates.length > 0) {
        for (const cert of inspectionCertificates) {
          if (!cert.inspection_certificate_url) continue;
          try {
            const bytes = await fetchPdfBytes(cert.inspection_certificate_url);
            buffers.push(bytes);
          } catch (err) {
            console.error(`Could not fetch inspection PDF for TC ${cert.tc_no}:`, err);
            alert(`Warning: Could not load inspection certificate for TC No. ${cert.tc_no}. It will be skipped.`);
          }
        }
      }

   // 3) Certificate of Compliance — force single page
if (includeCoC && cocRef.current) {
  const bytes = await elementToPdfBytes(cocRef.current, 'portrait', true);
  buffers.push(bytes);
}

      if (buffers.length === 0) {
        alert('No content to generate PDF from.');
        return;
      }

      // Merge all PDFs and add page numbers
      const mergedBytes = await mergePdfsWithPageNumbers(buffers);
      const filename = `Certificate_${(certNo || 'unknown').replace(/\//g, '-')}.pdf`;
      downloadBytes(mergedBytes, filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleDelete = async (id, certNo) => {
    if (!window.confirm(`Delete certificate ${certNo}?`)) return;
    try {
      const res = await fetch(`http://136.109.165.80:5000/api/sheet/delete-certificate/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setSheets(prev => prev.filter(s => s.id !== id));
        if (expandedId === id) setExpandedId(null);
        alert('Deleted successfully');
      }
    } catch {
      alert('Network error during delete');
    }
  };

  const formatDateForEdit = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return `${date.getDate().toString().padStart(2, '0')}-${date.toLocaleString('en-US', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`;
  };

  const openEditModal = async (id) => {
    let data = sheetDetails[id];
    if (!data) {
      try {
        const res = await fetch(`http://136.109.165.80:5000/api/sheet/get-certificate/${id}`);
        const json = await res.json();
        if (json.success) data = json.data;
        else return alert('Could not load data');
      } catch { return alert('Failed to load certificate for editing'); }
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
      items: data.items ? data.items.map(i => ({ ...i })) : [],
      test_line_items: Array.isArray(data.test_line_items)
        ? [...data.test_line_items]
        : (typeof data.test_line_items === 'string' ? [data.test_line_items] : []),
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

  const handleTestLineChange = (index, field, value) => {
    setEditForm(prev => {
      const newLines = [...prev.test_line_items];
      if (field === 'full') {
        newLines[index] = value;
      } else if (field === 'li') {
        const cur = newLines[index] || '';
        const pm = cur.match(/AT\s+([^ ]+)\s+WITHOUT/);
        const pressure = pm ? pm[1].trim() : '';
        newLines[index] = `TEST: ABOVE FITTINGS (L/I: ${value}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${pressure} WITHOUT ANY LEAKAGE.`;
      } else if (field === 'pressure') {
        const cur = newLines[index] || '';
        const lm = cur.match(/\(L\/I:\s*([^)]*)\)/);
        const li = lm ? lm[1].trim() : '';
        newLines[index] = `TEST: ABOVE FITTINGS (L/I: ${li}) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT ${value} WITHOUT ANY LEAKAGE.`;
      }
      return { ...prev, test_line_items: newLines };
    });
  };

  const addNewTestLine = () =>
    setEditForm(prev => ({
      ...prev,
      test_line_items: [...prev.test_line_items,
        'TEST: ABOVE FITTINGS (L/I: ) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT PSI WITHOUT ANY LEAKAGE.']
    }));

  const removeTestLine = (index) => {
    if (window.confirm('Remove this test message?'))
      setEditForm(prev => ({ ...prev, test_line_items: prev.test_line_items.filter((_, i) => i !== index) }));
  };

  const addNewItemRow = () =>
    setEditForm(prev => ({
      ...prev,
      items: [...prev.items, {
        po_lineitem_no: '', item_size: '', raw_material_size: '', tc_no: '',
        traceability_no: '', qty_pcs: '', material_grade: '',
        c: '', cr: '', ni: '', mo: '', mn: '', si: '', s: '', p: '', cu: '', fe: '', co: ''
      }]
    }));

  const removeItemRow = (index) => {
    if (window.confirm('Remove this item row?'))
      setEditForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const saveUpdatedCertificate = async () => {
    if (!editingCertificate?.id) return;
    try {
      const res = await fetch(`http://136.109.165.80:5000/api/sheet/update-certificate/${editingCertificate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const result = await res.json();
      if (result.success) {
        alert('Certificate updated successfully');
        setEditModalOpen(false);
        fetchSummary();
        const freshRes = await fetch(`http://136.109.165.80:5000/api/sheet/get-certificate/${editingCertificate.id}`);
        const fresh = await freshRes.json();
        if (fresh.success) setSheetDetails(prev => ({ ...prev, [editingCertificate.id]: fresh.data }));
      } else {
        alert('Update failed: ' + (result.error || 'Unknown error'));
      }
    } catch { alert('Network error while saving'); }
  };

  const clearFilter = () => setFilterText('');

  const formatChemicalValue = (value) => {
    if (value === undefined || value === null || value === '' || value === '---') return '---';
    const n = parseFloat(value);
    if (isNaN(n)) return '---';
    if (Math.abs(n) < 0.0001) return '-';
    return n.toFixed(3);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" size={48} />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Material Test Certificates</h1>

        {/* Filter */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="relative max-w-xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text" value={filterText} onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Search by Certificate No. or Customer Name..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {filterText && (
                  <button onClick={clearFilter} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
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
              {filterText ? 'No certificates match your search' : 'No certificates found'}
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

                {expandedId === sheet.id && sheetDetails[sheet.id] && (
                  <div className="p-6 border-t bg-gray-50">
                    {/* ── Action bar ── */}
                    <div className="flex flex-wrap justify-end gap-4 mb-6 items-center">
                      <button
                        onClick={() => openEditModal(sheet.id)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit size={18} /> Edit
                      </button>

                      {/* Checkboxes – order reflects PDF order */}
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={includeGuarantee}
                          onChange={(e) => setIncludeGuarantee(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600" />
                        Guarantee Certificate
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={includeInspections}
                          onChange={(e) => setIncludeInspections(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600" />
                        <FileText size={16} />
                        Inspection Certificate ({inspectionCertificates.length})
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={includeCoC}
                          onChange={(e) => setIncludeCoC(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600" />
                        Certificate of Compliance
                      </label>

                      <button
                        onClick={() => handleDownloadPDF(sheet.cert_no)}
                        disabled={pdfGenerating}
                        className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-60"
                      >
                        {pdfGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        {pdfGenerating ? 'Generating…' : 'Download PDF'}
                      </button>

                      <button
                        onClick={() => handleDelete(sheet.id, sheet.cert_no)}
                        className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={18} /> Delete
                      </button>
                    </div>

                    {loadingInspections && (
                      <div className="text-center py-4 text-gray-500">
                        <Loader2 className="animate-spin inline-block mr-2" size={16} />
                        Loading inspection certificates…
                      </div>
                    )}

                    {!loadingInspections && inspectionCertificates.length > 0 && includeInspections && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        <FileText size={16} className="inline mr-2" />
                        {inspectionCertificates.length} inspection certificate(s) will be appended to the PDF
                      </div>
                    )}

                    {/* ── Guarantee Certificate (always rendered, hidden from view if unchecked) ── */}
                    {/* We always render it so the ref is valid when user clicks Download */}
                    <div ref={mtrRef} style={{ display: includeGuarantee ? 'block' : 'none' }}>
                      <CertificateLayout
                        data={sheetDetails[sheet.id]}
                        formatChemicalValue={formatChemicalValue}
                      />
                    </div>

                    {/* ── Certificate of Compliance ── */}
                    <div ref={cocRef} style={{ display: includeCoC ? 'block' : 'none', marginTop: '20px' }}>
                      <CoC data={sheetDetails[sheet.id]} />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ═══════════════════ EDIT MODAL ═══════════════════ */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
          <div className="border-b px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
            <button onClick={() => setEditModalOpen(false)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-lg font-medium">
              <ArrowLeft size={24} /> Back
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Edit Certificate{editForm.cert_no ? ` – ${editForm.cert_no}` : ''}
            </h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-14 pb-20">

              {/* Header Fields */}
              <section>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Certificate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Certificate No', name: 'cert_no' },
                    { label: 'Certificate Date', name: 'cert_date', placeholder: '06-Jul-25' },
                    { label: 'Customer Name', name: 'customer_name' },
                    { label: 'P.O. Number', name: 'po_no' },
                    { label: 'P.O. Date', name: 'po_date', placeholder: '06-Jul-25' },
                    { label: 'Delivery Note No', name: 'delivery_note_no' },
                    { label: 'Delivery Date', name: 'delivery_date', placeholder: '06-Jul-25' },
                  ].map(field => (
                    <div key={field.name} className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                      <input type="text" name={field.name} value={editForm[field.name] || ''}
                        onChange={handleEditHeaderChange} placeholder={field.placeholder || ''}
                        className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Signature */}
              <section>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Signature</h3>
                <div className="flex flex-wrap gap-8">
                  {[
                    { value: 0, label: 'None', img: null },
                    { value: 1, label: 'Sign 1', img: sign1 },
                    { value: 2, label: 'Sign 2', img: sign2 },
                  ].map(opt => (
                    <label key={opt.value} className="flex flex-col items-center cursor-pointer">
                      <input type="radio" name="signature" value={opt.value}
                        checked={editForm.signature === opt.value}
                        onChange={() => setEditForm(prev => ({ ...prev, signature: opt.value }))}
                        className="mb-2" />
                      {opt.img
                        ? <img src={opt.img} alt={opt.label} className="w-32 h-auto border border-gray-300 rounded shadow-sm" />
                        : null}
                      <div className="mt-2 text-gray-700 font-medium">{opt.label}</div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Hydro Test Messages */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Hydro Test Messages</h3>
                  <button onClick={addNewTestLine}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors">
                    <Plus size={20} /> Add New Line
                  </button>
                </div>
                {editForm.test_line_items.length === 0 ? (
                  <p className="text-gray-500 italic">No test messages yet. Click "Add New Line" to create one.</p>
                ) : (
                  <div className="space-y-8">
                    {editForm.test_line_items.map((msg, index) => {
                      const liMatch = msg.match(/\(L\/I:\s*([^)]*)\)/);
                      const pressureMatch = msg.match(/AT\s+([^ ]+)\s+WITHOUT/);
                      const liValue = liMatch ? liMatch[1].trim() : '';
                      const pressureValue = pressureMatch ? pressureMatch[1].trim() : '';
                      return (
                        <div key={index} className="border border-gray-300 rounded-xl p-6 bg-white relative">
                          <button onClick={() => removeTestLine(index)}
                            className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors">
                            <Trash2 size={22} />
                          </button>
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Message (Editable)</label>
                            <input type="text" value={msg}
                              onChange={(e) => handleTestLineChange(index, 'full', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                              placeholder="TEST: ABOVE FITTINGS (L/I: ) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT PSI WITHOUT ANY LEAKAGE." />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">L/I (PO Line Items)</label>
                              <input type="text" value={liValue}
                                onChange={(e) => handleTestLineChange(index, 'li', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="1 & 3 & 4 or 1 to 5" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Test Pressure</label>
                              <input type="text" value={pressureValue}
                                onChange={(e) => handleTestLineChange(index, 'pressure', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="4500 PSI" />
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                            Preview: <strong>{msg}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Items Section */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Items / Line Items</h3>
                  <button onClick={addNewItemRow}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors">
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
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative shadow-sm">
                        <button onClick={() => removeItemRow(idx)}
                          className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors">
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
                              <input value={item[f.field] || ''} onChange={e => handleItemChange(idx, f.field, e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                          ))}
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gray-100 px-5 py-3 font-medium text-gray-800 border-b">Chemical Composition (%)</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-200">
                            {[
                              { label: 'C', field: 'c' }, { label: 'Cr', field: 'cr' },
                              { label: 'Ni', field: 'ni' }, { label: 'Mo', field: 'mo' },
                              { label: 'Mn', field: 'mn' }, { label: 'Si', field: 'si' },
                              { label: 'S', field: 's' }, { label: 'P', field: 'p' },
                              { label: 'Cu', field: 'cu' }, { label: 'Fe', field: 'fe' },
                              { label: 'Co', field: 'co' },
                            ].map(({ label, field }) => (
                              <div key={field} className="flex flex-col p-4">
                                <span className="text-sm font-medium text-gray-700 mb-2">{label}</span>
                                <input value={item[field] || ''} onChange={e => handleItemChange(idx, field, e.target.value)}
                                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-center" placeholder="—" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Save / Cancel */}
              <div className="flex justify-end gap-4 pt-8 border-t sticky bottom-0 bg-white py-4 -mx-6 md:-mx-10 px-6 md:px-10">
                <button onClick={() => setEditModalOpen(false)}
                  className="px-10 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={saveUpdatedCertificate}
                  className="flex items-center gap-2 px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow font-medium transition-colors">
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

// ═══════════════════════════════════════════════════════════════════
//  CertificateLayout  (Guarantee Certificate / MTR)
// ═══════════════════════════════════════════════════════════════════
const CertificateLayout = React.forwardRef(({ data, formatChemicalValue }, ref) => {
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  const displayValue = (v) => (v === undefined || v === null || v === '') ? '—' : v;

  const formatItemSizeWithBracket = (itemSize) => {
    if (!itemSize || itemSize === '—') return '—';
    const trimmed = itemSize.trim();
    const bracketMatch = trimmed.match(/\(([^)]+)\)/);
    const bracketContent = bracketMatch ? bracketMatch[1].trim() : '';
    const mainText = trimmed.replace(/\s*\([^)]+\)\s*/g, '').trim();
    if (bracketContent) {
      return (
        <div style={{ textAlign: 'center', lineHeight: '1.25' }}>
          {mainText}<br />
          <span style={{ fontSize: '9.5px' }}>({bracketContent})</span>
        </div>
      );
    }
    return <div style={{ textAlign: 'center' }}>{trimmed}</div>;
  };

  const formatRawMaterialSize = (value) => {
    if (!value || value === '—' || value.trim() === '') return '—';
    const trimmed = value.trim();
    const match = trimmed.match(/^([A-Za-z\s]+?)\s+(.+)$/);
    if (match) {
      return (
        <div style={{ textAlign: 'center', lineHeight: '1.25' }}>
          {match[1].trim()}<br />
          <span style={{ fontSize: '8.3px', color: '#333', fontWeight: 'normal' }}>{match[2].trim()}</span>
        </div>
      );
    }
    return <div style={{ textAlign: 'center' }}>{trimmed}</div>;
  };

  const formatMaterialGrade = (value) => {
    if (!value || value === '—') return '—';
    const trimmed = value.trim();
    if (trimmed.includes('+')) {
      const parts = trimmed.split('+').map(p => p.trim());
      return (
        <div style={{ textAlign: 'center', lineHeight: '1.25' }}>
          {parts[0]}<br />
          <span style={{ fontSize: '9.5px' }}>+ {parts.slice(1).join(' + ')}</span>
        </div>
      );
    }
    return <div style={{ textAlign: 'center' }}>{trimmed}</div>;
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
        result.push({ ...item, displayPo: `${po}.${counter}` });
      } else {
        currentPo = po;
        counter = 0;
        result.push({ ...item, displayPo: po });
      }
    });
    return result;
  }, [data?.items]);

  const styles = {
    reportContainer: { width: '1050px', margin: '0 auto', backgroundColor: 'white', fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#000' },
    page: { width: '100%', backgroundColor: 'white', boxSizing: 'border-box', pageBreakAfter: 'always', pageBreakInside: 'avoid' },
    lastPage: { width: '100%', backgroundColor: 'white', boxSizing: 'border-box', pageBreakAfter: 'auto' },
    table: { borderCollapse: 'collapse', tableLayout: 'fixed', border: '1px solid #333' },
    cell: { border: '1px solid #333', padding: '7px 4px', textAlign: 'center', verticalAlign: 'middle', wordWrap: 'break-word', fontSize: '9.5px', lineHeight: '1.35' },
    chemicalCell: { border: '1px solid #333', padding: '7px 2px', textAlign: 'center', fontSize: '8.5px', width: '3.2%', lineHeight: '1.35' },
    bold: { fontWeight: 'bold' },
    textLeft: { textAlign: 'left', paddingLeft: '8px' },
    textRight: { textAlign: 'right', paddingRight: '8px' },
    arabic: { fontSize: '16px', fontWeight: 'bold', direction: 'rtl', margin: '0 5px' },
    companyTitle: { fontSize: '17px', fontWeight: 'bold' },
    address: { fontWeight: 'normal', fontSize: '9px', marginTop: '4px', display: 'block' },
    nestedTable: { border: 'none', width: '100%', borderCollapse: 'collapse' },
    nestedCell: { border: 'none', padding: '9px 8px', borderLeft: '0.75px solid #444', textAlign: 'left', lineHeight: '1.3' },
    signatureImg: { width: '200px', display: 'block', margin: '8px auto 0 auto' },
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
        testMessages = Array.isArray(parsed) ? parsed : [data.test_line_items];
      } catch { testMessages = [data.test_line_items]; }
    }
  }

  const HeaderSection = () => (
    <>
      <tr>
        <td colSpan="13" style={{ ...styles.cell, ...styles.textLeft, borderBottom: '1px solid black', borderRight: 'none', fontSize: '9px', minHeight: '28px' }}>
          Format No. : ICCL/QC/R/14, Rev 01, Date: 01/04/2024
        </td>
        <td colSpan="6" style={{ ...styles.cell, ...styles.textRight, borderBottom: '1px solid black', borderLeft: 'none', fontSize: '9px', minHeight: '28px' }}>
          C.R. 2055012479
        </td>
        <td rowSpan="2" style={{ ...styles.cell, width: '85px', padding: '6px', minHeight: '56px' }}>
          <img src={logo} alt="ICCL" style={{ width: '70px', display: 'block', margin: '0 auto' }} crossOrigin="anonymous" />
        </td>
      </tr>
      <tr>
        <td colSpan="19" style={{ ...styles.cell, padding: '12px 8px', minHeight: '70px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={styles.companyTitle}>Instrumentation & Controls Co. Ltd. (ICCL).</span>
            <span style={styles.arabic}>شركة الآلات الدقيقة والتحكم المحدودة</span>
            <div style={styles.address}>
              Lot #56, Block #02, Section G, Support Industries, Jubail 2, P.O. Box No. 11300, Jubail – 31961 KSA<br />
              Email: info@icclksa.com , Web: www.icclksa.com
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td colSpan="15" style={{ ...styles.cell, ...styles.bold, fontSize: '13px', padding: '12px 4px', minHeight: '52px' }}>
          MATERIAL TESTING REPORT AND GUARANTEE CERTIFICATE
        </td>
        <td colSpan="5" style={{ padding: 0, border: '1px solid black' }}>
          <table style={styles.nestedTable}>
            <tbody>
              <tr>
                <td style={{ ...styles.nestedCell, borderLeft: 'none', borderBottom: '1px solid black', fontWeight: 'bold', width: '113.5px', ...styles.textRight, minHeight: '38px' }}>CERT.NO.:</td>
                <td style={{ ...styles.nestedCell, borderBottom: '1px solid black', minHeight: '38px', verticalAlign: 'middle' }}>{data.cert_no || '—'}</td>
              </tr>
              <tr>
                <td style={{ ...styles.nestedCell, borderLeft: 'none', fontWeight: 'bold', ...styles.textRight, minHeight: '38px' }}>DATE:</td>
                <td style={{ ...styles.nestedCell, minHeight: '38px', verticalAlign: 'middle' }}>{getFormattedDate(data.cert_date)}</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td colSpan="4" style={{ ...styles.cell, ...styles.bold, ...styles.textRight, padding: '9px 8px 10px 2px' }}>CUSTOMER NAME</td>
        <td colSpan="11" style={{ ...styles.cell, ...styles.textLeft, ...styles.bold, padding: '9px 2px 10px 8px' }}>{displayValue(data.customer_name)}</td>
        <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textRight, width: '171px', padding: '9px 8px 10px 2px' }}>Delivery Note No.:</td>
        <td colSpan="2" style={{ ...styles.cell, ...styles.bold, ...styles.textLeft, padding: '9px 2px 10px 8px' }}>{displayValue(data.delivery_note_no)}</td>
      </tr>
      <tr>
        <td colSpan="4" style={{ ...styles.cell, ...styles.bold, ...styles.textRight, padding: '9px 8px 10px 2px' }}>P.O.NO.</td>
        <td colSpan="5" style={{ ...styles.cell, ...styles.textLeft, padding: '9px 2px 10px 8px' }}>{displayValue(data.po_no)}</td>
        <td colSpan="2" style={{ ...styles.cell, ...styles.bold, padding: '9px 2px 10px 2px' }}>P.O.Date:</td>
        <td colSpan="4" style={{ ...styles.cell, padding: '9px 2px 10px 2px' }}>{displayValue(data.po_date)}</td>
        <td colSpan="3" style={{ ...styles.cell, ...styles.bold, ...styles.textRight, padding: '9px 8px 10px 2px' }}>Date:</td>
        <td colSpan="2" style={{ ...styles.cell, ...styles.textLeft, padding: '9px 2px 10px 8px' }}>{displayValue(data.delivery_date)}</td>
      </tr>
      <tr style={styles.bold}>
        <td rowSpan="2" style={{ ...styles.cell, width: '3.5%', padding: '8px 2px 4px 2px' }}>PO<br />L/I</td>
        <td colSpan="3" rowSpan="2" style={{ ...styles.cell, width: '16%', padding: '8px 2px 4px 2px' }}>ITEM & SIZE</td>
        <td rowSpan="2" style={{ ...styles.cell, width: '7%', padding: '8px 2px 4px 2px' }}>RAW<br />MTL. SIZE</td>
        <td rowSpan="2" style={{ ...styles.cell, width: '6%', padding: '8px 2px 4px 2px' }}>T.C.NO.</td>
        <td rowSpan="2" style={{ ...styles.cell, width: '7%', padding: '8px 2px 4px 2px' }}>Traceability<br />no-</td>
        <td colSpan="11" style={{ ...styles.cell, padding: '8px 2px 10px 2px' }}>CHEMICAL COMPOSITION %</td>
        <td rowSpan="2" style={{ ...styles.cell, width: '4%', padding: '8px 2px 4px 2px' }}>QTY<br />PCS</td>
        <td rowSpan="2" style={{ ...styles.cell, width: '10%', padding: '8px 2px 4px 2px' }}>MATL.<br />Conf.To</td>
      </tr>
      <tr style={styles.bold}>
        {['C', 'Cr', 'Ni', 'Mo', 'Mn', 'Si', 'S', 'P', 'Cu', 'Fe', 'Co'].map(c => (
          <td key={c} style={{ ...styles.chemicalCell, padding: '7px 1px 7px 1px' }}>{c}</td>
        ))}
      </tr>
    </>
  );

 const FooterSection = () => (
  <>
    {testMessages.length > 0 && (
      <tr style={{ pageBreakInside: 'avoid' }}>
        <td colSpan="20" style={{ ...styles.cell, textAlign: 'left', padding: '12px 8px 8px 8px', verticalAlign: 'top', lineHeight: '1.5', minHeight: '70px' }}>
          {testMessages.map((msg, i) => <div key={i} style={{ marginBottom: '8px' }}>{msg}</div>)}
        </td>
      </tr>
    )}
    <tr style={{ pageBreakInside: 'avoid', pageBreakBefore: 'avoid' }}>
      <td colSpan="12" style={{ ...styles.cell, textAlign: 'left', padding: '12px 8px 8px 8px', verticalAlign: 'top', lineHeight: '1.45', height: '140px', borderTop: '0.75px solid #444' }}>
        <span style={{ ...styles.bold, fontSize: '9px' }}>
          WE GUARANTEE ABOVE MATERIAL AGAINST ANY MANUFACTURING DEFECT FOR 12 MONTHS <br />
          FROM DATE OF SUPPLY OR 6 MONTHS FROM DATE OF INSTALLATION WHICHEVER IS EARLIER
        </span>
      </td>
      <td colSpan="8" style={{ ...styles.cell, height: '140px', verticalAlign: 'top', padding: '30px 25px 20px 25px', borderTop: 'none', borderLeft: '0.75px solid #444', textAlign: 'right' }}>
        <div style={{ ...styles.bold, paddingBottom: '12px', textAlign: 'right' }}>FOR Instrumentation & Controls Co. Ltd</div>
        {signatureImage && (
          <img src={signatureImage} alt="Signature" style={{ ...styles.signatureImg, width: '200px', margin: '0 0 0 auto' }} crossOrigin="anonymous" />
        )}
      </td>
    </tr>
  </>
);

  const ROWS_PER_PAGE = 4;
  const pages = [];
  for (let i = 0; i < processedItems.length; i += ROWS_PER_PAGE) {
    pages.push(processedItems.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <div style={{ overflowX: 'auto', padding: '10px' }} ref={ref}>
      <div style={styles.reportContainer}>
        {pages.map((pageItems, pageIndex) => {
          const isLastPage = pageIndex === pages.length - 1;
          return (
            <div key={pageIndex} style={isLastPage ? styles.lastPage : styles.page} className="pdf-page">
              <table style={styles.table}>
                <tbody>
                  <HeaderSection />
                  {pageItems.length > 0 ? (
                    pageItems.map((item, idx) => (
                      <tr key={`${pageIndex}-${idx}`}>
                        <td style={styles.cell}>{item.displayPo}</td>
                        <td colSpan="3" style={{ ...styles.cell, ...styles.bold, textAlign: 'center', verticalAlign: 'middle', padding: '8px 4px', lineHeight: '1.25' }}>
                          {formatItemSizeWithBracket(item.item_size)}
                        </td>
                        <td style={{ ...styles.cell, textAlign: 'center', verticalAlign: 'middle', lineHeight: '1.25' }}>
                          {formatRawMaterialSize(item.raw_material_size)}
                        </td>
                        <td style={styles.cell}>{displayValue(item.tc_no)}</td>
                        <td style={styles.cell}>{displayValue(item.traceability_no)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.c)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.cr)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.ni)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.mo)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.mn)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.si)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.s)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.p)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.cu)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.fe)}</td>
                        <td style={styles.chemicalCell}>{formatChemicalValue(item.co)}</td>
                        <td style={styles.cell}>{displayValue(item.qty_pcs)}</td>
                        <td style={{ ...styles.cell, textAlign: 'center', verticalAlign: 'middle', padding: '8px 4px', lineHeight: '1.25' }}>
                          {formatMaterialGrade(item.material_grade)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="20" style={styles.cell}>No items to display</td></tr>
                  )}
                  {isLastPage && <FooterSection />}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
//  Certificate of Compliance (CoC)
// ═══════════════════════════════════════════════════════════════════
const CoC = React.forwardRef(({ data }, ref) => {
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const certificateData = data || {};
  let signatureImage = null;
  if (certificateData.signature === 1) signatureImage = sign1;
  if (certificateData.signature === 2) signatureImage = sign2;

  const styles = {
container: {
  display: 'flex',
  justifyContent: 'center',
  padding: '10px',           // reduced from 20px
  backgroundColor: '#fff',
  fontFamily: 'Arial, sans-serif',
},page: {
  width: '190mm',           // slightly narrower to avoid overflow
  backgroundColor: '#fff',
  padding: '12px 30px 30px 30px',  // reduced padding
  border: '1px solid #444',
  boxSizing: 'border-box',
  // NO minHeight here — let content define the height
},    title: { textAlign: 'center', fontSize: '22px', fontWeight: '700', textDecoration: 'underline', fontFamily: 'Times New Roman', marginTop: '65px', marginBottom: '28px', color: '#000' },
    date: { textAlign: 'right', fontSize: '13.5px', fontWeight: '700', marginBottom: '25px', color: '#000' },
    content: { fontSize: '13.5px', lineHeight: '1.9', color: '#000' },
    row: { marginBottom: '11px', fontSize: '13.5px' },
    certBody: { marginTop: '40px', marginBottom: '45px', textAlign: 'justify', lineHeight: '2.05', fontSize: '13.5px', textIndent: '35px' },
    thanks: { marginTop: '35px', lineHeight: '1.8', fontSize: '13.5px' },
    signatureSection: { marginTop: '55px' },
    signatureImg: { width: '230px', height: 'auto' },
  };

  return (
    <div ref={ref} style={styles.container}>
      <div style={styles.page}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div style={{ width: '38%', textAlign: 'left', paddingTop: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.1, marginBottom: '8px', fontFamily: 'Times New Roman', whiteSpace: 'nowrap' }}>
                INSTRUMENTATION & CONTROLS CO. LTD.
              </div>
              <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', fontFamily: 'Times New Roman' }}>C.R. 2055012479</div>
              <div style={{ fontSize: '10px', fontWeight: '600', fontFamily: 'Times New Roman' }}>VAT No. 300399662200003</div>
            </div>
            <div style={{ width: '18%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={logo} alt="ICCL Logo" style={{ width: '72px', height: 'auto', objectFit: 'contain' }} />
            </div>
            <div style={{ width: '38%', textAlign: 'right', direction: 'rtl', paddingTop: '2px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.2, marginBottom: '7px', fontFamily: 'Arial', whiteSpace: 'nowrap' }}>
                شركة الآلات الدقيقة والتحكم المحدودة
              </div>
              <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '3px', fontFamily: 'Arial' }}>الرقم التجاري: ٢٠٥٥٠١٢٤٧٩</div>
              <div style={{ fontSize: '10px', fontWeight: '600', fontFamily: 'Arial' }}>الرقم الضريبي: ٣٠٠٣٩٩٦٦٢٢٠٠٠٠٣</div>
            </div>
          </div>
          <div style={{ marginTop: '8px', textAlign: 'center', lineHeight: 1.3 }}>
            <div style={{ fontSize: '10px', fontWeight: '700', fontFamily: 'Times New Roman' }}>
              Lot# 56, Block# 02, Section G, Support Industries, Jubail 2 - P.O. Box 11300, Jubail 31961. K.S.A.
            </div>
            <div style={{ fontSize: '10px', fontWeight: '600', marginTop: '2px', direction: 'rtl', fontFamily: 'Arial' }}>
              قطعة رقم ٥٦، مخطط رقم ٠٢، قسم (ج)، الصناعات المساندة الجبيل ٢، ص.ب رقم ١١٣٠٠ الجبيل ٣١٩٦١، المملكة العربية السعودية
            </div>
            <div style={{ fontSize: '10px', fontWeight: '600', marginTop: '3px', fontFamily: 'Times New Roman' }}>
              Tel.: +966 (013) 361 7166 Email: info@icclksa.com, Web.: www.icclksa.com
            </div>
          </div>
        </div>

        <div style={styles.title}>CERTIFICATE OF COMPLIANCE</div>
        <div style={styles.date}>DATE: {getFormattedDate(certificateData.cert_date)}</div>

        <div style={styles.content}>
          <div style={styles.row}><strong>Customer:</strong> {certificateData.customer_name || '—'}</div>
          <div style={styles.row}><strong>Ref. No.:</strong> P.O.NO: {certificateData.po_no || '—'}</div>
          <div style={styles.row}><strong>P.O. Date:</strong> {getFormattedDate(certificateData.po_date)}</div>
          <div style={styles.certBody}>
            This is to certify that the line items mentioned in the P.O NO.{' '}
            <strong>{certificateData.po_no || '—'}</strong> are found to be in compliance
            with the Purchase order requirements, applicable project specifications &amp;
            compliance with <strong>NACE MR0175</strong>. These items are being released
            as per our delivery note no. <strong>{certificateData.delivery_note_no || '—'}</strong>.
          </div>
          <div style={styles.thanks}>
            <div>Thanks & regards,</div>
            <div>For Instrumentation & Controls Co. Ltd.</div>
          </div>
        </div>

        <div style={styles.signatureSection}>
          {signatureImage && (
            <img src={signatureImage} alt="Authorized Signature" style={styles.signatureImg} crossOrigin="anonymous" />
          )}
        </div>
      </div>
    </div>
  );
});

export default ViewSheets;