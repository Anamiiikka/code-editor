import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const TerminalComponent = ({ onClose }) => {
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

  return (
    <div className="fixed bottom-0 left-0 right-0 h-96 bg-black border-t border-gray-700 flex flex-col z-50">
      {/* Terminal Header */}
      <div className="flex justify-between items-center p-2 bg-gray-800">
        <h2 className="text-white text-lg font-semibold">Terminal</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-400"
        >
          Close
        </button>
      </div>

      {/* Terminal Container */}
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  );
};