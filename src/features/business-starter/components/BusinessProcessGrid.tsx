/**
 * Business Process Grid Component
 * Displays business processes in grid or table view
 * Origin: BusinessStarterPage.html - bps-tableCard and bps-gridCard sections
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateUserContext } from '../../authentication/store/authSlice';
import { selectBusinessStarter } from '../store/businessStarterSlice';
import { useBusinessStarterState } from '../hooks/useBusinessStarterState';
import type { BusinessProcess } from '../types/BusinessStarterTypes';

interface BusinessProcessGridProps {
  bpsList: BusinessProcess[][];
  isGridView: boolean;
  onToggleView: () => void;
}

export const BusinessProcessGrid: React.FC<BusinessProcessGridProps> = ({
  bpsList,
  isGridView,
  onToggleView,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCustomerId } = useAppSelector(selectBusinessStarter);
  const { handleFilterBusinessProcess, handleGroupBusinessUnit } = useBusinessStarterState();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (value: string) => {
    setSearchInput(value);
    handleFilterBusinessProcess(value);
  };

  const handleSelectBps = (bps: BusinessProcess) => {
    if (bps.bu_list) {
      // Update auth user context with the selected BPS/customer so downstream
      // controllers (Home, Tasks, Apps) pick up the correct IDs for API calls
      dispatch(updateUserContext({
        customer_id: selectedCustomerId || undefined,
        bps_id: bps.bps_id,
        sp_process_id: bps.bps_id,
      }));

      handleGroupBusinessUnit(bps.bu_list as unknown as import('../types/BusinessStarterTypes').Queue[]);
      navigate('/BusinessHomeViews');
    }
  };

  return (
    <div className="business-process-container">
      {/* Header with search and view toggle */}
      <div className="bps-header">
        <div className="bps-header-left">
          <b className="bps-title">Business Process Subscription</b>
          <div className="search-input-container">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search"
              className="bps-searchinputs"
              autoFocus
            />
          </div>
        </div>
        <div className="bps-header-right">
          <button
            className={`grid-list-toggle ${isGridView ? 'active' : ''}`}
            onClick={onToggleView}
          >
            <div className="icon">
              {!isGridView ? (
                <div className="dots">
                  <i /><i /><i /><i />
                </div>
              ) : (
                <div className="lines">
                  <i /><i /><i />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Table View */}
      {!isGridView && (
        <div className={`bps-tableCard ${isGridView ? 'fade-out' : 'fade-in'}`}>
          <table className="bps-table">
            <thead>
              <tr>
                <th>Business Process</th>
                <th>Line of Business</th>
                <th>Start Date</th>
                <th>Renew Date</th>
              </tr>
            </thead>
            {bpsList.length === 0 ? (
              <tbody className="no-data-body">
                <tr>
                  <td colSpan={4} className="no-data-cell">
                    <i className="fa fa-info-circle" aria-hidden="true" />
                    &nbsp;&nbsp;No Data Available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {bpsList.map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {row.map((bps) => (
                      <tr key={bps.bps_id} onClick={() => handleSelectBps(bps)}>
                        <td>
                          <div className="bpslist-icon">
                            {bps.bps_logo && (
                              <img src={bps.bps_logo} alt={`${bps.bps_desc} Icon`} />
                            )}
                            <span>{bps.bps_desc}</span>
                          </div>
                        </td>
                        <td>{bps.lobtype}</td>
                        <td>{bps.contract_start_date}</td>
                        <td>{bps.contract_end_date}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            )}
          </table>
        </div>
      )}

      {/* Grid View */}
      {isGridView && (
        <div className={`bps-gridCard ${!isGridView ? 'fade-out' : 'fade-in'}`}>
          {bpsList.length === 0 ? (
            <div className="no-data-grid">
              <span className="alert alert-primary">
                <i className="fa fa-info-circle" aria-hidden="true" />
                &nbsp;&nbsp;No Data Available
              </span>
            </div>
          ) : (
            <div className="bps-gridView">
              {bpsList.map((row, rowIndex) => (
                <div key={rowIndex} className="bps-grid-row">
                  {row.map((bps) => (
                    <div
                      key={bps.bps_id}
                      className="bps-card"
                      onClick={() => handleSelectBps(bps)}
                    >
                      <div className="bps-icon">
                        {bps.bps_logo && (
                          <img src={bps.bps_logo} alt={`${bps.bps_desc} Icon`} />
                        )}
                      </div>
                      <div className="bps-card-title">{bps.bps_desc}</div>
                      <div className="bps-subtitle">{bps.lobtype}</div>
                      <div className="bps-detail">
                        <strong>Start Date:</strong> {bps.contract_start_date}
                      </div>
                      <div className="bps-detail">
                        <strong>Renew Date:</strong> {bps.contract_end_date}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessProcessGrid;
