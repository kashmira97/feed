// External dependencies
import React, { useState, useEffect, useRef } from "react";
import reactToWebComponent from "react-to-webcomponent";
import ReactDOM from "react-dom";
import {
  Video,
  Users,
  MessageCircle,
  AlertCircle,
  MoreHorizontal,
  Maximize,
  Minimize,
  Link,
  List,
  LogOut,
} from "lucide-react";

// Components
import MemberSense from "./components/MemberSenseComponents/MemberSenseLogin/MemberSense";
import MemberShowcase from "./components/MemberSenseComponents/MemberShowcase/MemberShowcase";
import DiscordChannelViewer from "./components/MemberSenseComponents/DiscordChannelViewer/DiscordChannelViewer";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";

// Context
import ContextProvider from "./Context/ContextGoogle";

// Services
import {
  fetchMembers,
  fetchChannels,
  fetchMessages,
  fetchFakeMembers,
  fetchFakeChannels,
  fetchFakeMessages,
} from "./services/Dataservice";

// Styles
import "./App.scss";

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Discord token will be retrieved from backend instead of being embedded
let DISCORD_BOT_TOKEN = null;

// Web Component Registration
const VideoPlayerComponent = reactToWebComponent(VideoPlayer, React, ReactDOM);
customElements.define("video-player-widget", VideoPlayerComponent);

function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState("FeedPlayer");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showMemberSenseOverlay, setShowMemberSenseOverlay] = useState(false);
  const [sidePanelView, setSidePanelView] = useState(null); // "Showcase" or "DiscordViewer"
  const [sidePanelExpanded, setSidePanelExpanded] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const appRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState("");
  const menuOpenRef = useRef(null);
  const [swiperData, setSwiperData] = useState(null);
  const [isPopup, setIsPopup] = useState(false);
  const menuRef = useRef(null);
  const [isMenu, setIsMenu] = useState(false);
  const [showPageView, setShowPageView] = useState(true); // Show page initially
  const [pageContent, setPageContent] = useState('');

  // Auth state
  const [token, setToken] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);

  // Data state
  const [useMockData, setUseMockData] = useState(false);
  const [members, setMembers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Navigation items configuration
  const memberSenseDropdownItems = [
    { id: "Showcase", icon: Users, label: "Member Showcase" },
    { id: "DiscordViewer", icon: MessageCircle, label: "Discord Viewer" },
  ];

  const handlePopupClick = () => {
    setSelectedOption("");
    setIsMenu(true);
  };

  const handleMenuClick = (option) => {
    setIsMenu(false);
    setSelectedOption(option);
  };

  // Click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If menuRef exists and the click is NOT inside it, close the menu
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenu(false);
    };

    if (isMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenu]);

  useEffect(() => {
    if (isMenu) setIsMenu(false);
  }, [currentView]);

  // Function to determine correct path based on current location
  const getProjectsPath = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/dist')) {
      // We're in dist context, need to go up one more level
      return '../../team/projects/index.html';
    } else if (currentPath.includes('/feed')) {
      // We're in feed folder
      return '../team/projects/index.html';
    } else {
      // Direct access
      return 'team/projects/index.html';
    }
  };

  // Function to adjust paths in the loaded HTML content
  const adjustPaths = (htmlContent) => {
    const currentPath = window.location.pathname;
    let pathPrefix = '';
    
    if (currentPath.includes('/dist')) {
      pathPrefix = '../../team/';
    } else if (currentPath.includes('/feed')) {
      pathPrefix = '../team/';
    } else {
      pathPrefix = 'team/';
    }

    // Adjust relative paths in the HTML
    return htmlContent
      // Fix CSS and JS paths that start with ../
      .replace(/href="\.\.\/css\//g, `href="${pathPrefix}css/`)
      .replace(/src="\.\.\/js\//g, `src="${pathPrefix}js/`)
      .replace(/href="\.\.\/img\//g, `href="${pathPrefix}img/`)
      .replace(/src="\.\.\/img\//g, `src="${pathPrefix}img/`)
      // Fix localsite paths
      .replace(/href="\.\.\/\.\.\/localsite\//g, 'href="localsite/')
      .replace(/src="\.\.\/\.\.\/localsite\//g, 'src="localsite/')
      // Fix any other team relative paths
      .replace(/href="([^"]*\.css)"/g, (match, path) => {
        if (path.startsWith('http') || path.startsWith('/') || path.includes('team/')) {
          return match;
        }
        return `href="${pathPrefix}${path}"`;
      })
      .replace(/src="([^"]*\.(js|png|jpg|jpeg|gif|svg))"/g, (match, path) => {
        if (path.startsWith('http') || path.startsWith('/') || path.includes('team/')) {
          return match;
        }
        return `src="${pathPrefix}${path}"`;
      });
  };

  // Function to fetch and load the projects page
  const loadProjectsPage = async () => {
    try {
      const projectsPath = getProjectsPath();
      const response = await fetch(projectsPath);
      
      if (!response.ok) {
        console.warn(`Could not load projects page from ${projectsPath}`);
        return;
      }
      
      let htmlContent = await response.text();
      
      // Extract just the body content (everything between <body> and </body>)
      const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        htmlContent = bodyMatch[1];
      }
      
      // Adjust paths in the content
      htmlContent = adjustPaths(htmlContent);
      
      setPageContent(htmlContent);
      console.log('Successfully loaded team/projects page');
    } catch (error) {
      console.warn('Error loading projects page:', error);
    }
  };

  // Hash detection effect
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.substring(1); // Remove the leading '#'
      const params = new URLSearchParams(hash);
      
      // Check if a list parameter is specified
      if (params.get('list')) {
        setShowPageView(false); // Show FeedPlayer when list is specified
      } else {
        setShowPageView(true); // Show page when no list is specified
      }
      
      if (params.get('members') === 'discord') {
        setShowMemberSenseOverlay(true);
        // Set currentView to FeedPlayer if it's not already to ensure video is visible
        if (currentView !== "FeedPlayer") {
          setCurrentView("FeedPlayer");
        }
      } else {
        setShowMemberSenseOverlay(false);
      }
    };

    // Check hash on component mount
    checkHash();

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);
    
    return () => {
      window.removeEventListener('hashchange', checkHash);
    };
  }, [currentView]);

  // Load projects page on initial mount
  useEffect(() => {
    loadProjectsPage();
  }, []);

  // Effects
  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      if (useMockData) {
        const fakeMembers = fetchFakeMembers();
        const fakeChannels = fetchFakeChannels();
        setMembers(fakeMembers);
        setChannels(fakeChannels);
        if (fakeChannels.length > 0 && !selectedChannel) {
          setSelectedChannel(fakeChannels[0].id);
        }
      } else {
        Promise.all([fetchMembers(sessionId), fetchChannels(sessionId)])
          .then(([membersData, channelsData]) => {
            setMembers(membersData);
            setChannels(channelsData);
            console.log("Fetching Channel Data.");
            console.log(channelsData.length);
            if (channelsData.length > 0 && !selectedChannel) {
              setSelectedChannel(channelsData[0].id);
            }
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data. Please try again.");
          })
          .finally(() => setIsLoading(false));
      }
    } else {
      setMembers([]);
      setChannels([]);
      setMessages([]);
    }
  }, [sessionId]);

  useEffect(() => {
    if (swiperData) {
      setIsPopup(true);
    }
  }, [swiperData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenRef.current && !menuOpenRef.current.contains(event.target)) setIsMenuOpen(false);
    };

    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (sessionId && selectedChannel) {
      setIsLoading(true);
      if (useMockData) {
        const fakeMessages = fetchFakeMessages(selectedChannel);
        setMessages(fakeMessages);
        setIsLoading(false);
      } else {
        fetchMessages(sessionId, selectedChannel)
          .then((messagesData) => {
            setMessages(messagesData);
          })
          .catch((error) => {
            console.error("Error fetching messages:", error);
            setError("Failed to fetch messages. Please try again.");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [sessionId, selectedChannel]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      if (!isFullScreen) setIsMenuOpen(false);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Event handlers
  const handleLogin = async (inputToken) => {
    setIsLoading(true);
    setError("");

    if (useMockData) {
      setToken("MockTokenPlaceHolder");
      setSessionId("12345-abcdef-67890");
      setIsLoggedIn(true);
      setServerInfo({
        serverName: "Sample Discord Team",
        memberCount: 100,
        //iconURL: "https://via.placeholder.com/48",
      });
      setIsLoading(false);
      return "mock"; // Return special value for mock data
    }

    try {
      // Try auto-login first (uses backend token), then manual if inputToken provided
      const endpoint = inputToken ? 'api/auth/login' : 'api/auth/auto-login';
      const body = inputToken ? JSON.stringify({ token: inputToken }) : JSON.stringify({});
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      setToken(inputToken || 'backend-token'); // Don't expose actual token
      setSessionId(data.sessionId);
      setServerInfo({
        serverName: data.serverName,
        memberCount: data.memberCount,
        iconURL: data.iconURL,
      });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your token and try again.");
      setToken("");
      setSessionId("");
      setServerInfo(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (useMockData) {
      setIsLoggingOut(true);
      setIsTransitioning(true);
      setIsLoading(true);
      setTimeout(() => {
        setToken("");
        setSessionId("");
        setServerInfo(null);
        setCurrentView("MemberSense");
        setIsLoggedIn(false);
        setIsLoggingOut(false);
        setIsLoading(false);
        setIsTransitioning(false);
        setUseMockData(false);
      }, 300);
      return;
    }

    setIsLoggingOut(true);
    try {
      const response = await fetch(`${API_BASE_URL}api/auth/logout`, {
        method: "POST",
        headers: { Authorization: sessionId },
      });
      if (!response.ok) throw new Error("Logout failed");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setTimeout(() => {
        setToken("");
        setSessionId("");
        setServerInfo(null);
        setCurrentView("MemberSense");
        setIsLoggingOut(false);
      }, 300);
    }
  };

  const handleViewChange = (view) => {
    if (view === "Showcase" || view === "DiscordViewer") {
      // Show side panel for MemberSense features
      setSidePanelView(view);
      setCurrentView("FeedPlayer"); // Keep video player as main view
      
      // Load data if not already loaded
      if (sessionId && members.length === 0 && !useMockData) {
        setIsLoading(true);
        Promise.all([fetchMembers(sessionId), fetchChannels(sessionId)])
          .then(([membersData, channelsData]) => {
            setMembers(membersData);
            setChannels(channelsData);
            if (channelsData.length > 0 && !selectedChannel) {
              setSelectedChannel(channelsData[0].id);
            }
          })
          .catch((error) => {
            console.error("Error loading Discord data:", error);
            setError("Failed to load Discord data");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      // Normal view change
      setError("");
      setIsTransitioning(true);
      setIsLoading(true);
      setTimeout(() => {
        setCurrentView(view);
        setSidePanelView(null); // Close side panel
        setIsTransitioning(false);
        setTimeout(() => setIsLoading(false), 500);
      }, 300);
    }
  };

  const handleFullScreen = () => {
    if (!isFullScreen) {
      if (appRef.current.requestFullscreen) {
        appRef.current.requestFullscreen();
      } else if (appRef.current.webkitRequestFullscreen) {
        appRef.current.webkitRequestFullscreen();
      } else if (appRef.current.msRequestFullscreen) {
        appRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Render helpers
  const renderContent = () => {
    const commonProps = { isFullScreen };

    switch (currentView) {
      case "FeedPlayer":
        return (
          <div className="feedplayer-wrapper">
            {/* Page Container - shown when no list is specified */}
            {showPageView && (
              <div 
                className="page-container" 
                dangerouslySetInnerHTML={{ __html: pageContent }}
              />
            )}
            
            {/* FeedPlayer Container - shown when list is specified */}
            {!showPageView && (
              <div className="feedplayer-container">
                <VideoPlayer
                  autoplay={false}
                  isFullScreen={isFullScreen}
                  setIsFullScreen={setIsFullScreen}
                  handleFullScreen={handleFullScreen}
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  swiperData={swiperData}
                  setSwiperData={setSwiperData}
                  playerHashFromCache={true}
                />
              </div>
            )}
            
            {sidePanelView && !showPageView && (
              <div className={`membersense-side-panel ${sidePanelExpanded ? 'expanded' : ''}`}>
                <div className="side-panel-controls">
                  <button 
                    className="panel-control-btn pause-btn" 
                    onClick={() => {
                      const video = document.querySelector('video');
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                    title="Pause/Play Video"
                  >
                    ⏸️
                  </button>
                  <button 
                    className="panel-control-btn expand-btn" 
                    onClick={() => setSidePanelExpanded(!sidePanelExpanded)}
                    title={sidePanelExpanded ? "Collapse Panel" : "Expand Panel"}
                  >
                    {sidePanelExpanded ? '📐' : '📏'}
                  </button>
                  <button 
                    className="panel-control-btn close-btn" 
                    onClick={() => {
                      setSidePanelView(null);
                      setSidePanelExpanded(false);
                    }}
                    title="Close Panel"
                  >
                    ×
                  </button>
                </div>
                {sidePanelView === "Showcase" && (
                  <MemberShowcase 
                    token={token} 
                    members={members} 
                    isLoading={isLoading} 
                    {...commonProps} 
                  />
                )}
                {sidePanelView === "DiscordViewer" && (
                  <DiscordChannelViewer
                    channels={channels}
                    messages={messages}
                    selectedChannel={selectedChannel}
                    onChannelSelect={setSelectedChannel}
                    isLoading={isLoading}
                    {...commonProps}
                  />
                )}
              </div>
            )}
          </div>
        );
      case "MemberSense":
        return (
          <MemberSense
            onValidToken={handleLogin}
            initialToken={token}
            isLoading={isLoading}
            error={error}
            isLoggedIn={isLoggedIn}
            isLoggingOut={isLoggingOut}
            serverInfo={serverInfo}
            isFullScreen={isFullScreen}
            useMockData={useMockData}
            onToggleMockData={(value) => setUseMockData(value)}
            handleViewChange={handleViewChange}
            {...commonProps}
          />
        );
      case "Showcase":
        return <MemberShowcase token={token} members={members} isLoading={isLoading} {...commonProps} />;
      case "DiscordViewer":
        return (
          <DiscordChannelViewer
            channels={channels}
            messages={messages}
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
            isLoading={isLoading}
            {...commonProps}
          />
        );
      default:
        return <div>Select a view</div>;
    }
  };

  const memberSenseItems = [...(token ? memberSenseDropdownItems : [])];

  const mediaItems = [
    { id: "FeedPlayer", icon: Video, label: "Feed Player" },
    { id: "MemberSense", icon: Users, label: "MemberSense" },
    ...memberSenseItems,
  ];

  const getMenuStyles = () => {
    if (currentView === "FeedPlayer") return { top: "30px", right: "30px" };
    if (token) {
      if (currentView === "MemberSense") return { top: "50px", right: "50px" };
      if (currentView === "Showcase") return { top: "40px", right: "40px" };
      if (currentView === "DiscordViewer") return { top: "68px", right: "50px" };
    }
    if (currentView === "MemberSense") return { top: "50px", right: "50px" };
  };

  const renderNavItems = (items, excludeCurrentView = true) => {
    return items
      .filter((item) => !excludeCurrentView || item.id !== currentView)
      .map((item) => (
        <button
          key={item.id}
          onClick={() => {
            handleViewChange(item.id);
            if (isFullScreen) setIsMenuOpen(false);
          }}
          className={currentView === item.id ? "active" : ""}
          title={item.label}
        >
          <item.icon size={24} />
          <span>{item.label}</span>
        </button>
      ));
  };

  return (
    <ContextProvider>
      <div className={`App ${isFullScreen ? "fullscreen" : ""}`} ref={appRef}>
        {isFullScreen ? (
          <div className="fullscreen-nav" ref={menuOpenRef}>
            {!isMenuOpen && (
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-btn">
                <MoreHorizontal size={24} />
              </button>
            )}
            {isMenuOpen && (
              <div className="fullscreen-menu">
                {currentView === "FeedPlayer" && (
                  <div>
                    <button onClick={() => handleMenuClick("feeds")}>
                      <List size={24} />
                      <span>Choose Feeds</span>
                    </button>
                    <button onClick={() => handleMenuClick("url")}>
                      <Link size={24} />
                      <span>Paste Your Video URL</span>
                    </button>
                    <button onClick={() => setShowPageView(!showPageView)}>
                      <Video size={24} />
                      <span>{showPageView ? "View Player" : "View Page"}</span>
                    </button>
                  </div>
                )}
                {renderNavItems(mediaItems)}
                <button onClick={handleFullScreen} className="fullscreen-toggle">
                  <Minimize size={24} />
                  <span>Exit Fullscreen</span>
                </button>
                {token && (
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={24} />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="nav-menu">
            <div className="VideoPlayer__toggleMenu" ref={menuRef}>
              {!isMenu && (
                <button
                  className="popup-btn"
                  onClick={handlePopupClick}
                  title="Click to Toggle Options"
                  style={getMenuStyles()}
                >
                  <MoreHorizontal size={24} />
                </button>
              )}
              {isMenu && (
                <div className="menu-content">
                  <ul className="menu-list">
                    {currentView === "FeedPlayer" && (
                      <>
                        <li className="menu-item" onClick={() => handleMenuClick("feeds")}>
                          <List size={24} />
                          <span>Choose Feeds</span>
                        </li>
                        <li className="menu-item" onClick={() => handleMenuClick("url")}>
                          <Link size={24} />
                          <span>Paste Your Video URL</span>
                        </li>
                        <li className="menu-item" onClick={() => {
                          setShowPageView(!showPageView);
                          setIsMenu(false);
                        }}>
                          <Video size={24} />
                          <span>{showPageView ? "View Player" : "View Page"}</span>
                        </li>
                      </>
                    )}
                    <div className="video-nav">
                      {renderNavItems(mediaItems)}
                      <button onClick={handleFullScreen} className="fullscreen-toggle">
                        <Maximize size={24} />
                        <span>Fullscreen</span>
                      </button>
                      {token && (
                        <button onClick={handleLogout} className="logout-btn">
                          <LogOut size={24} />
                          <span>Logout</span>
                        </button>
                      )}
                    </div>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <p>{error}</p>
          </div>
        )}
        <main className={`app-content ${isTransitioning ? "fade-out" : "fade-in"}`}>{renderContent()}</main>
        {showMemberSenseOverlay && (
          <div className="membersense-overlay">
            <button 
              className="close-overlay-btn" 
              onClick={() => {
                setShowMemberSenseOverlay(false);
                // Remove members parameter while preserving other hash parameters
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                params.delete('members');
                const newHash = params.toString();
                if (newHash) {
                  window.location.hash = '#' + newHash;
                } else {
                  window.history.replaceState(null, null, window.location.pathname + window.location.search);
                }
              }}
            >
              ×
            </button>
            <div className="membersense-overlay-content">
              <MemberSense
                onValidToken={handleLogin}
                initialToken={token}
                isLoading={isLoading}
                error={error}
                isLoggedIn={isLoggedIn}
                isLoggingOut={isLoggingOut}
                serverInfo={serverInfo}
                isFullScreen={false}
                useMockData={useMockData}
                onToggleMockData={(value) => setUseMockData(value)}
                handleViewChange={handleViewChange}
              />
            </div>
          </div>
        )}
        {isPopup && (
          <div className="lightbox" onClick={() => setIsPopup(null)}>
            <button className="close-btn" onClick={() => setIsPopup(null)}>
              x
            </button>
            {swiperData.mediaType === "video" ? (
              <iframe className="lightboxImg" src={swiperData.url} alt="Enlarged Video" allowFullScreen />
            ) : (
              <img className="lightboxImg" src={swiperData.url} alt="Enlarged Image" />
            )}
          </div>
        )}
      </div>
    </ContextProvider>
  );
}

export default App;
