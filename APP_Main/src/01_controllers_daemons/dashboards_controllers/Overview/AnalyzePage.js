import React from 'react';

const AnalyzePage = ({
  csvData,
  headers,
  fileName,
  aiSearchQuery,
  setAiSearchQuery,
  isAiLoading,
  aiError,
  filteredData,
  quickActions,
  isGeneratingActions,
  handleFileUpload,
  handleAiSearch,
  handleQuickAction,
  setFilteredData
}) => {
  return (
    <div className="analyze-section">
      <div className="analyze-header">
        <h2>Data Analysis</h2>
        <p>Upload your CSV files and analyze with AI</p>
      </div>

      <div className="analyze-content">
        <div className="upload-section">
          <button 
            className="upload-button"
            onClick={handleFileUpload}
          >
            <i className="fas fa-file-csv"></i>
            Upload CSV File
          </button>
          {fileName && (
            <div className="file-info">
              <i className="fas fa-file"></i>
              <span>{fileName}</span>
            </div>
          )}
        </div>

        {csvData.length > 0 && (
          <>
            {/* AI Search Section */}
            <div className="ai-search-section">
              <h3>
                <i className="fas fa-robot"></i>
                AI Data Assistant
              </h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Find the best"
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  disabled={isAiLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isAiLoading) {
                      handleAiSearch();
                    }
                  }}
                />
                <button
                  onClick={handleAiSearch}
                  disabled={isAiLoading}
                  className="search-btn"
                >
                  {isAiLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Search
                    </>
                  )}
                </button>
              </div>
              
              {aiError && (
                <div className="error-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  {aiError}
                </div>
              )}
            </div>

            {/* Quick Actions Section */}
            <div className="quick-actions-section">
              <h3>
                Quick Actions
                {isGeneratingActions && (
                  <i className="fas fa-spinner fa-spin"></i>
                )}
              </h3>
              <div className="actions-container">
                {isGeneratingActions ? (
                  <div className="loading-actions">
                    <i className="fas fa-robot"></i>
                    Creating smart actions for your data...
                  </div>
                ) : (
                  quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      title={action.description}
                      className="action-btn"
                    >
                      <i className={action.icon}></i>
                      {action.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Data Table Section */}
            <div className="data-table-section">
              <div className="table-header">
                <h3>
                  {filteredData.length > 0 ? 'AI Filtered Results' : 'CSV Data'}: {fileName}
                  {filteredData.length > 0 && (
                    <span className="result-count">
                      ({filteredData.length} / {csvData.length} rows)
                    </span>
                  )}
                </h3>
                {filteredData.length > 0 && (
                  <button
                    onClick={() => setFilteredData([])}
                    className="clear-filter-btn"
                  >
                    <i className="fas fa-times"></i>
                    Clear Filter
                  </button>
                )}
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredData.length > 0 ? filteredData : csvData).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="table-footer">
                <p>
                  Showing {filteredData.length > 0 ? filteredData.length : csvData.length} rows, {headers.length} columns
                  {filteredData.length > 0 && (
                    <span className="filtered-indicator">
                      (filtered by AI)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
