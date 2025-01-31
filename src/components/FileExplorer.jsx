import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';

export const FileExplorer = () => {
  const { openedFiles, openFile } = useEditorStore();
  const [expandedDirs, setExpandedDirs] = useState({});

  const toggleDirectory = async (folder) => {
    if (!folder.isDirectory) return;

    // Toggle directory expansion
    setExpandedDirs((prev) => ({
      ...prev,
      [folder.path]: !prev[folder.path],
    }));

    // If the folder has no children, load its contents
    if (folder.children.length === 0) {
      loadFolderChildren(folder);
    }
  };

  const loadFolderChildren = async (folder) => {
    try {
      const files = [];
      for await (const entry of folder.handle.values()) {
        const child = {
          name: entry.name,
          path: `${folder.path}/${entry.name}`,
          handle: entry,
          isDirectory: entry.kind === 'directory',
          children: entry.kind === 'directory' ? [] : null,
        };

        // If the child is a directory, add a children property (empty array for now)
        if (child.isDirectory) {
          child.children = [];
        }

        files.push(child);
      }

      // Update the folder with its children
      folder.children = files;
      setExpandedDirs((prev) => ({ ...prev })); // Trigger re-render
    } catch (error) {
      console.error('Error reading folder:', error);
    }
  };

  // Recursive function to render each folder and its contents
  const renderFolder = (folder) => {
    return (
      <li key={folder.path} className="p-2 cursor-pointer">
        <span onClick={() => toggleDirectory(folder)}>
          {folder.isDirectory ? '📂' : '📄'} {folder.name}
        </span>
        {expandedDirs[folder.path] && folder.children && (
          <ul className="ml-4">
            {folder.children.map((subFile) => (
              <li key={subFile.path}>
                {subFile.isDirectory ? renderFolder(subFile) : (
                  <span
                    onClick={() => openFile(subFile)}
                    className="p-1 hover:bg-gray-700 cursor-pointer"
                  >
                    📄 {subFile.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="w-60 h-full bg-gray-900 text-white p-2">
      <h2 className="text-lg font-semibold mb-2">File Explorer</h2>
      <ul>
        {openedFiles.map((file) => (
          <li key={file.path} className="p-2 cursor-pointer">
            {file.isDirectory ? (
              <>
                <span onClick={() => toggleDirectory(file)}>📂 {file.name}</span>
                {expandedDirs[file.path] && file.children && (
                  <ul className="ml-4">
                    {file.children.map((subFile) => (
                      <li key={subFile.path}>
                        {subFile.isDirectory ? renderFolder(subFile) : (
                          <span
                            onClick={() => openFile(subFile)}
                            className="p-1 hover:bg-gray-700 cursor-pointer"
                          >
                            📄 {subFile.name}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <span onClick={() => openFile(file)}>📄 {file.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
