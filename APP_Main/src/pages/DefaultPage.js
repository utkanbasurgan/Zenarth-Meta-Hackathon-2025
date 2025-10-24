import React from 'react';

const DefaultPage = ({ pageTitle }) => {
  return (
    <div className="content-card">
      <h2>{pageTitle}</h2>
      <p>Select a section from the sidebar to view details.</p>
    </div>
  );
};

export default DefaultPage;
