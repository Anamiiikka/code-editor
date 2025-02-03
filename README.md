
---

# Codev - Collaborative Code Editor <>

Codev is a collaborative code editor designed to provide developers with a seamless coding experience. It includes features such as real-time collaboration, AI-powered code assistance, file management, and code execution.

https://codev-k6mg.onrender.com/
-------------------------------
https://youtu.be/0RchrH2ImJE

## Table of Contents

- [Codev - Collaborative Code Editor](#codev---collaborative-code-editor)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Directory Structure](#directory-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
      - [Backend `.env`](#backend-env)
      - [Frontend `.env`](#frontend-env)
  - [Usage](#usage)
    - [Running the Backend](#running-the-backend)
    - [Running the Frontend](#running-the-frontend)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [File Management](#file-management)
    - [Code Execution](#code-execution)
    - [AI Assistance](#ai-assistance)
  - [Contributing](#contributing)
  - [License](#license)

---

## Features

- **AI-Powered Assistance**: Get code completions, linting suggestions, documentation generation, and code snippets using AI.
- **File Management**: Create, read, update, and delete files within projects.
- **Code Execution**: Run code in multiple languages (C++, Java, Python, JavaScript) using JDoodle API.
- **Project Management**: Create, list, and delete projects.
- **Real-Time Collaboration**: Collaborate with others in real-time using WebSockets.
- **Cloud Storage**: Files are stored in AWS S3 for persistence.
- **Authentication**: User authentication via Auth0.

---

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** for database operations
- **AWS SDK** for S3 storage
- **JDoodle API** for code execution
- **Groq SDK** for AI-powered code assistance
- **Socket.IO** for real-time collaboration

### Frontend
- **React.js** with **Vite** for fast development
- **Material-UI (MUI)** for UI components
- **CodeMirror** for code editing
- **Auth0** for authentication
- **Axios** for API calls

---

## Directory Structure

```
└── codedpool-codev/
    ├── backend/
    │   ├── controllers/        # Business logic for routes
    │   ├── middleware/         # Middleware functions (e.g., error handling)
    │   ├── models/             # MongoDB schemas
    │   ├── projects/           # Sample project files
    │   ├── routes/             # API route definitions
    │   └── utils/              # Utility functions
    └── frontend/
        ├── public/             # Static assets
        └── src/
            ├── components/     # React components
            ├── App.jsx         # Main application component
            ├── index.css       # Global styles
            └── main.jsx        # Entry point for the frontend
```

---

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** instance
- **AWS S3 Bucket** configured
- **JDoodle API** credentials
- **Auth0** account for authentication

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codedpool/codev.git)
   cd codedpool-codev
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Environment Variables

Create `.env` files in both `backend` and `frontend` directories:

#### Backend `.env`
```env
PORT=5000
MONGO_URI=<your-mongodb-uri>
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
AWS_REGION=<your-aws-region>
S3_BUCKET_NAME=<your-s3-bucket-name>
JDOODLE_CLIENT_ID=<your-jdoodle-client-id>
JDOODLE_CLIENT_SECRET=<your-jdoodle-client-secret>
```

#### Frontend `.env`
```env
VITE_BACKEND_URL=http://localhost:5000
AUTH0_DOMAIN=<your-auth0-domain>
AUTH0_CLIENT_ID=<your-auth0-client-id>
AUTH0_AUDIENCE=<your-auth0-audience>
```

---

## Usage

### Running the Backend

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`.

### Running the Frontend

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

---

## API Endpoints

### Authentication
- **POST `/api/projects`**: Create a new project.
- **GET `/api/projects`**: List all projects for a user.
- **DELETE `/api/projects/:projectId`**: Delete a project.

### File Management
- **POST `/api/files`**: Create a new file.
- **GET `/api/files/:projectId/:fileName`**: Fetch file content.
- **DELETE `/api/files/:projectId/:fileName`**: Delete a file.

### Code Execution
- **POST `/api/run`**: Execute code.

### AI Assistance
- **POST `/api/ai/auto-complete`**: Get code completions.
- **POST `/api/ai/lint`**: Get linting suggestions.
- **POST `/api/ai/generate-docs`**: Generate documentation.
- **POST `/api/ai/generate-snippet`**: Generate code snippets.

---

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m "Add some feature"`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

---

## License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

Feel free to customize this README further based on your project's specific needs!

Created with 🧠 and ❤️ @ HAXPLORE-CODEFEST'25 by Team Phoenix Arcana 🐦‍🔥🦊🐢
