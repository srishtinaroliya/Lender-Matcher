# Running the Lender Matching Platform Locally

To run this application follow these steps:

### 1. Prerequisites
- **Node.js**: Install Node.js (v18 or higher recommended).
- **PostgreSQL**: Install and have a PostgreSQL database running locally or accessible via a URL.

### 2. Clone/Download the Code
Download all the files to your local machine into a folder (e.g., `lender-platform`).

### 3. Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### 4. Set Environment Variables
Create a file named `.env` in the root of your project and add your database connection string:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/your_database_name
```

### 5. Initialize the Database
Run the following command to create the necessary tables in your local PostgreSQL database:
```bash
npm run db:push
```

### 6. Start the Application
Run the development command to start both the backend server and the frontend preview:
```bash
npm run dev
```

The application will typically be available at `http://localhost:5000`.

### 7. Production Build (Optional)
To build the app for production:
```bash
npm run build
npm start
```
