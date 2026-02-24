import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const ViewSheets = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSheets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/api/sheet/sheets');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch sheets');
        }

        setSheets(data.sheets || []);
      } catch (err) {
        console.error('Fetch sheets error:', err);
        setError(err.message || 'Could not load sheets. Server may be down.');
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-xl text-indigo-600">
          <Loader2 className="animate-spin" size={28} />
          <span>Loading sheets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg w-full text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <p className="mt-4 text-gray-600 text-sm">
            Please check your server connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-8 text-white">
            <h1 className="text-3xl font-bold">All Test Certificate Sheets</h1>
            <p className="mt-3 text-gray-300 text-lg">
              View and manage all created material testing certificates
            </p>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    Sheet Name
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    PO Date
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    Cert No
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {sheets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center text-gray-500 text-lg font-medium">
                      No sheets found yet. Create your first certificate!
                    </td>
                  </tr>
                ) : (
                  sheets.map((sheet) => (
                    <tr
                      key={sheet.id}
                      className="hover:bg-indigo-50/50 transition-colors duration-150"
                    >
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sheet.sheet_name || '-'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">
                        {sheet.customer_name || '-'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">
                        {sheet.po_number || '-'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">
                        {sheet.po_date
                          ? new Date(sheet.po_date).toLocaleDateString('en-GB')
                          : '-'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-indigo-700">
                        {sheet.cert_no || '-'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                        {new Date(sheet.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="px-8 py-5 bg-gray-50 text-sm text-gray-600 border-t flex justify-between items-center">
            <div>
              Total sheets: <span className="font-semibold text-gray-900">{sheets.length}</span>
            </div>
            <div className="text-gray-500">
              Last updated: {new Date().toLocaleTimeString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSheets;