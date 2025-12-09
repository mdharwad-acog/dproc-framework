import React from 'react';

interface DataTableProps {
  data: any[] | string;
  columns: string[] | string;
}

export const DataTable = ({ data, columns }: DataTableProps) => {
  const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  const parsedColumns = typeof columns === 'string' ? JSON.parse(columns) : columns;

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {parsedColumns.map((col: string) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsedData.map((row: any, idx: number) => (
            <tr key={idx}>
              {parsedColumns.map((col: string) => (
                <td key={col}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
