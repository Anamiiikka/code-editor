// frontend/src/components/IDE.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from './CodeEditor';
import FileActions from './FileActions';
import AiSidebar from './AiSidebar';
import OutputArea from './OutputArea';
import { ClientSideSuspense } from '@liveblocks/react/suspense';
import './IDE.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function IDE() {
  const { projectId, fileName } = useParams();
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiFixes, setAiFixes] = useState('');
  const [aiDocs, setAiDocs] = useState('');
  const [aiSnippet, setAiSnippet] = useState('');
  const [snippetDescription, setSnippetDescription] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic room ID based on projectId and fileName
  const roomId = `${projectId}-${fileName}`;

  return (
    <div className="ide-container">
      <nav className="navbar">
        <h1 className="file-name">{fileName}</h1>
      </nav>
      <ClientSideSuspense fallback={<div>Loading collaboration...</div>}>
        <div className="main-content">
          <div className="editor-container">
            <CodeEditor
              code={code}
              setCode={setCode}
              fileExtension={fileName.split('.').pop()}
              backendUrl={backendUrl}
              projectId={projectId}
              fileName={fileName}
            />
          </div>
          <div className="io-container">
            <OutputArea input={input} setInput={setInput} output={output} />
          </div>
        </div>
        <div className="file-actions-container">
          <div className="file-actions">
            <FileActions
              saveFile={() => saveFile(code, projectId, fileName, backendUrl)}
              runCode={() =>
                runCode(code, input, projectId, fileName, backendUrl, setOutput, setIsRunning)
              }
              fetchAiFixes={() => fetchAiFixes(code, backendUrl, setAiFixes, setIsSidebarOpen)}
              generateAiDocs={() => generateAiDocs(code, backendUrl, setAiDocs, setIsSidebarOpen)}
              generateAiSnippet={() =>
                generateAiSnippet(snippetDescription, backendUrl, setAiSnippet, setIsSidebarOpen)
              }
              setSnippetDescription={setSnippetDescription}
              isRunning={isRunning}
            />
          </div>
        </div>
        <AiSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          aiFixes={aiFixes}
          aiDocs={aiDocs}
          aiSnippet={aiSnippet}
        />
      </ClientSideSuspense>
    </div>
  );
}

// Helper Functions (unchanged)
const saveFile = async (code, projectId, fileName, backendUrl) => {
  try {
    await axios.post(`${backendUrl}/api/files`, { projectId, fileName, content: code });
    console.log('File saved successfully');
  } catch (error) {
    console.error('Error saving file:', error);
  }
};

const runCode = async (code, input, projectId, fileName, backendUrl, setOutput, setIsRunning) => {
  setIsRunning(true);
  try {
    await saveFile(code, projectId, fileName, backendUrl);
    const response = await axios.post(`${backendUrl}/api/run`, { projectId, fileName, input });
    setOutput(response.data.output);
  } catch (error) {
    setOutput(error.response?.data?.error || 'Failed to run code');
  } finally {
    setIsRunning(false);
  }
};

const fetchAiFixes = async (code, backendUrl, setAiFixes, setIsSidebarOpen) => {
  try {
    const response = await axios.post(`${backendUrl}/api/ai/lint`, { code });
    setAiFixes(response.data.fixes);
    setIsSidebarOpen(true);
  } catch (error) {
    console.error('Error fetching AI fixes:', error);
  }
};

const generateAiDocs = async (code, backendUrl, setAiDocs, setIsSidebarOpen) => {
  try {
    const response = await axios.post(`${backendUrl}/api/ai/generate-docs`, { code });
    setAiDocs(response.data.docs);
    setIsSidebarOpen(true);
  } catch (error) {
    console.error('Error generating AI docs:', error);
  }
};

const generateAiSnippet = async (description, backendUrl, setAiSnippet, setIsSidebarOpen) => {
  try {
    const response = await axios.post(`${backendUrl}/api/ai/generate-snippet`, { description });
    setAiSnippet(response.data.snippet);
    setIsSidebarOpen(true);
  } catch (error) {
    console.error('Error generating AI snippet:', error);
  }
};

export default IDE;