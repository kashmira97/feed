import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Users, Video, FileText } from "lucide-react";
import PropTypes from "prop-types";
import "./SharedGalleryView.scss";

const SharedGalleryView = ({
  data = [],
  playerType = "video",
  isFullScreen = false,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [gridDimensions, setGridDimensions] = useState({ columns: 5, rows: 3 });
  
  const containerRef = useRef(null);

  // Calculate grid dimensions based on screen size and fullscreen mode
  const calculateGridDimensions = () => {
    if (!containerRef.current) {
      return isFullScreen 
        ? { columns: 6, rows: 4 } 
        : { columns: 5, rows: 3 };
    }

    const { width, height } = containerRef.current.getBoundingClientRect();
    const cardWidth = 160;
    const cardHeight = 200;
    const gap = 16;

    const columns = Math.floor((width + gap) / (cardWidth + gap));
    const rows = Math.floor((height - 120) / (cardHeight + gap)); // Account for header space

    if (isFullScreen) {
      return {
        columns: Math.max(columns, 6),
        rows: Math.max(rows, 4),
      };
    } else {
      // Responsive columns: 5 when wide, 3 when narrow
      const responsiveColumns = width > 800 ? 5 : 3;
      return {
        columns: Math.min(responsiveColumns, Math.max(columns, 2)),
        rows: Math.max(rows, 2),
      };
    }
  };

  // Update grid dimensions on resize
  useEffect(() => {
    const updateGridDimensions = () => {
      setGridDimensions(calculateGridDimensions());
    };

    updateGridDimensions();
    window.addEventListener("resize", updateGridDimensions);
    return () => window.removeEventListener("resize", updateGridDimensions);
  }, [isFullScreen]);

  // Filter data based on search term and player type
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

  const filteredData = getFilteredData();
  const itemsPerPage = gridDimensions.columns * gridDimensions.rows;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Navigation handlers
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  // Item click handler
  const openProfile = (item) => {
    setSelectedItem(item);
  };

  // Render item based on player type
  const renderGalleryItem = (item, index) => {
    switch (playerType) {
      case "member":
        return renderMemberCard(item, index);
      case "video":
        return renderMediaCard(item, index);
      case "page":
        return renderPageCard(item, index);
      default:
        return renderGenericCard(item, index);
    }
  };

  // Member card component
  const renderMemberCard = (member, index) => (
    <motion.div
      key={`member-${member.id || index}`}
      className="gallery-card member-card"
      onClick={() => openProfile(member)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="card-image">
        <img 
          src={member.avatar || "/api/placeholder/120/120"} 
          alt={member.username || "User"} 
        />
      </div>
      <div className="card-content">
        <h3 className="card-title">{member.username || "Unknown User"}</h3>
        <span className="card-badge">{member.role || "Member"}</span>
        {member.email && (
          <p className="card-subtitle">{member.email}</p>
        )}
      </div>
      <div className="card-actions">
        <Users size={16} />
      </div>
    </motion.div>
  );

  // Media/Video card component
  const renderMediaCard = (media, index) => (
    <motion.div
      key={`media-${media.id || index}`}
      className="gallery-card media-card"
      onClick={() => openProfile(media)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="card-image">
        {media.thumbnail ? (
          <img src={media.thumbnail} alt={media.title || "Media"} />
        ) : (
          <div className="placeholder-image">
            <Video size={48} />
          </div>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{media.title || "Untitled"}</h3>
        <p className="card-subtitle">
          {media.text ? media.text.substring(0, 60) + "..." : "No description"}
        </p>
      </div>
      <div className="card-actions">
        <Video size={16} />
      </div>
    </motion.div>
  );

  // Page card component
  const renderPageCard = (page, index) => (
    <motion.div
      key={`page-${page.id || index}`}
      className="gallery-card page-card"
      onClick={() => openProfile(page)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="card-image">
        {page.image ? (
          <img src={page.image} alt={page.title || "Page"} />
        ) : (
          <div className="placeholder-image">
            <FileText size={48} />
          </div>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{page.title || "Untitled Page"}</h3>
        <p className="card-subtitle">
          {page.description ? page.description.substring(0, 60) + "..." : "No description"}
        </p>
      </div>
      <div className="card-actions">
        <FileText size={16} />
      </div>
    </motion.div>
  );

  // Generic card fallback
  const renderGenericCard = (item, index) => (
    <motion.div
      key={`generic-${item.id || index}`}
      className="gallery-card generic-card"
      onClick={() => openProfile(item)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="card-content">
        <h3 className="card-title">{item.title || item.name || "Item"}</h3>
        <p className="card-subtitle">{item.description || "No description"}</p>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="SharedGalleryView loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`SharedGalleryView ${isFullScreen ? "fullscreen" : ""} ${playerType}-gallery`}
      ref={containerRef}
    >
      {/* Header with search */}
      <div className="gallery-header">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder={`Search ${playerType === "member" ? "members" : playerType === "video" ? "media" : "content"}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
        
        <div className="gallery-info">
          <span>{filteredData.length} items</span>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="gallery-container">
        {filteredData.length === 0 ? (
          <div className="empty-gallery">
            <div className="empty-icon">
              {playerType === "member" ? <Users size={64} /> : 
               playerType === "video" ? <Video size={64} /> : 
               <FileText size={64} />}
            </div>
            <h3>No Items Found</h3>
            <p>{searchTerm ? "No items match your search criteria." : "No items available to display."}</p>
          </div>
        ) : (
          <div 
            className="gallery-grid"
            style={{
              gridTemplateColumns: `repeat(${gridDimensions.columns}, 1fr)`,
              gridTemplateRows: `repeat(${gridDimensions.rows}, 1fr)`,
            }}
          >
            <AnimatePresence mode="wait">
              {paginatedData.map((item, index) => renderGalleryItem(item, index))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="gallery-navigation">
          <button
            className="nav-button prev"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="page-indicator">
            {currentPage + 1} / {totalPages}
          </span>
          
          <button
            className="nav-button next"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Modal for selected item */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="gallery-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="gallery-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
              <div className="modal-content">
                <h2>{selectedItem.title || selectedItem.username || selectedItem.name || "Item Details"}</h2>
                <div className="modal-details">
                  {JSON.stringify(selectedItem, null, 2)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

SharedGalleryView.propTypes = {
  data: PropTypes.array.isRequired,
  playerType: PropTypes.oneOf(["video", "page", "member"]).isRequired,
  isFullScreen: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SharedGalleryView;