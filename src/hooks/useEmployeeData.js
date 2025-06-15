import { useQuery } from '@tanstack/react-query';
import { salaryService } from '../services/api';

// Custom hook to fetch and cache employee data (salary results)
export function useEmployeeData(file, totalDays, enabled) {
  return useQuery({
    queryKey: ['employeeData', file, totalDays],
    queryFn: async () => {
      // Only fetch if file is provided
      if (!file) return null;
      return await salaryService.processSalary(file, totalDays);
    },
    enabled: enabled && !!file, // Only run if enabled and file is present
    staleTime: 5 * 60 * 1000,    // 5 minutes
    cacheTime: 30 * 60 * 1000,   // 30 minutes
    retry: 1,
  });
}
