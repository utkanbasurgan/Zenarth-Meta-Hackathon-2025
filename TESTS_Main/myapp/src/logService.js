// API service for writing to log file
const API_BASE_URL = 'http://localhost:3004/api';

export const writeToLogFile = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/write-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('API Response:', result);
      return true;
    } else {
      const error = await response.json();
      console.error('API Error:', error);
      return false;
    }
  } catch (error) {
    console.error('Network error calling API:', error);
    return false;
  }
};

// Function to write "Deneme!" to log file via API
export const writeDenemeToLog = async () => {
  console.log('Calling API to write "Deneme!" to log file...');
  const success = await writeToLogFile('Deneme!');
  
  if (success) {
    console.log('✅ Deneme! written to log file successfully via API');
  } else {
    console.log('❌ Failed to write Deneme! to log file via API');
  }
  
  return success;
};

// Function to read the log file via API
export const readLogFile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/read-log`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Log file content:', result.content);
      return result.content;
    } else {
      console.error('Failed to read log file');
      return null;
    }
  } catch (error) {
    console.error('Error reading log file:', error);
    return null;
  }
};

// Function to log errors to the file via API
export const logError = async (error) => {
  try {
    const errorMessage = `ERROR: ${error.message} - ${error.stack}`;
    console.log('Logging error to file:', errorMessage);
    
    const success = await writeToLogFile(errorMessage);
    
    if (success) {
      console.log('✅ Error logged to file successfully');
    } else {
      console.log('❌ Failed to log error to file');
    }
    
    return success;
  } catch (logError) {
    console.error('Failed to log error:', logError);
    return false;
  }
};

