import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import IDE from './components/IDE';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ide/:projectId/:fileName" element={<IDE />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;