import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Users, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import "./MemberPlayer.scss";

const MemberPlayer = ({
  channels = [],
  messages = [],
  members = [],
  selectedChannel = null,
  onChannelSelect,
  token = "",
  isFullScreen = false,
  viewMode = "full",
  onTitleChange,
  onDescriptionChange,
  isLoading = false,
}) => {
  const [activeView, setActiveView] = useState("channels"); // "channels", "members"
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  
  const ITEMS_PER_PAGE = 10;

  // Update parent with member info
  useEffect(() => {
    const channelName = channels.find(ch => ch.id === selectedChannel)?.name || "No Channel";
    if (onTitleChange) {
      onTitleChange(`Discord ${activeView === "members" ? "Members" : "Channel"}: ${activeView === "members" ? members.length : channelName}`);
    }
    if (onDescriptionChange) {
      onDescriptionChange(
        activeView === "members" 
          ? `Viewing ${members.length} Discord members` 
          : `Viewing messages from #${channelName}`
      );
    }
  }, [activeView, channels, selectedChannel, members.length, onTitleChange, onDescriptionChange]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter messages based on search
  const filteredMessages = messages.filter(message =>
    message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current data based on active view
  const getCurrentData = () => {
    return activeView === "members" ? filteredMembers : filteredMessages;
  };

  // Paginate current data
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const currentData = getCurrentData();
  const paginatedData = paginateData(currentData);
  const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);

  // Handle channel selection
  const handleChannelSelect = (channelId) => {
    if (onChannelSelect) {
      onChannelSelect(channelId);
    }
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  // Handle view switching
  const switchView = (view) => {
    setActiveView(view);
    setCurrentPage(1);
    setSearchTerm("");
  };

  // Render channel selector
  const renderChannelSelector = () => {
    const selectedChannelData = channels.find(ch => ch.id === selectedChannel);
    
    return (
      <div className="MemberPlayer__channel-selector" ref={dropdownRef}>
        <div
          className="channel-select-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <MessageCircle size={16} />
          <span>#{selectedChannelData?.name || "Select Channel"}</span>
          <ChevronDown size={16} className={isDropdownOpen ? "rotated" : ""} />
        </div>
        
        {isDropdownOpen && (
          <div className="channel-dropdown">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`channel-option ${selectedChannel === channel.id ? "selected" : ""}`}
                onClick={() => handleChannelSelect(channel.id)}
              >
                <MessageCircle size={14} />
                <span>#{channel.name}</span>
                {selectedChannel === channel.id && <span className="check">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render message item
  const renderMessage = (message, index) => (
    <div key={`${message.id || index}`} className="MemberPlayer__message-item">
      <div className="message-avatar">
        <img 
          src={message.author?.avatar || "/api/placeholder/32/32"} 
          alt={message.author?.username || "User"}
        />
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="username">{message.author?.username || "Unknown User"}</span>
          <span className="timestamp">
            {message.timestamp ? new Date(message.timestamp).toLocaleString() : "Unknown time"}
          </span>
        </div>
        <div className="message-text">
          {message.content || "No content available"}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment, idx) => (
              <div key={idx} className="attachment">
                📎 {attachment.filename || "Attachment"}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render member item
  const renderMember = (member, index) => (
    <div key={`${member.id || index}`} className="MemberPlayer__member-item">
      <div className="member-avatar">
        <img 
          src={member.avatar || "/api/placeholder/40/40"} 
          alt={member.username || "User"}
        />
      </div>
      <div className="member-info">
        <div className="member-name">{member.username || "Unknown User"}</div>
        <div className="member-role">{member.role || "Member"}</div>
        {member.email && (
          <div className="member-email">{member.email}</div>
        )}
      </div>
      <div className="member-status">
        <div className={`status-indicator ${member.status || "offline"}`}></div>
      </div>
    </div>
  );

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="MemberPlayer__pagination">
        <button 
          className="page-button prev"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          ←
        </button>
        
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        
        <button 
          className="page-button next"
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className={`MemberPlayer ${isFullScreen ? "fullscreen" : ""}`} ref={containerRef}>
      {/* Header with view switching */}
      <div className="MemberPlayer__header">
        <div className="view-switcher">
          <button
            className={`view-button ${activeView === "channels" ? "active" : ""}`}
            onClick={() => switchView("channels")}
          >
            <MessageCircle size={16} />
            <span>Channels ({messages.length})</span>
          </button>
          <button
            className={`view-button ${activeView === "members" ? "active" : ""}`}
            onClick={() => switchView("members")}
          >
            <Users size={16} />
            <span>Members ({members.length})</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder={`Search ${activeView === "members" ? "members" : "messages"}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Channel selector (only show for channel view) */}
      {activeView === "channels" && renderChannelSelector()}

      {/* Content area */}
      <div className="MemberPlayer__content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading {activeView === "members" ? "members" : "messages"}...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeView === "members" ? <Users size={48} /> : <MessageCircle size={48} />}
            </div>
            <h3>No {activeView === "members" ? "Members" : "Messages"} Found</h3>
            <p>
              {searchTerm 
                ? `No ${activeView} match your search criteria.`
                : `No ${activeView} available to display.`
              }
            </p>
          </div>
        ) : (
          <div className="content-list">
            {paginatedData.map((item, index) => 
              activeView === "members" 
                ? renderMember(item, index)
                : renderMessage(item, index)
            )}
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      <div className="MemberPlayer__footer">
        {renderPagination()}
      </div>
    </div>
  );
};

MemberPlayer.propTypes = {
  channels: PropTypes.array,
  messages: PropTypes.array,
  members: PropTypes.array,
  selectedChannel: PropTypes.string,
  onChannelSelect: PropTypes.func,
  token: PropTypes.string,
  isFullScreen: PropTypes.bool,
  viewMode: PropTypes.string,
  onTitleChange: PropTypes.func,
  onDescriptionChange: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default MemberPlayer;