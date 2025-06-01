# Salary Processor Frontend

A React-based frontend application for the Salary Processor system. This frontend allows users to upload Excel files with attendance data, process them to calculate salaries, and download individual PDF salary slips.

## Features

- Modern, responsive UI built with React and Material UI
- Excel file upload for attendance data
- Dashboard view of computed salaries
- Download functionality for PDF salary slips
- JWT-based authentication
- Deployable to Vercel

## Prerequisites

- Node.js 14+
- npm 6+
- A running instance of the Salary Processor Backend

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:8080/api
```

For production, this should point to your deployed backend URL.

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Main application pages
- `src/context`: React context for state management
- `src/services`: API services for backend communication

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Authentication

The application uses JWT tokens for authentication. Default credentials (matching the backend):
- Username: `admin`
- Password: `admin123`

## Usage Guide

1. **Login**: Use your credentials to log in to the system
2. **Upload File**: Click on the upload area to select an Excel file with attendance data
3. **Process Data**: Click "Process Salary Data" to view the computed salaries
4. **Download Slips**: Click "Download Salary Slips" to get a ZIP file with individual PDF salary slips

## Deployment to Vercel

1. Push the code to a Git repository
2. Connect your Vercel account to the repository
3. Configure environment variables
4. Deploy

## Connecting to Backend

The frontend communicates with the backend through the API service. Make sure to update the `REACT_APP_API_URL` environment variable to point to your deployed backend URL.

## Customization

- Update theme colors in `App.js`
- Modify the table columns in `Dashboard.js` to include additional data
- Change the PDF format by updating the backend's PDFGenerationService
