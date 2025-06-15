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
    try {
      console.log('Attempting to fetch employee salary data');
      // Try the /salary/employees endpoint instead - the API likely uses this path
      const response = await api.get('/salary/employees');
      console.log('Employee data fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee data:', error.response?.status, error.message);
      // If we get a 404, try the alternative endpoint
      if (error.response?.status === 404) {
        console.log('Trying alternative endpoint /employee/salary');
        try {
          const altResponse = await api.get('/employee/salary');
          console.log('Alternative endpoint successful');
          return altResponse.data;
        } catch (altError) {
          console.error('Alternative endpoint also failed');
          throw altError;
        }
      }
      throw error;
    }
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
