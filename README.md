# Event Management System

A full-stack MERN-based Event Management System that allows users to explore events, register, and manage event-related activities.

## 🌐 Live Demo

- **Frontend:** https://event-management-system-beta-five-81.vercel.app
- **Backend:** https://event-management-system-almw.onrender.com

## 🚀 Technologies Used

- React.js
- Node.js
- Express.js
- MongoDB Atlas
- JavaScript
- HTML & CSS
- REST API
- Git & GitHub

## ✨ Features

- User Registration and Login
- Event Management
- Browse Available Events
- Event Booking
- User Authentication
- Backend REST APIs
- MongoDB Database Integration

## 📁 Project Structure

```text
Event-Management-System/
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── Frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/nirmaldarbar/event-management-system.git
cd event-management-system
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside the Backend folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

Start Backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
npm start
```

## ☁️ Deployment

- Frontend deployed on Vercel.
- Backend deployed on Render.
- Database hosted on MongoDB Atlas.

## 🔐 Security

- Keep `.env` files private.
- Never upload database passwords or secret keys to GitHub.
- Use environment variables for sensitive information.

## 👨‍💻 Author

**Nirmal Darbar**

GitHub: https://github.com/nirmaldarbar

---

⭐ If you like this project, consider giving it a star!
