# Mill Manager

A full-stack mill management application designed to simplify daily operations of flour mills and oil extraction businesses. It helps mill owners manage customers, record processing orders, track work progress, maintain payment records, and provide customers with visibility into their orders.

**Live Demo:** [Mill Manager](https://mill-manager-kappa.vercel.app/)

**GitHub Repository:** [MILL_MANAGER](https://github.com/swapnil7500/MILL_MANAGER)

---

## Overview

Mill Manager digitizes everyday mill operations by replacing manual registers with a centralized management system.

The application provides two separate experiences:

- **Admin Panel:** Manage customers, create and update work entries, monitor processing status, maintain payment information, and export records.
- **Customer Panel:** View personal work entries, track processing progress, and read updates from the mill owner.

It also includes a customer registration approval workflow, allowing the mill owner to control who can access the customer dashboard.

## Key Features

### 1. Authentication & Access Control
- Secure registration and login using JWT authentication.
- Password hashing using bcryptjs.
- HTTP-only cookies for session token storage.
- Separate protected routes for admin and customer roles.
- Customer registration requires admin approval before login.
- Persistent login sessions using an authentication context.

### 2. Customer Management
- Add new customers, including walk-in customers.
- Manage customer name, phone number, and address.
- View and search customer records.
- Approve or reject customer registration requests.
- Set or reset customer passwords.
- Maintain existing customer records and their associated work history.

### 3. Mill Work & Entry Management
- Create work entries for two services:
  - Flour Milling
  - Oil Extraction
- Record customer, item name, weight, date, amount, and payment status.
- Automatically generate a unique serial number for every entry.
- Edit or delete existing entries.
- Add comments and updates to work entries.

### 4. Work Status Tracking
Each work entry follows a processing workflow:

| Status | Description |
|---|---|
| Pending | Work is registered and waiting to be processed. |
| In Progress | Processing has started. |
| Done | Processing is completed and ready for pickup. |
| Delivered | Work has been delivered to the customer. |

Customers can track their orders and view updates from the mill owner.

### 5. Admin Dashboard & Records
- View and manage all work entries.
- Search by customer name, phone number, or item name.
- Filter entries by service type, processing status, and date range.
- Server-side pagination for efficient record browsing.
- Export filtered records to CSV.
- Generate printable customer work slips.
- Manage payment amounts and paid/unpaid status.

### 6. Customer Dashboard
- View only the logged-in customer's work entries.
- Track the status of each order.
- Filter entries by processing status.
- View comments and updates added by the mill owner.
- See a summary of orders across different processing stages.
- Get an indication when orders are ready for pickup.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Routing | React Router |
| API Communication | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs, HTTP-only cookies |
| Security | Helmet, CORS, Express Rate Limit |
| Deployment | Vercel (frontend), backend hosting configured separately |

---

## Application Architecture

Mill Manager follows a client-server architecture.

The React frontend communicates with the Express backend through REST APIs. The backend handles authentication, authorization, business logic, and database operations using Mongoose.

```text
                  USER
                    |
                    v
           REACT FRONTEND
              (Vite)
                    |
             React Router
                    |
             Axios API Client
                    |
          HTTP Requests + Cookies
                    |
                    v
           EXPRESS BACKEND
                    |
          ---------------------
          |         |         |
        Routes  Middleware Controllers
          |         |         |
          |    Authentication |
          |    Authorization  |
          |                   |
          ---------------------
                    |
                    v
              MONGOOSE
                    |
                    v
               MONGODB
```

### Authentication Flow

1. A customer submits a registration request.
2. The backend validates the information and securely hashes the password.
3. The customer account is created with a pending approval status.
4. The admin reviews and approves or rejects the request.
5. Approved users can log in using their phone number and password.
6. The backend generates a JWT and stores it in an HTTP-only cookie.
7. Protected API routes verify the cookie and check the user's role before granting access.

### Work Entry Flow

1. The admin selects an existing customer or creates a new walk-in customer.
2. The admin records the service type, item, weight, date, amount, and payment status.
3. The backend validates the information and generates a unique serial number.
4. The entry is saved in MongoDB with an initial `Pending` status.
5. The admin updates the processing status and adds comments as work progresses.
6. The customer accesses their dashboard to view their own entries and updates.

---

## Project Structure

The repository is organized into separate frontend and backend applications.

```text
MILL_MANAGER/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── EntryTable.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── AddEntry.jsx
│   │   │   │   └── Customers.jsx
│   │   │   ├── customer/
│   │   │   │   └── MyEntries.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   └── entryController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Entry.js
│   │   └── Counter.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   └── entryRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
└── README.md
```

---

## Database Models

The application uses MongoDB with Mongoose schemas.

### User Model

Stores admin and customer information.

Important fields:

- `name`
- `phone`
- `address`
- `passwordHash`
- `role` — admin or customer
- `accountStatus` — no-login, pending, approved, or rejected

### Entry Model

Stores mill processing records.

Important fields:

- `serialNo`
- `customer` — reference to the User model
- `serviceType` — flour or oil
- `itemName`
- `weightKg`
- `date`
- `status`
- `comments`
- `amount`
- `paid`

### Counter Model

Maintains the sequence used to generate unique serial numbers for work entries.

---

## Getting Started

Follow these steps to run Mill Manager locally.

### Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/swapnil7500/MILL_MANAGER.git

cd MILL_MANAGER
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Use the following configuration:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_secret_at_least_32_characters

CLIENT_URL=http://localhost:5173

NODE_ENV=development

ADMIN_NAME=Owner
ADMIN_PHONE=9999999999
ADMIN_PASSWORD=your_admin_password
```

Replace the MongoDB URI and admin credentials with your own values. Use a strong, randomly generated JWT secret.

### 3. Create the Admin Account

Run the seed script once:

```bash
node seed.js
```

This creates the initial admin account if the configured admin phone number does not already exist.

### 4. Start the Backend

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 5. Setup the Frontend

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

---

## API Overview

The backend exposes REST API endpoints under `/api`.

### Authentication Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Submit customer registration |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current authenticated user |

### Customer Routes

All customer management routes require admin authentication.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/customers` | Create a customer |
| GET | `/api/customers` | Get customer records |
| GET | `/api/customers/pending` | Get pending registrations |
| PUT | `/api/customers/:id` | Update customer details |
| PATCH | `/api/customers/:id/approve` | Approve registration |
| PATCH | `/api/customers/:id/reject` | Reject registration |
| PATCH | `/api/customers/:id/password` | Set or reset password |

### Work Entry Routes

All entry routes require authentication. Admin-only operations additionally require the admin role.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/entries` | Create work entry |
| GET | `/api/entries` | Get and filter all entries (admin) |
| GET | `/api/entries/mine` | Get logged-in customer's entries |
| PUT | `/api/entries/:id` | Update entry details |
| PATCH | `/api/entries/:id/status` | Update processing status |
| POST | `/api/entries/:id/comment` | Add a comment |
| DELETE | `/api/entries/:id` | Delete an entry |

---

## Security Considerations

- Passwords are hashed using bcryptjs before storage.
- JWT tokens are stored in HTTP-only cookies.
- Protected routes verify the authenticated user on the server.
- Role-based middleware restricts admin-only operations.
- Helmet adds HTTP security headers.
- CORS is configured to allow the specified frontend origin with credentials.
- Express Rate Limit helps protect login and registration endpoints against excessive requests.
- Request body size is limited to reduce unnecessarily large payloads.

---

## Deployment

The frontend is deployed on Vercel.

**Live Application:** [https://mill-manager-kappa.vercel.app/](https://mill-manager-kappa.vercel.app/)

For a production deployment:

1. Deploy the backend to a Node.js-compatible hosting platform.
2. Configure the production MongoDB connection string.
3. Set a strong `JWT_SECRET`.
4. Set `NODE_ENV=production`.
5. Configure `CLIENT_URL` with the deployed frontend origin.
6. Configure `VITE_API_URL` with the deployed backend API URL.
7. Ensure the hosting platform supports HTTPS and credentialed cross-origin requests.

Never commit `.env` files or expose database credentials and JWT secrets in the repository.

---

## Future Improvements

- Advanced payment summaries and outstanding balance reports.
- Analytics dashboard for daily and monthly mill operations.
- Improved reporting and invoice generation.
- Notifications for customers when work status changes.
- More detailed business performance insights.

---

## Author

**Swapnil Gupta**

- GitHub: [@swapnil7500](https://github.com/swapnil7500)
- Project: [Mill Manager](https://github.com/swapnil7500/MILL_MANAGER)
- Live Demo: [Mill Manager](https://mill-manager-kappa.vercel.app/)

---

*Built to make everyday mill operations simpler, more organized, and easier to track.*