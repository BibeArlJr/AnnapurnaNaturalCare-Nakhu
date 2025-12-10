# 📘 Hospital Website — Project Specification Document

![Project Status](https://img.shields.io/badge/Status-Planning-blue)
![Version](https://img.shields.io/badge/Version-1.0-green)

---

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Document Title** | Hospital Website - Technical Specification |
| **Version** | 1.0 |
| **Last Updated** | December 2024 |
| **Status** | Draft |
| **Author** | Development Team |

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Goals & Scope](#2-project-goals--scope)
3. [User Roles](#3-user-roles)
4. [System Features & Functional Requirements](#4-system-features--functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Database Models](#8-database-models)
9. [API Specification](#9-api-specification)
10. [Project Structure](#10-project-structure)
11. [Development Phases](#11-development-phases)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Risk Assessment](#14-risk-assessment)
15. [Appendix](#15-appendix)

---

## 1. Project Overview

### 1.1 Introduction

The goal is to build a **modern, scalable hospital website platform** with appointment booking, doctor directory, health packages, blogs, gallery, departments, and admin management tools.

### 1.2 System Components

The system consists of:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js | SEO-optimized, fast routing, image optimization |
| **Backend** | Node.js + Express | RESTful API services |
| **Database** | MongoDB | Document-based data storage |
| **Admin Dashboard** | Next.js (integrated) | Content + appointment management |

### 1.3 Target Users

- **Patients** (Primary)
- **Doctors** (Optional - Future Phase)
- **Admin** (Internal)

### 1.4 Platform Capabilities

The platform will allow:

- ✅ Patients to browse departments, doctors, packages
- ✅ Book appointments with available doctors
- ✅ Read blogs and explore gallery
- ✅ Contact the hospital
- ✅ Admins to manage all website content from a centralized dashboard

---

## 2. Project Goals & Scope

### 2.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Build a fully functional hospital website with appointment booking | High |
| **G2** | Provide SEO-friendly pages for departments, doctors, packages, and blogs | High |
| **G3** | Enable admin-level control over all content | High |
| **G4** | Deliver a mobile-responsive, clean user experience | High |
| **G5** | Implement real-time availability and booking management | Medium |

### 2.2 In-Scope (Phase 1)

- ✅ Public-facing hospital website
- ✅ Department & Doctor directory
- ✅ Appointment booking system
- ✅ Health packages showcase
- ✅ Blog management system
- ✅ Gallery management
- ✅ Contact form & messaging
- ✅ Admin dashboard
- ✅ JWT-based authentication

### 2.3 Out-of-Scope (Phase 1)

> These features can be added in later phases:

- ❌ Online payment integration
- ❌ Multi-hospital / multi-branch system
- ❌ Doctor login portal
- ❌ Telemedicine/video consultation
- ❌ Push notifications
- ❌ Patient registration/login portal
- ❌ Medical records management
- ❌ Prescription management

---

## 3. User Roles

### 3.1 Patients (Public Users)

**Description:** General public visiting the hospital website

| Permission | Description |
|------------|-------------|
| Browse departments | View all hospital departments |
| View doctor details | Access doctor profiles and specializations |
| Search doctors | Search by department, name, or specialty |
| Check availability | View doctor's available time slots |
| Book appointments | Schedule appointments with doctors |
| Explore content | Read blogs, view gallery |
| View packages | Browse and inquire about health packages |
| Contact hospital | Submit contact form inquiries |

### 3.2 Admin

**Description:** Hospital staff with full system access

| Permission | Description |
|------------|-------------|
| Manage doctors | CRUD operations on doctor profiles |
| Manage departments | CRUD operations on departments |
| Manage blogs | Create, edit, publish, delete blog posts |
| Manage gallery | Upload, organize, delete media |
| Manage packages | CRUD operations on health packages |
| Manage appointments | View, confirm, cancel, complete appointments |
| Manage messages | View and respond to contact messages |
| System settings | Manage basic website configuration |

### 3.3 Internal Staff (Future Phase)

> Not required for initial version. Planned for Phase 2+.

- Limited admin access
- Department-specific permissions
- Appointment management only

---

## 4. System Features & Functional Requirements

---

### 4.1 Homepage

#### Features

- Hero banner with search functionality
- Featured sections display
- Newsletter subscription

#### Search Functionality

The hero banner shall include search capabilities for:

| Search Type | Description |
|-------------|-------------|
| By Department | Filter/navigate to department |
| By Doctor | Search doctor by name |
| By Date | Check availability for specific date |

#### Featured Sections

| Section | Display Count | Description |
|---------|---------------|-------------|
| Departments | 6-8 items | Popular/featured departments |
| Doctors | 4-6 items | Featured doctors with specializations |
| Health Packages | 3-4 items | Popular health checkup packages |
| Blogs | 3-4 items | Latest blog posts |
| Gallery | 6-8 items | Recent gallery items |

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-HOME-01 | System shall display hero banner with search | High |
| FR-HOME-02 | System shall display featured departments | High |
| FR-HOME-03 | System shall display featured doctors | High |
| FR-HOME-04 | System shall display health packages | Medium |
| FR-HOME-05 | System shall display latest blogs | Medium |
| FR-HOME-06 | System shall display gallery preview | Low |
| FR-HOME-07 | System shall allow newsletter subscription | Low |

---

### 4.2 Department Module

#### Features

- Department list page (grid/list view)
- Department detail page
- Doctor association

#### Department Detail Page Content

| Element | Description |
|---------|-------------|
| Hero Image | Department banner image |
| Name | Department name |
| Description | Detailed description |
| Services | List of services offered |
| Doctors | Doctors belonging to this department |

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DEP-01 | System shall list all departments | High |
| FR-DEP-02 | System shall show a detailed department page | High |
| FR-DEP-03 | System shall attach doctors to departments | High |
| FR-DEP-04 | Admin can create/edit/delete departments | High |
| FR-DEP-05 | System shall support department ordering | Medium |
| FR-DEP-06 | System shall support active/inactive status | Medium |

---

### 4.3 Doctor Module

#### Features

- Doctor directory with search & filters
- Doctor detail/profile page
- Available time slots display
- Book appointment button

#### Doctor Profile Content

| Element | Description |
|---------|-------------|
| Photo | Professional photograph |
| Name | Full name with title |
| Department | Associated department |
| Specialization | Areas of expertise |
| Experience | Years of experience |
| Bio | Professional biography |
| Schedule | Weekly availability |
| Education | Qualifications (optional) |

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DOC-01 | System shall allow searching doctors by department, name, or specialty | High |
| FR-DOC-02 | Doctor profile shall include photo, bio, experience, specialty, schedule | High |
| FR-DOC-03 | Admin shall manage doctor details | High |
| FR-DOC-04 | Admin shall manage doctor schedule slots | High |
| FR-DOC-05 | System shall display doctor availability status | Medium |
| FR-DOC-06 | System shall support multiple specializations per doctor | Medium |

---

### 4.4 Appointment Booking System

#### Booking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPOINTMENT BOOKING FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Step 1  │───▶│  Step 2  │───▶│  Step 3  │───▶│  Step 4  │  │
│  │  Select  │    │  Choose  │    │   View   │    │  Select  │  │
│  │  Doctor  │    │   Date   │    │  Slots   │    │   Time   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                                                │         │
│       │              ┌──────────┐    ┌──────────┐     │         │
│       │              │  Step 6  │◀───│  Step 5  │◀────┘         │
│       │              │ Confirm  │    │  Fill    │               │
│       │              │          │    │ Details  │               │
│       │              └──────────┘    └──────────┘               │
│       │                    │                                     │
│       ▼                    ▼                                     │
│  ┌──────────┐        ┌──────────┐                               │
│  │   OR     │        │  Step 7  │                               │
│  │  Select  │        │  Admin   │                               │
│  │Department│        │ Notified │                               │
│  └──────────┘        └──────────┘                               │
│                            │                                     │
│                            ▼                                     │
│                      ┌──────────┐                               │
│                      │  Step 8  │                               │
│                      │  Status  │                               │
│                      │  Update  │                               │
│                      └──────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Booking Steps Detail

| Step | Action | Description |
|------|--------|-------------|
| 1 | Select doctor or department | User chooses starting point |
| 2 | Choose date | Select preferred appointment date |
| 3 | View availability | System shows available time slots |
| 4 | Select time slot | User picks a time |
| 5 | Fill patient details | Name, email, phone, notes |
| 6 | Confirm appointment | Review and submit |
| 7 | Admin notification | Admin receives new appointment alert |
| 8 | Status update | Admin confirms/manages appointment |

#### Appointment Statuses

| Status | Description | Color Code |
|--------|-------------|------------|
| `pending` | Newly booked, awaiting confirmation | Yellow |
| `confirmed` | Admin confirmed the appointment | Green |
| `cancelled` | Appointment cancelled | Red |
| `completed` | Appointment completed | Blue |
| `no-show` | Patient didn't arrive | Gray |

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-APP-01 | System shall display available time slots for each doctor | High |
| FR-APP-02 | System shall allow patients to book appointments | High |
| FR-APP-03 | Admin shall view all appointments | High |
| FR-APP-04 | Admin shall update appointment status: pending, confirmed, canceled, completed | High |
| FR-APP-05 | System shall send confirmation email (optional) | Medium |
| FR-APP-06 | System shall prevent double-booking of same slot | High |
| FR-APP-07 | System shall validate appointment date is in future | High |

---

### 4.5 Health Packages Module

#### Features

- Package list page
- Package detail page
- Booking/inquiry feature

#### Package Detail Content

| Element | Description |
|---------|-------------|
| Title | Package name |
| Images | Package promotional images |
| Price | Package cost |
| Description | Detailed description |
| Inclusions | List of tests/services included |
| Duration | Validity/duration |

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PKG-01 | System shall list all health packages | High |
| FR-PKG-02 | System shall display details with price, inclusions, images | High |
| FR-PKG-03 | Admin can create/edit/delete packages | High |
| FR-PKG-04 | System shall support package inquiry form | Medium |

---

### 4.6 Blog Module

#### Features

- Blog listing page with pagination
- Blog detail/reading page
- Tags support
- Admin WYSIWYG editor

#### Blog Post Content

| Element | Description |
|---------|-------------|
| Title | Blog post title |
| Cover Image | Featured image |
| Body | Rich text content |
| Tags | Categorization tags |
| Author | Author name |
| Published Date | Publication date |
| Read Time | Estimated reading time |

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BLG-01 | Public blog listing page with pagination | High |
| FR-BLG-02 | Detailed blog reading page | High |
| FR-BLG-03 | Admin CRUD: create, edit, delete blogs | High |
| FR-BLG-04 | System shall support tags for categorization | Medium |
| FR-BLG-05 | System shall display estimated read time | Low |
| FR-BLG-06 | System shall support draft/published status | Medium |

---

### 4.7 Gallery Module

#### Features

- Photos/videos grid display
- Lightbox viewer
- Media categorization

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-GAL-01 | System shall allow admin to upload images/videos | High |
| FR-GAL-02 | System shall display gallery items on public page | High |
| FR-GAL-03 | Admin can delete media | High |
| FR-GAL-04 | System shall support lightbox view | Medium |
| FR-GAL-05 | System shall support media categories | Low |

---

### 4.8 Contact Module

#### Contact Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text | Yes | Min 2 chars |
| Email | Email | Yes | Valid email format |
| Phone | Tel | Yes | Valid phone format |
| Subject | Text | No | Max 200 chars |
| Message | Textarea | Yes | Min 10, Max 1000 chars |

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CON-01 | Users can submit contact form (name, email, phone, message) | High |
| FR-CON-02 | System shall store messages in DB | High |
| FR-CON-03 | System shall send email notification to admin (optional) | Medium |
| FR-CON-04 | Admin can view messages in dashboard | High |
| FR-CON-05 | Admin can mark messages as read/resolved | Medium |

---

### 4.9 Authentication Module

#### Features

- Admin login
- JWT-based authentication
- Role-based access control

#### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Login   │───▶│ Validate │───▶│ Generate │              │
│  │  Request │    │  Creds   │    │   JWT    │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                        │                    │
│                                        ▼                    │
│                                  ┌──────────┐              │
│                                  │  Return  │              │
│                                  │  Token   │              │
│                                  └──────────┘              │
│                                        │                    │
│                                        ▼                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Protected│◀───│ Verify   │◀───│  Send    │              │
│  │ Resource │    │   JWT    │    │  Token   │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Admin login endpoint using JWT | High |
| FR-AUTH-02 | Admin area protected via middleware | High |
| FR-AUTH-03 | System shall support token refresh | Medium |
| FR-AUTH-04 | System shall implement secure password storage (bcrypt) | High |
| FR-AUTH-05 | System shall support logout functionality | High |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Page Load Time | < 2 seconds | First Contentful Paint |
| Time to Interactive | < 3 seconds | TTI metric |
| API Response Time | < 500ms | Average response time |
| Image Optimization | WebP format | Next.js Image component |
| Server-Side Rendering | Enabled | For SEO-critical pages |

### 5.2 Scalability

| Aspect | Approach |
|--------|----------|
| Database | MongoDB with proper indexing |
| Backend | Horizontal scaling capability |
| Image Storage | Local or cloud bucket (S3/Cloudinary) |
| Caching | Redis for session/cache (future) |
| CDN | Vercel Edge Network / Cloudflare |

### 5.3 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT with secure secret |
| Password Storage | bcrypt hashing (salt rounds: 12) |
| Input Validation | Server-side validation on all inputs |
| Rate Limiting | Contact & appointment forms |
| CORS | Configured for allowed origins |
| XSS Prevention | Sanitized inputs, CSP headers |
| SQL Injection | MongoDB parameterized queries |
| HTTPS | Enforced in production |

### 5.4 SEO Requirements

| Requirement | Implementation |
|-------------|----------------|
| Server-Side Rendering | Next.js SSR/SSG |
| Meta Tags | Dynamic meta tags per page |
| URL Structure | Clean, semantic URLs with slugs |
| Sitemap | Auto-generated sitemap.xml |
| Robots.txt | Properly configured |
| Schema Markup | JSON-LD for doctors, blogs, organization |
| Open Graph | Social sharing meta tags |
| Canonical URLs | Prevent duplicate content |

### 5.5 Usability

| Requirement | Standard |
|-------------|----------|
| Mobile Responsive | All breakpoints (320px - 1920px+) |
| Accessibility | WCAG 2.1 AA compliance |
| Browser Support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Booking UX | Maximum 6 steps to complete |
| Form Validation | Real-time inline validation |
| Loading States | Skeleton loaders, spinners |
| Error Handling | User-friendly error messages |

### 5.6 Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| Backup Frequency | Daily automated backups |
| Recovery Time | < 4 hours |

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │                      CLIENT LAYER                        │      │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │      │
│    │  │   Browser   │  │   Mobile    │  │   Tablet    │     │      │
│    │  │   (Desktop) │  │   Browser   │  │   Browser   │     │      │
│    │  └─────────────┘  └─────────────┘  └─────────────┘     │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                │                                     │
│                                ▼                                     │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │                    FRONTEND LAYER                        │      │
│    │  ┌─────────────────────────────────────────────────┐   │      │
│    │  │              Next.js Application                 │   │      │
│    │  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │   │      │
│    │  │  │ Public  │  │  Admin  │  │    API Routes   │ │   │      │
│    │  │  │  Pages  │  │  Pages  │  │   (Optional)    │ │   │      │
│    │  │  └─────────┘  └─────────┘  └─────────────────┘ │   │      │
│    │  └─────────────────────────────────────────────────┘   │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                │                                     │
│                                │ REST API                            │
│                                ▼                                     │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │                    BACKEND LAYER                         │      │
│    │  ┌─────────────────────────────────────────────────┐   │      │
│    │  │           Node.js + Express Server               │   │      │
│    │  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │   │      │
│    │  │  │ Routes  │  │ Middle  │  │   Controllers   │ │   │      │
│    │  │  │         │  │  ware   │  │                 │ │   │      │
│    │  │  └─────────┘  └─────────┘  └─────────────────┘ │   │      │
│    │  └─────────────────────────────────────────────────┘   │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                │                                     │
│                                ▼                                     │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │                     DATA LAYER                           │      │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │      │
│    │  │   MongoDB   │  │   File      │  │   Email     │     │      │
│    │  │   Database  │  │   Storage   │  │   Service   │     │      │
│    │  └─────────────┘  └─────────────┘  └─────────────┘     │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Admin Panel Architecture

- Built inside Next.js under `/admin` route
- Protected pages with authentication middleware
- Uses same backend API as public site
- Role-based component rendering

### 6.3 Data Flow

```
User Action → Next.js Page → API Call → Express Route → Controller → Model → MongoDB
                                                              ↓
User Display ← Next.js Page ← API Response ← Express Route ← Controller
```

---

## 7. Technology Stack

### 7.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with SSR/SSG |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first CSS |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| React Query | 5.x | Server state management |
| Axios | 1.x | HTTP client |
| Lucide React | Latest | Icon library |
| React Quill | Latest | WYSIWYG editor |
| Swiper | Latest | Carousel/slider |
| Yet Another React Lightbox | Latest | Lightbox component |

### 7.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Mongoose | 8.x | MongoDB ODM |
| JWT | Latest | Authentication tokens |
| bcryptjs | Latest | Password hashing |
| Multer | Latest | File uploads |
| Nodemailer | Latest | Email sending |
| Express Validator | Latest | Input validation |
| Helmet | Latest | Security headers |
| CORS | Latest | Cross-origin requests |
| Morgan | Latest | HTTP logging |
| dotenv | Latest | Environment variables |

### 7.3 Database

| Technology | Purpose |
|------------|---------|
| MongoDB | Primary database |
| MongoDB Atlas | Cloud hosting (production) |

### 7.4 DevOps & Tools

| Technology | Purpose |
|------------|---------|
| Git | Version control |
| GitHub | Repository hosting |
| Vercel | Frontend deployment |
| Render / Railway | Backend deployment |
| Cloudinary | Image CDN (optional) |
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |

---

## 8. Database Models

### 8.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIP DIAGRAM                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐         ┌──────────────┐                        │
│   │  Department  │◄────────│    Doctor    │                        │
│   │              │   1:N   │              │                        │
│   └──────────────┘         └──────────────┘                        │
│                                   │                                  │
│                                   │ 1:N                              │
│                                   ▼                                  │
│                            ┌──────────────┐                        │
│                            │ Appointment  │                        │
│                            │              │                        │
│                            └──────────────┘                        │
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│   │    Blog      │    │   Package    │    │    User      │        │
│   │              │    │              │    │   (Admin)    │        │
│   └──────────────┘    └──────────────┘    └──────────────┘        │
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐                             │
│   │ GalleryItem  │    │ContactMessage│                             │
│   │              │    │              │                             │
│   └──────────────┘    └──────────────┘                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Department Model

```javascript
{
  _id: ObjectId,
  name: String,              // Required, unique
  slug: String,              // Required, unique, auto-generated
  description: String,       // Required
  services: [String],        // Array of services
  heroImage: String,         // Image URL
  icon: String,              // Icon name or URL
  order: Number,             // Display order
  isActive: Boolean,         // Default: true
  isFeatured: Boolean,       // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug`: unique index
- `isActive, isFeatured`: compound index
- `order`: ascending index

---

### 8.3 Doctor Model

```javascript
{
  _id: ObjectId,
  name: String,              // Required
  slug: String,              // Required, unique, auto-generated
  departmentId: ObjectId,    // Reference to Department
  specialization: [String],  // Array of specialties
  experienceYears: Number,   // Years of experience
  qualification: String,     // Degrees/certifications
  photo: String,             // Photo URL
  bio: String,               // Biography
  email: String,             // Contact email
  phone: String,             // Contact phone
  schedule: [{
    day: String,             // Monday, Tuesday, etc.
    startTime: String,       // "09:00"
    endTime: String,         // "17:00"
    slotDuration: Number,    // In minutes (default: 30)
    isAvailable: Boolean
  }],
  consultationFee: Number,   // Optional
  isActive: Boolean,         // Default: true
  isFeatured: Boolean,       // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug`: unique index
- `departmentId`: index
- `isActive, isFeatured`: compound index
- `specialization`: text index for search

---

### 8.4 Appointment Model

```javascript
{
  _id: ObjectId,
  doctorId: ObjectId,        // Reference to Doctor, Required
  departmentId: ObjectId,    // Reference to Department
  patientName: String,       // Required
  patientEmail: String,      // Required
  patientPhone: String,      // Required
  date: Date,                // Appointment date, Required
  time: String,              // Time slot "10:00", Required
  reason: String,            // Reason for visit
  notes: String,             // Additional notes
  status: String,            // pending | confirmed | cancelled | completed | no-show
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId      // Reference to User
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `doctorId, date, time`: compound unique index (prevent double-booking)
- `status`: index
- `date`: descending index
- `patientEmail`: index

---

### 8.5 Package Model

```javascript
{
  _id: ObjectId,
  title: String,             // Required
  slug: String,              // Required, unique
  images: [String],          // Array of image URLs
  price: Number,             // Required
  originalPrice: Number,     // For discount display
  currency: String,          // Default: "NPR"
  description: String,       // Required
  shortDescription: String,  // For listing cards
  inclusions: [String],      // What's included
  exclusions: [String],      // What's not included
  duration: String,          // e.g., "2-3 hours"
  preparation: String,       // Preparation instructions
  isActive: Boolean,         // Default: true
  isFeatured: Boolean,       // Default: false
  order: Number,             // Display order
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug`: unique index
- `isActive, isFeatured`: compound index

---

### 8.6 Blog Model

```javascript
{
  _id: ObjectId,
  title: String,             // Required
  slug: String,              // Required, unique
  coverImage: String,        // Featured image URL
  excerpt: String,           // Short description
  body: String,              // Rich text content, Required
  tags: [String],            // Categorization tags
  author: String,            // Author name
  authorId: ObjectId,        // Reference to User (optional)
  readTime: Number,          // Estimated read time in minutes
  status: String,            // draft | published
  publishedAt: Date,
  viewCount: Number,         // Default: 0
  isActive: Boolean,         // Default: true
  isFeatured: Boolean,       // Default: false
  metaTitle: String,         // SEO meta title
  metaDescription: String,   // SEO meta description
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug`: unique index
- `status, isActive`: compound index
- `tags`: index
- `publishedAt`: descending index
- `title, body`: text index for search

---

### 8.7 GalleryItem Model

```javascript
{
  _id: ObjectId,
  type: String,              // image | video
  url: String,               // Media URL, Required
  thumbnailUrl: String,      // Thumbnail for videos
  title: String,             // Caption/title
  description: String,       // Optional description
  category: String,          // Optional categorization
  order: Number,             // Display order
  isActive: Boolean,         // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `type, isActive`: compound index
- `category`: index
- `order`: ascending index

---

### 8.8 ContactMessage Model

```javascript
{
  _id: ObjectId,
  name: String,              // Required
  email: String,             // Required
  phone: String,             // Required
  subject: String,           // Optional
  message: String,           // Required
  status: String,            // unread | read | resolved
  adminNotes: String,        // Internal notes
  respondedAt: Date,
  respondedBy: ObjectId,     // Reference to User
  ipAddress: String,         // For rate limiting
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `status`: index
- `createdAt`: descending index
- `email`: index

---

### 8.9 User Model (Admin)

```javascript
{
  _id: ObjectId,
  email: String,             // Required, unique
  password: String,          // Hashed, Required
  name: String,              // Required
  role: String,              // admin | super_admin
  isActive: Boolean,         // Default: true
  lastLogin: Date,
  passwordChangedAt: Date,
  refreshToken: String,      // For token refresh
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: unique index

---

### 8.10 Newsletter Subscriber Model (Optional)

```javascript
{
  _id: ObjectId,
  email: String,             // Required, unique
  isActive: Boolean,         // Default: true
  subscribedAt: Date,
  unsubscribedAt: Date
}
```

---

### 8.11 Settings Model (Optional)

```javascript
{
  _id: ObjectId,
  key: String,               // Setting key, unique
  value: Mixed,              // Setting value
  category: String,          // general | contact | social | seo
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 9. API Specification

### 9.1 Base URL

```
Development: http://localhost:5000/api/v1
Production:  https://api.hospital.com/api/v1
```

### 9.2 Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional: validation errors
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 9.3 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Admin login | No |
| POST | `/auth/logout` | Admin logout | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/change-password` | Change password | Yes |

#### POST /auth/login

**Request:**
```json
{
  "email": "admin@hospital.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@hospital.com",
      "name": "Admin User",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 9.4 Department Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/departments` | List all departments | No |
| GET | `/departments/:slug` | Get department by slug | No |
| POST | `/departments` | Create department | Yes |
| PUT | `/departments/:id` | Update department | Yes |
| DELETE | `/departments/:id` | Delete department | Yes |

#### GET /departments

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `isFeatured` (boolean): Filter featured only

---

### 9.5 Doctor Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/doctors` | List all doctors | No |
| GET | `/doctors/:slug` | Get doctor by slug | No |
| GET | `/doctors/:id/availability` | Get doctor availability | No |
| POST | `/doctors` | Create doctor | Yes |
| PUT | `/doctors/:id` | Update doctor | Yes |
| DELETE | `/doctors/:id` | Delete doctor | Yes |
| PUT | `/doctors/:id/schedule` | Update doctor schedule | Yes |

#### GET /doctors

**Query Parameters:**
- `department` (string): Filter by department ID or slug
- `specialization` (string): Filter by specialization
- `search` (string): Search by name
- `isActive` (boolean): Filter by active status
- `isFeatured` (boolean): Filter featured only
- `page` (number): Page number
- `limit` (number): Items per page

#### GET /doctors/:id/availability

**Query Parameters:**
- `date` (string): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "doctorId": "...",
    "date": "2024-12-15",
    "slots": [
      { "time": "09:00", "available": true },
      { "time": "09:30", "available": false },
      { "time": "10:00", "available": true }
    ]
  }
}
```

---

### 9.6 Appointment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/appointments` | Book appointment | No |
| GET | `/appointments` | List all appointments | Yes |
| GET | `/appointments/:id` | Get appointment details | Yes |
| PATCH | `/appointments/:id` | Update appointment status | Yes |
| DELETE | `/appointments/:id` | Cancel appointment | Yes |

#### POST /appointments

**Request:**
```json
{
  "doctorId": "...",
  "date": "2024-12-15",
  "time": "10:00",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+977-9812345678",
  "reason": "General checkup"
}
```

#### GET /appointments (Admin)

**Query Parameters:**
- `status` (string): Filter by status
- `doctorId` (string): Filter by doctor
- `date` (string): Filter by date
- `startDate` (string): Filter from date
- `endDate` (string): Filter to date
- `page` (number): Page number
- `limit` (number): Items per page

#### PATCH /appointments/:id

**Request:**
```json
{
  "status": "confirmed",
  "adminNotes": "Confirmed via phone call"
}
```

---

### 9.7 Blog Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/blogs` | List all published blogs | No |
| GET | `/blogs/:slug` | Get blog by slug | No |
| POST | `/blogs` | Create blog | Yes |
| PUT | `/blogs/:id` | Update blog | Yes |
| DELETE | `/blogs/:id` | Delete blog | Yes |

#### GET /blogs

**Query Parameters:**
- `tag` (string): Filter by tag
- `search` (string): Search in title/body
- `status` (string): Filter by status (admin only)
- `page` (number): Page number
- `limit` (number): Items per page

---

### 9.8 Gallery Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/gallery` | List all gallery items | No |
| POST | `/gallery` | Upload media | Yes |
| DELETE | `/gallery/:id` | Delete media | Yes |

#### GET /gallery

**Query Parameters:**
- `type` (string): Filter by type (image/video)
- `category` (string): Filter by category
- `page` (number): Page number
- `limit` (number): Items per page

---

### 9.9 Package Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/packages` | List all packages | No |
| GET | `/packages/:slug` | Get package by slug | No |
| POST | `/packages` | Create package | Yes |
| PUT | `/packages/:id` | Update package | Yes |
| DELETE | `/packages/:id` | Delete package | Yes |

---

### 9.10 Contact Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/contact` | Submit contact form | No |
| GET | `/contact` | List all messages | Yes |
| GET | `/contact/:id` | Get message details | Yes |
| PATCH | `/contact/:id` | Update message status | Yes |
| DELETE | `/contact/:id` | Delete message | Yes |

#### POST /contact

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+977-9812345678",
  "subject": "Inquiry about services",
  "message": "I would like to know more about..."
}
```

---

### 9.11 Upload Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload/image` | Upload single image | Yes |
| POST | `/upload/images` | Upload multiple images | Yes |
| DELETE | `/upload/:filename` | Delete uploaded file | Yes |

---

## 10. Project Structure

### 10.1 Frontend Structure (Next.js)

```
frontend/
├── public/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                 # Homepage
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── departments/
│   │   │   │   ├── page.tsx             # Department list
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         # Department detail
│   │   │   ├── doctors/
│   │   │   │   ├── page.tsx             # Doctor directory
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         # Doctor profile
│   │   │   ├── appointments/
│   │   │   │   ├── page.tsx             # Booking page
│   │   │   │   └── confirmation/
│   │   │   │       └── page.tsx
│   │   │   ├── packages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── blogs/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Admin layout
│   │   │   ├── page.tsx                 # Dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── departments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── doctors/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── packages/
│   │   │   │   └── ...
│   │   │   ├── blogs/
│   │   │   │   └── ...
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ...
│   │   ├── layout/                      # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── AdminNav.tsx
│   │   ├── home/                        # Homepage components
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── SearchSection.tsx
│   │   │   ├── FeaturedDepartments.tsx
│   │   │   ├── FeaturedDoctors.tsx
│   │   │   └── ...
│   │   ├── doctors/                     # Doctor-related components
│   │   │   ├── DoctorCard.tsx
│   │   │   ├── DoctorList.tsx
│   │   │   ├── DoctorProfile.tsx
│   │   │   └── AvailabilityCalendar.tsx
│   │   ├── appointments/                # Appointment components
│   │   │   ├── BookingForm.tsx
│   │   │   ├── TimeSlotPicker.tsx
│   │   │   └── AppointmentCard.tsx
│   │   ├── forms/                       # Form components
│   │   │   ├── ContactForm.tsx
│   │   │   ├── DepartmentForm.tsx
│   │   │   ├── DoctorForm.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── hooks/                           # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useDepartments.ts
│   │   ├── useDoctors.ts
│   │   └── ...
│   ├── lib/                             # Utility functions
│   │   ├── api.ts                       # API client setup
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── services/                        # API service functions
│   │   ├── auth.service.ts
│   │   ├── department.service.ts
│   │   ├── doctor.service.ts
│   │   ├── appointment.service.ts
│   │   └── ...
│   ├── types/                           # TypeScript types
│   │   ├── index.ts
│   │   ├── department.ts
│   │   ├── doctor.ts
│   │   └── ...
│   ├── context/                         # React context
│   │   └── AuthContext.tsx
│   └── constants/                       # Constants
│       └── index.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

---

### 10.2 Backend Structure (Node.js + Express)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts                  # MongoDB connection
│   │   ├── env.ts                       # Environment variables
│   │   └── cors.ts                      # CORS configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── department.controller.ts
│   │   ├── doctor.controller.ts
│   │   ├── appointment.controller.ts
│   │   ├── blog.controller.ts
│   │   ├── gallery.controller.ts
│   │   ├── package.controller.ts
│   │   ├── contact.controller.ts
│   │   └── upload.controller.ts
│   ├── models/
│   │   ├── Department.ts
│   │   ├── Doctor.ts
│   │   ├── Appointment.ts
│   │   ├── Blog.ts
│   │   ├── GalleryItem.ts
│   │   ├── Package.ts
│   │   ├── ContactMessage.ts
│   │   └── User.ts
│   ├── routes/
│   │   ├── index.ts                     # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── department.routes.ts
│   │   ├── doctor.routes.ts
│   │   ├── appointment.routes.ts
│   │   ├── blog.routes.ts
│   │   ├── gallery.routes.ts
│   │   ├── package.routes.ts
│   │   ├── contact.routes.ts
│   │   └── upload.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts           # JWT verification
│   │   ├── error.middleware.ts          # Global error handler
│   │   ├── validate.middleware.ts       # Request validation
│   │   ├── upload.middleware.ts         # File upload handling
│   │   └── rateLimiter.middleware.ts    # Rate limiting
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   └── ...
│   ├── utils/
│   │   ├── ApiResponse.ts               # Standardized responses
│   │   ├── ApiError.ts                  # Custom error class
│   │   ├── asyncHandler.ts              # Async error wrapper
│   │   ├── generateSlug.ts              # Slug generation
│   │   └── helpers.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── department.validator.ts
│   │   ├── doctor.validator.ts
│   │   ├── appointment.validator.ts
│   │   └── ...
│   ├── types/
│   │   └── index.ts
│   └── app.ts                           # Express app setup
├── uploads/                             # Local file uploads
├── server.ts                            # Server entry point
├── tsconfig.json
├── package.json
├── .env
└── .env.example
```

---

## 11. Development Phases

### Phase 1: Foundation (Week 1-2)

| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Setup Next.js project with TypeScript | ⬜ |
| 1.2 | Setup Tailwind CSS configuration | ⬜ |
| 1.3 | Setup backend folder structure | ⬜ |
| 1.4 | Configure MongoDB connection | ⬜ |
| 1.5 | Implement Auth module (login, JWT) | ⬜ |
| 1.6 | Setup ESLint, Prettier | ⬜ |
| 1.7 | Create base UI components | ⬜ |

**Deliverables:**
- Working development environment
- Authentication system
- Basic project structure

---

### Phase 2: Core Content (Week 3-4)

| Task | Description | Status |
|------|-------------|--------|
| 2.1 | Department CRUD API | ⬜ |
| 2.2 | Department public pages | ⬜ |
| 2.3 | Doctor CRUD API | ⬜ |
| 2.4 | Doctor public pages | ⬜ |
| 2.5 | Doctor search & filters | ⬜ |
| 2.6 | Package CRUD API | ⬜ |
| 2.7 | Package public pages | ⬜ |
| 2.8 | Blog CRUD API with WYSIWYG | ⬜ |
| 2.9 | Blog public pages | ⬜ |
| 2.10 | Gallery API & upload | ⬜ |
| 2.11 | Gallery public page | ⬜ |

**Deliverables:**
- All content modules working
- Public-facing pages complete
- Image upload functionality

---

### Phase 3: Appointment System (Week 5-6)

| Task | Description | Status |
|------|-------------|--------|
| 3.1 | Doctor schedule management | ⬜ |
| 3.2 | Availability calculation logic | ⬜ |
| 3.3 | Appointment booking API | ⬜ |
| 3.4 | Booking UI flow | ⬜ |
| 3.5 | Time slot picker component | ⬜ |
| 3.6 | Appointment confirmation page | ⬜ |
| 3.7 | Email notifications (optional) | ⬜ |

**Deliverables:**
- Complete booking system
- Real-time availability checking
- Confirmation flow

---

### Phase 4: Admin Dashboard (Week 7-8)

| Task | Description | Status |
|------|-------------|--------|
| 4.1 | Admin layout & navigation | ⬜ |
| 4.2 | Dashboard overview page | ⬜ |
| 4.3 | Department management screens | ⬜ |
| 4.4 | Doctor management screens | ⬜ |
| 4.5 | Appointment management | ⬜ |
| 4.6 | Blog management | ⬜ |
| 4.7 | Gallery management | ⬜ |
| 4.8 | Package management | ⬜ |
| 4.9 | Contact messages | ⬜ |

**Deliverables:**
- Fully functional admin dashboard
- CRUD interfaces for all modules
- Appointment status management

---

### Phase 5: Static Pages & Polish (Week 9)

| Task | Description | Status |
|------|-------------|--------|
| 5.1 | About page | ⬜ |
| 5.2 | Contact page | ⬜ |
| 5.3 | Homepage completion | ⬜ |
| 5.4 | SEO optimization | ⬜ |
| 5.5 | Mobile responsiveness | ⬜ |
| 5.6 | Performance optimization | ⬜ |
| 5.7 | Bug fixes & testing | ⬜ |

**Deliverables:**
- All static pages
- SEO-optimized site
- Mobile-ready interface

---

### Phase 6: Deployment (Week 10)

| Task | Description | Status |
|------|-------------|--------|
| 6.1 | Configure production environment | ⬜ |
| 6.2 | Setup MongoDB Atlas | ⬜ |
| 6.3 | Deploy frontend to Vercel | ⬜ |
| 6.4 | Deploy backend to Render/Railway | ⬜ |
| 6.5 | Configure domain & SSL | ⬜ |
| 6.6 | Setup monitoring & logging | ⬜ |
| 6.7 | Final testing & launch | ⬜ |

**Deliverables:**
- Production deployment
- Live website
- Monitoring setup

---

## 12. Testing Strategy

### 12.1 Testing Levels

| Level | Scope | Tools |
|-------|-------|-------|
| **Unit Testing** | Individual functions, utilities | Jest |
| **Integration Testing** | API endpoints | Supertest |
| **Component Testing** | React components | React Testing Library |
| **E2E Testing** | Complete user flows | Cypress / Playwright |

### 12.2 Test Coverage Goals

| Area | Minimum Coverage |
|------|------------------|
| API Controllers | 80% |
| Utility Functions | 90% |
| React Components | 70% |
| Critical Paths | 100% |

### 12.3 Testing Checklist

- [ ] All API endpoints return correct status codes
- [ ] Authentication flow works correctly
- [ ] Appointment booking prevents double-booking
- [ ] Form validations work on frontend and backend
- [ ] Pagination works correctly
- [ ] Image uploads work
- [ ] Admin CRUD operations work
- [ ] Mobile responsive design works
- [ ] SEO meta tags are present

---

## 13. Deployment Strategy

### 13.1 Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | localhost:3000 / localhost:5000 |
| Staging | Testing before production | staging.hospital.com |
| Production | Live site | www.hospital.com |

### 13.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────┐        ┌─────────────────┐                   │
│   │     Vercel      │        │  Render/Railway │                   │
│   │   (Frontend)    │───────▶│    (Backend)    │                   │
│   │    Next.js      │  API   │  Node + Express │                   │
│   └─────────────────┘        └─────────────────┘                   │
│           │                          │                              │
│           │                          │                              │
│           ▼                          ▼                              │
│   ┌─────────────────┐        ┌─────────────────┐                   │
│   │   Cloudflare    │        │  MongoDB Atlas  │                   │
│   │      CDN        │        │    Database     │                   │
│   └─────────────────┘        └─────────────────┘                   │
│                                      │                              │
│                                      │                              │
│                              ┌───────┴───────┐                     │
│                              │               │                      │
│                        ┌─────────────┐ ┌─────────────┐             │
│                        │ Cloudinary  │ │   SendGrid  │             │
│                        │   Images    │ │   Emails    │             │
│                        └─────────────┘ └─────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 13.3 Environment Variables

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

#### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/hospital

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 14. Risk Assessment

### 14.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database performance issues | Medium | High | Proper indexing, query optimization |
| Security vulnerabilities | Medium | High | Regular security audits, input validation |
| Third-party API failures | Low | Medium | Fallback mechanisms, caching |
| File storage limits | Medium | Medium | Cloud storage integration |
| SEO ranking delays | High | Medium | Proper SEO implementation from start |

### 14.2 Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | High | High | Clear requirements, change control |
| Timeline delays | Medium | Medium | Buffer time, agile methodology |
| Resource unavailability | Low | High | Documentation, knowledge sharing |
| Technology learning curve | Medium | Low | Training, documentation |

### 14.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | High | User feedback, iterative improvement |
| Competition | Medium | Medium | Unique features, good UX |
| Regulatory compliance | Low | High | Legal consultation, HIPAA consideration |

---

## 15. Appendix

### 15.1 Glossary

| Term | Definition |
|------|------------|
| **SSR** | Server-Side Rendering |
| **SSG** | Static Site Generation |
| **JWT** | JSON Web Token |
| **CRUD** | Create, Read, Update, Delete |
| **API** | Application Programming Interface |
| **ODM** | Object Document Mapper |
| **SEO** | Search Engine Optimization |
| **CORS** | Cross-Origin Resource Sharing |
| **CDN** | Content Delivery Network |

### 15.2 References

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [JWT.io](https://jwt.io/)

### 15.3 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Development Team | Initial document |

---

## 16. Additional Recommendations

### 16.1 Future Enhancements (Phase 2+)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Patient Portal** | User registration, appointment history | High |
| **Online Payments** | Integration with payment gateways | High |
| **Doctor Dashboard** | Doctors manage their own schedules | Medium |
| **Telemedicine** | Video consultation integration | Medium |
| **Multi-language** | Support for multiple languages | Medium |
| **Mobile App** | React Native mobile application | Low |
| **Analytics Dashboard** | Advanced reporting and analytics | Low |
| **Review System** | Patient reviews for doctors | Low |

### 16.2 Performance Optimization Tips

1. **Image Optimization**
   - Use Next.js Image component
   - Implement lazy loading
   - Use WebP format

2. **Database Optimization**
   - Create proper indexes
   - Use MongoDB aggregation pipelines
   - Implement pagination everywhere

3. **Caching Strategy**
   - Cache static content
   - Implement API response caching
   - Use ISR (Incremental Static Regeneration) for semi-static pages

4. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based code splitting

### 16.3 Security Best Practices

1. **Input Validation**
   - Validate all inputs server-side
   - Sanitize HTML content
   - Use parameterized queries

2. **Authentication**
   - Implement refresh token rotation
   - Set secure, httpOnly cookies
   - Use short-lived access tokens

3. **API Security**
   - Rate limiting on all endpoints
   - CORS configuration
   - Helmet.js for security headers

4. **Data Protection**
   - Encrypt sensitive data
   - Regular backups
   - Access logging

---

<div align="center">

**📘 Hospital Website Project Specification**

*Document Version 1.0*

*Last Updated: December 2024*

---

**Ready for Development** ✅

</div>

