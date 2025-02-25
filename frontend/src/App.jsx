import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import IDE from './components/IDE';
import Homepage from './components/Homepage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

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
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/ide/:projectId/:fileName" element={<IDE />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;