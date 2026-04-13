'use client';

import { useEffect, useState } from 'react';
import { Plus, Download, Loader } from 'lucide-react';

interface Table {
  id: string;
  number: number;
  status: 'AVAILABLE' | 'OCCUPIED';
  createdAt: string;
}

export default function TablesView({ restaurantId }: { restaurantId: string }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, [restaurantId]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tables?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setTables(Array.isArray(data) ? data : data.tables || []);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    try {
      setAdding(true);
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          number: (tables.length + 1),
        }),
      });
      if (response.ok) {
        await fetchTables();
      }
    } catch (error) {
      console.error('Failed to add table:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDownloadQR = async (tableId: string, number: number) => {
    try {
      setDownloadingId(tableId);
      const response = await fetch(`/api/qr?tableId=${tableId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `table-${number}-qr.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        status === 'AVAILABLE'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {status === 'AVAILABLE' ? 'Available' : 'Occupied'}
    </span>
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-dark text-opacity-60">Loading tables...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Tables</h2>
          <p className="text-dark text-opacity-60">
            Manage restaurant tables and generate QR codes.
          </p>
        </div>
        <button
          onClick={handleAddTable}
          disabled={adding}
          className="flex items-center gap-2 bg-orange text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {adding ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
          {adding ? 'Adding...' : 'Add Table'}
        </button>
      </div>

      {/* Tables List */}
      {tables.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-dark text-opacity-60 mb-4">No tables yet</p>
          <p className="text-sm text-dark text-opacity-50">
            Click "Add Table" to create your first table.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light border-b border-dark border-opacity-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Table Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-dark">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.id} className="border-b border-dark border-opacity-5 hover:bg-light transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-dark">Table {table.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={table.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-dark text-opacity-60">
                      {new Date(table.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadQR(table.id, table.number)}
                        disabled={downloadingId === table.id}
                        className="flex items-center gap-2 bg-orange text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 ml-auto"
                      >
                        {downloadingId === table.id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        {downloadingId === table.id ? 'Downloading...' : 'QR Code'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
