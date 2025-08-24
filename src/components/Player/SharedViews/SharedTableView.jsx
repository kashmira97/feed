import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import PropTypes from "prop-types";
import "./SharedTableView.scss";

const SharedTableView = ({
  data = [],
  playerType = "video",
  isFullScreen = false,
  isLoading = false,
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Define columns based on player type
  const getColumns = () => {
    switch (playerType) {
      case "member":
        return [
          { key: "avatar", label: "", width: "60px", sortable: false },
          { key: "username", label: "Username", width: "auto", sortable: true },
          { key: "role", label: "Role", width: "120px", sortable: true },
          { key: "email", label: "Email", width: "auto", sortable: true },
          { key: "status", label: "Status", width: "100px", sortable: true },
          { key: "joinedAt", label: "Joined", width: "120px", sortable: true },
        ];
      case "video":
        return [
          { key: "thumbnail", label: "", width: "80px", sortable: false },
          { key: "title", label: "Title", width: "auto", sortable: true },
          { key: "duration", label: "Duration", width: "100px", sortable: true },
          { key: "type", label: "Type", width: "100px", sortable: true },
          { key: "url", label: "Source", width: "150px", sortable: true },
          { key: "timestamp", label: "Date", width: "120px", sortable: true },
        ];
      case "page":
        return [
          { key: "image", label: "", width: "60px", sortable: false },
          { key: "title", label: "Title", width: "auto", sortable: true },
          { key: "category", label: "Category", width: "120px", sortable: true },
          { key: "author", label: "Author", width: "120px", sortable: true },
          { key: "date", label: "Date", width: "120px", sortable: true },
        ];
      default:
        return [
          { key: "title", label: "Title", width: "auto", sortable: true },
        ];
    }
  };

  const columns = getColumns();

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      const searchText = searchTerm.toLowerCase();
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(searchText)
      );
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle different data types
        if (sortColumn === "joinedAt" || sortColumn === "timestamp" || sortColumn === "date") {
          aVal = new Date(aVal || 0);
          bVal = new Date(bVal || 0);
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = (bVal || "").toLowerCase();
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);

  // Handle column sort
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Render cell content based on column and data type
  const renderCellContent = (item, column) => {
    const value = item[column.key];

    switch (column.key) {
      case "avatar":
      case "thumbnail":
      case "image":
        return value ? (
          <img 
            src={value} 
            alt=""
            className="table-image"
            style={{
              width: column.key === "thumbnail" ? "60px" : "40px",
              height: column.key === "thumbnail" ? "36px" : "40px",
              borderRadius: column.key === "avatar" ? "50%" : "4px"
            }}
          />
        ) : (
          <div className="table-placeholder">-</div>
        );

      case "status":
        return (
          <span className={`status-indicator ${value || "offline"}`}>
            {value || "offline"}
          </span>
        );

      case "joinedAt":
      case "timestamp":
      case "date":
        return value ? new Date(value).toLocaleDateString() : "-";

      case "url":
        return value ? (
          <span title={value}>
            {new URL(value).hostname}
          </span>
        ) : "-";

      case "duration":
        return value || "-";

      case "email":
        return value ? (
          <span title={value}>
            {value.length > 25 ? value.substring(0, 25) + "..." : value}
          </span>
        ) : "-";

      default:
        if (typeof value === "string" && value.length > 50) {
          return <span title={value}>{value.substring(0, 50)}...</span>;
        }
        return value || "-";
    }
  };

  if (isLoading) {
    return (
      <div className="SharedTableView loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading table...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`SharedTableView ${isFullScreen ? "fullscreen" : ""} ${playerType}-table`}>
      {/* Header with search */}
      <div className="table-header">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-info">
          {processedData.length} of {data.length} items
        </div>
      </div>

      {/* Table container */}
      <div className="table-container">
        {processedData.length === 0 ? (
          <div className="empty-table">
            <h3>No Data Available</h3>
            <p>{searchTerm ? "No items match your search criteria." : "No data to display in table."}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`${column.sortable ? "sortable" : ""} ${
                      sortColumn === column.key ? "sorted" : ""
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="th-content">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <div className="sort-icon">
                          {sortColumn === column.key ? (
                            sortDirection === "asc" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <div className="sort-placeholder">
                              <ChevronUp size={14} style={{ opacity: 0.3 }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((item, index) => (
                <tr key={`row-${item.id || index}`} className="data-row">
                  {columns.map((column) => (
                    <td key={`cell-${column.key}-${index}`}>
                      {renderCellContent(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

SharedTableView.propTypes = {
  data: PropTypes.array.isRequired,
  playerType: PropTypes.oneOf(["video", "page", "member"]).isRequired,
  isFullScreen: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SharedTableView;