/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import {
  User,
  Course,
  Department,
  AdmissionApplication,
  RepairTicket,
  DocumentationOrder,
  Certificate,
  Product,
  Order,
  BlogPost,
  Notification,
  AcademicRecord,
  AttendanceRecord,
  TimetableEntry,
  Assignment,
} from "../types";

const DB_FILE = path.join(process.cwd(), "db.json");

interface DatabaseSchema {
  users: User[];
  departments: Department[];
  courses: Course[];
  admissions: AdmissionApplication[];
  repairs: RepairTicket[];
  docOrders: DocumentationOrder[];
  certificates: Certificate[];
  products: Product[];
  orders: Order[];
  blogs: BlogPost[];
  notifications: Notification[];
  academicRecords: AcademicRecord[];
  attendanceRecords: AttendanceRecord[];
  timetable: TimetableEntry[];
  assignments: Assignment[];
}

// Initial Seed Data
const INITIAL_DEPARTMENTS: Department[] = [
  { id: "dept-dp", name: "Data Processing", description: "Master essential computing tools, office suites, spreadsheet logic, and computer operations.", durationMonths: 3 },
  { id: "dept-hm", name: "Hardware Maintenance & Networking", description: "Learn systematic computer diagnostics, component assembly, OS installation, and system network configurations.", durationMonths: 12 },
  { id: "dept-se", name: "Software Engineering", description: "Comprehensive software architecture course covering web programming, algorithmic structures, databases, and application deployments.", durationMonths: 9 },
  { id: "dept-gd", name: "Graphic Design & Digital Publishing", description: "Master digital publishing layout designs, desktop publishing, vector illustration, and print media creation.", durationMonths: 6 },
];

const INITIAL_COURSES: Course[] = [
  {
    id: "course-dp3",
    departmentId: "dept-dp",
    title: "Data Processing Intensive",
    description: "Introductory 3-month hands-on course covering Microsoft Office Suite, Operating Systems, Keyboard typing master techniques, and digital storage systems.",
    durationMonths: 3,
    subjects: ["Fundamentals of Computing", "Microsoft Word & Document Design", "Excel Spreadsheets and Logic", "Powerpoint Presentations", "Intro to Web Browsing & Email Security"],
    materialsRequired: ["Notebook", "USB Flash Drive (Minimum 16GB)"],
    feesCFAF: 60000,
    schedule: "Morning Shift (8:00 AM - 12:00 PM) & Afternoon Shift (1:00 PM - 4:00 PM)",
    instructor: "Mr. Azemoh Edmond",
    careerOpportunities: ["Office Assistant", "Data Entry Specialist", "Secretary", "Administrative Clerk"],
  },
  {
    id: "course-dp6",
    departmentId: "dept-dp",
    title: "Advanced Data Processing & Office Management",
    description: "6-month program for administrative careers. Master spreadsheets, database basics, professional report typing, and modern cloud collaboration tools.",
    durationMonths: 6,
    subjects: ["Advanced Spreadsheet Modeling", "Database Essentials (Access)", "Administrative Report Layouts", "Cloud Productivity Tools (Workspace)", "Business Communication & Typing Speed"],
    materialsRequired: ["Notebook", "USB Flash Drive (32GB)"],
    feesCFAF: 100000,
    schedule: "Morning Shift (8:00 AM - 12:00 PM)",
    instructor: "Mr. Azemoh Edmond",
    careerOpportunities: ["Executive Assistant", "Office Manager", "Database Clerk", "Front Desk Receptionist"],
  },
  {
    id: "course-hm12",
    departmentId: "dept-hm",
    title: "Computer Hardware Engineering & Applied Systems",
    description: "Our core 12-month professional training. Learn PC dismantling, electronics troubleshooting, power units, hard drives, RAM replacement, operating system installations, virus cleaning, and local network wiring.",
    durationMonths: 12,
    subjects: ["Intro to Computer Electronics", "Motherboard Diagnostics & CPU Architectures", "Storage & RAM Systems Optimization", "Operating System Installation & Driver Setup", "Local Area Networking (LAN) Routing & Cabling", "Diagnostic Tools & Systematic Troubleshooting"],
    materialsRequired: ["Digital Multimeter", "Anti-static Wristband", "Precision Screwdriver Toolkit", "8GB USB Flash Drive"],
    feesCFAF: 150000,
    schedule: "Afternoon Shift (1:00 PM - 4:00 PM) & Evening Shift (5:00 PM - 8:00 PM)",
    instructor: "Mr. Azemoh Edmond",
    careerOpportunities: ["Computer Repair Technician", "Systems Administrator", "IT Support Engineer", "Network Installer"],
  },
  {
    id: "course-se9",
    departmentId: "dept-se",
    title: "Software Development & Web Technologies",
    description: "9-month intense software developer training. Master full stack HTML, CSS, JavaScript, React, Node.js, databases, git control, and cloud environments.",
    durationMonths: 9,
    subjects: ["Algorithms & Computational Logic", "Responsive Frontend Web Design (HTML/CSS/JS)", "React UI components development", "Server-side Express and APIs", "Database Modeling & SQL Solutions", "Project Version Control with Git"],
    materialsRequired: ["Laptop with minimum 8GB RAM"],
    feesCFAF: 180000,
    schedule: "Evening Shift (5:00 PM - 8:00 PM)",
    instructor: "Mr. Azemoh Edmond",
    careerOpportunities: ["Full Stack Developer", "Frontend Programmer", "Freelance Software Developer", "Systems Analyst"],
  },
  {
    id: "course-holiday",
    departmentId: "dept-dp",
    title: "Computer 1 Month Holiday Classes",
    description: "Special 1-month holiday intensive training on computer basics, internet browsing, and creative typing.",
    durationMonths: 1,
    subjects: ["Introduction to Computers", "Keyboard Typing Practice", "Web Browsing & E-mail Basics", "Creative Drawing & Paint"],
    materialsRequired: ["Notebook", "Pen"],
    feesCFAF: 10000,
    schedule: "Morning Shift (9:00 AM - 12:00 PM) & Afternoon Shift (2:00 PM - 5:00 PM)",
    instructor: "Mr. Azemoh Edmond",
    careerOpportunities: ["Basic Computer Literacy Certificate"],
  },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: "prod-1", category: "Laptops", name: "Lenovo ThinkPad T480 (Refurbished)", description: "Intel Core i5, 16GB RAM, 256GB SSD, 14-inch Display. Excellent for programming & business.", priceCFAF: 185000, stock: 12, imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80", specifications: ["Intel Core i5-8350U", "16GB DDR4 RAM", "256GB NVMe SSD", "14 inch HD Screen", "Windows 10 Pro Installed"] },
  { id: "prod-2", category: "Laptops", name: "HP EliteBook 840 G5", description: "Premium aluminum build, Intel Core i7, 16GB RAM, 512GB SSD. Reliable student powerhouse.", priceCFAF: 240000, stock: 8, imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80", specifications: ["Intel Core i7-8550U", "16GB RAM", "512GB High Speed SSD", "Fingerprint Scanner", "Backlit Keyboard"] },
  { id: "prod-3", category: "Desktops", name: "Dell OptiPlex 7050 Mini Tower", description: "Complete Desktop Unit with 20-inch monitor, USB Keyboard & Mouse. Best for office desks & cyber cafes.", priceCFAF: 150000, stock: 5, imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500&q=80", specifications: ["Intel Core i5 Quad Core", "8GB DDR4 RAM", "1TB SATA HDD", "DVD-RW Writer", "20 inch LED Monitor Included"] },
  { id: "prod-4", category: "Printers", name: "HP LaserJet Pro M402dn", description: "Heavy duty monochrome laser printer. Best for cyber cafes, high speed documentation typing, and photocopy.", priceCFAF: 135000, stock: 4, imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80", specifications: ["Monochrome Laser Printing", "Up to 40 pages per minute", "Automatic Double-Sided Printing", "Ethernet Port Built-In"] },
  { id: "prod-5", category: "Accessories", name: "Sandisk Cruzer Dial 32GB USB 2.0", description: "Reliable flash drive for school assignments, driver installations, and portfolio backup.", priceCFAF: 45000, stock: 120, imageUrl: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=500&q=80", specifications: ["32GB Storage Capacity", "Retractable Design", "SecureAccess Software Included"] },
  { id: "prod-6", category: "Accessories", name: "Premium HDMI Cable 3 Meters", description: "High-speed 4K UHD nylon braided HDMI cable. Perfect for connecting laptops to project screens.", priceCFAF: 4000, stock: 50, imageUrl: "https://images.unsplash.com/photo-1557063673-0493e05d49ef?w=500&q=80", specifications: ["3 Meters length", "Gold Plated Connectors", "Oxygen Free Copper core"] },
];

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Systematic Motherboard Diagnostics: Practical Guide for Kumba Technicians",
    slug: "motherboard-diagnostics-guide",
    category: "Hardware",
    summary: "Learn how to diagnose a dead computer motherboard systematically using cheap tools like multimeters, RAM testers, and post code cards.",
    content: "## Troubleshooting a Dead Motherboard\n\nMany computer repair technicians in Kumba get intimidated when a laptop or desktop motherboard refuses to power on entirely. The general reflex is to tell the customer: 'Your motherboard is bad, you need to replace it.'\n\nBefore you render this expensive verdict, you must follow systematic hardware diagnosis steps taught inside the **Computer Jungle Training Center Laboratory**:\n\n### 1. Power Supply Rail Test\nAlways test the external charger or desktop SMPS first. Check if the voltage output matches the rated voltage (typically 19V for laptops or 12V/5V for desktops). If the external brick works, inspect the DC jack socket. Loose DC jack connections are incredibly common in Cameroon due to dusty roads in Fiango and heavy socket plugging.\n\n### 2. Standby Power System (3.3V / 5V)\nUse a digital multimeter to locate the standby power controller coil inductors. If there is no 3.3V standby voltage on the power switch, the motherboard will not trigger. Trace the voltage back to the charge controller IC.\n\n### 3. CMOS Battery Clear\nA corrupted BIOS memory state can freeze a motherboard completely. Pull out the 3V CR2032 CMOS cell, wait for 30 seconds, short-circuit the BIOS terminals to clear register memory, and power on. This simple step resolves up to 25% of black screen computers!\n\nWant to learn hands-on diagnostics? Join our **Hardware Maintenance 12 Months Masterclass** at Confidence Street Junction, Fiango, Kumba.",
    author: "Engr. Paul Ayuk",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
    createdAt: "2026-07-10T10:00:00-07:00",
  },
  {
    id: "blog-2",
    title: "Why Web Software Engineering is the Future of Cameroon's Digital Economy",
    slug: "web-engineering-cameroon",
    category: "Programming",
    summary: "Cameroon is experiencing an e-commerce, banking, and mobile money boom. Web software engineers are critical to building local scalable systems.",
    content: "## Developing Digital Solutions Locally\n\nHistorically, businesses in Cameroon had to buy expensive foreign software systems or rely on legacy offline practices. Today, with the massive adoption of MTN Mobile Money (MoMo) and Orange Money, building web-enabled software systems has never been more vital.\n\nLocal systems built by engineers inside Kumba, Buea, and Douala are tackling real-world problems:\n\n- School management systems supporting local bank integrations.\n- E-Commerce platforms allowing farmers in South West Region to sell cocoa direct.\n- Real-time computer repair diagnostics ticketing.\n\nIn our **Software Engineering 9 Months curriculum**, students build full-stack React + Express + SQLite apps and integrate local mobile money payment webhooks, prepping them to be high-earning local developers or offshore freelancers.\n\nStart your programming journey at **Computer Jungle Training Center!**",
    author: "Mr. Manases Chumtan",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
    createdAt: "2026-07-12T14:30:00-07:00",
  },
];

const INITIAL_CERTIFICATES: Certificate[] = [
  { id: "CERT-CJ-2026-8801", studentName: "Achuo Divine Neba", studentId: "CJ-STUD-101", courseTitle: "Computer Hardware Engineering & Applied Systems", departmentName: "Hardware Maintenance & Networking", grade: "Excellent", issueDate: "2026-06-15", regNumber: "REG/CJ/2025/042", qrUrl: "/verify/CERT-CJ-2026-8801", verified: true },
  { id: "CERT-CJ-2026-8802", studentName: "Etonde Mary Sango", studentId: "CJ-STUD-102", courseTitle: "Data Processing Intensive", departmentName: "Data Processing", grade: "Very Good", issueDate: "2026-05-10", regNumber: "REG/CJ/2026/011", qrUrl: "/verify/CERT-CJ-2026-8802", verified: true },
];

const INITIAL_TIMETABLE: TimetableEntry[] = [
  { id: "time-1", courseId: "course-dp3", subjectName: "Microsoft Word Essentials", dayOfWeek: "Monday", timeSlot: "8:00 AM - 10:00 AM", classroom: "Lab Room 1", instructorName: "Mr. Azemoh Edmond" },
  { id: "time-2", courseId: "course-dp3", subjectName: "Fundamentals of Windows OS", dayOfWeek: "Monday", timeSlot: "10:00 AM - 12:00 PM", classroom: "Lab Room 1", instructorName: "Mr. Azemoh Edmond" },
  { id: "time-3", courseId: "course-hm12", subjectName: "Motherboard Diagnostics", dayOfWeek: "Tuesday", timeSlot: "1:00 PM - 3:00 PM", classroom: "Hardware Lab 2", instructorName: "Mr. Azemoh Edmond" },
  { id: "time-4", courseId: "course-se9", subjectName: "Full Stack Development with Express", dayOfWeek: "Wednesday", timeSlot: "5:00 PM - 7:00 PM", classroom: "Lab Room 1", instructorName: "Mr. Azemoh Edmond" },
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: "assign-1", courseId: "course-dp3", title: "Excel Budget Formulation", description: "Create an advanced, double-entry school financial template calculating automatic balances, tax percentages, and totals using absolute cell references.", dueDate: "2026-07-25", maxPoints: 20, submissionStatus: "Pending" },
  { id: "assign-2", courseId: "course-hm12", title: "Operating System Dual Booting", description: "Demonstrate dual-boot configuration containing Windows 10 Pro and Linux Ubuntu with customized swap partition tables on a legacy BIOS mother board.", dueDate: "2026-07-28", maxPoints: 50, submissionStatus: "Pending" },
];

const INITIAL_USERS: User[] = [
  { id: "u-1", name: "Mr. Azemoh Edmond", email: "admin@computerjungle.com", role: "Super Admin", phone: "+237 677 83 64 22", password: "admin123", createdAt: "2026-01-01T08:00:00Z" },
  { id: "u-2", name: "Mr. Azemoh Edmond", email: "paul.ayuk@computerjungle.com", role: "Instructor", phone: "+237 675 12 34 56", password: "teacher123", createdAt: "2026-01-05T08:00:00Z" },
  { id: "u-3", name: "Mr. Azemoh Edmond", email: "silas.ndumbe@computerjungle.com", role: "Instructor", phone: "+237 676 98 76 54", password: "teacher123", createdAt: "2026-01-05T08:00:00Z" },
  { id: "u-4", name: "Mr. Azemoh Edmond", email: "manases@computerjungle.com", role: "Principal", phone: "+237 677 83 64 22", password: "admin123", createdAt: "2026-01-02T08:00:00Z" },
  { id: "u-5", name: "Fritz Kumba Student", email: "student@computerjungle.com", role: "Student", phone: "+237 672 34 56 78", password: "student123", createdAt: "2026-02-10T08:00:00Z" },
  { id: "u-6", name: "Kumba Customer", email: "customer@computerjungle.com", role: "Customer", phone: "+237 681 23 45 67", password: "customer123", createdAt: "2026-03-01T08:00:00Z" },
  { id: "u-7", name: "Mr. Azemoh Edmond", email: "accountant@computerjungle.com", role: "Accountant", phone: "+237 674 11 22 33", password: "admin123", createdAt: "2026-01-10T08:00:00Z" },
];

const INITIAL_REPAIRS: RepairTicket[] = [
  {
    id: "REP-1001",
    customerName: "Chief Sango of Fiango",
    customerPhone: "+237 671 23 45 67",
    customerEmail: "chief.sango@gmail.com",
    deviceType: "Laptop",
    deviceName: "HP Pavilion x360",
    issueDescription: "No power entirely after water spill on keyboard.",
    status: "Diagnosing",
    assignedTechnician: "Engr. Paul Ayuk",
    createdAt: "2026-07-13T09:00:00-07:00",
  },
  {
    id: "REP-1002",
    customerName: "Kumba Baptist High School",
    customerPhone: "+237 670 98 76 54",
    customerEmail: "kbhs.school@yahoo.com",
    deviceType: "Printer",
    deviceName: "HP LaserJet M130fn",
    issueDescription: "Paper jam errors constantly and faint horizontal lines printing.",
    status: "Quoted",
    quotedPriceCFAF: 15000,
    technicianNotes: "Needs fuser assembly lubrication and cleaning, scanner glass reset.",
    assignedTechnician: "Engr. Paul Ayuk",
    createdAt: "2026-07-14T11:30:00-07:00",
  }
];

const INITIAL_DOC_ORDERS: DocumentationOrder[] = [
  {
    id: "DOC-2001",
    customerName: "Tabi Collins Enow",
    customerEmail: "tabi.collins@gmail.com",
    customerPhone: "+237 673 45 67 89",
    serviceType: "CV Creation",
    fileName: "tabi_draft_details.docx",
    instructions: "Format draft details into an ATS professional template for oil/gas sector.",
    quantity: 1,
    calculatedPriceCFAF: 5000,
    paymentStatus: "Paid",
    paymentMethod: "MTN Mobile Money",
    status: "In Progress",
    createdAt: "2026-07-14T15:00:00-07:00",
  }
];

class DatabaseEngine {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = {
      users: INITIAL_USERS,
      departments: INITIAL_DEPARTMENTS,
      courses: INITIAL_COURSES,
      admissions: [],
      repairs: INITIAL_REPAIRS,
      docOrders: INITIAL_DOC_ORDERS,
      certificates: INITIAL_CERTIFICATES,
      products: INITIAL_PRODUCTS,
      orders: [],
      blogs: INITIAL_BLOGS,
      notifications: [],
      academicRecords: [
        { id: "rec-1", studentId: "u-5", courseId: "course-dp3", subjectName: "Microsoft Word Essentials", score: 85, grade: "Very Good", term: "First Term", remarks: "Excellent typing alignment", dateRecorded: "2026-06-01" },
        { id: "rec-2", studentId: "u-5", courseId: "course-dp3", subjectName: "Fundamentals of Windows OS", score: 92, grade: "Excellent", term: "First Term", remarks: "Great directory navigation speed", dateRecorded: "2026-06-05" },
      ],
      attendanceRecords: [
        { id: "att-1", studentId: "u-5", date: "2026-07-13", status: "Present", courseId: "course-dp3" },
        { id: "att-2", studentId: "u-5", date: "2026-07-14", status: "Present", courseId: "course-dp3" },
        { id: "att-3", studentId: "u-5", date: "2026-07-15", status: "Late", courseId: "course-dp3" },
      ],
      timetable: INITIAL_TIMETABLE,
      assignments: INITIAL_ASSIGNMENTS,
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const loadedData = JSON.parse(fileContent);
        this.schema = { ...this.schema, ...loadedData };
        // Force update static collections to guarantee Mr. Azemoh Edmond and new holiday courses
        this.schema.users = INITIAL_USERS;
        this.schema.courses = INITIAL_COURSES;
        this.schema.timetable = INITIAL_TIMETABLE;
        this.save();
        console.log("Database file successfully loaded with", this.schema.admissions.length, "admissions.");
      } else {
        this.save();
      }
    } catch (error) {
      console.error("Failed to load local DB, falling back to seed data:", error);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write to local DB:", err);
    }
  }

  // Getters
  getUsers() { return this.schema.users; }
  getDepartments() { return this.schema.departments; }
  getCourses() { return this.schema.courses; }
  getAdmissions() { return this.schema.admissions; }
  getRepairs() { return this.schema.repairs; }
  getDocOrders() { return this.schema.docOrders; }
  getCertificates() { return this.schema.certificates; }
  getProducts() { return this.schema.products; }
  getOrders() { return this.schema.orders; }
  getBlogs() { return this.schema.blogs; }
  getNotifications() { return this.schema.notifications; }
  getAcademicRecords() { return this.schema.academicRecords; }
  getAttendanceRecords() { return this.schema.attendanceRecords; }
  getTimetable() { return this.schema.timetable; }
  getAssignments() { return this.schema.assignments; }

  // Mutations
  createUser(user: User) {
    this.schema.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.schema.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.schema.users[idx] = { ...this.schema.users[idx], ...updates };
      this.save();
      return this.schema.users[idx];
    }
    return null;
  }

  createAdmission(admission: AdmissionApplication) {
    this.schema.admissions.push(admission);
    this.save();
    return admission;
  }

  updateAdmission(id: string, updates: Partial<AdmissionApplication>) {
    const idx = this.schema.admissions.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.schema.admissions[idx] = { ...this.schema.admissions[idx], ...updates };
      this.save();
      return this.schema.admissions[idx];
    }
    return null;
  }

  createRepair(ticket: RepairTicket) {
    this.schema.repairs.push(ticket);
    this.save();
    return ticket;
  }

  updateRepair(id: string, updates: Partial<RepairTicket>) {
    const idx = this.schema.repairs.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.schema.repairs[idx] = { ...this.schema.repairs[idx], ...updates };
      this.save();
      return this.schema.repairs[idx];
    }
    return null;
  }

  createDocOrder(order: DocumentationOrder) {
    this.schema.docOrders.push(order);
    this.save();
    return order;
  }

  updateDocOrder(id: string, updates: Partial<DocumentationOrder>) {
    const idx = this.schema.docOrders.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.schema.docOrders[idx] = { ...this.schema.docOrders[idx], ...updates };
      this.save();
      return this.schema.docOrders[idx];
    }
    return null;
  }

  createOrder(order: Order) {
    this.schema.orders.push(order);
    // Deduct stock
    for (const item of order.items) {
      const prodIdx = this.schema.products.findIndex((p) => p.id === item.productId);
      if (prodIdx !== -1) {
        this.schema.products[prodIdx].stock = Math.max(0, this.schema.products[prodIdx].stock - item.quantity);
      }
    }
    this.save();
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>) {
    const idx = this.schema.orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.schema.orders[idx] = { ...this.schema.orders[idx], ...updates };
      this.save();
      return this.schema.orders[idx];
    }
    return null;
  }

  createCertificate(cert: Certificate) {
    this.schema.certificates.push(cert);
    this.save();
    return cert;
  }

  createNotification(notif: Notification) {
    this.schema.notifications.push(notif);
    this.save();
    return notif;
  }

  markNotificationRead(id: string) {
    const idx = this.schema.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.schema.notifications[idx].read = true;
      this.save();
    }
  }

  submitAssignment(assignmentId: string, studentId: string, url: string) {
    const idx = this.schema.assignments.findIndex((a) => a.id === assignmentId);
    if (idx !== -1) {
      this.schema.assignments[idx].submittedUrl = url;
      this.schema.assignments[idx].submissionStatus = "Submitted";
      this.save();
      return this.schema.assignments[idx];
    }
    return null;
  }

  gradeAssignment(assignmentId: string, points: number, feedback: string) {
    const idx = this.schema.assignments.findIndex((a) => a.id === assignmentId);
    if (idx !== -1) {
      this.schema.assignments[idx].pointsEarned = points;
      this.schema.assignments[idx].submissionStatus = "Graded";
      this.schema.assignments[idx].feedback = feedback;
      this.save();
      return this.schema.assignments[idx];
    }
    return null;
  }
}

export const dbStore = new DatabaseEngine();
