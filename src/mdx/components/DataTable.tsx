'use client';
import React, { useState, useMemo } from "react";

export interface DataTableProps {
  data: Array<Record<string, any>>;
  columns?: string[];
  sortable?: boolean;
  searchable?: boolean;
  pageSize?: number;
}

function DataTable({
  data,
  columns,
  sortable = false,
  searchable = false,
  pageSize = 10,
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(0);

  const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : []);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) =>
      tableColumns.some((col) =>
        String(row[col]).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery, tableColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate
  const paginatedData = sortedData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleSort = (column: string) => {
    if (!sortable) return;

    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return React.createElement(
    "div",
    { className: "data-table-container" },
    searchable &&
      React.createElement(
        "div",
        { className: "table-search" },
        React.createElement("input", {
          type: "text",
          placeholder: "Search...",
          className: "search-input",
          value: searchQuery,
          onChange: (e: any) => setSearchQuery(e.target.value),
        })
      ),
    React.createElement(
      "table",
      { className: "data-table" },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          tableColumns.map((col) =>
            React.createElement(
              "th",
              {
                key: col,
                onClick: () => handleSort(col),
                style: sortable ? { cursor: "pointer" } : {},
              },
              col,
              sortable &&
                React.createElement(
                  "span",
                  { className: "sort-indicator" },
                  sortColumn === col
                    ? sortDirection === "asc"
                      ? " ↑"
                      : " ↓"
                    : " ↕"
                )
            )
          )
        )
      ),
      React.createElement(
        "tbody",
        null,
        paginatedData.map((row, idx) =>
          React.createElement(
            "tr",
            { key: idx },
            tableColumns.map((col) =>
              React.createElement("td", { key: col }, String(row[col] ?? ""))
            )
          )
        )
      )
    ),
    totalPages > 1 &&
      React.createElement(
        "div",
        { className: "table-pagination" },
        React.createElement(
          "button",
          {
            onClick: () => setCurrentPage(Math.max(0, currentPage - 1)),
            disabled: currentPage === 0,
          },
          "← Previous"
        ),
        ` Page ${currentPage + 1} of ${totalPages} `,
        React.createElement(
          "button",
          {
            onClick: () =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1)),
            disabled: currentPage === totalPages - 1,
          },
          "Next →"
        )
      )
  );
}

export default DataTable;
export { DataTable };