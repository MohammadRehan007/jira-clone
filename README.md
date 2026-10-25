# 🚀 Jira Clone — Production-Ready Agile Project Management System

A full-stack, enterprise-grade Jira clone built with **React 18**, **Node.js**, **Express**, **MongoDB**, **Cloudinary**, and an automated **Email Notification Engine (Nodemailer)**.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Key Features](#-key-features)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Quick Start & Setup Guide](#-quick-start--setup-guide)
   - [1. Clone Repository & Install Dependencies](#1-clone-repository--install-dependencies)
   - [2. Environment Variables Configuration](#2-environment-variables-configuration)
   - [3. Running the Project Locally](#3-running-the-project-locally)
   - [4. Running via Docker](#4-running-via-docker)
7. [Default Seed Credentials](#-default-seed-credentials)
8. [Cloudinary Integration Guide](#-cloudinary-integration-guide)
9. [Email Notification Engine (Nodemailer)](#-email-notification-engine-nodemailer)
10. [API Reference](#-api-reference)
11. [CI/CD Pipeline (GitHub Actions ➔ Render & Vercel)](#-cicd-pipeline-github-actions--render--vercel)
12. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🎯 Project Overview

This project is a modern, responsive Agile management software replicating core Atlassian Jira workflows:
- **Interactive Drag-and-Drop Kanban Board**: Move issues smoothly between agile stages (`To Do` ➔ `In Progress` ➔ `In Review` ➔ `Testing` ➔ `Done`).
- **Sprint & Backlog Planning**: Plan sprints, set goals, estimate story points, and transition tasks between the Product Backlog and Active Sprints.
- **Image & Screenshot Attachments via Cloudinary**: Upload screenshots and issue mockups directly to Cloudinary CDN with interactive lightbox previews.
- **Real-Time Automated Email Alerts**: Transactional emails dispatched automatically on ticket assignments, status transitions, and `@user` comment mentions.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for `Admin`, `ProjectLead`, `Developer`, `Tester`, and `Viewer`.

---

## 🛠 Tech Stack

### Frontend (`client/`)
- **React 18** with **Vite**
- **Tailwind CSS** (Modern responsive design & sleek dark/light components)
- **@hello-pangea/dnd** (Accessible, buttery smooth drag-and-drop)
- **Lucide React** (Clean, minimalist iconography)
- **Axios** (Centralized API client with JWT interceptors)
- **React Router v6**

### Backend (`server/`)
- **Node.js** (v18+) & **Express.js**
- **MongoDB** & **Mongoose** (Relational-like schemas, automated indexes, pre-save hashing)
- **Cloudinary SDK** + **Multer** (Memory buffer streaming, face-crop transformations, zero disk-clutter)
- **Nodemailer** (HTML email notification templates)
- **JSON Web Tokens (JWT)** & **Bcrypt.js** (Secure authentication and RBAC middleware)

---

## ✨ Key Features

### 1. Kanban Board & Sprints
- Drag-and-drop issue cards across columns with optimistic UI updates.
- Quick user avatar filtering and real-time search across titles, descriptions, and ticket keys (e.g., `JIR-101`).
- Backlog view to plan sprints, set sprint duration/goals, and bulk-move tasks.

### 2. Issue Tracking & Detail View
- Issue types: **Task**, **Bug**, **Story**, **Epic**.
- Priorities: **Lowest**, **Low**, **Medium**, **High**, **Highest**.
- Story points estimation, due dates, and tags.
- Detailed issue modal with live history/activity audit trail.

### 3. Cloudinary Image & Attachment Engine
- **Ticket Attachments**: Upload screenshots and images directly to Cloudinary with drag-and-drop or file picker.
- **Attachment Previews**: Interactive full-size lightbox viewer with download links and file size badges.
- **Kanban Card Badges**: Attachment indicators on Kanban cards showing attachment count.
- **Profile Photo Upload**: Change user profile avatar via Cloudinary with automatic face-detection cropping.
- **Orphan Asset Cleanup**: Deleting an issue automatically deletes its attached media assets from Cloudinary.

### 4. Email Notification Engine
- **Ticket Assignment**: Developer receives an email notification when a ticket is assigned to them.
- **Status Changes**: Reporter and Assignee receive updates when issue status changes (e.g., `In Review` ➔ `Done`).
- **@Mentions**: Users tagged with `@Username` in issue comments receive instant alerts.
- **Welcome Credentials**: Automatically emails new team members their generated login credentials.

---

## 📁 Project Structure

```plaintext
JIR_clone/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── api/                # Axios instance & request/response interceptors
│   │   ├── components/
│   │   │   ├── common/         # Avatar, Button, Modal, ImageUpload, Badges
│   │   │   ├── dashboard/      # Analytics, team members & management
│   │   │   ├── kanban/         # KanbanBoard, Column, TicketCard
│   │   │   ├── layout/         # Navbar, AppLayout, ProfileModal
│   │   │   ├── sprint/         # BacklogView, SprintCard
│   │   │   └── ticket/         # CreateTicketModal, TicketDetailModal, CommentSection
│   │   ├── context/            # AuthContext, ProjectContext, ToastContext
│   │   ├── pages/              # BoardPage, BacklogPage, DashboardPage, LoginPage
│   │   ├── App.jsx             # Routes & layout provider wrapper
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # MongoDB (db.js) & Cloudinary (cloudinary.js)
│   │   ├── controllers/        # Auth, User, Project, Sprint, Ticket, Comment, Upload
│   │   ├── middleware/         # Auth (JWT), RBAC, Multer upload, ErrorHandler
│   │   ├── models/             # User, Project, Sprint, Ticket, Comment, ActivityLog
│   │   ├── routes/             # Express API route definitions
│   │   ├── services/           # Nodemailer email notification templates
│   │   ├── utils/              # Database seeder (seedData.js), password generator
│   │   └── server.js           # Server entry point
│   ├── .env                    # Backend environment configuration
│   └── package.json
│
├── docker-compose.yml          # Container configuration for MongoDB & Backend
├── package.json                # Monorepo root scripts
└── README.md                   # Project documentation
```

---

## 📦 Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **npm** (v9+) or **yarn**
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- **Cloudinary Account** (Free tier) — [Sign up on Cloudinary](https://cloudinary.com/)
- **Docker & Docker Compose** *(Optional, if running via containers)*

---

## 🚀 Quick Start & Setup Guide

### 1. Clone Repository & Install Dependencies

From the project root folder (`JIR_clone/`), install dependencies for all workspaces with a single command:

```bash
# Install root, backend, and frontend packages
npm run install:all
```

*Or manually install inside each folder:*
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

---

### 2. Environment Variables Configuration

Open the `server/.env` file and configure your credentials:

```env
# Server Runtime
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/jira_clone

# Security
JWT_SECRET=super_secret_jira_key_2026_antigravity

# Cloudinary Storage (For Image & Screenshot Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gmail SMTP Configuration (For Automated Email Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Jira Engine" <your_email@gmail.com>
```

> [!TIP]
> **Getting Gmail App Password:**
> 1. Go to your Google Account > Security > **2-Step Verification**.
> 2. At the bottom, select **App Passwords**.
> 3. Create an app password named "Jira Clone" and paste the 16-character code into `SMTP_PASS`.

---

### 3. Running the Project Locally

You can launch both the **Backend API** and the **Frontend Client** together with one command from the project root:

```bash
npm run dev
```

*Or run them in separate terminal windows:*

**Terminal 1 — Backend Server:**
```bash
npm run server
# Running at: http://localhost:5000
```

**Terminal 2 — Frontend Client:**
```bash
npm run client
# Running at: http://localhost:5173
```

Once running:
- **Frontend App:** Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 4. Running via Docker

If you prefer running via Docker containers:

```bash
docker-compose up -d --build
```
This starts:
- MongoDB database container on port `27017`
- Express backend container on port `5000`

---

## 🔑 Default Seed Credentials

When the backend starts up for the first time, it automatically initializes the database with demo users, a project (`JIR`), an active sprint, and sample tickets:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | System Admin | `admin@gmail.com` | `password@12345` |
| **Project Lead** | Sarah Lead | `sarah.lead@jira.com` | `password123` |
| **Developer** | Alex Developer | `alex.dev@jira.com` | `password123` |
| **Tester** | Taylor Tester | `taylor.tester@jira.com` | `password123` |

> [!NOTE]
> Public user registration is disabled by default to follow corporate Jira security principles. The **Admin** or **Project Lead** creates new team accounts from the navigation bar (`Add Member`).

---

## ☁️ Cloudinary Integration Guide

Cloudinary powers all media storage in this application.

### Features Supported:
1. **Ticket Issue Attachments**:
   - Drag-and-drop or select screenshots in `Create Ticket Modal` or `Ticket Detail Modal`.
   - Files are validated (JPG, PNG, WebP, GIF, SVG) up to 10MB.
   - Attachments render with thumbnails, file size indicators, and a full-size lightbox preview.
2. **User Profile Photo / Avatar**:
   - Click on user profile in the top navbar and choose **"Profile & Photo"**.
   - Upload any custom photo. It is automatically transformed to `256x256` with smart face cropping (`gravity: 'face'`).
3. **Automatic Cleanup**:
   - Removing an attachment or deleting a ticket automatically issues a delete command to Cloudinary to prevent orphaned storage.

---

## 📬 Email Notification Engine (Nodemailer)

The server includes automated email triggers:
- **`sendTicketAssignedEmail`**: Triggered when a ticket is created with an assignee or when the assignee is updated.
- **`sendTicketStatusChangedEmail`**: Triggered when a ticket moves to another column (e.g. `To Do` ➔ `Done`).
- **`sendMentionEmail`**: Triggered when typing `@User` inside a ticket's comment box.
- **`sendWelcomeUserEmail`**: Sent to newly invited team members with their auto-generated password.
- **`sendForgotPasswordEmail`**: Dispatches a secure temporary password reset.

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset email | Public |
| `GET` | `/api/auth/me` | Get current authenticated user profile | Private |

### Media Upload (`/api/upload`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload/image` | Upload a single image to Cloudinary | Private |
| `POST` | `/api/upload/images` | Upload up to 10 images concurrently | Private |
| `POST` | `/api/upload/avatar` | Upload and set profile avatar photo | Private |
| `DELETE` | `/api/upload/:publicId` | Delete image from Cloudinary | Private |
| `GET` | `/api/upload/status` | Check Cloudinary configuration status | Public |

### Tickets (`/api/tickets`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | List tickets (filters: project, sprint, status, search) | Private |
| `GET` | `/api/tickets/:id` | Get ticket details and activity logs | Private |
| `POST` | `/api/tickets` | Create a new ticket (with optional attachments) | Private |
| `PUT` | `/api/tickets/:id` | Update ticket details | Private |
| `PUT` | `/api/tickets/:id/status`| Update ticket status (Kanban drag-and-drop) | Private |
| `POST` | `/api/tickets/:id/attachments` | Add attachment to ticket | Private |
| `DELETE`| `/api/tickets/:id/attachments/:attachmentId` | Remove attachment from ticket | Private |
| `DELETE`| `/api/tickets/:id` | Delete ticket (Admin/ProjectLead only) | Admin/Lead |

### Sprints (`/api/sprints`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sprints/project/:projectId` | Get all sprints for a project | Private |
| `POST` | `/api/sprints` | Create a new sprint | Admin/Lead |
| `PUT` | `/api/sprints/:id/status` | Start (`Active`) or complete (`Closed`) sprint | Admin/Lead |

---

## 🔄 CI/CD Pipeline (GitHub Actions ➔ Render & Vercel)

The repository includes an automated CI/CD pipeline in [`.github/workflows/ci-cd.yml`](file:///.github/workflows/ci-cd.yml).

### Pipeline Workflow Architecture:
```
[Push to main/master]
       │
       ├──► 1. Backend CI  ──► Node.js 18 setup, dependency install, syntax checks
       │
       └──► 2. Frontend CI ──► Node.js 18 setup, Vite bundle compilation & dist artifact
               │
               ▼ (On Success)
       ├──► 3. Deploy Backend  ──► Render (via Deploy Hook URL)
       │
       └──► 4. Deploy Frontend ──► Vercel (via Deploy Hook URL or Vercel CLI)
```

### Setup Instructions for Automated Deployment:

#### A. Backend on Render:
1. Create a Web Service on [Render](https://render.com) pointing to this repository (or use `render.yaml` Blueprint).
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
2. Under **Settings** > **Deploy Hook**, copy your unique **Deploy Hook URL**.
3. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: `https://api.render.com/deploy/srv-xxxxxx?key=xxxxxx`

#### B. Frontend on Vercel:
1. Import the project into [Vercel](https://vercel.com).
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
2. Under **Project Settings** > **Git** > **Deploy Hooks**, create a hook named `github-actions-main` and copy the URL.
3. In your GitHub repository secrets, add:
   - Name: `VERCEL_DEPLOY_HOOK_URL`
   - Value: `https://api.vercel.com/v1/integrations/deploy/prj_xxxxxx/xxxxxx`
   *(Alternatively, if using Vercel CLI tokens, you can provide `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`).*

Whenever code is pushed to `main` or `master`, GitHub Actions automatically validates the code, builds the production bundles, and triggers live deployments!

---

## ❓ Troubleshooting & FAQs

### 1. MongoDB Connection Error (`ECONNREFUSED`)
- Ensure your MongoDB service is running locally:
  ```bash
  # Windows (Command Prompt / Services)
  net start MongoDB
  ```
- If using MongoDB Atlas, update `MONGODB_URI` in `server/.env` with your connection string:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jira_clone?retryWrites=true&w=majority
  ```

### 2. Cloudinary Upload Fails
- Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly copied from your Cloudinary dashboard without extra spaces or quotes.
- You can test configuration status via `http://localhost:5000/api/upload/status`.

### 3. Emails Not Sending
- If using Gmail, ensure **2-Step Verification** is enabled and you are using an **16-character App Password** (not your standard Gmail account password).
- Check server terminal logs for `[Welcome Email Error]` or `[Nodemailer Error]`.

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
