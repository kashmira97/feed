import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./SharedColumnsView.scss";

const SharedColumnsView = ({
  data = [],
  playerType = "video",
  isFullScreen = false,
  isLoading = false,
}) => {
  const [columns, setColumns] = useState(3);

  // Determine column count based on screen size
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (isFullScreen) {
        setColumns(width > 1200 ? 4 : 3);
      } else {
        setColumns(width > 800 ? 3 : 1);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [isFullScreen]);

  // Organize data into columns
  const organizeIntoColumns = () => {
    const columnData = Array.from({ length: columns }, () => []);
    data.forEach((item, index) => {
      columnData[index % columns].push(item);
    });
    return columnData;
  };

  const columnData = organizeIntoColumns();

  // Render item based on player type
  const renderItem = (item, index) => {
    switch (playerType) {
      case "member":
        return (
          <div key={`member-${index}`} className="column-item member-item">
            <img src={item.avatar || "/api/placeholder/60/60"} alt={item.username} />
            <div className="item-info">
              <h4>{item.username}</h4>
              <p>{item.role}</p>
            </div>
          </div>
        );
      case "video":
        return (
          <div key={`video-${index}`} className="column-item video-item">
            <img src={item.thumbnail || "/api/placeholder/200/120"} alt={item.title} />
            <div className="item-info">
              <h4>{item.title}</h4>
              <p>{item.text?.substring(0, 50)}...</p>
            </div>
          </div>
        );
      case "page":
        return (
          <div key={`page-${index}`} className="column-item page-item">
            <div className="item-info">
              <h4>{item.title}</h4>
              <p>{item.description?.substring(0, 100)}...</p>
            </div>
          </div>
        );
      default:
        return (
          <div key={`item-${index}`} className="column-item generic-item">
            <h4>{item.title || item.name}</h4>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="SharedColumnsView loading">
        <div className="loading-spinner">Loading columns...</div>
      </div>
    );
  }

  return (
    <div className={`SharedColumnsView ${isFullScreen ? "fullscreen" : ""} ${playerType}-columns`}>
      <div className="columns-container" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {columnData.map((columnItems, columnIndex) => (
          <div key={columnIndex} className="column">
            {columnItems.map((item, itemIndex) => renderItem(item, itemIndex))}
          </div>
        ))}
      </div>
    </div>
  );
};

SharedColumnsView.propTypes = {
  data: PropTypes.array.isRequired,
  playerType: PropTypes.oneOf(["video", "page", "member"]).isRequired,
  isFullScreen: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SharedColumnsView;