# Logistic CRM - GlobalIndiaExpress

## Overview

Logistic CRM is a comprehensive Customer Relationship Management (CRM) and operations tool designed for GlobalIndiaExpress, a logistics and international courier service. This application streamlines docket management, client interactions, payment processing, and user administration, providing a centralized platform for efficient logistic operations.

## Features

*   **User Management:** Secure registration, login, and role-based access control (Admin, User).
*   **Docket Management:**
    *   Create, Read, Update, and Delete (CRUD) operations for dockets.
    *   Detailed docket information including client details, receiver details, payment information, GST, and tracking.
    *   Search dockets by various identifiers (Docket No, Email, Phone, Vendor).
*   **Client & Receiver Management:** Store and manage consignor and consignee details.
*   **Payment & GST Tracking:** Record payment details and associated GST information (SGST, CGST, IGST).
*   **Shipment Tracking:** Log and update shipment statuses and locations.
*   **Token-Based Authentication:** Secure API access using JWT (Access and Refresh tokens).
*   **Responsive UI:** User-friendly interface built with React and Tailwind CSS.
*   **Dark Mode:** Theme switching for user preference.
*   **PDF Generation:** Download docket details as a PDF.

## Tech Stack

**Backend:**

*   **Framework:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose ODM
*   **Authentication:** JSON Web Tokens (JWT)
*   **Middleware:** CORS, Cookie Parser, Express JSON/URLEncoded
*   **Error Handling:** Centralized error handling, custom `ApiError` and `ApiResponse` classes.
*   **Utilities:** `asyncHandler` for cleaner async route handling.

**Frontend:**

*   **Framework/Library:** React.js
*   **State Management:** React Context API (for Dockets, Auth, Theme)
*   **Routing:** React Router
*   **HTTP Client:** Axios (with interceptors for token refresh)
*   **Styling:** Tailwind CSS
*   **UI Components:** Custom components for forms, tables, etc.
*   **Notifications:** React Toastify
*   **Icons:** Lucide React
*   **PDF Generation:** html2canvas, jsPDF

## Project Structure
logistic-crm/ ├── backend/ │ ├── src/ │ │ ├── controllers/ # Request handlers │ │ ├── db/ # Database connection │ │ ├── middlewares/ # Express middlewares │ │ ├── models/ # Mongoose schemas and models │ │ ├── routes/ # API routes │ │ ├── utils/ # Utility functions (ApiError, ApiResponse, asyncHandler) │ │ ├── app.js # Express app configuration │ │ └── index.js # Server entry point │ └── .env.example # Environment variable template ├── frontend/ │ ├── public/ # Static assets │ ├── src/ │ │ ├── api/ # Axios instance │ │ ├── assets/ # Images, fonts, etc. │ │ ├── components/ # Reusable UI components │ │ ├── context/ # React context providers │ │ ├── pages/ # Page-level components │ │ ├── App.jsx # Main application component │ │ ├── main.jsx # Frontend entry point │ │ └── input.css # Tailwind CSS input │ ├── .env.example # Frontend environment variable template │ └── tailwind.config.js # Tailwind CSS configuration └── README.md


## Getting Started

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn
*   MongoDB (local instance or a cloud-hosted solution like MongoDB Atlas)
*   Git

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/toxic-programmer-cell/logistic-crm.git
    cd logistic-crm/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory by copying `.env.example` and fill in the required values:
    ```env
    PORT=8000
    MONGODB_URI=mongodb://localhost:27017/logisticcrm # Or your MongoDB connection string
    CORS_ORIGIN=http://localhost:5173 # Or your frontend URL
    ACCESS_TOKEN_SECRET=youraccesstokensecret
    ACCESS_TOKEN_EXPIRY=15m
    REFRESH_TOKEN_SECRET=yourrefreshtokensecret
    REFRESH_TOKEN_EXPIRY=10d # Or a numeric value in milliseconds for cookie maxAge
    # REFRESH_TOKEN_EXPIRY_MS=864000000 # Example: 10 days in ms
    # ACCESS_TOKEN_EXPIRY_MS=900000    # Example: 15 minutes in ms
    ```
    *Ensure `REFRESH_TOKEN_EXPIRY` is compatible with cookie `maxAge` if you're using numeric values directly in `user.controller.js` for cookies.*

4.  **Start the backend server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The backend server should now be running on the port specified in your `.env` file (default: 8000).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables (if any):**
    If your frontend requires specific environment variables (e.g., for API base URL if not using a proxy, or other configurations), create a `.env` file in the `frontend` directory by copying `.env.example` (if it exists) and fill in the values.
    *Note: The `axiosInstance.js` is currently configured with `baseURL: '/api/v1'`, which assumes the frontend development server will proxy requests to the backend.*

4.  **Start the frontend development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend application should now be accessible, typically at `http://localhost:5173` (or the port Vite assigns).

## API Endpoints

The backend exposes RESTful APIs for various functionalities. Key routes include:

*   **Users:**
    *   `POST /api/v1/users/register` - Register a new user (Admin only)
    *   `POST /api/v1/users/login` - Login an existing user
    *   `GET /api/v1/users/logout` - Logout the current user
    *   `POST /api/v1/users/refresh-token` - Refresh an expired access token
    *   `PATCH /api/v1/users/profile/:userId` - Update user profile (Admin only)
    *   `DELETE /api/v1/users/:userId` - Delete a user (Admin only)
*   **Dockets:**
    *   `POST /api/v1/dockets/` - Create a new full docket entry
    *   `GET /api/v1/dockets/` - Get all dockets
    *   `GET /api/v1/dockets/:docketId` - Get a single docket by its MongoDB ID
    *   `GET /api/v1/dockets/lookup/:identifier` - Get a single docket by docket number, email, phone, or vendor
    *   `PATCH /api/v1/dockets/:docketId` - Update an existing docket entry
    *   `DELETE /api/v1/dockets/:docketId` - Delete a docket entry

*(For detailed request/response structures, please refer to the backend controller files.)*

## Usage

1.  Ensure both backend and frontend servers are running.
2.  Access the application through your frontend URL (e.g., `http://localhost:5173`).
3.  **Login:** Use valid credentials. The default admin user might need to be created directly in the database or via a seed script if not implemented in the registration flow for the first admin.
4.  **Admin Users:** Can register new users and manage all dockets.
5.  **Regular Users:** Can manage dockets based on permissions (if further refined).
6.  Navigate through the sidebar to access different modules like creating dockets, viewing dockets, etc.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.


## License

This project is licensed under the GlobalIndiaExpress.

## Contact & Acknowledgements

*   **Project Lead/Developer:** [Rohit Kumar Mahto] - [rohitmahto062@gmail.com]
*   This project was built as a comprehensive solution for logistic CRM needs.
*   Special thanks to the open-source libraries and tools that made this project possible.

---
