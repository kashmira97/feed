import React from "react";
import PropTypes from "prop-types";

// This component acts as a wrapper for the full view mode
// It will render the appropriate sub-player content directly
const SharedFullView = ({ children, ...props }) => {
  return (
    <div className="SharedFullView">
      {children}
    </div>
  );
};

SharedFullView.propTypes = {
  children: PropTypes.node,
};

export default SharedFullView;