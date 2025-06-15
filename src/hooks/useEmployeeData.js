import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to fetch and cache employee salary data using React Query
 * @returns {Object} Query result containing data, loading state, and error
 */
export const useEmployeeData = () => {
  const { token } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Function to fetch employee data
  const fetchEmployeeData = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.get(`${API_URL}/employee/salary`, config);
    return response.data;
  };

  // Use React Query to fetch and cache data
  return useQuery({
    queryKey: ['employeeData'],
    queryFn: fetchEmployeeData,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Cache will be considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000, 
    // Data will be kept in cache for 30 minutes even when unused
    gcTime: 30 * 60 * 1000, // Note: cacheTime was renamed to gcTime in v5
    // Don't fetch data if there's no token
    enabled: !!token,
  });
};
