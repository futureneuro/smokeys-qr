'use client';

import { useEffect, useState } from 'react';
import { Download, Search, Loader } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
}

export default function CustomersView({ restaurantId }: { restaurantId: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [restaurantId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : data.customers || []);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await fetch(`/api/customers?restaurantId=${restaurantId}&export=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export customers:', error);
    } finally {
      setExporting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-dark text-opacity-60">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Customers</h2>
          <p className="text-dark text-opacity-60">
            Customer contacts collected through your QR system.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 bg-orange text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader size={20} className="animate-spin" /> : <Download size={20} />}
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3 text-dark text-opacity-40" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-dark border-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
        />
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-dark text-opacity-60 mb-2">
            {searchTerm ? 'No customers match your search' : 'No customers yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light border-b border-dark border-opacity-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-dark border-opacity-5 hover:bg-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-dark">{customer.name}</span>
                    </td>
                    <td className="px-6 py-4 text-dark text-opacity-70">
                      <a
                        href={`mailto:${customer.email}`}
                        className="hover:text-orange transition-colors"
                      >
                        {customer.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-dark text-opacity-70">
                      <a
                        href={`tel:${customer.phone}`}
                        className="hover:text-orange transition-colors"
                      >
                        {customer.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark text-opacity-60">
                      {new Date(customer.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 text-sm text-dark text-opacity-60">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  );
}
