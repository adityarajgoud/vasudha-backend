# Vasudha Foundation - Climate, Energy & Power Data Visualization Platform

A full-stack, enterprise-grade data platform developed for **Vasudha Foundation** to manage, validate, review, and publicly visualize heterogeneous environmental datasets across India.

The application implements a strict Role-Based Access Control (RBAC) governance model, automated schema validation for tabular `.csv` datasets, an administrative approval workflow, dynamic geospatial and time-series visualizations, and an OTP-based account recovery system.

---

## 🌐 Live Deployments & Repository Links

- **Frontend Live URL:** [https://vasudhafrontend.netlify.app](https://vasudhafrontend.netlify.app)
- **Backend Live API URL:** [https://vasudha-backend.vercel.app](https://vasudha-backend.vercel.app)
- **Backend Health Check:** [https://vasudha-backend.vercel.app/health](https://vasudha-backend.vercel.app/health)
- **GitHub Repository:** `<YOUR_PUBLIC_GITHUB_REPO_URL>`
- **Application Demo Video (Loom/Drive):** `<YOUR_5_MINUTE_DEMO_VIDEO_URL>`

---

## 🚀 Key Features & Capabilities

### 1. Role-Based Access Control (RBAC) & Authentication

- **Default Super Admin:** Automatically provisioned during database initialization with the credentials:
  - **Email:** `superadmin@vasudhaindia.org`
  - **Password:** `Admin@123`
- **JWT Authentication & Bcrypt Hashing:** Secure stateless authentication with SHA-256 password hashing.
- **Super Admin Capabilities:**
  - Complete control over application data and administrative access.
  - View all submitted datasets along with author metadata (name, email).
  - Approve or Reject datasets submitted by Admins.
  - Edit dataset metadata (title, domain, visualization type) or re-upload CSVs.
  - Delete any dataset across the platform.
  - Provision new Admin accounts with automated email notifications dispatching login credentials.
  - Activate / Deactivate Admin accounts dynamically.
- **Admin Capabilities:**
  - Log in with credentials provisioned by the Super Admin.
  - Dedicated Admin Dashboard presenting tabular submission history, domain categories, chart types, and real-time approval statuses.
  - Add new datasets supporting `.csv` files with client & server schema validation.

### 2. CSV Schema Validation Engine

Uploads are dynamically parsed and validated server-side using streaming buffers. Malformed fields or schema mismatches are immediately rejected with clear error messages:

- **Latitude/Longitude India Map (`lat_long_map`):** Validates the presence of `Latitude` ($-90$ to $90$), `Longitude` ($-180$ to $180$), and numeric metric/label columns.
- **State-Wise Heatmap (`state_heatmap`):** Validates Indian state names against GeoJSON boundary features and ensures numeric values exist.
- **Time-Series (`line`, `bar`, `area`):** Validates chronological date/year columns and one or more numerical metrics.

### 3. Dataset Approval Workflow & Dynamic Visualizations

- **Staging to Publication Lifecycle:** All newly added datasets default to a `PENDING` state and remain strictly invisible to the public portal until explicitly approved by the Super Admin.
- **Approved Feed Ordering:** Approved datasets are automatically published on the public landing page (`/`) sorted strictly in the chronological order of their approval (`approvedAt` timestamp).
- **Domain-Specific Isolation:** Datasets are concurrently segregated and accessible under dedicated routes:
  - `/climate` - Displays approved Climate visualizations
  - `/energy` - Displays approved Energy visualizations
  - `/power` - Displays approved Power visualizations
- **Zero Hardcoding:** Visualizations dynamically scale and generate based on runtime dataset structure and admin-selected configurations.

### 4. Visualizations Supported

- **Interactive India Lat/Long Map:** Leaflet-powered map supporting panning, zooming, interactive circle markers, and custom metric tooltips.
- **India State Choropleth Heatmap:** Leverages `india.geojson.json` to compute dynamic green-gradient heat scales and state-level hover tooltips.
- **Time-Series Charts:** Responsive Line, Bar, and Area charts built with Recharts supporting legends, tooltips, and grid lines.

### 5. Implemented Bonus Features

- **Email Notification:** Automated credentials email dispatched via Nodemailer when the Super Admin provisions a new Admin account.
- **Forgot Password / Password Reset via OTP:** Secure 6-digit numeric OTP generation, SHA-256 hashed storage, 10-minute expiry window, and email delivery for secure password updates.
- **Fully Responsive UI:** Engineered with mobile-first Tailwind CSS to provide seamless experiences on Desktop, Tablet, and Mobile.

---

## 🛠️ Technology Stack

| Layer               | Technology                           | Purpose                                                  |
| :------------------ | :----------------------------------- | :------------------------------------------------------- |
| **Frontend**        | React (Vite)                         | Single Page Application framework                        |
| **Styling**         | Tailwind CSS                         | Modern utility-first responsive layout & design system   |
| **Icons**           | Lucide React                         | Clean, scalable vector icons                             |
| **Maps & Geo**      | Leaflet, React-Leaflet               | Coordinate point plotting & GeoJSON choropleth rendering |
| **Charts**          | Recharts                             | Composable SVG Line, Bar, and Area time-series charts    |
| **Routing**         | React Router DOM v7                  | Client-side declarative routing & protected guards       |
| **Backend**         | Node.js, Express.js                  | RESTful API server with modular controllers & routes     |
| **Database**        | MongoDB Atlas, Mongoose              | NoSQL database storing users and parsed dataset schemas  |
| **File Parsing**    | PapaParse, Multer                    | Memory-buffered CSV parsing and schema verification      |
| **Auth & Security** | JWT, BcryptJS, Crypto                | Token authentication, password hashing, and OTP tokens   |
| **Email Service**   | Nodemailer                           | Transactional emails for account creation and OTP reset  |
| **Deployment**      | Vercel (Backend), Netlify (Frontend) | Global edge hosting with automated CI/CD pipelines       |

---

## 📁 Project Architecture & Directory Structure

```text
vasudha-platform/
├── vasudha-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, OTP generation & password reset
│   │   │   ├── datasetController.js  # Upload, review, edit, delete & public query
│   │   │   └── userController.js     # Admin user management & provisioning
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js     # JWT verification & RBAC authorization
│   │   │   └── uploadMiddleware.js   # Multer in-memory CSV file filter
│   │   ├── models/
│   │   │   ├── Dataset.js            # Dataset schema with parsed mixed data
│   │   │   └── User.js               # User model with bcrypt & OTP helpers
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth routes
│   │   │   ├── datasetRoutes.js      # /api/datasets routes
│   │   │   ├── publicRoutes.js       # /api/public routes
│   │   │   └── userRoutes.js         # /api/users routes
│   │   ├── utils/
│   │   │   ├── csvValidator.js       # Per-visualization schema rules engine
│   │   │   ├── seedSuperAdmin.js     # Auto-seeding default Super Admin
│   │   │   └── sendEmail.js          # Nodemailer SMTP transporter
│   │   └── server.js                 # Express server & CORS configuration
│   ├── package.json
│   └── .env.example
│
├── vasudha-frontend/
│   ├── public/
│   │   ├── india.geojson.json        # India state boundary polygons
│   │   └── _redirects                # Netlify SPA routing rewrite rule
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── DynamicVisualizer.jsx # Master dynamic chart wrapper
│   │   │   │   ├── LatLngMap.jsx         # Leaflet India coordinate point map
│   │   │   │   ├── StateHeatmap.jsx      # GeoJSON Choropleth state heatmap
│   │   │   │   └── TimeSeriesChart.jsx   # Recharts Line / Bar / Area chart
│   │   │   └── common/
│   │   │       ├── Navbar.jsx            # Public & admin header navigation
│   │   │       └── ProtectedRoute.jsx    # Client-side RBAC route gatekeeper
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state & token storage
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Admin dataset table & CSV upload modal
│   │   │   ├── DomainPage.jsx        # /climate, /energy, /power domain feeds
│   │   │   ├── Home.jsx              # Public landing page with ordered feed
│   │   │   ├── Login.jsx             # Admin login & OTP reset modal
│   │   │   └── SuperAdminDashboard.jsx# Review queue, edit modal, admin management
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with auth interceptors
│   │   ├── App.jsx                   # React Router route registry
│   │   ├── index.css                 # Tailwind directives & Leaflet styling
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```
