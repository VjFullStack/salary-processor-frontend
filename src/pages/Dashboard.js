import React, { useState, useRef, useEffect } from 'react';
import { useEmployeeData } from '../hooks/useEmployeeData';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Container,
  Divider,
  Chip,
  Tooltip,
  Fade,
  Zoom,
  // useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { salaryService } from '../services/api';
import { isDemoMode } from '../context/AuthContext';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: 'calc(100vh - 64px)',
  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
  padding: theme.spacing(3),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const MetricCard = styled(StyledCard)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette[color].light} 0%, ${theme.palette[color].main} 100%)`,
  color: 'white',
}));

const UploadCard = styled(StyledCard)(({ theme }) => ({
  background: 'white',
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '30%',
    height: '30%',
    background: 'linear-gradient(135deg, transparent 0%, rgba(25, 118, 210, 0.05) 100%)',
    borderTopLeftRadius: '50%',
  },
}));

const FileUploadArea = styled(Box)(({ theme, isDragging }) => ({
  border: `2px dashed ${isDragging ? theme.palette.primary.main : '#ccc'}`,
  borderRadius: '12px',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.05)' : '#f9f9f9',
  margin: theme.spacing(2, 0, 3),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '28px',
  padding: theme.spacing(1.2, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    fontWeight: 600,
  },
  '.MuiTableRow-root': {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.05)',
    },
  },
}));

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  // Use React Query loading instead
  const [loading, setLoading] = useState(false);
  // Remove salaryResults state, use React Query instead
  // const [salaryResults, setSalaryResults] = useState([]);
  const [processedData, setProcessedData] = useState(null);

  // React Query: fetch and cache employee data (salary results)
  const {
    data: salaryResults,
    isLoading: queryLoading,
    error: queryError,
    refetch: refetchEmployeeData
  } = useEmployeeData(file, totalDays, !!file);

  const [isDragging, setIsDragging] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [totalDays, setTotalDays] = useState(30); // Default to 30 days
  const [daysLoading, setDaysLoading] = useState(false);
  const fileInputRef = useRef(null);
  // const theme = useTheme();
  
  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setFadeIn(true);
    
    // Load current total days setting
    const loadTotalDays = async () => {
      try {
        setDaysLoading(true);
        const response = await salaryService.getTotalWorkingDays();
        if (response && response.totalWorkingDays) {
          setTotalDays(response.totalWorkingDays);
        }
      } catch (error) {
        console.error('Failed to load total days setting:', error);
        // Keep default value
      } finally {
        setDaysLoading(false);
      }
    };
    
    if (!isDemoMode()) {
      loadTotalDays();
    }
  }, []);

  const handleFileChange = (e) => {
    console.log('File input changed:', e.target.files);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log('Selected file:', selectedFile.name, selectedFile.type, selectedFile.size);
      console.log('File details:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        lastModified: new Date(selectedFile.lastModified).toISOString()
      });
      
      // Check if the file is an Excel file
      if (
        !selectedFile.name.endsWith('.xls') && 
        !selectedFile.name.endsWith('.xlsx')
      ) {
        console.log('File is not an Excel file');
        setError('Please upload an Excel file (.xls or .xlsx)');
        setFile(null);
        return;
      }
      
      console.log('File is valid, setting in state');
      setError('');
      setFile(selectedFile);
      console.log('File set in state:', selectedFile.name);
      console.log('IMPORTANT: Please click the "Process Data" button to submit the file to the backend');
    } else {
      console.log('No file selected');
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check if the file is an Excel file
      if (
        !droppedFile.name.endsWith('.xls') && 
        !droppedFile.name.endsWith('.xlsx')
      ) {
        setError('Please upload an Excel file (.xls or .xlsx)');
        return;
      }
      
      setError('');
      setFile(droppedFile);
      
      // In demo mode, automatically process the file after a short delay
      if (isDemoMode()) {
        setLoading(true);
        setTimeout(() => {
          processDemoData();
          setLoading(false);
        }, 1500); // Simulate processing time
      }
    }
  };

  // Mock data for demo mode
  const mockSalaryData = {
    employeeResults: [
      { employeeId: 1, employeeName: 'John Doe', expectedHours: 160, actualWorkedHours: 165, monthlySalary: 5000, finalPayableSalary: 5156.25, lateMarks: 0, coefficient: 1.03 },
      { employeeId: 2, employeeName: 'Jane Smith', expectedHours: 160, actualWorkedHours: 155, monthlySalary: 4800, finalPayableSalary: 4650, lateMarks: 1, coefficient: 0.97 },
      { employeeId: 3, employeeName: 'Mike Johnson', expectedHours: 160, actualWorkedHours: 152, monthlySalary: 5200, finalPayableSalary: 4940, lateMarks: 2, coefficient: 0.95 },
      { employeeId: 4, employeeName: 'Sarah Williams', expectedHours: 160, actualWorkedHours: 168, monthlySalary: 5500, finalPayableSalary: 5775, lateMarks: 0, coefficient: 1.05 },
      { employeeId: 5, employeeName: 'David Brown', expectedHours: 160, actualWorkedHours: 140, monthlySalary: 4700, finalPayableSalary: 4112.5, lateMarks: 3, coefficient: 0.87 }
    ]
  };
  
  // Calculate metrics from salary results
  const calculateMetrics = (results) => {
    const totalEmployees = results.length;
    const totalSalary = results.reduce((sum, item) => sum + item.finalPayableSalary, 0);
    const averageSalary = totalSalary / totalEmployees;
    const totalLateMarks = results.reduce((sum, item) => sum + item.lateMarks, 0);
    
    setProcessedData({
      totalEmployees,
      totalSalary,
      averageSalary,
      totalLateMarks
    });
  };
  
  // Process demo data function
  const processDemoData = () => {
    if (mockSalaryData.employeeResults) {
      calculateMetrics(mockSalaryData.employeeResults);
    }
  };
  
  // Auto-load mock data in demo mode
  useEffect(() => {
    if (isDemoMode()) {
      // Simulate loading delay
      const timer = setTimeout(() => {
        calculateMetrics(mockSalaryData.employeeResults);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle total days change
  const handleTotalDaysChange = async (event) => {
    const newValue = event.target.value;
    setTotalDays(newValue);
    
    try {
      setDaysLoading(true);
      await salaryService.setTotalWorkingDays(newValue);
      console.log(`Total working days updated to ${newValue}`);
    } catch (error) {
      console.error('Failed to update total days:', error);
      setError(`Failed to update total working days: ${error.message || ''}`);
    } finally {
      setDaysLoading(false);
    }
  };
  
  // Use React Query - just trigger refetch and process metrics
  const handleProcessSalary = async () => {
    if (!file) {
      setError('Please upload a file first');
      return;
    }
    setError('');
    await refetchEmployeeData();
    if (salaryResults) {
      calculateMetrics(salaryResults);
    }
  };


  const handleDownloadPdf = async (employeeId) => {
    try {
      setLoading(true);
      
      // Check if we're in demo mode
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate download delay
        
        // Generate a simple PDF with employee data in demo mode
        const employee = salaryResults.find(emp => emp.employeeId === employeeId);
        if (!employee) {
          throw new Error('Employee not found');
        }
        
        // Create a simple PDF using Canvas and jsPDF (we simulate this)
        simulatePdfDownload(employee);
      } else {
        const response = await salaryService.generatePdf(employeeId);
        
        // Create blob URL
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        // Create temporary link to download file
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `salary_slip_${employeeId}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Error downloading PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle bulk PDF download - will be implemented in future releases
  const handleBulkPdfDownload = async () => { // eslint-disable-line no-unused-vars
    if (!salaryResults || salaryResults.length === 0) {
      setError('No salary data to download');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if we're in demo mode
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        // Create a simple text file with all employee data in demo mode
        const textContent = salaryResults.map(employee => {
          return `
            SALARY SLIP - ${employee.employeeName}
            ------------------
            
            Employee ID: ${employee.employeeId}
            Name: ${employee.employeeName}
            
            Basic Salary: ${formatCurrency(employee.monthlySalary)}
            Performance Coefficient: ${formatPercentage(employee.coefficient)}
            Late Marks: ${employee.lateMarks}
            
            Hours Expected: ${employee.expectedHours ? employee.expectedHours.toFixed(1) : '0.0'}
            Hours Worked: ${employee.actualWorkedHours ? employee.actualWorkedHours.toFixed(1) : '0.0'}
            
            Final Payable Salary: ${formatCurrency(employee.finalPayableSalary)}
            
            This is a demo PDF generated on ${new Date().toLocaleDateString()}
            ==========================================
          `;
        }).join('\n');
        
        // Create a Blob with the text content
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'all_salary_slips.txt');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // In real mode, call the bulk PDF generation API
        await salaryService.generatePDFs(file);
      }
    } catch (error) {
      console.error('Error generating bulk PDFs:', error);
      setError('Error generating bulk PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to simulate PDF download in demo mode
  const simulatePdfDownload = (employee) => {
    // Create a text representation of what would be in the PDF
    const pdfContent = `
      SALARY SLIP
      ------------------
      
      Employee ID: ${employee.employeeId}
      Name: ${employee.employeeName}
      
      Basic Salary: ${formatCurrency(employee.monthlySalary)}
      Performance Coefficient: ${formatPercentage(employee.coefficient)}
      Late Marks: ${employee.lateMarks}
      
      Hours Expected: ${employee.expectedHours ? employee.expectedHours.toFixed(1) : '0.0'}
      Hours Worked: ${employee.actualWorkedHours ? employee.actualWorkedHours.toFixed(1) : '0.0'}
      
      Final Payable Salary: ${formatCurrency(employee.finalPayableSalary)}
      
      This is a demo PDF generated on ${new Date().toLocaleDateString()}
    `;
    
    // Create a Blob with the text content
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a download link
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `demo_salary_slip_${employee.employeeId}.txt`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  
  // Format currency with safety check
  const formatCurrency = (amount) => {
    // Return 0 if amount is undefined or null
    if (amount === undefined || amount === null) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }).format(0);
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format percentage with safety check
  const formatPercentage = (value) => {
    // Return 0% if value is undefined or null
    if (value === undefined || value === null) {
      return '0.00%';
    }
    
    // The coefficient is already calculated as a decimal ratio
    // Some backends may send the value already multiplied by 100, check the magnitude
    if (value > 0 && value < 5) { // Likely a decimal ratio (e.g., 0.8347)
      return (value * 100).toFixed(2) + '%';
    } else {
      // Likely already a percentage (e.g., 104.32)
      return value.toFixed(2) + '%';
    }
  };
  
  // Get status color based on coefficient
  const getStatusColor = (coefficient) => {
    // Add safety check
    if (!coefficient) return 'warning';
    
    if (coefficient >= 0.95) return 'success';
    if (coefficient >= 0.85) return 'warning';
    return 'error';
  };
  
  // Get status label based on coefficient
  const getStatusLabel = (coefficient) => {
    // Add safety check
    if (!coefficient) return 'N/A';
    
    if (coefficient >= 0.95) return 'Excellent';
    if (coefficient >= 0.85) return 'Good';
    if (coefficient >= 0.75) return 'Average';
    return 'Below Average';
  };

  return (
    <DashboardContainer>
      <Fade in={fadeIn} timeout={800}>
        <Container maxWidth="xl">
          <PageHeader>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="700" color="primary.main">
                Salary Processor Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload, process and manage employee salary data
              </Typography>
            </Box>
            
            {processedData && (
              <Chip 
                label={`Month: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: '16px', mt: { xs: 2, md: 0 } }}
              />
            )}
          </PageHeader>
          
          {error && (
            <Fade in={!!error} timeout={500}>
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ mb: 3, borderRadius: '12px' }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Fade>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={5} lg={4}>
              <Zoom in={fadeIn} timeout={800}>
                <UploadCard elevation={3}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Upload Attendance Data
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <FileUploadArea 
                      onClick={handleFileUploadClick}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      isDragging={isDragging}
                    >
                      <input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleFileChange}
                        hidden
                        ref={fileInputRef}
                      />
                      
                      <CloudUploadIcon 
                        sx={{ 
                          fontSize: 64, 
                          color: isDragging ? 'primary.main' : 'primary.light', 
                          mb: 2,
                          transition: 'all 0.3s ease'
                        }} 
                      />
                      
                      <Typography variant="h6" gutterBottom color={isDragging ? 'primary.main' : 'inherit'}>
                        {file ? file.name : 'Drag & Drop or Click to Upload'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Upload monthly attendance Excel file (.xls or .xlsx)
                      </Typography>
                    </FileUploadArea>
                    
                    <Box mb={2}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel id="total-days-label">Total Working Days</InputLabel>
                        <Select
                          labelId="total-days-label"
                          id="total-days"
                          value={totalDays}
                          onChange={handleTotalDaysChange}
                          label="Total Working Days"
                          disabled={daysLoading || loading}
                        >
                          {Array.from({length: 31}, (_, i) => i + 1).map(days => (
                            <MenuItem key={days} value={days}>{days} days</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ActionButton
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={handleProcessSalary}
                          disabled={!file || loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                        >
                          Process Data ({totalDays} days)
                        </ActionButton>
                      </Grid>
            </Grid>

            {salaryResults && processedData && (
              <Grid item xs={12} md={7} lg={8}>
                <Zoom in={!!processedData} timeout={500}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={3}>
                      <MetricCard color="primary">
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <PeopleIcon sx={{ mr: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Employees
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="600">
                            {processedData ? processedData.totalEmployees : 0}
                          </Typography>
                        </CardContent>
                      </MetricCard>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <MetricCard color="secondary">
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <AccountBalanceWalletIcon sx={{ mr: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Total Payout
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="600">
                            {formatCurrency(processedData.totalSalary)}
                          </Typography>
                        </CardContent>
                      </MetricCard>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <MetricCard color="success">
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <TrendingUpIcon sx={{ mr: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Average Salary
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="600">
                            {formatCurrency(processedData.averageSalary)}
                          </Typography>
                        </CardContent>
                      </MetricCard>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <MetricCard color="warning">
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <AccessTimeIcon sx={{ mr: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Late Marks
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="600">
                            {processedData.totalLateMarks}
                          </Typography>
                        </CardContent>
                      </MetricCard>
                    </Grid>
                  </Grid>
                </Zoom>
              </Grid>
            )}
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <AccountBalanceWalletIcon sx={{ mr: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Total Payout
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="600">
                            {formatCurrency(processedData.totalSalary)}
                          </Typography>
                        </CardContent>
                      </MetricCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} lg={3}>
                      <MetricCard color="success">
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <TrendingUpIcon sx={{ mr: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Average Salary
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="600">
                            {formatCurrency(processedData.averageSalary)}
                          </Typography>
                        </CardContent>
                      </MetricCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} lg={3}>
                      <MetricCard color="warning">
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <AccessTimeIcon sx={{ mr: 1, opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Late Marks
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="600">
                            {processedData.totalLateMarks}
                          </Typography>
                        </CardContent>
                      </MetricCard>
                    </Grid>
          </Grid>
          {Array.isArray(salaryResults) && salaryResults.length > 0 && (
            <Fade in={salaryResults.length > 0} timeout={1000}>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
                  Salary Results
                </Typography>
                <StyledTableContainer component={Paper}>
                  <Table aria-label="salary results table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Monthly Salary</TableCell>
                        <TableCell align="right">Hours (Expected/Actual)</TableCell>
                        <TableCell align="right">Coefficient</TableCell>
                        <TableCell align="right">Late Marks</TableCell>
                        <TableCell align="right">Final Salary</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salaryResults.map((row) => {
                        const statusColor = getStatusColor(row.coefficient);
                        
                        return (
                          <TableRow key={row.employeeId}>
                            <TableCell component="th" scope="row">
                              {row.employeeId}
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="500">{row.employeeName}</Typography>
                            </TableCell>
                            <TableCell align="right">{formatCurrency(row.monthlySalary)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title={`Actual: ${row.actualWorkedHours ? row.actualWorkedHours.toFixed(1) : '0.0'}, Expected: ${totalDays * 8}`}>
                                <span>{row.actualWorkedHours ? row.actualWorkedHours.toFixed(1) : '0.0'} / {totalDays * 8}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="500" color={`${statusColor}.main`}>
                                {formatPercentage(row.coefficient)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{row.lateMarks}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="700">
                                {formatCurrency(row.finalPayableSalary)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={getStatusLabel(row.coefficient)}
                                color={statusColor}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <ActionButton
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleDownloadPdf(row.employeeId)}
                                disabled={loading}
                                startIcon={<DownloadIcon />}
                              >
                                PDF
                              </ActionButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </Box>
            </Fade>
          )}
        </Container>
      </Fade>
    </DashboardContainer>
  );
};

export default Dashboard;
