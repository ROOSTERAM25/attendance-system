# Project Structure & File Guide

## 📁 Complete Directory Layout

```
attendance-system/
│
├── 📄 QUICKSTART.md                    ← START HERE (Fast launch guide)
├── 📄 IMPLEMENTATION_SUMMARY.md        ← What was changed
├── 📄 PRODUCTION_READY.md              ← Complete system overview
├── 📄 MONGODB_SETUP.md                 ← MongoDB installation guide
├── 📄 PRODUCTION_CHECKLIST.md          ← Pre-launch verification
│
├── 📄 package.json                     ← Dependencies: express, mongoose, etc.
├── 📄 server.js                        ← Main application entry point
├── 📄 .env                             ← Configuration (PORT, MongoDB URI, secrets)
│
├── 📁 config/
│   └── 📄 database.js                  ← MongoDB connection (UPDATED for persistent storage)
│
├── 📁 controllers/
│   ├── 📄 authController.js            ← Registration/Login (UPDATED - handles Division)
│   ├── 📄 studentController.js         ← Student attendance & scanning
│   ├── 📄 teacherController.js         ← Teacher sessions & Excel export
│   └── 📄 adminController.js           ← Admin dashboard & data viewing
│
├── 📁 middleware/
│   └── 📄 auth.js                      ← Authentication middleware
│
├── 📁 models/
│   ├── 📄 User.js                      ← User schema (UPDATED - added Division field)
│   ├── 📄 AttendanceSession.js         ← Session schema
│   └── 📄 AttendanceRecord.js          ← Attendance record schema
│
├── 📁 routes/
│   ├── 📄 authRoutes.js                ← /register, /login
│   ├── 📄 teacherRoutes.js             ← Teacher endpoints
│   ├── 📄 studentRoutes.js             ← Student endpoints
│   └── 📄 adminRoutes.js               ← Admin endpoints
│
├── 📁 public/
│   ├── 📁 css/
│   │   └── 📄 style.css                ← Application styling
│   └── 📁 js/
│       └── (JS files if any)
│
└── 📁 views/
    ├── 📄 layout.ejs                   ← Base template
    ├── 📄 login.ejs                    ← Login page
    ├── 📄 register.ejs                 ← Registration form (UPDATED - added Division)
    │
    ├── 📁 student/
    │   ├── 📄 dashboard.ejs            ← Student home page
    │   ├── 📄 scan.ejs                 ← QR scanning page
    │   └── 📄 history.ejs              ← Attendance history
    │
    ├── 📁 teacher/
    │   ├── 📄 dashboard.ejs            ← Teacher home page
    │   ├── 📄 session.ejs              ← Session management
    │   └── 📄 attendance.ejs           ← View attendance
    │
    └── 📁 admin/
        ├── 📄 dashboard.ejs            ← Admin statistics
        ├── 📄 users.ejs                ← All users (with Division)
        ├── 📄 sessions.ejs             ← All sessions
        └── 📄 attendance.ejs           ← All attendance records
```

---

## 🔄 Data Flow Diagram

### Registration with Division:
```
User Browser
    ↓
[register.ejs]  ← Shows Division form field (for students only)
    ↓
Form Submit → [POST /auth/register]
    ↓
[authController.register()]  ← Captures division from request body
    ↓
[models/User.js] ← Saves with Division field
    ↓
[MongoDB] ← Data persisted in attedence_db.users
    ↓
Confirmation → [Browser] ← "Registration successful!"
```

### Attendance Marking Flow:
```
Student scans QR
    ↓
[views/student/scan.ejs] ← Camera captures QR
    ↓
QR Code Data → [POST /student/mark-attendance]
    ↓
[studentController.markAttendance()]
    ↓
Validate: QR code, Location, Duplicates
    ↓
[models/AttendanceRecord] ← Saves record with Division
    ↓
[MongoDB] ← Stored in attedence_db.attendancerecords
    ↓
Response → [Browser] ← "Attendance marked!"
```

### Data Persistence:
```
Application Data
    ↓
[Express.js Server] ← Processes requests
    ↓
[Mongoose ODM] ← Maps to schemas
    ↓
[MongoDB Persistent Storage] ← Data saved to disk
    ↓
Even after: Server restart, Power cycle, etc.
Data is safe and recoverable!
```

---

## 📝 Important Files & Their Changes

### 1. models/User.js
**Status:** ✅ UPDATED
**Change:** Added `division` field
```javascript
division: {
  type: String,
  sparse: true  // Only for students
}
```
**Why:** To track student's class division (A, B, C)

### 2. controllers/authController.js
**Status:** ✅ UPDATED
**Change:** Capture and save Division
```javascript
if (req.body.role === 'student') {
  newUser.division = req.body.division;
}
```
**Why:** Division only applicable to students, not teachers

### 3. views/register.ejs
**Status:** ✅ UPDATED
**Changes:** 
- Added Division form field
- Shows only for students (conditional)
- Included in form submission data
**Why:** Users must see and fill Division during registration

### 4. config/database.js
**Status:** ✅ UPDATED
**Changes:**
- Removed MongoDB Memory Server dependency
- Now uses persistent MongoDB
- Cleaner error messages
```javascript
// Before: MongoMemoryServer (temporary, in-memory)
// After: Real MongoDB (persistent, permanent)
```
**Why:** Data must persist across server restarts

### 5. .env
**Status:** ✅ READY
**Configuration:**
```
MONGODB_URI=mongodb://localhost:27017/attedence_db
```
**No changes needed:** Already correctly configured

---

## 🔐 Database Schema Overview

### collections/users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: "teacher", "student"),
  rollNumber: String (students only),
  department: String,
  division: String,  // NEW - students only
  createdAt: Date
}
```

### collections/attendancesessions
```javascript
{
  _id: ObjectId,
  teacher: ObjectId (ref to User),
  sessionCode: String,
  qrCode: String,
  status: String (enum: "active", "ended"),
  createdAt: Date,
  endedAt: Date,
  attendanceList: Array
}
```

### collections/attendancerecords
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref to User),
  session: ObjectId (ref to Session),
  timestamp: Date,
  latitude: Number,
  longitude: Number,
  status: String (enum: "present", "absent"),
  createdAt: Date
}
```

---

## 🚀 Startup Sequence

### When You Run: `npm start`

```
1. Load config/database.js
   ↓
2. Connect to MongoDB
   - Tries: mongodb://localhost:27017/attedence_db
   - If connected: ✅ "MongoDB Connected Successfully"
   - If failed: ❌ "MongoDB Connection Error"
   ↓
3. Load models (User, Session, Record)
   ↓
4. Load routes (auth, teacher, student, admin)
   ↓
5. Start Express server on port 3000
   ↓
6. Display: "✅ Server running on port 3000"
   ↓
7. Application ready for use!
```

---

## 🧪 Testing Quick Routes

| Action | URL | Method | Result |
|--------|-----|--------|--------|
| Home | / | GET | Login/Register page |
| Register | /register | POST | Creates user with Division |
| Login | /login | POST | Authenticates user |
| T Dashboard | /teacher/dashboard | GET | Teacher home (protected) |
| Create Session | /teacher/session | POST | Creates session + QR |
| S Dashboard | /student/dashboard | GET | Student home (protected) |
| Scan QR | /student/scan | GET | QR scanner page |
| Mark Attend | /student/mark-attendance | POST | Records attendance |
| Admin | /admin | GET | System statistics |

---

## 📊 MongoDB Collections Explained

### users Collection
- **Stores:** All registered students and teachers
- **Size:** Grows with each registration
- **Query Example:** `db.users.find({ role: "student" })`
- **New Field:** `division` for students

### attendancesessions Collection
- **Stores:** Each session created by teacher
- **Size:** Grows with each session
- **Query Example:** `db.attendancesessions.find({ status: "active" })`
- **Contains:** QR code, session code, status

### attendancerecords Collection
- **Stores:** Each attendance mark by students
- **Size:** Grows significantly (multiple records per day)
- **Query Example:** `db.attendancerecords.find({ status: "present" })`
- **Contains:** Student ID, Session ID, Location, Timestamp

---

## 🔑 Key Features & Their Files

### Feature: User Registration
Files Involved:
- routes/authRoutes.js → POST /register
- controllers/authController.js → register()
- models/User.js → User schema
- views/register.ejs → Form with Division field
- MongoDB collections.users → Storage

### Feature: QR Session Creation
Files Involved:
- routes/teacherRoutes.js → POST /teacher/session
- controllers/teacherController.js → startSession()
- models/AttendanceSession.js → Session schema
- views/teacher/session.ejs → QR display
- MongoDB collections.attendancesessions → Storage

### Feature: Attendance Marking
Files Involved:
- routes/studentRoutes.js → POST /student/mark-attendance
- controllers/studentController.js → markAttendance()
- models/AttendanceRecord.js → Record schema
- views/student/scan.ejs → QR scanner
- MongoDB collections.attendancerecords → Storage

### Feature: Excel Export
Files Involved:
- routes/teacherRoutes.js → POST /teacher/export
- controllers/teacherController.js → exportToExcel()
- ExcelJS library → Excel generation
- Generated file → Downloaded to user

### Feature: Admin Panel
Files Involved:
- routes/adminRoutes.js → /admin/*
- controllers/adminController.js → Admin queries
- views/admin/*.ejs → Admin pages
- MongoDB queries → Data retrieval

---

## 🛠️ Maintenance Guide

### Adding a New Student Division
No code changes needed! Division is just a string field.
Students enter their division during registration.

### Adding a New Teacher
Same process as student, but:
- Select "Teacher" role (Roll Number and Division hidden)
- Only requires: Name, Email, Password, Department

### Backing Up Data
```powershell
mongodump --db attedence_db --out ./backup_$(Get-Date -Format "yyyy-MM-dd_HH-mm-ss")
```

### Restoring Data
```powershell
mongorestore --db attedence_db ./backup_folder/attedence_db
```

### Clearing All Data (Fresh Start)
```powershell
mongosh
use attedence_db
db.users.deleteMany({})
db.attendancesessions.deleteMany({})
db.attendancerecords.deleteMany({})
```

---

## 🎯 File Purposes Summary

| File | Purpose | Type |
|------|---------|------|
| server.js | Start app & setup routes | Config |
| config/database.js | MongoDB connection | Config |
| .env | Environment variables | Config |
| models/* | Database schemas | Data |
| controllers/* | Business logic | Logic |
| routes/* | URL endpoints | Routing |
| views/* | HTML/EJS templates | UI |
| public/css/* | Styling | UI |

---

## 🚀 Ready to Launch!

**All files are configured and ready.**

Start with:
```powershell
# Terminal 1:
mongod

# Terminal 2:
npm start

# Browser:
http://localhost:3000
```

**Your system is production-ready!**
