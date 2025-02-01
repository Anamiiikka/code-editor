const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const projectsDir = path.join(__dirname, 'projects');

// Ensure projects directory exists
if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
}

// Helper function to read project metadata
const readProjectMetadata = (projectId) => {
    const metadataPath = path.join(projectsDir, projectId, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
        return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    }
    return null;
};

// API to create a new project
app.post('/api/projects', (req, res) => {
    const { projectName } = req.body;
    if (!projectName) {
        return res.status(400).json({ error: 'Project name is required!' });
    }

    const projectId = uuidv4();
    const projectPath = path.join(projectsDir, projectId);

    // Create project directory and metadata
    fs.mkdirSync(projectPath);
    const metadata = { projectId, projectName };
    fs.writeFileSync(path.join(projectPath, 'metadata.json'), JSON.stringify(metadata));

    res.status(201).json(metadata);
});

// API to list all projects
app.get('/api/projects', (req, res) => {
    const projects = fs.readdirSync(projectsDir).map((projectId) => {
        return readProjectMetadata(projectId);
    }).filter(Boolean); // Filter out invalid projects

    res.status(200).json(projects);
});

// API to delete a project
app.delete('/api/projects/:projectId', (req, res) => {
    const { projectId } = req.params;
    const projectPath = path.join(projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: 'Project not found!' });
    }

    fs.rmdirSync(projectPath, { recursive: true });
    res.status(200).json({ message: 'Project deleted successfully!' });
});

// API to create a new file
app.post('/api/files', (req, res) => {
    const { projectId, fileName, content } = req.body;

    if (!projectId || !fileName) {
        return res.status(400).json({ error: 'Project ID and file name are required!' });
    }

    const filePath = path.join(projectsDir, projectId, fileName);

    // Ensure the project directory exists
    if (!fs.existsSync(path.join(projectsDir, projectId))) {
        return res.status(404).json({ error: 'Project not found!' });
    }

    fs.writeFileSync(filePath, content || ''); // Create file with content (if provided)
    res.status(201).json({ message: 'File created successfully!' });
});

// API to get file content
app.get('/api/files/:projectId/:fileName', (req, res) => {
    const { projectId, fileName } = req.params;
    const filePath = path.join(projectsDir, projectId, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found!' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.status(200).json({ content });
});

// API to delete a file
app.delete('/api/files/:projectId/:fileName', (req, res) => {
    const { projectId, fileName } = req.params;
    const filePath = path.join(projectsDir, projectId, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found!' });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: 'File deleted successfully!' });
});

// API to list files in a project
app.get('/api/files/:projectId', (req, res) => {
    const { projectId } = req.params;
    const projectPath = path.join(projectsDir, projectId);

    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: 'Project not found!' });
    }

    const files = fs.readdirSync(projectPath).filter((file) => file !== 'metadata.json');
    res.status(200).json(files);
});

// API to run code
app.post('/api/run', (req, res) => {
    const { projectId, fileName, input } = req.body;
    const filePath = path.join(projectsDir, projectId, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found!' });
    }

    const extension = path.extname(fileName);
    let command = '';

    switch (extension) {
        case '.cpp':
            command = `g++ ${filePath} -o ${filePath}.out && echo "${input}" | ${filePath}.out`;
            break;
        case '.java':
            command = `javac ${filePath} && java -cp ${path.dirname(filePath)} ${path.basename(fileName, '.java')}`;
            break;
        case '.py':
            command = `echo "${input}" | python3 ${filePath}`;
            break;
        case '.js':
            command = `echo "${input}" | node ${filePath}`;
            break;
        default:
            return res.status(400).json({ error: 'Unsupported file type!' });
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr });
        }
        res.status(200).json({ output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});