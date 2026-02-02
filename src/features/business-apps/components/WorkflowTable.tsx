/**
 * Workflow Table Component
 * Reusable table for displaying workflows
 * Origin: Various workflow tables in Apps views
 */
import React from 'react';
import type { Workflow } from '../types/BusinessAppsTypes';

interface WorkflowTableProps {
  workflows: Workflow[];
  onRowClick: (workflow: Workflow, index: number) => void;
}

export const WorkflowTable: React.FC<WorkflowTableProps> = ({
  workflows,
  onRowClick,
}) => {
  return (
    <div className="workflow-table-container">
      <table className="workflow-table">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Transaction ID</th>
            <th>Queue</th>
            <th>Activity Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow, index) => (
            <tr
              key={`${workflow.BatchID}-${workflow.TransactionID}-${index}`}
              onClick={() => onRowClick(workflow, index)}
              className="workflow-row"
            >
              <td>{workflow.BatchID}</td>
              <td>{workflow.TransactionID}</td>
              <td>{workflow.Queue}</td>
              <td>
                {workflow.ConvertedAppRecentActivityDate || workflow.ActivityDate}
              </td>
              <td>
                <span className="action-badge">{workflow.Actions}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowTable;
