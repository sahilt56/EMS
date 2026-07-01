# Event Management System (EMS) 🚀

This is a comprehensive Event Management SaaS platform built with the MERN stack (MongoDB, Express.js, React, Node.js) along with Firebase for authentication, Razorpay for payments, and Socket.io for real-time features.

## 🌟 Project Overview

This project provides a complete solution for organizing and attending events. 
- **Organizers** can create events, manage attendees, and track payments.
- **Attendees** can browse events, purchase tickets securely, and participate in real-time event lounges.
- **Key Features Include**: 
  - Secure Authentication via Firebase
  - Real-time chat & lounge features using Socket.io
  - Payment gateway integration with Razorpay
  - Image uploads via Cloudinary
  - AI-powered functionalities using Gemini API

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, GSAP
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Services:** Firebase, Razorpay, Cloudinary, Gemini AI

---

## 🚀 How to Run the Project Locally

Follow these steps to set up and run the project on your local machine.

### 1. Install Dependencies

You will need to install dependencies for both the frontend and the backend separately.

Open two separate terminal windows or tabs.

**Terminal 1: Backend**
```bash
cd backend
npm install
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
```

### 2. Environment Variables Setup (.env files)

You need to create **two** separate `.env` files: one in the `backend` folder and one in the `frontend` folder.

#### 📍 Backend Environment Variables
Create a file named `.env` inside the **`backend`** directory (`backend/.env`) and add the following keys with your own credentials:

```env
# Server Setup
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# Razorpay (For Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Firebase Admin (Get this from Firebase Project Settings -> Service Accounts -> Generate New Private Key)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key" # Keep this wrapped in quotes if it contains \n

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

#### 📍 Frontend Environment Variables
Create a file named `.env` inside the **`frontend`** directory (`frontend/.env`) and add the following keys:

```env
# API & Websocket URLs
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000

# Firebase Client SDK (Get this from Firebase Project Settings -> General -> Web App)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary (For Image Uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Razorpay
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Start the Application

Once your `.env` files are created and populated, you can start both development servers.

**Terminal 1: Start Backend**
```bash
cd backend
npm run dev
```
*(The backend server will start on http://localhost:5000)*

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```
*(The frontend Vite server will start on http://localhost:5173)*

🎉 **You're all set! Open your browser and go to `http://localhost:5173` to see the app.**
