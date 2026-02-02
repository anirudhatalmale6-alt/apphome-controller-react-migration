/**
 * Company Selector Component
 * Left panel for selecting customer/partner
 * Origin: BusinessStarterPage.html - selectedCustomerLists section
 */
import React from 'react';
import type { Customer } from '../types/BusinessStarterTypes';

interface CompanySelectorProps {
  customers: Customer[];
  onSelectPartner: (index: number) => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  customers,
  onSelectPartner,
}) => {
  return (
    <div className="company-selector">
      <div className="company-header">
        <b className="company-title">Company</b>
      </div>
      <div className="selected-customer-lists">
        {customers.map((partner, index) => (
          <div
            key={partner.customer_id}
            className="customer-item"
            onClick={() => onSelectPartner(index)}
          >
            <div className="checkbox-container">
              <input
                type="checkbox"
                checked={partner.isSelected}
                readOnly
                className="customer-checkbox"
              />
            </div>
            <div className="customer-name">
              <span>{partner.customer_name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanySelector;
