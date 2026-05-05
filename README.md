# Team Task Management Web Application

A complete production-ready task management application inspired by Trello/Asana, built using the MERN stack with modern features like drag-and-drop Kanban boards, role-based access control, and a responsive Tailwind UI.

## Folder Structure

```
├── backend/
│   ├── controllers/      # Route controllers (auth, projects, tasks, dashboard)
│   ├── middleware/       # JWT Token verification & Role protection
│   ├── models/           # Mongoose schemas (User, Project, Task)
│   ├── routes/           # Express router endpoints
│   ├── server.js         # Entry point
│   ├── seed.js           # Mock data seeder
│   └── .env              # Environment vars (Not in VCS)
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Layout, TaskCard, TaskModal, etc.)
│   │   ├── context/      # (Using Zustand store instead for state management)
│   │   ├── lib/          # Axios setup with interceptors
│   │   ├── pages/        # Main pages (Login, Dashboard, ProjectList, TaskBoard)
│   │   ├── store/        # Zustand global states (Auth)
│   │   ├── App.jsx       # Routing logic
│   │   └── main.jsx      # React injection
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas cluster.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory by copying `.env.example`:
   ```bash
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/task-manager
   JWT_SECRET=any_strong_secret
   ```
4. Seed the database with initial users and tasks (Optional but recommended for testing):
   ```bash
   node seed.js
   ```
   *This creates: `admin@test.com` (Admin) & `member@test.com` (Member). Password for both is `password123`.*
5. Run the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory (Optional if backend runs on port 5000):
   ```bash
   VITE_API_URL=http://localhost:5000
   ```
4. Run the frontend dev server:
   ```bash
   npm run dev
   ```

---

## Deployment Steps (Railway)

Both frontend and backend can be hosted on [Railway](https://railway.app/).

### Prerequisites
1. Create a GitHub repository and push this entire project. 
2. Ensure you have a MongoDB Atlas cluster URI ready.

### Deploying Backend
1. In Railway, click **New Project** -> **Deploy from GitHub repo**.
2. Select your repository.
3. Once imported, go to the Service Settings for the backend:
   - Change the Root Directory to `/backend`.
   - Set the Start Command to: `npm start`
4. Go to the **Variables** tab and add:
   - `PORT`: `5000`
   - `MONGO_URI`: `your_mongo_atlas_connection_string`
   - `JWT_SECRET`: `your_secure_random_string`
5. Railway will automatically build and deploy. Grab the generated public URL!

### Deploying Frontend
1. Click **New** -> **Service** -> **GitHub Repo** (use the same repo).
2. Go to Service Settings for the frontend:
   - Change Root Directory to `/frontend`.
   - The Builder should auto-detect Vite/Node.
   - Set Start Command (if necessary, though Vite builds statically) or let it use Railway's default static site hosting configuration.
3. Go to the **Variables** tab and add:
   - `VITE_API_URL`: `<The Railway URL of your backend service>`
4. Deploy the service.

---

## API Testing Examples (Postman)

Here are examples of endpoints you can test using Postman or cURL:

1. **Authentication (Login)**
   - **Method**: `POST`
   - **URL**: `http://localhost:5000/api/auth/login`
   - **Body (JSON)**: 
     ```json
     {
       "email": "admin@test.com",
       "password": "password123"
     }
     ```
   - *Extract the `token` from the response.*

2. **Create Project (Admin Only)**
   - **Method**: `POST`
   - **URL**: `http://localhost:5000/api/projects`
   - **Headers**: `Authorization: Bearer <your_token>`
   - **Body**:
     ```json
     {
       "name": "Q3 Marketing Planning"
     }
     ```

3. **Get Dashboard Metrics**
   - **Method**: `GET`
   - **URL**: `http://localhost:5000/api/dashboard`
   - **Headers**: `Authorization: Bearer <your_token>`

4. **Change Task Status**
   - **Method**: `PUT`
   - **URL**: `http://localhost:5000/api/tasks/:task_id`
   - **Headers**: `Authorization: Bearer <your_token>`
   - **Body**:
     ```json
     {
       "status": "Done"
     }
     ```
