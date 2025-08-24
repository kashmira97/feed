import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./PagePlayer.scss";

const PagePlayer = ({
  pageContent = "",
  isFullScreen = false,
  viewMode = "full",
  onTitleChange,
  onDescriptionChange,
  isLoading = false,
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Update parent with page info
  useEffect(() => {
    if (onTitleChange) {
      onTitleChange("Team Projects");
    }
    if (onDescriptionChange) {
      onDescriptionChange("Displaying team projects page content");
    }
  }, [onTitleChange, onDescriptionChange]);

  // Handle scroll position tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Update content and container dimensions
  useEffect(() => {
    if (contentRef.current && containerRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, [pageContent]);

  // Calculate scroll progress for progress indication
  const scrollProgress = contentHeight > containerHeight 
    ? (scrollPosition / (contentHeight - containerHeight)) * 100 
    : 0;

  return (
    <div className={`PagePlayer ${isFullScreen ? "fullscreen" : ""}`}>
      {/* Scroll progress indicator */}
      {contentHeight > containerHeight && (
        <div className="PagePlayer__progress">
          <div 
            className="PagePlayer__progress-bar" 
            style={{ width: `${Math.min(scrollProgress, 100)}%` }}
          />
        </div>
      )}

      {/* Page content container */}
      <div 
        className="PagePlayer__container"
        ref={containerRef}
      >
        {isLoading ? (
          <div className="PagePlayer__loading">
            <div className="spinner"></div>
            <p>Loading page content...</p>
          </div>
        ) : pageContent ? (
          <div 
            className="PagePlayer__content"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        ) : (
          <div className="PagePlayer__no-content">
            <h2>No Page Content</h2>
            <p>No page content available to display</p>
          </div>
        )}
      </div>

      {/* Page navigation controls overlay */}
      <div className="PagePlayer__navigation">
        <button 
          className="nav-button scroll-top"
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          title="Scroll to top"
        >
          ↑
        </button>
        <button 
          className="nav-button scroll-bottom"
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollTo({ 
                top: contentHeight, 
                behavior: 'smooth' 
              });
            }
          }}
          title="Scroll to bottom"
        >
          ↓
        </button>
      </div>
    </div>
  );
};

PagePlayer.propTypes = {
  pageContent: PropTypes.string,
  isFullScreen: PropTypes.bool,
  viewMode: PropTypes.string,
  onTitleChange: PropTypes.func,
  onDescriptionChange: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default PagePlayer;