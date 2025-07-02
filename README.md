# PawPal - Pet Adoption Management System

![PawPal Banner](https://via.placeholder.com/1200x300.png?text=PawPal%20-%20Connecting%20Pets%20with%20Loving%20Homes)
<!-- TODO: Replace the placeholder banner with a nice screenshot of your app's homepage -->

PawPal is a full-stack web application designed to streamline the pet adoption process. It provides a centralized, user-friendly platform that directly connects individuals looking to rehome their pets with potential adopters, fostering responsible and efficient pet transitions.

This project was developed as a final year B.Tech project in Computer Science and Engineering.

<!--**[Live Demo Link](https://your-live-demo-url.com)** <!-- TODO: Add your live deployment link here! -->

---

## 🌟 Key Features

- **User Authentication:** Secure registration with email verification and login using JWT-based sessions.
- **Pet Listings (CRUD):** Users can create, view, edit, and delete detailed pet profiles, including image uploads.
- **Public Pet Browsing:** A paginated, public gallery of all available pets for anyone to browse.
- **Adoption Request Workflow:** A complete lifecycle for adoption requests:
  - Adopters can submit requests with a personal message.
  - Listers can view and manage received requests.
  - Both parties can approve, reject, or withdraw requests.
- **Asynchronous Notification System:**
  - **In-App Notifications:** Real-time (or polled) alerts for key events via a notification bell.
  - **Email Notifications:** Robust, asynchronous email sending for critical updates (new requests, status changes) using **BullMQ and Redis** to ensure a non-blocking user experience.
- **File Uploads:** Pet image uploads are handled using `multer` and stored on the server's filesystem.
- **Responsive UI:** A modern and responsive user interface built with Tailwind CSS and Shadcn UI.

---

## 🛠️ Technology Stack

This project leverages a modern, type-safe technology stack for a robust and maintainable application.

| Area                  | Technologies                                                                          |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Frontend**          | React, Vite, TypeScript, Recoil, Tailwind CSS, Shadcn UI, Axios, React Router, date-fns |
| **Backend**           | Node.js, Express.js, TypeScript, Prisma ORM, JWT, bcrypt, Zod, Multer                 |
| **Database**          | PostgreSQL                                                                            |
| **Asynchronous Tasks**| BullMQ (Job Queue), Redis (Queue Backend), Nodemailer (Email Sending)                     |
| **DevOps**              | Docker, Docker Compose, Nginx (optional), GitHub Actions (for CI/CD)                    |

---

## 🏛️ System Architecture

The application follows a multi-tier architecture to ensure separation of concerns and scalability.

<!-- TODO: Insert your system architecture diagram here -->
<!-- Example: -->
<!-- ![System Architecture Diagram](./docs/architecture.png) -->

1.  **Client (Browser):** The React single-page application that users interact with.
2.  **Web Server (Backend):** The Node.js/Express.js server that handles API requests, business logic, and user authentication.
3.  **Database Server:** PostgreSQL database managed by Prisma ORM for data persistence.
4.  **Queue & Worker System:** Redis and BullMQ manage a queue of background jobs (like sending emails), which are processed by a separate worker service to avoid blocking the main API.

---

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn
- PostgreSQL
- Redis
- Docker & Docker Compose (Recommended)

### Local Installation (Without Docker)

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/pawpal.git
    cd pawpal
    ```
2.  **Backend Setup:**
    ```sh
    cd server
    npm install
    # Create a .env file based on .env.example and fill in your DB, Redis, JWT, and SMTP credentials.
    cp .env.example .env 
    # Run Prisma migrations to set up the database schema
    npx prisma generate && npx prisma migrate dev
    # Start the backend server
    npm run dev
    ```
3.  **Frontend Setup:**
    ```sh
    cd ../frontend # Or your frontend directory name
    npm install
    # Create a .env file and set VITE_API_BASE_URL to your backend URL (e.g., http://localhost:3001/api)
    cp .env.example .env
    # Start the frontend dev server
    npm run dev
    ```

### Local Installation (With Docker Compose)

Using Docker is the recommended way to run the entire stack consistently.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Versatile-Programmer/pawpal.git
    cd pawpal
    ```
2.  **Setup Environment Variables:**
    - Create a `.env` file in the `root` directory with name `.env`.
    - For now i am pushing my `.env` file to use and review my project, i will replace it later with better alternative such as IAM.
3.  **Build and Run:**
    ```sh
    docker-compose up --build -d
    ```
    - After running this command a container will start in your docker.

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5005`.

---

## 🧑‍💻 Author

-   **Raj Raushan** - [GitHub](https://github.com/Versatile-Programmer) - [LinkedIn](https://www.linkedin.com/in/raj-raushan-43860b248/)

---


## 🙏 Acknowledgments

-   The open-source community for the amazing tools and libraries used.
