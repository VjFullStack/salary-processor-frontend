import axios from 'axios';

// Define base URL for API endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://salary-processor-backend.onrender.com/api';

// Remove duplicate /api if it exists
const normalizedBaseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

// Create axios instance with default config
export const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token for all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - URL:', config.url);
    console.log('Token exists:', !!token);
    
    if (token) {
      // Add token to headers
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 15)}...`);
    } else {
      console.warn('No token found in localStorage for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// Salary processing services
export const salaryService = {
  // Process salary data and get JSON results
  processSalary: async (file, totalDays) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // If totalDays is provided, include it in the URL
    let url = '/salary/process';
    if (totalDays) {
      url = `/salary/process?totalDays=${totalDays}`;
    }
    
    console.log('Processing salary with URL:', url);
    console.log('Total days:', totalDays);
    
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Salary processing API response:', response.data);
    
    // Helper function to map employee data with field name fallbacks
    const mapEmployeeData = (employee) => ({
      employeeId: employee.employeeId || employee.id || '',
      employeeName: employee.employeeName || employee.name || '',
      monthlySalary: employee.monthlySalary || employee.salary || 0,
      actualWorkedHours: employee.actualWorkedHours || employee.workedHours || 0,
      coefficient: employee.coefficient || employee.attendanceCoefficient || 0,
      lateMarks: employee.lateMarks || employee.lateCount || 0,
      finalPayableSalary: employee.finalPayableSalary || employee.finalSalary || 0
    });
    
    // Handle different API response formats
    let employeeArray = null;
    
    // Case 1: API returns array directly
    if (response.data && Array.isArray(response.data)) {
      employeeArray = response.data;
    }
    // Case 2: API returns object with employeeResults property
    else if (response.data && response.data.employeeResults && Array.isArray(response.data.employeeResults)) {
      employeeArray = response.data.employeeResults;
    }
    
    // If we found an array in either format, map it
    if (employeeArray) {
      return employeeArray.map(mapEmployeeData);
    }
    
    // Fallback
    return response.data;
  },
  
  // Set the total working days
  setTotalWorkingDays: async (days) => {
    const response = await api.post(`/salary/set-total-days?days=${days}`);
    return response.data;
  },
  
  // Get the current total working days
  getTotalWorkingDays: async () => {
    const response = await api.get('/salary/total-days');
    return response.data;
  },
  
  // Generate PDF for a specific employee
  generatePdf: async (employeeId) => {
    const response = await api.get(`/salary/pdf/${employeeId}`, {
      responseType: 'blob', // Important for handling binary data
    });
    return response;
  },
  
  // Generate and download PDF salary slips in bulk
  generatePDFs: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/salary/generate-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // Important for handling binary data
    });
    
    // Create a download link for the ZIP file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'salary_slips.zip';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  // Process salary and get both JSON results and PDF data
  processSalaryWithPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/salary/process-with-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Generate and download PDF salary slips in bulk (combines all in one PDF)
  generateBulkPdf: async () => {
    const response = await api.get('/salary/bulk-pdf', {
      responseType: 'blob', // Important for handling binary data
    });
    return response;
  },
};
