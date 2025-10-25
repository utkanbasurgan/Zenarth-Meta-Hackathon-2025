import React, { useState, useEffect } from 'react';
import { generateSimpleChart, generateCSVDirectSort } from '../../../02_softwares_daemons/aiService';

const FileDisplay = ({ fileId }) => {
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Project2-like states
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [sortedData, setSortedData] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Enhanced sorting states
  const [sortQuery, setSortQuery] = useState('');
  const [sortOutput, setSortOutput] = useState('');
  const [sortLoading, setSortLoading] = useState(false);
  
  // Chart states
  const [showCharts, setShowCharts] = useState(false);
  const [chartType, setChartType] = useState('scatter');
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [chartConfig, setChartConfig] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    // Load file data from localStorage
    const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    const file = storedFiles.find(f => f.id.toString() === fileId);
    
    if (file) {
      setFileData(file);
      // Set Project2-like data
      setCsvData(file.data);
      setHeaders(file.headers);
      setFileName(file.name);
    } else {
      setError('File not found');
    }
    setLoading(false);
  }, [fileId]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSortCSV = () => {
    if (!csvData || csvData.length === 0) return;
    
    // Sort by first column in descending order
    const sorted = [...csvData].sort((a, b) => {
      const firstColA = a[0];
      const firstColB = b[0];
      
      // Try to parse as numbers first, then compare as strings
      const numA = parseFloat(firstColA);
      const numB = parseFloat(firstColB);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA; // Descending order for numbers
      }
      
      // String comparison for non-numeric values
      return firstColB.localeCompare(firstColA);
    });
    
    setSortedData(sorted);
    setIsPreviewMode(true);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim().toLowerCase() === 'send' && csvData) {
      handleSortCSV();
      setChatInput('');
    }
  };

  const runEnhancedSort = async () => {
    if (!csvData || !sortQuery.trim()) {
      setSortOutput('Error: Please enter a sorting query');
      return;
    }

    setSortLoading(true);
    setSortOutput(''); // Clear previous output
    
    try {
      const columns = headers.join(', ');
      const sampleRow = csvData[0] ? csvData[0].join(', ') : '';
      
      // Get sorting configuration from AI
      const sortConfig = await generateCSVDirectSort({
        columns,
        sampleRow,
        query: sortQuery
      });
      
      // Apply the sorting directly to the CSV data
      const sortedData = applySortingToCSV(csvData, sortConfig);
      
      // Update the displayed data
      setCsvData(sortedData);
      setSortedData(sortedData);
      setIsPreviewMode(true);
      
      setSortOutput(`✅ ${sortConfig.description}\n\nSorted ${sortedData.length} rows successfully!`);
    } catch (error) {
      console.error('Error running enhanced sort:', error);
      setSortOutput(`Error: Could not sort CSV data - ${error.message}`);
    } finally {
      setSortLoading(false);
    }
  };

  // Function to apply sorting configuration to CSV data
  const applySortingToCSV = (data, config) => {
    if (!data || data.length === 0) return data;
    
    let result = [...data];
    
    // Apply filter if specified
    if (config.filterColumn !== null && config.filterValue) {
      result = result.filter(row => {
        const cellValue = (row[config.filterColumn] || '').toString().toLowerCase();
        return cellValue.includes(config.filterValue.toLowerCase());
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[config.sortColumn] || '';
      const bVal = b[config.sortColumn] || '';
      
      let comparison = 0;
      
      switch (config.sortType) {
        case 'string_length':
          comparison = (aVal.toString().length) - (bVal.toString().length);
          break;
        case 'number':
          const aNum = parseFloat(aVal) || 0;
          const bNum = parseFloat(bVal) || 0;
          comparison = aNum - bNum;
          break;
        case 'date':
          const aDate = new Date(aVal);
          const bDate = new Date(bVal);
          comparison = aDate - bDate;
          break;
        default: // string
          comparison = aVal.toString().localeCompare(bVal.toString());
      }
      
      return config.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    // Apply limit if specified
    if (config.limit && config.limit > 0) {
      result = result.slice(0, config.limit);
    }
    
    return result;
  };

  // Chart generation function
  const generateChart = async () => {
    if (!csvData || !xColumn || !yColumn) {
      alert('Please select both X and Y columns for the chart');
      return;
    }

    setChartLoading(true);
    setChartConfig(null);
    
    try {
      const config = await generateSimpleChart({
        data: csvData,
        headers: headers,
        chartType: chartType,
        xColumn: xColumn,
        yColumn: yColumn
      });
      
      setChartConfig(config);
    } catch (error) {
      console.error('Error generating chart:', error);
      alert(`Error generating chart: ${error.message}`);
    } finally {
      setChartLoading(false);
    }
  };

  // Simple chart rendering function
  const renderChart = (config) => {
    if (!config || !config.dataPoints) return null;

    const maxX = Math.max(...config.dataPoints.map(p => p.x));
    const maxY = Math.max(...config.dataPoints.map(p => p.y));
    const minX = Math.min(...config.dataPoints.map(p => p.x));
    const minY = Math.min(...config.dataPoints.map(p => p.y));

    const width = 400;
    const height = 300;
    const padding = 40;

    return (
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <h4 style={{ color: '#1f1e7a', marginBottom: '15px' }}>{config.title}</h4>
        <svg width={width} height={height} style={{ border: '1px solid #e1e5e9', borderRadius: '8px' }}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Axes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="2"/>
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="2"/>
          
          {/* Data points */}
          {config.dataPoints.map((point, index) => {
            const x = padding + ((point.x - minX) / (maxX - minX)) * (width - 2 * padding);
            const y = height - padding - ((point.y - minY) / (maxY - minY)) * (height - 2 * padding);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={config.color || "#1f1e7a"}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Labels */}
          <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="12" fill="#666">
            {config.xLabel}
          </text>
          <text x={15} y={height / 2} textAnchor="middle" fontSize="12" fill="#666" transform={`rotate(-90, 15, ${height / 2})`}>
            {config.yLabel}
          </text>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="file-display">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="file-display">
        <div className="error-container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>File Not Found</h3>
          <p>The requested file could not be found or may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-display">
      <div className="file-header">
        <div className="file-info">
          <div className="file-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div className="file-details">
            <h1>{fileData.name}</h1>
            <div className="file-meta">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {formatDate(fileData.uploadDate)}
              </span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                {formatFileSize(fileData.size)}
              </span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                {fileData.rowCount} rows × {fileData.headers.length} columns
              </span>
            </div>
          </div>
        </div>
      </div>

      {!csvData ? (
        <div className="content-placeholder">
          <div className="placeholder-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>No Data Available</h3>
          <p>This file appears to be empty or corrupted</p>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="chart-section" style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#1f1e7a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Easy Plot Examples
              </h3>
              <button 
                onClick={() => setShowCharts(!showCharts)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: showCharts ? '#1f1e7a' : '#f8f9fa',
                  color: showCharts ? 'white' : '#1f1e7a',
                  border: '1px solid #e1e5e9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {showCharts ? 'Hide Charts' : 'Show Charts'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showCharts ? (
                    <path d="M18 15l-6-6-6 6"></path>
                  ) : (
                    <path d="M6 9l6 6 6-6"></path>
                  )}
                </svg>
              </button>
            </div>

            {showCharts && (
              <div className="chart-controls" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Chart Type:</label>
                    <select 
                      value={chartType} 
                      onChange={(e) => setChartType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="scatter">Scatter Plot</option>
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>X-Axis Column:</label>
                    <select 
                      value={xColumn} 
                      onChange={(e) => setXColumn(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select X Column</option>
                      {headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Y-Axis Column:</label>
                    <select 
                      value={yColumn} 
                      onChange={(e) => setYColumn(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select Y Column</option>
                      {headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={generateChart}
                  disabled={!xColumn || !yColumn || chartLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: (!xColumn || !yColumn || chartLoading) ? '#ccc' : '#1f1e7a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (!xColumn || !yColumn || chartLoading) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {chartLoading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                      Generating Chart...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </svg>
                      Generate Chart
                    </>
                  )}
                </button>
              </div>
            )}

            {chartConfig && renderChart(chartConfig)}
          </div>

          <div className="table-container">
          <div className="table-header">
            <h3>{fileName}</h3>
            <button onClick={() => { 
              setCsvData(null); 
              setFileName(''); 
              setSortedData(null);
              setIsPreviewMode(false);
            }} className="clear-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(isPreviewMode && sortedData ? sortedData : csvData).map((row, rowIndex) => (
                  <tr key={rowIndex} className={isPreviewMode ? 'preview-row' : ''}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Floating Chat Input */}
      <div className="floating-chat-container">
        <div className="floating-chat">
          <div className="chat-header">
            <div className="chat-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              CSV Sorter
            </div>
            {isPreviewMode && (
              <div className="preview-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                Preview Mode
              </div>
            )}
          </div>
          <div className="enhanced-sort-form">
            <div className="sort-input-container">
              <input
                type="text"
                value={sortQuery}
                onChange={(e) => setSortQuery(e.target.value)}
                placeholder="e.g., Sort by longest name, Top 5 by value, Sort by date"
                className="sort-input"
                disabled={!csvData}
              />
              <button 
                onClick={runEnhancedSort}
                className="sort-button"
                disabled={!csvData || !sortQuery.trim() || sortLoading}
              >
                {sortLoading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M7 12h10M10 18h4"/>
                  </svg>
                )}
              </button>
            </div>
            {!csvData && (
              <div className="sort-hint">
                Upload a CSV file to enable AI sorting
              </div>
            )}
            {csvData && (
              <div className="sort-examples">
                <p><strong>Try:</strong> "Sort by longest name", "Top 5 by value", "Sort by date"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Sort Output */}
      {sortOutput && (
        <div className="sort-output-container">
          <div className="sort-output">
            <h4>Generated Python Code:</h4>
            <pre className="sort-code-output">{sortOutput}</pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .file-display {
          padding: 2rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
        }
        
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: white;
          border-radius: 16px;
          text-align: center;
          padding: 3rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1f1e7a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-icon {
          color: #dc3545;
          margin-bottom: 1rem;
        }
        
        .error-container h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .error-container p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }
        
        .file-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }
        
        .file-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }
        
        .file-icon {
          color: #1f1e7a;
          display: flex;
          align-items: center;
          margin-top: 0.25rem;
        }
        
        .file-details h1 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: 700;
          word-break: break-word;
        }
        
        .file-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        
        .content-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: white;
          border-radius: 16px;
          border: 2px dashed rgba(31, 30, 122, 0.2);
          text-align: center;
          padding: 3rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .placeholder-icon {
          color: #1f1e7a;
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }
        
        .content-placeholder h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .content-placeholder p {
          margin: 0;
          color: #666;
          font-size: 1rem;
          max-width: 400px;
          line-height: 1.6;
        }
        
        .table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(31, 30, 122, 0.05);
          border-bottom: 2px solid rgba(31, 30, 122, 0.1);
        }
        
        .table-header h3 {
          margin: 0;
          color: #1f1e7a;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .clear-button {
          padding: 0.625rem 1.25rem;
          background: white;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .clear-button:hover {
          background: #f5f5f5;
          border-color: #999;
          color: #333;
          transform: translateY(-1px);
        }
        
        .clear-button:active {
          transform: translateY(0);
        }
        
        .table-wrapper {
          overflow-x: auto;
          max-height: 600px;
          overflow-y: auto;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
        
        .data-table thead {
          background: #1f1e7a;
          color: white;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .data-table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .data-table tbody tr {
          border-bottom: 1px solid #eee;
          transition: all 0.2s ease;
        }
        
        .data-table tbody tr:hover {
          background: rgba(31, 30, 122, 0.04);
          transform: scale(1.001);
        }
        
        .data-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .data-table td {
          padding: 1rem 1.5rem;
          color: #333;
          font-size: 0.95rem;
          white-space: nowrap;
        }
        
        .table-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .table-wrapper::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .table-wrapper::-webkit-scrollbar-thumb {
          background: #1f1e7a;
          border-radius: 4px;
        }
        
        .table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #16155a;
        }

        /* Floating Chat Styles */
        .floating-chat-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          width: 100%;
          max-width: 400px;
          padding: 0;
        }

        .floating-chat {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(31, 30, 122, 0.1);
          backdrop-filter: blur(10px);
          overflow: hidden;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 100%;
        }

        .floating-chat:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #1f1e7a 0%, #2a2885 100%);
          color: white;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .preview-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .chat-form {
          padding: 1.5rem;
        }

        .sort-input-container {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .sort-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #fafbfc;
        }

        .sort-input:focus {
          outline: none;
          border-color: #1f1e7a;
          background: white;
          box-shadow: 0 0 0 3px rgba(31, 30, 122, 0.1);
        }

        .sort-input:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .sort-button {
          padding: 0.875rem;
          background: #1f1e7a;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          height: 48px;
        }

        .sort-button:hover:not(:disabled) {
          background: #16155a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }

        .sort-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .sort-examples {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 6px;
          font-size: 0.8rem;
          color: #666;
        }

        .sort-examples p {
          margin: 0;
        }

        .sort-output-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          max-width: 500px;
          max-height: 400px;
          z-index: 1000;
        }

        .sort-output {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          padding: 1.5rem;
          border: 1px solid #e1e5e9;
        }

        .sort-output h4 {
          margin: 0 0 1rem 0;
          color: #1f1e7a;
          font-size: 1rem;
          font-weight: 600;
        }

        .sort-code-output {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.4;
          max-height: 300px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .sort-hint {
          margin-top: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 8px;
          color: #666;
          font-size: 0.85rem;
          text-align: center;
          border: 1px dashed rgba(31, 30, 122, 0.2);
        }

        /* Preview Mode Styles */
        .preview-row {
          background: linear-gradient(90deg, rgba(31, 30, 122, 0.05) 0%, rgba(31, 30, 122, 0.02) 100%);
          border-left: 3px solid #1f1e7a;
        }

        .preview-row:hover {
          background: linear-gradient(90deg, rgba(31, 30, 122, 0.08) 0%, rgba(31, 30, 122, 0.04) 100%);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .floating-chat-container {
            bottom: 1rem;
            padding: 0 0.5rem;
          }
          
          .chat-header {
            padding: 0.75rem 1rem;
          }
          
          .chat-form {
            padding: 1rem;
          }
          
          .chat-input {
            font-size: 0.9rem;
            padding: 0.75rem 1rem;
          }
          
          .file-header {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .file-meta {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FileDisplay;
