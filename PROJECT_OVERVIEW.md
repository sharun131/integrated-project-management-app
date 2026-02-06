# Unified Project Management System - Complete Project Overview

## 📋 Project Summary

The **Unified Project Management System** is a full-stack web application designed for managing projects, tasks, timesheets, issues, documents, and team collaboration. It provides role-based access control (RBAC), real-time notifications, and comprehensive project tracking features.

---

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB (via Mongoose v9.1.5)
- **Authentication**: JWT (jsonwebtoken v9.0.3)
- **Security**: 
  - Bcryptjs v3.0.3 (password hashing)
  - Helmet v8.1.0 (security headers)
  - CORS v2.8.6 (cross-origin requests)
- **File Upload**: Multer v2.0.2
- **Validation**: express-validator v7.3.1
- **Logging**: Morgan v1.10.1
- **Environment**: dotenv v17.2.3

### Frontend
- **Framework**: React v19.2.0 with React Router v7.13.0
- **Build Tool**: Vite v7.2.4
- **UI Framework**: Tailwind CSS v4.1.18
- **Data Fetching**: Axios v1.13.4
- **Charts/Graphs**: Recharts v3.7.0
- **Icons**: Lucide React v0.563.0
- **Styling Utilities**: 
  - clsx v2.1.1
  - tailwind-merge v3.4.0

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection setup
├── controllers/                 # Business logic for each module
│   ├── authController.js        # User authentication & registration
│   ├── projectController.js     # Project CRUD operations
│   ├── taskController.js        # Task management
│   ├── milestoneController.js   # Milestone tracking
│   ├── issueController.js       # Issue/bug tracking
│   ├── documentController.js    # Document management
│   ├── messageController.js     # Task comments/messages
│   ├── timesheetController.js   # Time tracking
│   ├── notificationController.js# User notifications
│   ├── fileUploadController.js  # File upload handling
│   ├── dashboardController.js   # Dashboard statistics
│   └── analyticsController.js   # Analytics & reporting
├── middleware/
│   ├── auth.js                  # JWT authentication & RBAC
│   └── upload.js                # File upload middleware (Multer)
├── models/                      # Mongoose schemas
│   ├── User.js                  # User schema with roles
│   ├── Project.js               # Project schema
│   ├── Task.js                  # Task schema with subtasks
│   ├── Milestone.js             # Milestone with progress tracking
│   ├── Issue.js                 # Issue/bug schema
│   ├── Message.js               # Task comments/discussions
│   ├── Timesheet.js             # Time entry schema
│   ├── Document.js              # Document metadata
│   ├── FileUpload.js            # File upload records
│   ├── Notification.js          # User notifications
│   └── Phase.js                 # Project phases
├── routes/                      # API endpoints
│   ├── auth.js                  # Authentication routes
│   ├── projects.js              # Project routes
│   ├── tasks.js                 # Task routes
│   ├── milestones.js            # Milestone routes
│   ├── issues.js                # Issue routes
│   ├── documents.js             # Document routes
│   ├── messages.js              # Message routes
│   ├── timesheets.js            # Timesheet routes
│   ├── files.js                 # File upload routes
│   ├── notifications.js         # Notification routes
│   ├── dashboard.js             # Dashboard routes
│   └── analytics.js             # Analytics routes
├── scripts/
│   ├── seed_users.js            # Seed database with test users
│   └── test_rbac.js             # RBAC testing script
├── uploads/                     # File storage directory
├── server.js                    # Main server entry point
└── package.json                 # Backend dependencies

frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ChatSection.jsx      # Task comment section
│   │   ├── CreateProjectModal.jsx# Project creation modal
│   │   ├── CreateTaskModal.jsx  # Task creation modal
│   │   ├── FileSection.jsx      # File upload/view section
│   │   ├── LogTimeModal.jsx     # Timesheet entry modal
│   │   ├── Modal.jsx            # Base modal component
│   │   ├── NotificationBell.jsx # Notification indicator
│   │   ├── ProtectedRoute.jsx   # Route protection wrapper
│   │   ├── ReportIssueModal.jsx # Issue reporting modal
│   │   ├── TaskDetailModal.jsx  # Task details modal
│   │   ├── UploadDocumentModal.jsx# Document upload modal
│   │   └── ui/                  # UI component library
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── FadeIn.jsx
│   │       ├── GlassPanel.jsx   # Glassmorphism panel
│   │       ├── Input.jsx
│   │       └── StatsCard.jsx    # Statistics card
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── layouts/
│   │   └── DashboardLayout.jsx  # Main dashboard layout with sidebar
│   ├── pages/                   # Page components
│   │   ├── DashboardHome.jsx    # Dashboard home with statistics
│   │   ├── Projects.jsx         # Projects listing & management
│   │   ├── Tasks.jsx            # Tasks listing & management
│   │   ├── Issues.jsx           # Issue tracking page
│   │   ├── Documents.jsx        # Document management
│   │   ├── Timesheets.jsx       # Time tracking page
│   │   ├── Reports.jsx          # Analytics & reports
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   └── NotificationsPage.jsx# Notifications page
│   ├── App.jsx                  # Main app component with routing
│   ├── App.css                  # App-level styles
│   ├── index.css                # Global styles
│   ├── main.jsx                 # React entry point
│   └── assets/                  # Static assets
├── public/                      # Public static files
├── vite.config.js               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── index.html                   # HTML entry point
├── eslint.config.js             # ESLint configuration
└── package.json                 # Frontend dependencies

```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead', 'Team Member', 'Client'],
  title: String,
  department: String,
  projects: [ObjectId],
  status: Enum ['Active', 'Inactive'],
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  name: String,
  description: String,
  status: Enum ['Active', 'On Hold', 'Completed', 'Archived'],
  startDate: Date,
  endDate: Date,
  manager: ObjectId (User),
  team: [{
    user: ObjectId (User),
    role: String
  }],
  budget: Number,
  client: ObjectId (User),
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String,
  description: String,
  project: ObjectId (Project),
  milestone: ObjectId (Milestone),
  phase: ObjectId (Phase),
  assignedTo: ObjectId (User),
  status: Enum ['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'],
  priority: Enum ['Low', 'Medium', 'High', 'Critical'],
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  subtasks: [{
    title: String,
    completed: Boolean
  }],
  dependencies: [ObjectId (Task)],
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Milestone Model
```javascript
{
  project: ObjectId (Project),
  name: String,
  description: String,
  dueDate: Date,
  progress: Number (0-100),
  progressCalculationMethod: Enum ['MANUAL', 'AUTO_FROM_TASKS'],
  status: Enum ['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'],
  createdBy: ObjectId (User),
  assignedUsers: [ObjectId (User)],
  isLocked: Boolean,
  lockedBy: ObjectId (User),
  lockedAt: Date,
  isDeleted: Boolean,
  deletedBy: ObjectId (User),
  deletedAt: Date,
  progressHistory: [{
    progress: Number,
    changedBy: ObjectId (User),
    changedAt: Date,
    reason: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Issue Model
```javascript
{
  title: String,
  description: String,
  project: ObjectId (Project),
  reportedBy: ObjectId (User),
  assignedTo: ObjectId (User),
  priority: Enum ['Low', 'Medium', 'High', 'Critical'],
  severity: Enum ['Minor', 'Major', 'Critical', 'Blocker'],
  status: Enum ['Open', 'In Progress', 'Resolved', 'Closed'],
  type: Enum ['Bug', 'Feature', 'Improvement'],
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Timesheet Model
```javascript
{
  user: ObjectId (User),
  project: ObjectId (Project),
  task: ObjectId (Task),
  date: Date,
  hours: Number (0.1-24),
  description: String,
  status: Enum ['Pending', 'Approved', 'Rejected'],
  approvedBy: ObjectId (User),
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model (Task Comments)
```javascript
{
  text: String,
  task: ObjectId (Task),
  project: ObjectId (Project),
  sender: ObjectId (User),
  reactions: [{
    emoji: String,
    user: ObjectId (User)
  }],
  isEdited: Boolean,
  editedAt: Date,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model
```javascript
{
  project: ObjectId (Project),
  uploader: ObjectId (User),
  name: String,
  originalName: String,
  filePath: String,
  fileType: String,
  fileSize: Number,
  version: Number,
  tags: [String],
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  recipient: ObjectId (User),
  title: String,
  message: String,
  type: Enum ['info', 'success', 'warning', 'error'],
  link: String,
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### JWT Authentication
- Tokens generated on login/register with expiry
- Tokens stored in localStorage on frontend
- Axios interceptors automatically add token to requests
- Backend `protect` middleware validates tokens

### Role-Based Access Control (RBAC)
**User Roles:**
1. **Super Admin** - Full system access
2. **Project Admin** - Manage projects and users
3. **Project Manager** - Create/manage projects and teams
4. **Team Lead** - Lead teams, assign tasks
5. **Team Member** - Work on assigned tasks
6. **Client** - View project updates (limited access)

**Authorization:**
- Middleware `authorize()` restricts routes by role
- Routes check user role before allowing operations
- Project managers can only see their own projects
- Team members see projects they're assigned to

---

## 🎨 Frontend Design System

### Color Scheme (Glassmorphism Theme)
- **Primary**: #3b82f6 (Bright Blue)
- **Secondary**: #8b5cf6 (Violet)
- **Accent**: #00f2fe (Cyan Neon)
- **Danger**: #ef4444 (Red)
- **Success**: #10b981 (Emerald)
- **Dark**: #0f172a (Slate-900)

### Styling Features
- **Glassmorphism**: Semi-transparent panels with blur effects
- **Gradient Background**: Deep blue-black gradient (135deg)
- **Custom Scrollbar**: Styled with transparency
- **Font**: Inter (Google Fonts) with multiple weights
- **Responsive**: Mobile-first design with Tailwind CSS

### Key UI Components
- **GlassPanel**: Reusable glassmorphic container
- **StatsCard**: Statistics display with icons and trends
- **Button**: Role-aware button component
- **Modal**: Dialog boxes for forms
- **Badge**: Status/priority indicators
- **Cards**: Content containers

---

## 🚀 Key Features

### 1. Project Management
- Create, read, update, delete projects
- Assign team members with roles
- Track project status (Active, On Hold, Completed, Archived)
- Budget tracking
- Client management

### 2. Task Management
- Create tasks with priority levels
- Assign tasks to team members
- Track task status (To Do, In Progress, In Review, Completed, Blocked)
- Subtasks for breaking down work
- Task dependencies
- Due date tracking
- Time estimation and actual hours

### 3. Milestone Tracking
- Create milestones for projects
- Automatic progress calculation from tasks
- Manual progress override
- Lock milestones to prevent changes
- Progress history with rollback capability
- Soft delete with recovery

### 4. Issue Tracking
- Report and track bugs, features, improvements
- Severity levels (Minor, Major, Critical, Blocker)
- Priority levels (Low, Medium, High, Critical)
- Issue status tracking (Open, In Progress, Resolved, Closed)
- Assign issues to team members

### 5. Time Tracking (Timesheets)
- Log work hours by project/task
- Daily time entries with descriptions
- Approval workflow (Pending, Approved, Rejected)
- Manager approval system
- Time analytics

### 6. Document Management
- Upload project documents
- Version control for documents
- Tag and categorize documents
- Download documents
- File type restrictions (10MB limit)

### 7. Team Collaboration
- Task comments/messages
- Emoji reactions on comments
- Edit and delete messages
- Project team management
- User assignment to projects

### 8. Notifications
- Real-time notification system
- Notification types (info, success, warning, error)
- Mark notifications as read
- Notification links for quick navigation

### 9. Dashboard & Analytics
- Task statistics (completed, pending, high priority)
- Project overview
- Team activity tracking
- Charts and visualizations using Recharts
- Performance metrics

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects (filtered by role)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (by project)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Milestones
- `GET /api/milestones` - List milestones
- `POST /api/milestones` - Create milestone
- `GET /api/milestones/:id` - Get milestone
- `PUT /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone

### Issues
- `GET /api/issues` - List issues
- `POST /api/issues` - Report issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue status
- `DELETE /api/issues/:id` - Delete issue

### Timesheets
- `GET /api/timesheets` - List timesheet entries
- `POST /api/timesheets` - Create timesheet entry
- `PUT /api/timesheets/:id` - Approve/reject timesheet
- `DELETE /api/timesheets/:id` - Delete entry

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/download/:id` - Download document

### Messages
- `GET /api/messages/:taskId` - Get task messages
- `POST /api/messages` - Post message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard statistics

### Analytics
- `GET /api/analytics/projects` - Project analytics
- `GET /api/analytics/tasks` - Task analytics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

---

## 🔧 Configuration

### Environment Variables (Backend)
Create `.env` file in backend directory:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/unified-project-mgmt
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

### File Upload Settings
- Max file size: 10MB
- Allowed types: jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, txt, zip
- Storage: Local filesystem (`/uploads` directory)

---

## 🚀 Running the Application

### Backend Setup
```bash
cd backend
npm install
npm run dev        # Development mode with auto-reload
npm run start      # Production mode
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Build for production
npm run lint       # Check code quality
npm run preview    # Preview production build
```

---

## 📊 Database Indexes

### Optimized Queries
- **User**: Email (unique)
- **Project**: Manager, Team members
- **Task**: Project, Milestone, Assigned user
- **Timesheet**: User, Date (composite), Project
- **Milestone**: Project, Soft delete status
- **Notification**: Recipient, Creation date

---

## 🔄 Data Flow

1. **User Login**: Credentials sent to backend → JWT token generated → Token stored locally
2. **Protected Requests**: Frontend adds token to headers → Backend verifies → Routes execute
3. **Project Creation**: Form → API POST → Controller validates → Database saves → Response
4. **Task Updates**: Edit form → API PUT → Controller updates → Database changes → Dashboard refreshes
5. **File Upload**: Multer receives file → Saves to `/uploads` → Record in DB → Frontend shows

---

## 🎯 Key Architectural Patterns

1. **MVC Pattern**: Controllers handle business logic, Models define schemas
2. **Middleware Pattern**: Auth and upload middleware for cross-cutting concerns
3. **Context API**: Frontend state management via React Context
4. **REST API**: RESTful endpoints for all resources
5. **JWT Authentication**: Stateless authentication with tokens
6. **Axios Interceptors**: Automatic token injection and error handling

---

## 🛠️ Development Notes

### Seed Users Script
- Located at `backend/scripts/seed_users.js`
- Creates test users with different roles
- Useful for testing RBAC

### RBAC Testing
- Located at `backend/scripts/test_rbac.js`
- Validates role-based access restrictions

### Error Handling
- Backend: Try-catch blocks with error responses
- Frontend: Axios error handling with user feedback

### Security Features
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- JWT expiration
- Input validation with express-validator

---

## 📱 Responsive Design

- **Desktop**: Full sidebar, multi-column layouts
- **Tablet**: Responsive grid adjustments
- **Mobile**: Collapsible sidebar, single column layouts
- **Breakpoints**: md (768px), lg (1024px)

---

## 🎓 Learning Resources

This project demonstrates:
- Full-stack JavaScript/Node.js development
- MongoDB database design and queries
- RESTful API design
- React component architecture
- Authentication and authorization
- File upload handling
- Responsive design with Tailwind CSS
- Real-time notifications concepts
- Project management best practices

---

## 📝 Summary

The **Unified Project Management System** is a comprehensive project management solution with:
- ✅ Complete authentication and authorization
- ✅ Project, task, milestone, and issue tracking
- ✅ Time tracking with approval workflows
- ✅ Document management
- ✅ Team collaboration features
- ✅ Dashboard with analytics
- ✅ Modern glassmorphism UI design
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Scalable architecture

Perfect for managing projects, teams, and resources in organizations!
