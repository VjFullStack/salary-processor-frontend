import React, { useState, useEffect, useRef } from 'react';
import { salaryService } from '../services/api';
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
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import { salaryService } from '../services/api';
// No need for isDemoMode in production

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
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [totalDays, setTotalDays] = useState(30); // Default to 30 days
  const [daysLoading, setDaysLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // State to hold processed salary data
  const [salaryResults, setSalaryResults] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(false);

  // Derived state for processed metrics from salary results
  const [processedData, setProcessedData] = useState(null);
  
  // Calculate processed metrics whenever salary results change
  useEffect(() => {
    console.log('Salary results updated:', salaryResults);
    if (salaryResults && salaryResults.length > 0) {
      console.log('Calculating metrics for', salaryResults.length, 'employees');
      calculateMetrics(salaryResults);
    } else {
      console.log('No salary results available yet');
    }
  }, [salaryResults]);
  
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
    
    loadTotalDays();
  }, []);
  
  // Initial data loading can be removed since we now use the process endpoint data directly

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
    }
  };

  // Calculate metrics from salary results
  const calculateMetrics = (results) => {
    if (!results || results.length === 0) {
      setProcessedData(null);
      return;
    }
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
  
  const handleProcessSalary = async () => {
    if (!file) {
      setError('Please select a file to process');
      return;
    }
    
    setProcessing(true);
    setDataLoading(true);
    setError('');
    
    console.log('Processing file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Processing salary data with total days:', totalDays);
      
      // Use the salary service to process the file
      const response = await salaryService.processSalary(file, totalDays);
      console.log('Salary processing response:', response);
      
      // Sort the data by employeeId numerically
      let processedData = [];
      
      if (response && Array.isArray(response)) {
        // Sort the array by employeeId numerically
        processedData = [...response].sort((a, b) => {
          const idA = parseInt(a.employeeId, 10) || 0;
          const idB = parseInt(b.employeeId, 10) || 0;
          return idA - idB;
        });
        
        console.log('Data sorted by employeeId:', processedData);
        setSalaryResults(processedData);
        calculateMetrics(processedData);
      }
      
      // Clear the file input after successful processing
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show success message
      setSuccessMessage('Salary data processed successfully!');
      setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
    } catch (err) {
      console.error('Failed to process salary data:', err);
      setError('Failed to process salary data: ' + (err.message || ''));
      setDataError(true);
    } finally {
      setProcessing(false);
      setDataLoading(false);
    }
  };

  const handleDownloadPdf = async (employeeId) => {
    try {
      setProcessing(true);
      
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
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Error downloading PDF. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Function to handle bulk PDF download of all salary slips
  const handleBulkPdfDownload = async () => { // eslint-disable-line no-unused-vars
    if (!salaryResults || !Array.isArray(salaryResults) || salaryResults.length === 0) {
      setError('No salary data to download');
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      // Call the real API to generate bulk PDFs
      const response = await salaryService.generateBulkPdf();
      
      // Create blob URL from the API response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a download link for the PDF file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'all_salary_slips.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      setSuccessMessage('Bulk PDFs downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error generating bulk PDFs:', error);
      setError('Error generating bulk PDFs. Please try again.');
    } finally {
      setProcessing(false);
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
              <Zoom in={true} timeout={500}>
                <UploadCard>
                  <CardContent>
                    <Box 
                      sx={{
                        border: '2px dashed',
                        borderColor: isDragging ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        p: 3,
                        mb: 2,
                        textAlign: 'center',
                        bgcolor: isDragging ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: 'primary.light'
                        }
                      }}
                      onClick={handleFileUploadClick}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <>
                          <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                            {file.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: 'action.active' }} />
                          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                            Drop Excel file here
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            or click to browse
                          </Typography>
                        </>
                      )}
                    </Box>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xls,.xlsx"
                      style={{ display: 'none' }}
                    />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Working Days:
                    </Typography>
                    <FormControl fullWidth variant="outlined" size="small">
                      <Select
                        value={totalDays}
                        onChange={handleTotalDaysChange}
                        disabled={daysLoading}
                      >
                        {[22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(days => (
                          <MenuItem key={days} value={days}>{days} days</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!file || processing || dataLoading}
                    startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    onClick={handleProcessSalary}
                    sx={{ py: 1 }}
                  >
                    {processing ? 'Processing...' : `Process Salary (${totalDays} days)`}
                  </Button>
                </CardContent>
              </UploadCard>
            </Zoom>
          </Grid>
          
          {processedData && (
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
                          {processedData.totalEmployees}
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
          </Grid>
          
          {salaryResults && salaryResults.length > 0 && (
            <Fade in={!!salaryResults && salaryResults.length > 0} timeout={1000}>
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
                        // Get employeeName from different possible field names
                        const employeeName = row.employeeName || row.name || '';
                        
                        // Handle coefficient properly with fallback to 0
                        const coefficient = typeof row.coefficient === 'number' ? row.coefficient : 0;
                        const statusColor = getStatusColor(coefficient);
                        
                        // Safely extract other fields with fallbacks
                        const monthlySalary = row.monthlySalary || 0;
                        const actualWorkedHours = row.actualWorkedHours || 0;
                        const lateMarks = row.lateMarks || 0;
                        const finalPayableSalary = row.finalPayableSalary || 0;
                        
                        console.log('Row data:', { 
                          id: row.employeeId, 
                          name: employeeName,
                          coefficient: coefficient,
                          salary: monthlySalary,
                          finalSalary: finalPayableSalary
                        });
                        
                        return (
                          <TableRow key={row.employeeId}>
                            <TableCell component="th" scope="row">
                              {row.employeeId}
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="500">{employeeName}</Typography>
                            </TableCell>
                            <TableCell align="right">{formatCurrency(monthlySalary)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title={`Actual: ${actualWorkedHours.toFixed(1)}, Expected: ${totalDays * 8}`}>
                                <span>{actualWorkedHours.toFixed(1)} / {totalDays * 8}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="500" color={`${statusColor}.main`}>
                                {formatPercentage(coefficient)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{lateMarks}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="700">
                                {formatCurrency(finalPayableSalary)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={getStatusLabel(coefficient)}
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
                                disabled={processing}
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
