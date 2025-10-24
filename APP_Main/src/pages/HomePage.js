import React, { useState } from 'react';
import { geminiApi } from '../services/geminiApi';

const HomePage = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const parsedData = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Simple CSV parsing - handles basic cases
        const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
        parsedData.push(values);
      }
    }
    
    return parsedData;
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const parsedData = parseCSV(text);
        
        if (parsedData.length > 0) {
          setHeaders(parsedData[0]);
          setCsvData(parsedData.slice(1));
          setFilteredData([]);
          
          // Generate quick actions based on CSV structure
          await generateQuickActions(parsedData[0], parsedData.slice(1));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = handleFileSelect;
    input.click();
  };

  const generateQuickActions = async (headers, data) => {
    setIsGeneratingActions(true);
    try {
      const actions = await geminiApi.generateQuickActions(headers, data);
      setQuickActions(actions);
    } catch (error) {
      console.error('Error generating quick actions:', error);
      // Use default actions if API fails
      setQuickActions(geminiApi.getDefaultQuickActions());
    } finally {
      setIsGeneratingActions(false);
    }
  };

  const handleQuickAction = (action) => {
    let result = [];
    
    switch (action.action) {
      case 'sort_asc':
        result = [...csvData].sort((a, b) => {
          const firstValue = a[0] || '';
          const secondValue = b[0] || '';
          return firstValue.toString().localeCompare(secondValue.toString());
        });
        break;
        
      case 'sort_desc':
        result = [...csvData].sort((a, b) => {
          const firstValue = a[0] || '';
          const secondValue = b[0] || '';
          return secondValue.toString().localeCompare(firstValue.toString());
        });
        break;
        
      case 'top_10':
        result = csvData.slice(0, 10);
        break;
        
      case 'bottom_10':
        result = csvData.slice(-10);
        break;
        
      case 'remove_empty':
        result = csvData.filter(row => row.some(cell => cell && cell.trim() !== ''));
        break;
        
      case 'find_duplicates':
        const seen = new Set();
        const duplicates = [];
        csvData.forEach((row, index) => {
          const rowKey = row.join('|');
          if (seen.has(rowKey)) {
            duplicates.push(row);
          } else {
            seen.add(rowKey);
          }
        });
        result = duplicates;
        break;
        
      case 'export_csv':
        exportToCSV();
        return;
        
      case 'reset_view':
        setFilteredData([]);
        return;
        
      default:
        // Try to find a column that matches the action
        const columnIndex = headers.findIndex(header => 
          header.toLowerCase().includes(action.action.toLowerCase()) ||
          action.action.toLowerCase().includes(header.toLowerCase())
        );
        
        if (columnIndex !== -1) {
          // Sort by the found column
          result = [...csvData].sort((a, b) => {
            const aVal = a[columnIndex] || '';
            const bVal = b[columnIndex] || '';
            return aVal.toString().localeCompare(bVal.toString());
          });
        } else {
          result = csvData;
        }
    }
    
    setFilteredData(result);
  };

  const exportToCSV = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : csvData;
    const csvContent = [headers, ...dataToExport]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.csv', '')}_exported.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) {
      setAiError('Please enter a search query first!');
      return;
    }

    if (csvData.length === 0) {
      setAiError('Please upload a CSV file first!');
      return;
    }

    setIsAiLoading(true);
    setAiError('');

    try {
      const generatedCode = await geminiApi.generateFilterCode(
        aiSearchQuery, 
        headers, 
        csvData
      );

      // Execute the generated code
      const filterFunction = new Function('csvData', 'headers', `
        ${generatedCode}
      `);

      const result = filterFunction(csvData, headers);
      
      if (result && Array.isArray(result)) {
        setFilteredData(result);
        setAiError('');
      } else if (result && result.error) {
        setAiError(result.error);
      } else {
        setFilteredData([]);
        setAiError('No results found for your query.');
      }

    } catch (error) {
      console.error('AI Search Error:', error);
      setAiError(`AI Search failed: ${error.message}`);
      setFilteredData([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="content-card">
      <h2>Welcome to Zenarth</h2>
      <p>Your modern dashboard for managing everything in one place.</p>
      <button 
        className="upload-button"
        onClick={handleFileUpload}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <i className="fas fa-file-csv"></i>
        Upload CSV
      </button>

      {csvData.length > 0 && (
        <>
          {/* AI Search Section */}
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-robot" style={{ color: '#667eea' }}></i>
              AI Data Assistant
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Find me the best one"
                value={aiSearchQuery}
                onChange={(e) => setAiSearchQuery(e.target.value)}
                disabled={isAiLoading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  opacity: isAiLoading ? 0.7 : 1
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#dee2e6';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isAiLoading) {
                    handleAiSearch();
                  }
                }}
              />
              <button
                onClick={handleAiSearch}
                disabled={isAiLoading}
                style={{
                  padding: '12px 20px',
                  background: isAiLoading 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isAiLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: isAiLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAiLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                {aiError}
              </div>
            )}
          </div>

          {/* Action Buttons Section */}
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Quick Actions
              {isGeneratingActions && (
                <i className="fas fa-spinner fa-spin" style={{ color: '#667eea', fontSize: '14px' }}></i>
              )}
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '10px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#667eea #f1f1f1'
            }}>
              {isGeneratingActions ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  <i className="fas fa-robot" style={{ marginRight: '8px' }}></i>
                  AI is generating smart actions for your data...
                </div>
              ) : (
                quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    title={action.description}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'white',
                      color: '#667eea',
                      border: '2px solid #667eea',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      minWidth: 'fit-content',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#667eea';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <i className={action.icon}></i>
                    {action.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {csvData.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#333', margin: 0 }}>
              {filteredData.length > 0 ? 'AI Filtered Results' : 'CSV Data'}: {fileName}
              {filteredData.length > 0 && (
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'normal', 
                  color: '#666',
                  marginLeft: '10px'
                }}>
                  (Showing {filteredData.length} of {csvData.length} rows)
                </span>
              )}
            </h3>
            {filteredData.length > 0 && (
              <button
                onClick={() => setFilteredData([])}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                }}
              >
                <i className="fas fa-times"></i>
                Clear Filter
              </button>
            )}
          </div>
          <div style={{ 
            overflowX: 'auto', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {headers.map((header, index) => (
                    <th key={index} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '14px'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filteredData.length > 0 ? filteredData : csvData).map((row, rowIndex) => (
                  <tr key={rowIndex} style={{
                    borderBottom: '1px solid #dee2e6',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#555',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ 
            marginTop: '10px', 
            fontSize: '12px', 
            color: '#666',
            fontStyle: 'italic'
          }}>
            Showing {filteredData.length > 0 ? filteredData.length : csvData.length} rows with {headers.length} columns
            {filteredData.length > 0 && (
              <span style={{ marginLeft: '10px', color: '#667eea' }}>
                (Filtered by AI)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
