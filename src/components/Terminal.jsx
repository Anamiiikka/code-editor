import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const fitAddon = new FitAddon();

  useEffect(() => {
    // Initialize the terminal
    const terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
    });

    // Load the fit addon
    terminal.loadAddon(fitAddon);

    // Attach the terminal to the DOM
    if (terminalRef.current) {
      terminal.open(terminalRef.current);
      fitAddon.fit(); // Adjust the terminal size to fit the container
    }

    // Handle terminal input
    terminal.onData((data) => {
      terminal.write(data); // Echo user input
    });

    // Cleanup on unmount
    return () => {
      terminal.dispose();
    };
  }, []);

  return <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />;
};