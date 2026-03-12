# MongoDB Setup Guide for Attendance System

## Prerequisites for Production Launch

Your attendance system is now configured to use **persistent MongoDB** instead of in-memory storage. This ensures all data persists across server restarts.

---

## Step 1: Install MongoDB Community Edition

### For Windows:

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Select your Windows version and download the MSI installer

2. **Run the Installer**
   - Execute the downloaded `.msi` file
   - Choose "Complete" installation
   - **Keep the default paths** (usually `C:\Program Files\MongoDB`)

3. **Install MongoDB as a Service** (Recommended)
   - During installation, check: "Install MongoDB as a Service"
   - This makes MongoDB start automatically on system boot

4. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Run: `mongod --version`
   - You should see the MongoDB version number

---

## Step 2: Start MongoDB Service

### Option A: Using Windows Service (Easiest)
```powershell
# MongoDB starts automatically if installed as a service
# Check service status:
Get-Service MongoDB
```

### Option B: Manual Start
```powershell
# In PowerShell or Command Prompt, run:
mongod

# You should see:
# [initandlisten] waiting for connections on port 27017
```

### Option C: Using MongoDB Compass (GUI)
- Download: https://www.mongodb.com/products/tools/compass
- Install and open Compass
- It will auto-connect to `mongodb://localhost:27017`
- You'll see your databases including `attedence_db`

---

## Step 3: Verify MongoDB Connection

1. **Check MongoDB is running:**
   ```powershell
   # MongoDB should be listening on port 27017
   netstat -ano | findstr :27017
   ```

2. **Test connection:**
   - Open MongoDB Compass (if installed)
   - Or use MongoDB shell: `mongosh` (if available)
   - Connect to: `mongodb://localhost:27017`

---

## Step 4: Configure Your Application

### Current Status:
✅ Your `.env` file already has:
```
MONGODB_URI=mongodb://localhost:27017/attedence_db
```

### If you need to change the database name:
Edit `.env` and modify:
```
MONGODB_URI=mongodb://localhost:27017/your_database_name
```

---

## Step 5: Test Data Persistence

1. **Start the attendance system:**
   ```powershell
   npm start
   ```

2. **Register a new student:**
   - Go to http://192.168.1.108:3000/register
   - Fill in all fields including the new **Division** field
   - Submit the form

3. **Verify data in MongoDB:**
   - Open MongoDB Compass
   - Navigate to: `attedence_db` → `users`
   - You should see your registered student with all fields

4. **Test persistence:**
   - Stop the server (Ctrl+C)
   - Start it again: `npm start`
   - Check if the data is still there

---

## Important: New Features

### Division Field Added
- **Location**: Student registration form
- **Purpose**: Track student's class division (A, B, C, etc.)
- **Requirement**: Required for all students during registration
- **Database**: Stored in `users` collection under `division` field

---

## Troubleshooting

### Problem: "MongoDB Connection Error"
**Solution:**
1. Ensure MongoDB is running: `mongod` in a separate terminal
2. Check MongoDB is on port 27017
3. Verify `.env` has correct `MONGODB_URI`

### Problem: "Data disappears after restart"
**Solution:**
- MongoDB Memory Server was being used before
- Now with persistent MongoDB, data should persist
- If using in-memory version, check if you're running `mongod`

### Problem: "Connection timeout"
**Solution:**
```powershell
# Kill any existing MongoDB process
Get-Process mongod -ErrorAction SilentlyContinue | Stop-Process

# Start fresh
mongod
```

### Problem: "Port 27017 already in use"
**Solution:**
```powershell
# Find what's using port 27017
netstat -ano | findstr :27017

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Start MongoDB again
mongod
```

---

## MongoDB GUI Options

### Option 1: MongoDB Compass (Recommended)
- **Download**: https://www.mongodb.com/products/tools/compass
- **Features**: Visual database explorer, data browser, schema analysis
- **Ease**: Very user-friendly for beginners

### Option 2: MongoDB Shell (mongosh)
```powershell
# Connect to MongoDB
mongosh

# View all databases
show dbs

# Use attendance database
use attedence_db

# View all users
db.users.find()

# View sessions
db.attendancesessions.find()

# View attendance records
db.attendancerecords.find()

# Count total students
db.users.countDocuments({ role: "student" })

# Count total teachers
db.users.countDocuments({ role: "teacher" })
```

---

## Data Backup Recommendations

For production use:

```powershell
# Backup database (this creates a dump)
mongodump --db attedence_db --out ./backup

# Restore from backup
mongorestore --db attedence_db ./backup/attedence_db
```

---

## Production Checklist

Before launching to production:

- [ ] MongoDB installed and running
- [ ] MongoDB as Windows Service (auto-start)
- [ ] `.env` configured with correct `MONGODB_URI`
- [ ] Student registration includes Division field
- [ ] Test data persists after server restart
- [ ] Admin panel shows all users with Division field
- [ ] Excel export works with division data
- [ ] Mobile access from other devices works
- [ ] Backup and restore tested

---

## Quick Start Command

Once MongoDB is installed and running:

```powershell
# Install dependencies
npm install

# Start the server
npm start

# Access the application
# Local: http://localhost:3000
# Mobile: http://192.168.1.108:3000
```

---

## Support

If you encounter any issues:
1. Check that `mongod` is running
2. Verify `.env` file configuration
3. Check console logs in both MongoDB and Node.js terminals
4. Review MongoDB documentation: https://docs.mongodb.com/

---

**Your system is now ready for production deployment with persistent data storage!**
