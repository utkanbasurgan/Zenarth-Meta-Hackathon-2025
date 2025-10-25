// API Service to simulate API calls with success and failure scenarios
import { logApiError } from './serverLogger';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for successful responses
const mockData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0124' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1-555-0125' }
  ],
  posts: [
    { id: 1, title: 'Welcome to Our Platform', body: 'This is a sample post content...' },
    { id: 2, title: 'Getting Started Guide', body: 'Here are some tips to get you started...' },
    { id: 3, title: 'Best Practices', body: 'Follow these best practices for optimal results...' }
  ]
};

// Successful API call simulation
export const successfulApiCall = async () => {
  try {
    // Simulate network delay
    await delay(1500);
    
    // Simulate successful API response
    const response = {
      success: true,
      data: mockData,
      message: 'Data loaded successfully',
      timestamp: new Date().toISOString()
    };
    
    return response;
  } catch (error) {
    throw new Error('Unexpected error in successful API call');
  }
};

// Random API endpoints that will fail
const randomFailedEndpoints = [
  'https://api.example.com/users',
  'https://jsonplaceholder.typicode.com/posts/invalid',
  'https://httpstat.us/500',
  'https://httpstat.us/404',
  'https://httpstat.us/503',
  'https://api.github.com/invalid-endpoint',
  'https://reqres.in/api/unknown/23',
  'https://api.openweathermap.org/data/2.5/weather?q=invalidcity',
  'https://api.coingecko.com/api/v3/invalid-endpoint',
  'https://api.themoviedb.org/3/movie/invalid'
];

// Failed API call simulation with random endpoint mismatch
export const failedApiCall = async () => {
  let randomEndpoint = '';
  
  try {
    // Simulate network delay
    await delay(1500);
    
    // Pick a random failed endpoint
    randomEndpoint = randomFailedEndpoints[Math.floor(Math.random() * randomFailedEndpoints.length)];
    
    // Attempt to make the API call to the invalid endpoint
    const response = await fetch(randomEndpoint);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} - Failed to fetch from ${randomEndpoint}`);
    }
    
    // This should not be reached, but just in case
    const data = await response.json();
    return data;
    
  } catch (error) {
    // Log the detailed error using the logger service
    const endpoint = error.message.includes('Failed to fetch from') ? 
      error.message.split('Failed to fetch from ')[1] : randomEndpoint;
    
    logApiError(error, endpoint);
    
    // Throw the error with more context
    throw new Error(`API Address Mismatch: ${error.message}`);
  }
};

// Real API call to JSONPlaceholder (for demonstration)
export const realApiCall = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      success: true,
      data: data.slice(0, 3), // Limit to 3 users
      message: 'Real API data loaded successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Real API Error: ${error.message}`);
  }
};
