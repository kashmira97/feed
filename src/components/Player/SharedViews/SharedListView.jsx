import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Users, Video, FileText, Clock, User } from "lucide-react";
import PropTypes from "prop-types";
import "./SharedListView.scss";

const SharedListView = ({
  data = [],
  playerType = "video",
  isFullScreen = false,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = isFullScreen ? 15 : 10;

  // Filter data based on search term
  const getFilteredData = () => {
    if (!data || data.length === 0) return [];
    
    return data.filter(item => {
      const searchText = searchTerm.toLowerCase();
      
      switch (playerType) {
        case "member":
          return (
            item.username?.toLowerCase().includes(searchText) ||
            item.email?.toLowerCase().includes(searchText) ||
            item.role?.toLowerCase().includes(searchText)
          );
        case "video":
          return (
            item.title?.toLowerCase().includes(searchText) ||
            item.text?.toLowerCase().includes(searchText) ||
            item.url?.toLowerCase().includes(searchText)
          );
        case "page":
          return (
            item.title?.toLowerCase().includes(searchText) ||
            item.content?.toLowerCase().includes(searchText)
          );
        default:
          return true;
      }
    });
  };

  // Sort filtered data
  const getSortedData = (filteredData) => {
    if (sortBy === "default") return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case "title":
          aVal = (a.title || a.username || a.name || "").toLowerCase();
          bVal = (b.title || b.username || b.name || "").toLowerCase();
          break;
        case "date":
          aVal = new Date(a.timestamp || a.createdAt || a.date || 0);
          bVal = new Date(b.timestamp || b.createdAt || b.date || 0);
          break;
        case "type":
          aVal = (a.role || a.type || "").toLowerCase();
          bVal = (b.role || b.type || "").toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const filteredData = getFilteredData();
  const sortedData = getSortedData(filteredData);
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // Handle sort change
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  // Get item image with responsive sizing
  const getItemImage = (item) => {
    let imageSrc = null;
    
    switch (playerType) {
      case "member":
        imageSrc = item.avatar;
        break;
      case "video":
        imageSrc = item.thumbnail || item.image;
        break;
      case "page":
        imageSrc = item.image || item.thumbnail;
        break;
    }

    return imageSrc;
  };

  // Render list item based on player type
  const renderListItem = (item, index) => {
    const imageSrc = getItemImage(item);
    
    return (
      <div key={`${item.id || index}`} className={`list-item ${playerType}-item`}>
        {/* Responsive image container */}
        <div className="item-image-container">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={item.title || item.username || "Item"} 
              className="item-image"
            />
          ) : (
            <div className="item-placeholder">
              {playerType === "member" ? <User size={24} /> : 
               playerType === "video" ? <Video size={24} /> : 
               <FileText size={24} />}
            </div>
          )}
        </div>

        {/* Item content */}
        <div className="item-content">
          {playerType === "member" && renderMemberContent(item)}
          {playerType === "video" && renderVideoContent(item)}
          {playerType === "page" && renderPageContent(item)}
        </div>

        {/* Item metadata */}
        <div className="item-metadata">
          {renderItemMetadata(item)}
        </div>
      </div>
    );
  };

  // Member content renderer
  const renderMemberContent = (member) => (
    <>
      <h3 className="item-title">{member.username || "Unknown User"}</h3>
      <p className="item-subtitle">{member.role || "Member"}</p>
      {member.email && (
        <p className="item-description">{member.email}</p>
      )}
      <div className="item-tags">
        <span className={`status-tag ${member.status || "offline"}`}>
          {member.status || "offline"}
        </span>
      </div>
    </>
  );

  // Video content renderer
  const renderVideoContent = (video) => (
    <>
      <h3 className="item-title">{video.title || "Untitled"}</h3>
      <p className="item-subtitle">
        {video.url ? new URL(video.url).hostname : "No source"}
      </p>
      {video.text && (
        <p className="item-description">
          {video.text.length > 150 ? video.text.substring(0, 150) + "..." : video.text}
        </p>
      )}
      <div className="item-tags">
        {video.type && <span className="type-tag">{video.type}</span>}
      </div>
    </>
  );

  // Page content renderer  
  const renderPageContent = (page) => (
    <>
      <h3 className="item-title">{page.title || "Untitled Page"}</h3>
      <p className="item-subtitle">{page.category || "Page"}</p>
      {page.content && (
        <p className="item-description">
          {page.content.length > 150 ? page.content.substring(0, 150) + "..." : page.content}
        </p>
      )}
      <div className="item-tags">
        {page.tags && page.tags.map((tag, idx) => (
          <span key={idx} className="content-tag">{tag}</span>
        ))}
      </div>
    </>
  );

  // Item metadata renderer
  const renderItemMetadata = (item) => {
    const timestamp = item.timestamp || item.createdAt || item.date;
    
    return (
      <div className="metadata-content">
        {timestamp && (
          <div className="metadata-item">
            <Clock size={14} />
            <span>{new Date(timestamp).toLocaleDateString()}</span>
          </div>
        )}
        {playerType === "member" && item.joinedAt && (
          <div className="metadata-item">
            <Users size={14} />
            <span>Joined {new Date(item.joinedAt).toLocaleDateString()}</span>
          </div>
        )}
        {playerType === "video" && item.duration && (
          <div className="metadata-item">
            <Video size={14} />
            <span>{item.duration}</span>
          </div>
        )}
      </div>
    );
  };

  // Render sort button
  const renderSortButton = (sortKey, label) => (
    <button
      className={`sort-button ${sortBy === sortKey ? "active" : ""}`}
      onClick={() => handleSort(sortKey)}
    >
      <span>{label}</span>
      {sortBy === sortKey && (
        sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="SharedListView loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`SharedListView ${isFullScreen ? "fullscreen" : ""} ${playerType}-list`}>
      {/* Header with search and sort controls */}
      <div className="list-header">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder={`Search ${playerType === "member" ? "members" : playerType === "video" ? "media" : "content"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          {renderSortButton("title", playerType === "member" ? "Name" : "Title")}
          {renderSortButton("date", "Date")}
          {renderSortButton("type", playerType === "member" ? "Role" : "Type")}
        </div>

        <div className="list-info">
          <span>{sortedData.length} items</span>
        </div>
      </div>

      {/* List content */}
      <div className="list-container">
        {sortedData.length === 0 ? (
          <div className="empty-list">
            <div className="empty-icon">
              {playerType === "member" ? <Users size={64} /> : 
               playerType === "video" ? <Video size={64} /> : 
               <FileText size={64} />}
            </div>
            <h3>No Items Found</h3>
            <p>{searchTerm ? "No items match your search criteria." : "No items available to display."}</p>
          </div>
        ) : (
          <div className="list-items">
            {paginatedData.map((item, index) => renderListItem(item, index))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="list-pagination">
          <button
            className="page-button"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages} ({sortedData.length} items)
          </span>
          
          <button
            className="page-button"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

SharedListView.propTypes = {
  data: PropTypes.array.isRequired,
  playerType: PropTypes.oneOf(["video", "page", "member"]).isRequired,
  isFullScreen: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SharedListView;