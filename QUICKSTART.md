# Quick Start Guide

## 🚀 Fastest Way to Launch

### Terminal 1: Start MongoDB
```powershell
mongod
```

Wait for message: `"waiting for connections on port 27017"`

### Terminal 2: Start Application
```powershell
cd c:\Users\mapka\Downloads\attendance-system DEMO\attendance-system
npm start
```

Wait for message: `"✅ MongoDB Connected Successfully to: mongodb://localhost:27017/attedence_db"`

### Terminal 3: Access Application
```powershell
# Open in browser
start http://localhost:3000

# Or on mobile (same network):
start http://192.168.1.108:3000
```

---

## 📋 First Time Setup

```powershell
# 1. Install MongoDB Community Edition
# Download: https://www.mongodb.com/try/download/community

# 2. Install Node.js dependencies
cd c:\Users\mapka\Downloads\attendance-system DEMO\attendance-system
npm install

# 3. Start MongoDB
mongod

# 4. Start the server (in another terminal)
npm start

# 5. Open browser
http://localhost:3000
```

---

## 👥 Test Accounts (After First Registration)

### Register New Users:
1. Go to http://localhost:3000/register
2. **For Teacher:**
   - Role: Teacher
   - Leave Roll Number and Division empty
   - Department: Your department name

3. **For Student:**
   - Role: Student
   - Roll Number: e.g., 101
   - Department: e.g., Computer Science
   - **Division: e.g., A** (NEW - required)

---

## 🎯 Common Tasks

### View Database in GUI
```powershell
# Download and install MongoDB Compass:
# https://www.mongodb.com/products/tools/compass

# Open Compass, it auto-connects to mongodb://localhost:27017
# Navigate to: attedence_db -> users, attendancesessions, attendancerecords
```

### View Database in Terminal
```powershell
mongosh
show dbs
use attedence_db
db.users.find().pretty()
db.users.countDocuments({ role: "student" })
db.users.countDocuments({ role: "teacher" })
```

### Backup Database
```powershell
mongodump --db attedence_db --out ./backup_$(Get-Date -Format "yyyy-MM-dd")
```

### Restore Database
```powershell
mongorestore --db attedence_db ./backup_folder/attedence_db
```

### Check if MongoDB is Running
```powershell
# Check port 27017
netstat -ano | findstr :27017

# Should show: TCP  127.0.0.1:27017  LISTENING
```

### Stop MongoDB
```powershell
# If running manually: Press Ctrl+C in mongod terminal

# If running as service:
Get-Service MongoDB | Stop-Service

# Or restart:
Get-Service MongoDB | Restart-Service
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "MongoDB Connection Error" | Run `mongod` in separate terminal |
| "Connection refused on 27017" | MongoDB not running - start with `mongod` |
| "Port 3000 already in use" | Kill existing: `taskkill /F /IM node.exe` |
| "Division field not visible" | Select "Student" role (only shows for students) |
| "QR scanning not working" | Use file upload fallback or allow camera access |
| "Data gone after restart" | Check MongoDB is running: `mongod` |
| "Can't access from mobile" | Use IP `192.168.1.108:3000` on same network |

---

## 📱 Mobile Testing on Network

From mobile device (same WiFi network):
```
http://192.168.1.108:3000
```

Features working:
- ✅ Registration with Division
- ✅ Login
- ✅ QR Code Scanning (camera or upload)
- ✅ Geolocation
- ✅ Attendance Marking
- ✅ History Viewing

---

## 🔑 Key URLs

| Purpose | URL | Role |
|---------|-----|------|
| Home | http://localhost:3000 | Any |
| Register | http://localhost:3000/register | Any |
| Login | http://localhost:3000/login | Any |
| Teacher Dashboard | http://localhost:3000/teacher/dashboard | Teacher |
| Create Session | http://localhost:3000/teacher/session | Teacher |
| Student Dashboard | http://localhost:3000/student/dashboard | Student |
| QR Scanner | http://localhost:3000/student/scan | Student |
| History | http://localhost:3000/student/history | Student |
| Admin Panel | http://localhost:3000/admin | Admin |

---

## 📊 System Status Check

```powershell
# Everything you need to verify:

# 1. MongoDB installed
mongod --version

# 2. Node.js installed
node --version

# 3. npm installed
npm --version

# 4. Project dependencies
cd c:\Users\mapka\Downloads\attendance-system DEMO\attendance-system
npm list

# 5. MongoDB running
netstat -ano | findstr :27017

# 6. Application running
# Visit http://localhost:3000 in browser
# Should see login page
```

---

## 🎓 Workflow Examples

### Teacher Creates Session & Views Attendance
```
1. Login as Teacher
2. Go to Teacher Dashboard
3. Click "Create New Session"
4. Session created with QR code
5. Share QR code link with students
6. Wait for students to scan
7. View attendance in real-time
8. Click "End Session"
9. Click "Export to Excel"
```

### Student Marks Attendance
```
1. Login as Student
2. Go to "Scan QR Code"
3. Allow camera permission
4. Scan QR code OR upload QR image
5. Geolocation captured automatically
6. "Attendance marked successfully!"
7. View in History
```

### Admin Views All Data
```
1. Go to http://localhost:3000/admin
2. View system statistics
3. Click "All Users" to see students with Division
4. Click "All Sessions" to see teacher sessions
5. Click "Attendance Records" to see all marks
```

---

## 🔐 Security Notes

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire based on session
- Each user role has restricted access
- Attendance validation includes geolocation check
- QR codes expire after session ends

---

## 💾 Data Storage

All data stored in MongoDB:
- **Database:** attedence_db
- **Collections:**
  - users (students + teachers)
  - attendancesessions (teacher sessions)
  - attendancerecords (attendance marks)

Data persists across:
- ✅ Server restarts
- ✅ Application updates
- ✅ Power cycles (if MongoDB service auto-starts)

---

## 🎯 Production Checklist (Pre-Launch)

- [ ] MongoDB installed and running
- [ ] npm install completed
- [ ] Registered test student with Division field
- [ ] Registered test teacher
- [ ] Created test session
- [ ] Scanned QR code as student
- [ ] Viewed attendance as teacher
- [ ] Exported attendance to Excel
- [ ] Restarted server and verified data persisted
- [ ] Accessed from mobile on network
- [ ] Admin panel working
- [ ] All users showing Division field

---

## 🆘 Need Help?

1. **Check console logs** - Terminal shows detailed messages
2. **Read PRODUCTION_READY.md** - Complete documentation
3. **Review MONGODB_SETUP.md** - Database setup guide
4. **Check PRODUCTION_CHECKLIST.md** - Feature checklist

---

## ⚡ Performance Tips

- MongoDB runs in-memory for speed (when configured)
- QR code generation takes ~100ms
- Session creation is instant
- Attendance export (Excel) takes ~1-2 seconds for 100 records
- Mobile access optimal on 2.4GHz WiFi (better range than 5GHz)

---

**You're ready to launch! Start with:**
```powershell
mongod    # Terminal 1
npm start # Terminal 2 (in project folder)
```

**Then visit: http://localhost:3000** 🚀
