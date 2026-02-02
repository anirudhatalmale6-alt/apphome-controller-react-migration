import { useState } from 'react';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';

export function CustomerSelector() {
  const { customers, selectedCustomerId, handleSelectCustomer } = useBusinessStarterState();
  const [searchInput, setSearchInput] = useState('');

  const filteredCustomers = customers.filter((customer) =>
    customer.customer_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Select Customer</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.customer_id}
            onClick={() => handleSelectCustomer(customer)}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedCustomerId === customer.customer_id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {customer.customer_logo && (
              <img
                src={customer.customer_logo}
                alt={customer.customer_name}
                className="w-16 h-16 object-contain mx-auto mb-2"
              />
            )}
            <p className="text-center font-medium text-gray-800">
              {customer.customer_name}
            </p>
            <p className="text-center text-sm text-gray-500">
              {customer.bps_list.length} Business Process(es)
            </p>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <p className="text-center text-gray-500 py-8">No customers found</p>
      )}
    </div>
  );
}
