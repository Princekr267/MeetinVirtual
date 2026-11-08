# MeetInVirtual

Full-stack, peer-to-peer video conferencing and collaborative meeting platform inspired by Google Meet, built with the MERN stack, WebRTC, and Socket.IO.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb)](https://www.mongodb.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P%20Mesh-333333?logo=webrtc)](https://webrtc.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)](https://socket.io/)
[![Stars](https://img.shields.io/github/stars/Princekr267/MeetInVirtual?style=social)](https://github.com/Princekr267/MeetInVirtual/stargazers)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Screenshots & Demo](#screenshots--demo)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & How It Works](#architecture--how-it-works)
- [Project Folder Structure](#project-folder-structure)
- [Prerequisites](#prerequisites)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [How to Use the Application](#how-to-use-the-application)
- [API Overview](#api-overview)
- [Security & Technical Notes](#security--technical-notes)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [License & Author](#license--author)

---

## About the Project

**MeetInVirtual** is a full-stack real-time video conferencing web application. Developed as an exploratory learning and portfolio project, it investigates how browser-native WebRTC APIs, WebSocket signaling servers, and collaborative canvas tools integrate to deliver multi-user meeting experiences.

The application allows users to create or join video meetings using unique 10-character room codes. Media streams (audio, video, and screen share) flow directly between connected peers over WebRTC, while room orchestration, signaling negotiation, live text chat, file transfers, and whiteboard synchronization are coordinated through a Node.js and Socket.IO backend.

> **Project Scope Notice:** MeetInVirtual is designed for educational, exploratory, and small-group use. It implements a peer-to-peer (P2P) full-mesh WebRTC topology, making it well-suited for small collaborative calls rather than large-scale enterprise webinars.

---

## Screenshots & Demo

<!-- Place your application screenshots or demo GIFs in frontend/public or link them from GitHub Releases/Assets -->

| In-Call Conference Grid | Real-Time Collaborative Whiteboard |
| :---: | :---: |
| ![Conference Grid](frontend/public/mobile.png) <br> *(Conference view with independent screen sharing)* | *(Collaborative Fabric.js drawing canvas with real-time sync)* |

| Mobile Lobby & Device Preview | Gemini AI Assistant in Live Chat |
| :---: | :---: |
| *(Responsive 16:9 camera preview with audio/video controls)* | *(Context-aware meeting Q&A powered by Google Gemini)* |

---

## Key Features

### Audio & Video Conferencing
- **Peer-to-Peer Mesh WebRTC:** Direct browser-to-browser media streaming without intermediate media servers.
- **Independent Hardware Toggles:** Toggle webcam and microphone independently. Hardware tracks are stopped immediately upon disabling to turn off device indicator lights and release resources.
- **Aspect Ratio Preservation:** Video tiles use `object-fit: contain` with dynamic aspect-ratio containers, preventing webcam feeds from being cropped on 4:3 or widescreen displays.

### Independent Screen Sharing
- **Dedicated Presentation Stream:** Screen sharing creates an independent presentation tile (`[Name]'s Presentation`) rather than replacing the user's camera feed.
- **Dual Stream Capability:** Presenters can share their screen with camera ON or OFF, or stream both their webcam and presentation simultaneously.

### Dynamic Layout & Spotlight
- **6-Tile Grid Pagination:** Meetings cleanly paginate up to 6 video tiles per page on desktop and laptop screens to avoid layout clutter.
- **Glassmorphic Navigation Bar:** A top-centered pagination control (`< Page X / Y >`) allows smooth navigation between participant pages.
- **1-Click Pin Spotlight:** Pin any participant or screen share feed to lock it into a full-screen spotlight stage, with a 1-click unpin option to return to grid view.

### In-Meeting Collaboration
- **Real-Time Live Chat:** Broadcast text messages to all participants in the room via Socket.IO.
- **In-Chat File Sharing (up to 5 MB):** Transfer documents, images, and archives directly in the chat drawer with instant download buttons.
- **Chat Transcript Export:** Download the entire meeting conversation as a formatted plain text file (`chat.txt`) with a single click.
- **Shared Interactive Whiteboard:** Multi-user whiteboard built on Fabric.js featuring Pencil, Rectangle, Circle, Text, Eraser, Clear Board, Undo/Redo, and PNG export. Late joiners receive the current canvas state automatically upon joining.
- **Floating Emoji Reactions:** Send animated floating emoji reactions (`👍 ❤️ 😂 😮 🎉 🔥 👏`) that render across all participant screens.

### AI Assistant (Google Gemini)
- **Direct Queries (`@ai <question>`):** Asks the Gemini API directly and streams the response chunk-by-chunk into the chat room.
- **Context-Aware Queries (`#ai <question>`):** Compiles the full in-meeting chat transcript and supplies it as context so the AI can summarize, analyze, or answer questions based on the conversation history.
- **Quick-Prompt Chips:** Clickable chips (`@ai`, `#ai`) for quick typing on desktop and mobile.

### Meeting Management & Host Controls
- **10-Character Meeting Codes:** Formatted room identifiers (`/abcdefghij`) for instant room generation or direct URL joining.
- **Automatic Host Assignment:** The first user to join the room is assigned host privileges (marked with a ★ badge).
- **Host Administration:** Room host can lock the room (rejecting new entries), force-mute participants, turn off participant video, kick users, or transfer host rights.
- **Automatic Host Handoff:** If the host leaves, host status is automatically passed to the next remaining participant.

### Authentication & User Profiles
- **Dual Authentication Modes:** Email/password authentication and Google OAuth 2.0 single sign-on.
- **Password Reset via OTP:** 6-digit one-time password generated and emailed via Nodemailer (Gmail SMTP), hashed in the database with a 10-minute expiry window.
- **Meeting History:** Authenticated dashboard tracks past attended meetings with one-click rejoin capability.
- **Guest Access:** Users can start or join meetings instantly without creating an account.

### Responsive Mobile Interface
- **Mobile-Optimized Lobby:** 16:9 responsive camera preview anchored at the top with safe-area spacing and quick-toggle controls.
- **Elastic Chat Drawer:** Mobile full-screen chat overlay (`100dvh`) with an iOS-safe 16px input font to prevent viewport zooming.
- **Consolidated Mobile Control Tray:** Streamlined 5-button bottom bar on screens under 600px with a dedicated cyan **⋮ More** popover menu containing emoji reactions, screen share, participants, and whiteboard.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | 19.2.0 | Core UI component framework |
| **Vite** | 7.x | Fast build tool and development server |
| **React Router** | 7.13.0 | Client-side routing and page navigation |
| **Material-UI (MUI)** | 7.3.7 | Component library, icons, and theming |
| **Fabric.js** | 5.5.2 | HTML5 canvas manipulation for the shared whiteboard |
| **Socket.IO Client** | 4.8.3 | WebSocket client for signaling, chat, and room state |
| **@google/genai** | 1.45.0 | Google Gemini SDK for the in-meeting AI assistant |
| **Axios** | 1.13.4 | Promise-based HTTP client for REST API requests |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | >= 18.0.0 | JavaScript runtime environment |
| **Express** | 5.2.1 | HTTP web server and REST API routing |
| **MongoDB & Mongoose** | 9.1.5 | Database and Object Document Mapper (ODM) |
| **Socket.IO** | 4.8.3 | Real-time bidirectional WebSocket event server |
| **Passport.js** | 0.7.0 | Authentication middleware for Google OAuth 2.0 |
| **JSON Web Tokens (JWT)** | 9.0.2 | Stateless token-based user authentication |
| **Bcrypt** | 6.0.0 | Cryptographic password and OTP hashing |
| **Nodemailer** | 8.0.3 | SMTP client for dispatching OTP verification emails |

### Networking & Communication Protocols
- **WebRTC (`RTCPeerConnection`):** Peer-to-peer transport for audio, video, and screen sharing.
- **DTLS-SRTP:** Industry-standard encryption in transit for WebRTC media streams.
- **STUN (`stun:stun.l.google.com:19302`):** Session Traversal Utilities for NAT to discover public IP/port mappings.
- **WebSockets / HTTP Long-Polling:** Transport layer for Socket.IO signaling and real-time events.

---

## Architecture & How It Works

MeetInVirtual separates communication into two distinct layers: the **Signaling Plane** and the **Media Plane**.

```mermaid
flowchart TD
    subgraph Clients["Meeting Participants"]
        A["Client A (Browser)"]
        B["Client B (Browser)"]
    end

    subgraph Signaling["Signaling Plane (Socket.IO & Node.js)"]
        Server["Node.js Express + Socket.IO Server"]
        DB[("MongoDB Database")]
        SMTP["Gmail SMTP (Nodemailer)"]
    end

    subgraph External["External Services"]
        STUN["Google Public STUN Server"]
        Gemini["Google Gemini API"]
    end

    A <-->|"WebSocket: Room State, Chat, Whiteboard, SDP & ICE"| Server
    B <-->|"WebSocket: Room State, Chat, Whiteboard, SDP & ICE"| Server
    Server <-->|"Auth, User Profile, Meeting History"| DB
    Server -->|"OTP Password Reset Emails"| SMTP

    A -.->|"NAT Discovery (Public IP / Port)"| STUN
    B -.->|"NAT Discovery (Public IP / Port)"| STUN

    A ==="Direct WebRTC P2P Mesh (DTLS-SRTP Audio / Video / Screen)"=== B

    A -.->|"AI Chat Queries (@ai / #ai)"| Gemini
    B -.->|"AI Chat Queries (@ai / #ai)"| Gemini
```

### 1. Signaling Plane (Socket.IO Server)
Because browsers cannot discover each other on the open internet directly, they first establish a connection to the Node.js Socket.IO server:
- **Room Coordination:** Tracks connected sockets per room, manages host assignments, and enforces room lock state.
- **Session Negotiation:** Relays WebRTC Session Description Protocol (SDP) offers, answers, and Interactive Connectivity Establishment (ICE) candidates between peers via the `signal` event.
- **Application State:** Broadcasts chat messages (`chat-message`), file payloads (`file-message`), emoji reactions (`emoji-reaction`), whiteboard draw actions (`whiteboard:update`), and host moderation commands.

### 2. Media Plane (WebRTC P2P Mesh)
Once signaling concludes, peers communicate directly:
- **Direct P2P Connections:** Each participant creates an individual `RTCPeerConnection` instance for every other participant in the room.
- **Full Mesh Topology:** In a 4-person room, each participant maintains 3 upstream connections and 3 downstream connections.
- **Media Encryption:** Video, audio, and presentation tracks are encrypted peer-to-peer using DTLS-SRTP without passing through the Node.js application server.

---

## Project Folder Structure

```
MeetInVirtual/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── passport.js          # Google OAuth 2.0 strategy configuration
│   │   ├── controllers/
│   │   │   ├── socketManager.js     # Socket.IO signaling, room lifecycle, & events
│   │   │   └── user.controller.js   # Auth, OTP, profile, and meeting history logic
│   │   ├── models/
│   │   │   ├── meeting.model.js     # Mongoose schema for meeting history
│   │   │   └── user.model.js        # Mongoose schema for user accounts & OTP data
│   │   ├── routes/
│   │   │   └── users.routes.js      # Express API routes (/api/v1/users)
│   │   ├── utils/
│   │   │   ├── auth.middleware.js   # JWT generation and verification middleware
│   │   │   └── mailer.js            # Nodemailer transport & HTML OTP email template
│   │   ├── app.js                   # Express application & HTTP/WebSocket server entry
│   │   └── test-email.js            # Standalone diagnostic script for email config
│   ├── .env.example                 # Example template for backend environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/                      # Static assets and icons
│   ├── src/
│   │   ├── assets/                  # Application SVGs and images
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context & Axios interceptors
│   │   ├── pages/
│   │   │   ├── VideoMeet/           # Main video conferencing page & WebRTC logic
│   │   │   │   ├── components/      # ChatPanel, VideoTile, ControlBar, Lobby, etc.
│   │   │   │   ├── utils/           # mediaHelpers.js (blank tracks, audio helpers)
│   │   │   │   └── index.jsx        # WebRTC peer lifecycle & room coordinator
│   │   │   ├── components/          # Whiteboard.jsx, Navbar.jsx, SignInCard.jsx
│   │   │   ├── authentication.jsx   # Login & register view
│   │   │   ├── ForgotPassword.jsx   # 3-step OTP password reset UI
│   │   │   ├── GoogleAuthCallback.jsx # OAuth token extractor
│   │   │   ├── history.jsx          # Meeting history dashboard
│   │   │   ├── home.jsx             # Authenticated dashboard (create/join meeting)
│   │   │   ├── landing.jsx          # Public landing page (guest access)
│   │   │   └── Profile.jsx          # User profile view
│   │   ├── styles/                  # CSS stylesheets (videoComponent, whiteboard, etc.)
│   │   ├── utils/
│   │   │   └── withAuth.jsx         # Higher-Order Component for protected routes
│   │   ├── App.jsx                  # Main route configuration
│   │   ├── enviroment.js            # Dynamic backend URL resolution
│   │   └── main.jsx                 # Application entry point
│   ├── .env.example                 # Example template for frontend environment variables
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore                       # Repository-wide ignore file
├── LICENSE                          # MIT License
└── README.md
```

---

## Prerequisites

Before running the application locally, ensure you have:

- **Node.js:** `>= 18.0.0` ([Download Node.js](https://nodejs.org/))
- **npm:** Package manager bundled with Node.js
- **MongoDB:** Locally installed instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string
- **Google Cloud Console Account (Optional):** Required only if testing Google OAuth 2.0 login
- **Google Gemini API Key (Optional):** Required only for in-meeting AI assistant queries ([Google AI Studio](https://aistudio.google.com/))
- **Gmail Account with App Password (Optional):** Required only for sending OTP emails during password reset ([Google App Passwords](https://myaccount.google.com/apppasswords))

---

## Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Princekr267/MeetInVirtual.git
cd MeetInVirtual
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure Environment Files
Copy the example environment templates to `.env` in both folders:

**Backend:**
```bash
# In backend/ directory
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

**Frontend:**
```bash
# In frontend/ directory
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

---

## Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Required | Default / Example |
| :--- | :--- | :---: | :--- |
| `PORT` | Port number for Express & Socket.IO server | No | `3000` |
| `MONGODB_URI` | MongoDB connection string | **Yes** | `mongodb://127.0.0.1:27017/meetinvirtual` |
| `FRONTEND_URL` | Frontend URL for CORS configuration and OAuth redirect | **Yes** | `http://localhost:5173` |
| `BACKEND_URL` | Public backend URL for OAuth callback | No | `http://localhost:3000` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | **Yes** | `your_jwt_secret_key_change_in_production` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional | `your_client_id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional | `your_google_client_secret` |
| `EMAIL_USER` | Gmail address used by Nodemailer for OTP emails | Optional | `your_email@gmail.com` |
| `EMAIL_PASS` | 16-character Gmail App Password (not account password) | Optional | `xxxx xxxx xxxx xxxx` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Required | Default / Example |
| :--- | :--- | :---: | :--- |
| `VITE_BACKEND_URL` | Base URL of the backend REST and Socket.IO server | No | `http://localhost:3000` |
| `VITE_GOOGLE_GEMINI_API_KEY` | Google Gemini API Key for AI chat assistant (`@ai`, `#ai`) | Optional | `your_gemini_api_key_here` |

---

## Running the Application

### 1. Verify Email Setup (Optional)
If you configured `EMAIL_USER` and `EMAIL_PASS`, test your SMTP configuration:
```bash
cd backend
node src/test-email.js
```

### 2. Start the Backend Server
```bash
cd backend
npm run dev
```
The server will connect to MongoDB and listen on `http://localhost:3000`.

### 3. Start the Frontend Client
In a separate terminal window:
```bash
cd frontend
npm run dev
```
Vite will start the client on `http://localhost:5173`. Open this URL in your browser.

### 4. Production Build
To create a production-optimized frontend bundle:
```bash
cd frontend
npm run build
```
The build artifacts will be output to `frontend/dist/`.

---

## How to Use the Application

### Starting or Joining a Meeting
- **Instant Meeting (Guest or Authenticated):** Click **Start Meeting** on the landing page or **Create an instant meeting** on the home dashboard. The app generates a 10-character code (e.g., `abc1234567`) and redirects you to `/:meetingCode`.
- **Join with Code:** Enter an existing 10-character code into the meeting code input box and click **Join**.
- **Direct Link Sharing:** Copy the meeting URL or use the share button inside the call to send the link to other participants.

### Pre-Meeting Lobby
Before joining a room, you enter the pre-call lobby:
- Check your camera and microphone preview.
- Toggle your microphone or camera off before entering if desired.
- Set or verify your display name.
- Click **Join Meeting** to enter the live call.

### In-Call Controls

| Control | Icon | Action / Description |
| :--- | :---: | :--- |
| **Microphone** | 🎤 | Toggle microphone on/off. Muting mutes the audio track. |
| **Camera** | 📹 | Toggle camera on/off. Stopping camera releases hardware device. |
| **Screen Share** | 🖥️ | Share your screen in a dedicated presentation tile. Works with camera on or off. |
| **Pin / Spotlight** | 📌 | Click on any video or presentation tile to pin it to a full-screen spotlight stage. |
| **Chat Drawer** | 💬 | Open real-time chat with text, file sharing, chat export, and Gemini AI. |
| **Participants** | 👥 | View participant list, host indicators, and host moderation tools. |
| **Whiteboard** | 🎨 | Open collaborative drawing canvas synchronized across all peers. |
| **Reactions** | 😂 | Broadcast floating emoji animations (`👍 ❤️ 😂 😮 🎉 🔥 👏`). |
| **Pagination** | ◀ ▶ | Navigate pages when more than 6 participant tiles exist. |
| **More Menu** *(Mobile)* | ⋮ | Cyan accent button opening a popover menu for reactions, screen share, and whiteboard. |
| **Leave Call** | 🔴 | Disconnect from the room and return to the home screen. |

### Using the Gemini AI Assistant
In the in-call chat panel:
- **Direct Question:** Type `@ai What is the difference between TCP and UDP?` to receive a direct streaming answer.
- **Context-Aware Question:** Type `#ai What decisions did we make so far?` to pass the entire in-meeting chat transcript to Gemini for analysis.
- **Quick-Tap Chips:** Tap the `@ai` or `#ai` chips above the chat input to automatically insert the prompt prefix.

### Using the Collaborative Whiteboard
Click the whiteboard icon in the control bar:
- **Tools:** Select/Move, Pencil, Rectangle, Circle, Text, and Eraser.
- **Controls:** Custom color picker, line thickness slider, Undo, Redo, and Clear Canvas.
- **Export:** Export the current whiteboard state as a PNG image directly to your computer.
- **Sync:** All strokes are synchronized via Socket.IO, and late joiners receive the canvas snapshot on demand.

### Host Moderation
The first participant to join the room is assigned host privileges:
- Hover over a participant in the **Participants** panel to access moderation actions.
- **Mute Participant:** Force-mute a participant's microphone.
- **Turn Off Video:** Force a participant's camera stream off.
- **Kick Participant:** Remove a user from the room and disconnect their socket.
- **Lock Room:** Prevent any new participants from entering the call.
- **Transfer Host:** Reassign host privileges to another member.

---

## API Overview

Base URL: `http://localhost:3000/api/v1/users`

| Method | Endpoint | Description | Auth Required | Request Body / Parameters |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/register` | Register a new user account | No | `{ name, username, password }` |
| `POST` | `/login` | Authenticate user and obtain a JWT | No | `{ username, password }` |
| `GET` | `/profile` | Retrieve the authenticated user's profile | **Yes (Bearer)** | Header: `Authorization: Bearer <token>` |
| `GET` | `/auth/google` | Initiate Google OAuth 2.0 authentication | No | Initiates OAuth redirect |
| `GET` | `/auth/google/callback` | OAuth callback endpoint | No | Handled by Passport.js |
| `POST` | `/forgot-password/send-otp` | Generate and dispatch 6-digit reset OTP | No | `{ username }` |
| `POST` | `/forgot-password/verify-otp` | Verify validity of submitted OTP | No | `{ username, otp }` |
| `POST` | `/forgot-password/reset` | Set a new password after OTP verification | No | `{ username, newPassword }` |
| `POST` | `/add_to_activity` | Add meeting code to user history | **Yes (Bearer)** | `{ meetingCode }` |
| `GET` | `/get_all_activity` | Fetch user's meeting history list | **Yes (Bearer)** | Header: `Authorization: Bearer <token>` |
| `GET` | `/health` *(root)* | Server health check and allowed CORS origins | No | None |

---

## Security & Technical Notes

### Media Stream Encryption in Transit
- WebRTC encrypts all peer-to-peer audio, video, and screen sharing streams in transit using **DTLS** (Datagram Transport Layer Security) and **SRTP** (Secure Real-time Transport Protocol).
- Because media flows directly between browsers in a P2P mesh topology, raw audio/video frames are not stored or decoded on the application server.
- *Note:* While media is encrypted in transit between peers, this should be understood as standard WebRTC transport encryption rather than a specialized end-to-end encryption framework with cryptographic identity verification.

### Signaling Channel Security
- WebRTC signaling (SDP offers, SDP answers, and ICE candidate exchange) and application events (chat, whiteboard) are transmitted via Socket.IO.
- In production deployments, signaling traffic must be served over **HTTPS / WSS (TLS)** to protect session negotiation against eavesdropping or man-in-the-middle tampering.

### Authentication & Password Handling
- User passwords are encrypted using `bcrypt` with **10 salt rounds** prior to storage in MongoDB.
- Sessions are authenticated using stateless **JSON Web Tokens (JWT)** signed with `JWT_SECRET` and set with a 7-day expiration. Tokens are passed via the standard `Authorization: Bearer <token>` HTTP header.
- On the client side, tokens are stored in browser `localStorage`.

### OTP Password Reset Security
- Password reset OTPs are generated as 6-digit random integers.
- OTPs are hashed using `bcrypt` (10 rounds) before being saved in MongoDB, ensuring that plain-text reset codes are never exposed in database backups.
- Reset OTPs have a strict **10-minute expiration** window.
- The reset endpoint enforces verification state checks to ensure passwords cannot be updated without a successfully verified OTP.
- The `send-otp` endpoint returns a generic response for non-existent accounts to mitigate username/email enumeration.

### Input Validation
- Meeting codes are strictly validated on both client and server against a 10-character lowercase alphanumeric regular expression (`/^[a-z0-9]{10}$/`).
- User registration and login endpoints enforce bounds on character length and data types.

### STUN vs. TURN Considerations
- The application currently configures Google's public STUN server (`stun:stun.l.google.com:19302`). STUN allows clients to determine their public IP address and port mapping.
- STUN is effective for direct connections across common residential and public Wi-Fi networks. However, clients behind symmetric NATs or strict corporate firewalls may fail to establish direct P2P connections without a **TURN** (Traversal Using Relays around NAT) relay server.

---

## Known Limitations

- **Mesh Topology Scalability:** Each participant in a full mesh topology must upload an individual media stream to every other peer ($N - 1$ upstream streams per client). Bandwidth and CPU consumption scale quadratically ($N \times (N - 1)$ connections room-wide). Consequently, meetings are best suited for 4 to 6 simultaneous participants.
- **No Default TURN Server:** Without a TURN server configured, users on restrictive symmetric NATs or cellular carrier networks (CGNAT) may fail to connect to peers.
- **In-Memory Signaling State:** Connected sockets, room memberships, host assignments, and active screen share metadata are tracked in Node.js server memory. Server restarts clear active room state, and horizontal scaling across multiple server instances requires a pub/sub adapter (such as `@socket.io/redis-adapter`).
- **File Sharing over WebSockets:** File sharing converts files up to 5 MB into Base64 Data URLs and transmits them through Socket.IO. While effective for small files, Base64 introduces ~33% payload overhead and loads data into server memory compared to dedicated object storage (e.g., S3) or WebRTC DataChannels.
- **Ephemeral In-Meeting Data:** Meeting chat messages and whiteboard states are stored in-memory for the duration of the call and are cleared when all participants disconnect.

---

## Future Improvements

- [ ] **Selective Forwarding Unit (SFU):** Transition from a full-mesh topology to an SFU architecture (e.g., using [mediasoup](https://mediasoup.org/) or [LiveKit](https://livekit.io/)) to support 20+ participants with reduced client bandwidth.
- [ ] **TURN Relay Integration:** Incorporate TURN server support (via Coturn or managed services like Twilio / Metered) for 100% connection reliability across restrictive firewalls.
- [ ] **WebRTC DataChannels:** Move file sharing and whiteboard data from WebSocket relays to direct peer-to-peer WebRTC DataChannels.
- [ ] **Redis Adapter:** Add `@socket.io/redis-adapter` for multi-node backend clustering and distributed signaling.
- [ ] **Persistent Chat & Recording:** Optional MongoDB chat history persistence and meeting recording via server-side media compositing.
- [ ] **Virtual Backgrounds:** Add AI-powered background blur and image replacement using MediaPipe Selfie Segmentation.

---

## License & Author

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

### Author
**Prince Kumar**
- GitHub: [@Princekr267](https://github.com/Princekr267)
- LinkedIn: [in/princekr267](https://linkedin.com/in/princekr267)
- Email: [princekrr267@gmail.com](mailto:princekrr267@gmail.com)
- Project Repository: [https://github.com/Princekr267/MeetInVirtual](https://github.com/Princekr267/MeetInVirtual)
