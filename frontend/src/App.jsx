// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import Home from './components/Home';
import IDE from './components/IDE';
import Homepage from './components/Homepage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { LiveblocksProvider } from '@liveblocks/react/suspense';
import { RoomProvider } from './liveblocks.config';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Wrapper component to access params inside RoomProvider
function IDEWrapper() {
  const { projectId, fileName } = useParams();
  const roomId = `${projectId}-${fileName}`;

  return (
    <RoomProvider id={roomId}>
      <IDE />
    </RoomProvider>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Home />} />
          <Route
            path="/ide/:projectId/:fileName"
            element={
              <LiveblocksProvider publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY}>
                <IDEWrapper />
              </LiveblocksProvider>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;