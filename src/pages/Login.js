import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { authService } from '../services/api';

// Styled components
const LoginBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
  padding: theme.spacing(2),
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(10px)',
  background: 'rgba(255, 255, 255, 0.95)',
  overflow: 'hidden',
  position: 'relative',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const Logo = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.5)',
  margin: theme.spacing(1),
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: '28px',
  padding: theme.spacing(1.2),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.3)',
    },
  },
  marginBottom: theme.spacing(2.5),
}));

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setFadeIn(true);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Always use real authentication against the backend
      const response = await authService.login(username, password);
      // Extract token from the response
      const token = response.token;
      console.log('Authentication successful, token received:', token ? 'Yes' : 'No');
      login(token); // This will set isAuthenticated to true in AuthContext
      navigate('/');
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <LoginBackground>
      <Container maxWidth="sm">
        <Fade in={fadeIn} timeout={800}>
          <LoginCard elevation={10}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Zoom in={fadeIn} timeout={1000}>
                  <LogoContainer>
                    <Logo>
                      <MonetizationOnIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Logo>
                  </LogoContainer>
                </Zoom>
                
                <Typography 
                  variant="h4" 
                  component="h1" 
                  align="center" 
                  fontWeight="700"
                  sx={{ mb: 1, color: '#1976d2' }}
                >
                  Salary Processor
                </Typography>
                
                <Typography 
                  variant="body1" 
                  align="center" 
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Sign in to access your dashboard
                </Typography>
              </Grid>
              
              {error && (
                <Grid item>
                  <Alert 
                    severity="error" 
                    variant="filled"
                    sx={{ borderRadius: 2, mb: 2 }}
                  >
                    {error}
                  </Alert>
                </Grid>
              )}
              
              <Grid item>
                <form onSubmit={handleSubmit}>
                  <StyledTextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <StyledTextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <LoginButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </LoginButton>
                </form>
              </Grid>
              

            </Grid>
          </LoginCard>
        </Fade>
      </Container>
    </LoginBackground>
  );
};

export default Login;
