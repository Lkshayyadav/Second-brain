# Second Brain (Brainly)

Second Brain is a clean, modern knowledge management web application designed to help users store, categorize, search, and curate their digital resources (articles, notes, PDF files, YouTube videos, Twitter posts, GitHub repositories, and more) into organized collections.

## Tech Stack

- **Frontend**: React (v18), TypeScript, Vite, React Router, TailwindCSS.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Database**: MongoDB (Atlas).
- **Authentication**: JSON Web Tokens (JWT), Bcrypt password hashing.
- **Validation**: Zod schema validation.

## Key Features

1. **JWT Authentication & Profile Security**:
   - Secure register and login.
   - Profile settings panel to update passwords.
2. **Resource Management (CRUD)**:
   - Save links, articles, documents, notes, or media.
   - Dynamic tag support (`#tag`).
   - Favorites (`★`) and pinning (`📌`).
   - Live inline reading status progression (`To Read`, `Reading`, `Completed`).
3. **Workspace Organization**:
   - Create, rename, and delete collections.
   - Automatically unsets collection references upon deletion.
4. **Rich Dashboard & Metrics**:
   - Total items count, status metrics, and category summaries.
   - Sidebars displaying recently added items, recently edited items, and recent collections.
   - Quick Action buttons.
5. **Advanced Search & Filtering**:
   - Search by title, description, category, tags, type, or collection.
   - Matching search text is highlighted in real-time.
   - Sorting (Newest, Oldest, Alphabetical) and filtering by status/category.
6. **Keyboard Shortcuts**:
   - `Ctrl + K` or `/` : Focus search input.
   - `N` : Open the add content modal.
   - `ESC` : Close any active modal.
7. **Workspace Data Export/Import**:
   - Backup the entire workspace as a validated JSON file.
   - Restore the JSON backup (re-mapping collections by name to avoid duplicate duplicates).
8. **Toast Notifications & Modals**:
   - Custom notification toast alerts for all CRUD/auth flows.
   - Reusable modal dialogue confirmation screens.
9. **Responsive Design**:
   - Mobile, tablet, and desktop adaptive layouts.

---

## Folder Structure

```text
├── backend
│   ├── src
│   │   ├── controllers     # User, Content, and Collection controllers
│   │   ├── db              # Mongoose DB connection logic
│   │   ├── middleware      # Auth verify and Error handling middleware
│   │   ├── models          # Mongoose schema definitions
│   │   ├── routes          # Express API route bindings
│   │   ├── validation      # Zod validation schemas
│   │   └── index.ts        # App startup entry point
│   ├── .env.example
│   └── tsconfig.json
├── frontend
│   ├── src
│   │   ├── components      # Reusable components & Layouts (Sidebar, Modal)
│   │   ├── contexts        # Auth and Toast Notification providers
│   │   ├── icons           # UI SVGs
│   │   ├── pages           # Dashboard, Sign In/Up, Settings, Landing
│   │   ├── router          # Protected client-side routing
│   │   ├── services        # Axios API handlers
│   │   ├── types           # TypeScript definitions
│   │   └── main.tsx        # React client mount point
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Clone and Setup Environment

Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_secret
PORT=3000
```

### 3. Running the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will boot and connect to MongoDB. It runs on `http://localhost:3000`.

### 4. Running the Frontend Server
```bash
cd frontend
npm install
npm run dev
```
The client app will launch on `http://localhost:5173` or `http://localhost:5174`.

---

## API Endpoints

### Authentication
- `POST /api/v1/users/signup` - Register a new user.
- `POST /api/v1/users/signin` - Authenticate and return JWT token.
- `PUT /api/v1/users/password` - Update password (Protected).

### Content (Protected)
- `GET /api/v1/content` - Get all contents for the logged-in user.
- `POST /api/v1/content` - Create a content card.
- `PUT /api/v1/content/:id` - Update content details (favorite, pin, status, tags).
- `DELETE /api/v1/content/:id` - Delete content item.

### Collections (Protected)
- `GET /api/v1/collections` - Get all collections.
- `POST /api/v1/collections` - Create a new collection.
- `PUT /api/v1/collections/:id` - Rename collection.
- `DELETE /api/v1/collections/:id` - Delete collection.
