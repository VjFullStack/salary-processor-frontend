import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

/**
 * Custom hook to fetch and cache employee salary data using React Query
 * @returns {Object} Query result containing data, loading state, and error
 */
export const useEmployeeData = () => {
  const { token } = useAuth();

  // Function to fetch employee data
  const fetchEmployeeData = async () => {
    // The api instance already handles authorization headers via interceptors
    const response = await api.get('/employee/salary');
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
