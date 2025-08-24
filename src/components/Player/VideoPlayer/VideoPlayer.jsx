import { useCallback, useContext, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Context } from "../../../Context/ContextGoogle";
import { formatTime } from "../../../utils/formatTime";
import "./VideoPlayer.scss";
import axios from "axios";
import PropTypes from "prop-types";
import { FaChevronUp, FaChevronDown, FaPlay, FaPause } from "react-icons/fa";
import Popup from "../../Popup/Popup";
import Papa from "papaparse";

const VideoPlayer = forwardRef((props, ref) => {
  const {
    autoplay = false,
    isFullScreen,
    selectedOption,
    setSelectedOption,
    swiperData,
    setSwiperData,
    playerHashFromCache = true,
    onTitleChange,
    onDescriptionChange,
    viewMode = "full",
    controlAction = "",
    onPlayStateChange,
  } = props;
  
  // Utility function to detect if we're in dist context and adjust paths
  const getAssetPath = (assetPath) => {
    // Check if we're in dist context by looking at the feedplayer.js script tag
    const scripts = document.querySelectorAll('script[src*="feedplayer.js"]');
    const isInDist = scripts.length > 0 && scripts[0].src.includes('./assets/feedplayer.js');
    
    if (isInDist) {
      // We're in dist context, remove 'src/' prefix if present
      const cleanPath = assetPath.startsWith('src/') ? assetPath.substring(4) : assetPath;
      return `./assets/${cleanPath}`;
    } else {
      // We're outside dist context, use original path logic
      const currentPath = window.location.pathname;
      let basePath;
      if (currentPath.includes('/feed/')) {
        basePath = currentPath.split('/feed/')[0] + '/feed';
      } else {
        basePath = '/feed';
      }
      return `${basePath}/${assetPath}`;
    }
  };

  // The numbers here are the states to see in React Developer Tools
  const { mediaList, currentMedia, setCurrentMedia } = useContext(Context); // 0
  const [isPlaying, setIsPlaying] = useState(autoplay); // 1
  const [currentVolume, setCurrentVolume] = useState(1); // 2
  const [isMute, setIsMute] = useState(true); // 3
  const [imageElapsed, setImageElapsed] = useState(0); // 4
  const containerRef = useRef(null); // 5
  const videoRef = useRef(null); // 6
  const videoRangeRef = useRef(null); // 7
  const volumeRangeRef = useRef(null); // 8
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // 9
  const imageTimerRef = useRef(null); // 10

  const [duration, setDuration] = useState([0, 0]); // 11
  const [currentTime, setCurrentTime] = useState([0, 0]); // 12
  const [durationSec, setDurationSec] = useState(0); // 13
  const [currentSec, setCurrentTimeSec] = useState(0); // 14

  const [isDropdownActive, setIsDropdownActive] = useState(false); // 15
  const [index, setIndex] = useState(0); // 16
  const [selectedMediaList, setSelectedMediaList] = useState([]); // 17
  const [listofMedia, setListofMedia] = useState({}); // 18
  const [loadedFeeds, setLoadedFeeds] = useState([]); // 19
  const [loadingFeeds, setLoadingFeeds] = useState({}); // 20

  const [isLoading, setIsLoading] = useState(false); // 21
  const [activeFeed, setActiveFeed] = useState("nasa"); // 22
  const [videoData, setVideoData] = useState(null); // 26
  const [showSceneIndicator, setShowSceneIndicator] = useState(false); // 27
  const [sceneDisplayTimeout, setSceneDisplayTimeout] = useState(null); // 28
  const [showFeedsDropdown, setShowFeedsDropdown] = useState(true); // 29 - Show by default

  // Debug logging
  useEffect(() => {
    console.log('VideoPlayer state:', {
      mediaList: mediaList ? mediaList.length : 'null',
      showFeedsDropdown,
      currentMedia,
      selectedMediaList: selectedMediaList.length
    });
  }, [mediaList, showFeedsDropdown, currentMedia, selectedMediaList]);
  const [isHovered, setIsHovered] = useState(false); // 30 - Track hover state
  const [userHasInteracted, setUserHasInteracted] = useState(false); // 31 - Track if user has manually played

  const imageDuration = 4;

  // Update parent with video info
  useEffect(() => {
    if (onTitleChange && currentMedia) {
      onTitleChange(currentMedia.title || "Video Player");
    }
    if (onDescriptionChange && currentMedia) {
      onDescriptionChange(currentMedia.text || "Playing video and image feeds");
    }
  }, [currentMedia, onTitleChange, onDescriptionChange]);

  // Initialize selectedMediaList when mediaList and currentMedia are available
  useEffect(() => {
    if (mediaList && mediaList.length > 0 && !selectedMediaList.length) {
      // Find the current media's associated list or use a default
      const currentFeed = mediaList.find(media => media.feed === activeFeed) || mediaList[0];
      if (currentFeed && listofMedia[currentFeed.title]) {
        setSelectedMediaList(listofMedia[currentFeed.title]);
      } else if (currentFeed) {
        // If no specific list, use the current feed as a single item
        setSelectedMediaList([currentFeed]);
        setCurrentMedia(currentFeed);
      }
    }
  }, [mediaList, listofMedia, activeFeed, selectedMediaList.length, setCurrentMedia]);

  // Show scene indicator when navigating
  useEffect(() => {
    if (selectedMediaList.length > 1) {
      setShowSceneIndicator(true);
      if (sceneDisplayTimeout) {
        clearTimeout(sceneDisplayTimeout);
      }
      const timeout = setTimeout(() => {
        setShowSceneIndicator(false);
      }, 2000);
      setSceneDisplayTimeout(timeout);
    }
  }, [currentMediaIndex, sceneDisplayTimeout, selectedMediaList.length]);

  // Player Hash Cache Management
  const getPlayerHashCache = () => {
    try {
      const cache = localStorage.getItem('playerHashCache');
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.warn('Error reading playerHashCache:', error);
      return {};
    }
  };

  const setPlayerHashCache = (listName, listStatus) => {
    try {
      const cache = getPlayerHashCache();
      cache[listName] = {
        ...listStatus,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('playerHashCache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Error saving playerHashCache:', error);
    }
  };

  // Media type detection functions
  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const urlPath = new URL(url).pathname.toLowerCase();
    return imageExtensions.some(ext => urlPath.includes(ext));
  };

  const isVideoFile = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
    const urlPath = new URL(url).pathname.toLowerCase();
    return videoExtensions.some(ext => urlPath.includes(ext));
  };

  // Media control functions
  const play = useCallback(() => {
    setIsPlaying(true);
    if (currentMedia && isVideoFile(currentMedia.url) && videoRef.current) {
      videoRef.current.play();
    }
  }, [currentMedia]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (currentMedia && isVideoFile(currentMedia.url) && videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentMedia]);

  const handlePlayPause = useCallback(() => {
    setUserHasInteracted(true); // Mark that user has manually interacted
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Scene navigation functions
  const handlePrev = useCallback(() => {
    if (selectedMediaList.length > 0 && currentMediaIndex > 0) {
      const newIndex = currentMediaIndex - 1;
      setCurrentMediaIndex(newIndex);
      setCurrentMedia(selectedMediaList[newIndex]);
      if (isPlaying) pause();
    }
  }, [selectedMediaList, currentMediaIndex, setCurrentMedia, isPlaying, pause]);

  const handleNext = useCallback(() => {
    if (selectedMediaList.length > 0 && currentMediaIndex < selectedMediaList.length - 1) {
      const newIndex = currentMediaIndex + 1;
      setCurrentMediaIndex(newIndex);
      setCurrentMedia(selectedMediaList[newIndex]);
      if (isPlaying) pause();
    }
  }, [selectedMediaList, currentMediaIndex, setCurrentMedia, isPlaying, pause]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (currentMedia && isVideoFile(currentMedia.url) && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setCurrentMediaIndex(0);
    if (selectedMediaList.length > 0) {
      setCurrentMedia(selectedMediaList[0]);
    }
  }, [currentMedia, selectedMediaList, setCurrentMedia]);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    handlePrev,
    handleNext,
    handlePlayPause,
    stop,
    isPlaying,
  }), [handlePrev, handleNext, handlePlayPause, stop, isPlaying]);

  // Handle control actions from parent Player
  useEffect(() => {
    if (controlAction) {
      switch (controlAction) {
        case "prev":
          handlePrev();
          break;
        case "next":
          handleNext();
          break;
        case "playPause":
          handlePlayPause();
          break;
        case "stop":
          stop();
          break;
        default:
          break;
      }
    }
  }, [controlAction, handlePrev, handleNext, handlePlayPause, stop]);

  // Notify parent of play state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Simplified component for Player structure
  return (
    <div 
      className={`VideoPlayerSub ${isFullScreen ? "fullscreen" : ""}`}
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scene Indicator */}
      {playerHashFromCache && showSceneIndicator && (
        <div className="VideoPlayerSub__scene-indicator">
          Scene {currentMediaIndex + 1}
        </div>
      )}
      
      {/* Main content area */}
      <div className="VideoPlayerSub__content">
        {isLoading ? (
          <div className="VideoPlayerSub__loading">
            <div className="spinner"></div>
            <p>Loading media...</p>
          </div>
        ) : currentMedia && currentMedia.isError ? (
          <div className="VideoPlayerSub__error">
            <img
              src={getAssetPath('src/assets/images/intro-landscape.jpg')}
              alt="Error Placeholder"
              className="placeholder-image"
            />
          </div>
        ) : currentMedia && currentMedia.url ? (
          isImageFile(currentMedia.url) ? (
            <img
              className="media-content image-content"
              src={currentMedia.url}
              alt={currentMedia.title || "Media"}
              onError={() => {
                console.error("Error loading image:", currentMedia.url);
              }}
            />
          ) : isVideoFile(currentMedia.url) ? (
            <div className="media-content video-wrapper">
              <video
                ref={videoRef}
                className="video-content"
                src={currentMedia.url}
                poster={getAssetPath('src/assets/images/intro-a.jpg')}
                muted={isMute}
                onClick={handlePlayPause}
              ></video>
              {!isPlaying && (
                <button
                  className="play-button"
                  onClick={handlePlayPause}
                  aria-label="Play Video"
                >
                  <FaPlay size={30} />
                </button>
              )}
              {isPlaying && (
                <button
                  className="play-button"
                  onClick={handlePlayPause}
                  aria-label="Pause Video"
                >
                  <FaPause size={30} />
                </button>
              )}
            </div>
          ) : (
            <div className="VideoPlayerSub__unsupported">
              <img
                src={getAssetPath('src/assets/images/intro-landscape.jpg')}
                alt="Error Placeholder"
                className="placeholder-image"
              />
              <div className="unsupported-message">
                Unsupported Media Type
              </div>
            </div>
          )
        ) : (
          <div className="VideoPlayerSub__no-media">
            <img
              src={getAssetPath('src/assets/images/intro-a.jpg')}
              alt="Feed Player Placeholder"
              className="placeholder-image"
            />
          </div>
        )}

        {/* Progress bar for media sequences */}
        {selectedMediaList.length > 1 && (
          <div className="VideoPlayerSub__progress-bar">
            <div
              className="progress-fill"
              style={{
                width: selectedMediaList.length > 0
                  ? `${((currentMediaIndex + 1) / Math.min(selectedMediaList.length, 7)) * 100}%`
                  : "0%",
              }}
            ></div>
            {selectedMediaList.slice(0, 7).map(
              (item, index) => (
                <div
                  key={index}
                  className="progress-point"
                  style={{
                    left: `${((index + 1) / Math.min(selectedMediaList.length, 7)) * 99.75}%`,
                  }}
                  title={`Move to scene ${index + 1}`}
                ></div>
              )
            )}
          </div>
        )}

        {/* Feeds dropdown - always show but with loading state */}
        {showFeedsDropdown && (
          <div className="VideoPlayerSub__feeds-dropdown">
            <div className="dropdown-header">
              <button 
                className="dropdown-close"
                onClick={() => setShowFeedsDropdown(false)}
                title="Close feeds dropdown"
              >
                ×
              </button>
              <div
                className="feed-selector"
                onClick={() => setIsDropdownActive(!isDropdownActive)}
              >
                <span>
                  {mediaList && mediaList.length > 0 && mediaList[index]
                    ? mediaList[index].title || mediaList[index].feed
                    : mediaList && mediaList.length > 0
                    ? "Select Feed"
                    : "Loading feeds..."}
                </span>
                <div className="selector-caret"></div>
              </div>
            </div>
            {isDropdownActive && (
              <ul className="feeds-menu">
                {mediaList && mediaList.length > 0 ? (
                  mediaList.map((media, idx) => (
                    <li
                      key={idx}
                      className={`${currentMediaIndex === idx ? "active" : ""} ${
                        loadedFeeds.includes(media.feed.trim().toLowerCase())
                          ? ""
                          : "loading"
                      }`}
                      onClick={() => {
                        setIndex(idx);
                        setIsDropdownActive(false);
                        setCurrentMediaIndex(0);
                        // Set current media when selecting from dropdown
                        setCurrentMedia(media);
                      }}
                    >
                      {media.title || media.feed}
                    </li>
                  ))
                ) : (
                  <li className="loading">Loading feeds...</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* URL popup */}
        {selectedOption === "url" && (
          <Popup {...{ setVideoData, setSelectedOption }} />
        )}
      </div>
    </div>
  );
});

VideoPlayer.propTypes = {
  autoplay: PropTypes.bool,
  isFullScreen: PropTypes.bool.isRequired,
  selectedOption: PropTypes.string.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
  swiperData: PropTypes.object,
  setSwiperData: PropTypes.func.isRequired,
  playerHashFromCache: PropTypes.bool,
  onTitleChange: PropTypes.func,
  onDescriptionChange: PropTypes.func,
  viewMode: PropTypes.string,
  controlAction: PropTypes.string,
  onPlayStateChange: PropTypes.func,
};

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;