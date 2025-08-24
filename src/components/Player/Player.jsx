import React, { useState, useEffect, useRef } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import PropTypes from "prop-types";
import "./Player.scss";

// Sub-player components
import PagePlayer from "./PagePlayer/PagePlayer";
import MemberPlayer from "./MemberPlayer/MemberPlayer";

// Shared view components
import SharedFullView from "./SharedViews/SharedFullView";
import SharedColumnsView from "./SharedViews/SharedColumnsView";
import SharedTableView from "./SharedViews/SharedTableView";
import SharedListView from "./SharedViews/SharedListView";
import SharedGalleryView from "./SharedViews/SharedGalleryView";

const Player = ({
  playerType = "video",
  viewMode = "full",
  isFullScreen = false,
  setIsFullScreen,
  handleFullScreen,
  autoplay = false,
  selectedOption = "",
  setSelectedOption,
  swiperData,
  setSwiperData,
  playerHashFromCache = true,
  pageContent = "",
  channels = [],
  messages = [],
  members = [],
  selectedChannel = null,
  onChannelSelect,
  token = "",
  isLoading = false,
  ...otherProps
}) => {
  // Player state
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // Media control state
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlAction, setControlAction] = useState("");
  
  // Refs
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const subPlayerRef = useRef(null);

  // View mode controls
  const viewModes = [
    { key: "full", label: "Full View", icon: "ri-play-circle-line" },
    { key: "columns", label: "Columns", icon: "ri-layout-column-line" },
    { key: "table", label: "Table", icon: "ri-table-line" },
    { key: "list", label: "List", icon: "ri-list-check" },
    { key: "gallery", label: "Gallery", icon: "ri-gallery-line" }
  ];

  // Toggle text expansion
  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  // Control handlers
  const handlePrev = () => {
    setControlAction("prev");
    setTimeout(() => setControlAction(""), 100);
  };

  const handleNext = () => {
    setControlAction("next");
    setTimeout(() => setControlAction(""), 100);
  };

  const handlePlayPause = () => {
    setControlAction("playPause");
    setIsPlaying(!isPlaying);
    setTimeout(() => setControlAction(""), 100);
  };

  const handleStop = () => {
    setControlAction("stop");
    setIsPlaying(false);
    setTimeout(() => setControlAction(""), 100);
  };

  // Update content based on player type
  useEffect(() => {
    switch (playerType) {
      case "video":
        setCurrentTitle("Video Player");
        setCurrentDescription("Playing video and image feeds");
        break;
      case "page":
        setCurrentTitle("Page Player");
        setCurrentDescription("Displaying page content");
        break;
      case "member":
        setCurrentTitle("Member Player");
        setCurrentDescription("Discord member and channel viewer");
        break;
      default:
        setCurrentTitle("Feed Player");
        setCurrentDescription("Select a player type");
    }
  }, [playerType]);

  // Render the appropriate sub-player based on type and view mode
  const renderPlayerContent = () => {
    const commonProps = {
      isFullScreen,
      setIsFullScreen,
      handleFullScreen,
      isLoading,
      viewMode,
      ...otherProps
    };

    // For shared view modes, use shared components
    if (viewMode !== "full") {
      const sharedProps = {
        ...commonProps,
        playerType,
        data: getPlayerData(),
      };

      switch (viewMode) {
        case "columns":
          return <SharedColumnsView {...sharedProps} />;
        case "table":
          return <SharedTableView {...sharedProps} />;
        case "list":
          return <SharedListView {...sharedProps} />;
        case "gallery":
          return <SharedGalleryView {...sharedProps} />;
        default:
          return <SharedFullView {...sharedProps} />;
      }
    }

    // For full view, use specialized sub-players
    switch (playerType) {
      case "page":
        return (
          <PagePlayer
            pageContent={pageContent}
            onTitleChange={setCurrentTitle}
            onDescriptionChange={setCurrentDescription}
            {...commonProps}
          />
        );
      case "member":
        return (
          <MemberPlayer
            channels={channels}
            messages={messages}
            members={members}
            selectedChannel={selectedChannel}
            onChannelSelect={onChannelSelect}
            token={token}
            onTitleChange={setCurrentTitle}
            onDescriptionChange={setCurrentDescription}
            {...commonProps}
          />
        );
      default:
        return (
          <div className="Player__no-content">
            <p>Select a player type to begin</p>
          </div>
        );
    }
  };

  // Get data for shared views
  const getPlayerData = () => {
    switch (playerType) {
      case "video":
        // Return video/media list data
        return [];
      case "page":
        // Return page elements data
        return [];
      case "member":
        // Return members or messages data based on context
        return viewMode === "gallery" ? members : messages;
      default:
        return [];
    }
  };

  return (
    <div
      className={`Player ${isFullScreen ? "fullscreen" : ""} Player--${playerType}`}
      ref={containerRef}
      data-testid="player-root"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
    >
      {/* Main content container with curved corners */}
      <div 
        className="Player__content-container"
        ref={contentRef}
      >
        {isLoading ? (
          <div className="Player__loading">
            <div className="spinner"></div>
            <p>Loading {playerType} player...</p>
          </div>
        ) : (
          renderPlayerContent()
        )}

        {/* Overlay with info and view mode controls */}
        {!isLoading && (
          <div className={`Player__overlay ${isExpanded ? "expanded-overlay" : ""}`}>
            <div className="Player__info">
              <h2>
                {currentTitle || "Untitled"}{" "}
                <span onClick={toggleText} className="toggle-text">
                  {isExpanded ? (
                    <FaChevronDown title="Reduce" size={20} />
                  ) : (
                    <FaChevronUp title="Expand" size={20} />
                  )}
                </span>
              </h2>
              <p className={isExpanded ? "expanded" : "collapsed"}>
                {currentDescription || "No description available"}
              </p>
              
              {/* View mode selector */}
              <div className="Player__view-modes">
                {viewModes.map((mode) => (
                  <button
                    key={mode.key}
                    className={`view-mode-btn ${viewMode === mode.key ? "active" : ""}`}
                    onClick={() => setSelectedOption(`viewMode:${mode.key}`)}
                    title={mode.label}
                  >
                    <span className="mode-icon">{mode.icon}</span>
                    <span className="mode-label">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unified controls bar - always visible */}
      {showControls && (
        <div className="Player__controls">
          <div className="control-group control-group-btn">
            <button 
              className="control-button prev" 
              onClick={handlePrev}
              title="Previous"
            >
              <i className="ri-skip-back-fill icon"></i>
            </button>
            <button
              className="control-button play-pause"
              onClick={handlePlayPause}
              title={isPlaying ? "Pause" : "Play"}
            >
              <i className={`ri-${isPlaying ? "pause" : "play"}-fill icon`}></i>
            </button>
            <button 
              className="control-button next" 
              onClick={handleNext}
              title="Next"
            >
              <i className="ri-skip-forward-fill icon"></i>
            </button>
            <button 
              className="control-button stop" 
              onClick={handleStop}
              title="Stop"
            >
              <i className="ri-stop-fill icon"></i>
            </button>
          </div>

          <div className="control-group control-group-slider">
            {/* Progress/slider will be managed by sub-players */}
            <span className="time">
            </span>
          </div>

          <div className="control-group control-group-views">
            {viewModes.map((mode) => (
              <button
                key={mode.key}
                className={`control-button view-mode ${viewMode === mode.key ? "active" : ""}`}
                onClick={() => setSelectedOption(`viewMode:${mode.key}`)}
                title={mode.label}
              >
                <i className={`${mode.icon} icon`}></i>
              </button>
            ))}
          </div>

          <div className="control-group control-group-volume">
            <button 
              className="control-button volume" 
              onClick={() => setSelectedOption("mute")}
            >
              <i className="ri-volume-up-fill"></i>
            </button>
            <input
              type="range"
              className="range-input"
              max={1}
              min={0}
              defaultValue={1}
              step={0.1}
            />
            <button
              className="control-button full-screen"
              onClick={handleFullScreen}
            >
              <i className={`ri-${isFullScreen ? "fullscreen-exit" : "fullscreen"}-line`}></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Player.propTypes = {
  playerType: PropTypes.oneOf(["video", "page", "member"]),
  viewMode: PropTypes.oneOf(["full", "columns", "table", "list", "gallery"]),
  isFullScreen: PropTypes.bool,
  setIsFullScreen: PropTypes.func.isRequired,
  handleFullScreen: PropTypes.func.isRequired,
  autoplay: PropTypes.bool,
  selectedOption: PropTypes.string,
  setSelectedOption: PropTypes.func.isRequired,
  swiperData: PropTypes.object,
  setSwiperData: PropTypes.func,
  playerHashFromCache: PropTypes.bool,
  pageContent: PropTypes.string,
  channels: PropTypes.array,
  messages: PropTypes.array,
  members: PropTypes.array,
  selectedChannel: PropTypes.string,
  onChannelSelect: PropTypes.func,
  token: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default Player;