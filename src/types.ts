/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User Roles
export type UserRole =
  | "Super Admin"
  | "Admin"
  | "Principal"
  | "Registrar"
  | "Accountant"
  | "Teacher"
  | "Instructor"
  | "Student"
  | "Parent"
  | "Technician"
  | "Cashier"
  | "Receptionist"
  | "Customer"
  | "Internship Coordinator"
  | "Guest";

// User representation
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  photoUrl?: string;
  password?: string;
  createdAt: string;
}

// Department Definition
export interface Department {
  id: string;
  name: string;
  description: string;
  durationMonths: number;
}

// Course Definition
export interface Course {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  durationMonths: number;
  subjects: string[];
  materialsRequired: string[];
  feesCFAF: number;
  schedule: string; // "Morning Shift (8-12)", "Afternoon Shift (1-4)", "Evening Shift (5-8)"
  instructor: string;
  careerOpportunities: string[];
}

// Admission Application Status
export type AdmissionStatus = "Pending" | "Approved" | "Rejected" | "Needs Correction";

// Admission Application
export interface AdmissionApplication {
  id: string;
  studentId?: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  nationalID?: string;
  departmentId: string;
  courseId: string;
  durationMonths: number;
  shift: "Morning Shift" | "Afternoon Shift" | "Evening Shift";
  paymentMethod: "MTN Mobile Money" | "Orange Money" | "Stripe" | "Bank Transfer" | "Cash";
  paymentReference?: string;
  status: AdmissionStatus;
  feedback?: string;
  passportUrl?: string;
  birthCertificateUrl?: string;
  assignedStudentId?: string;
  assignedRegNumber?: string;
  assignedClassroom?: string;
  assignedInstructor?: string;
  admissionLetterUrl?: string;
  screenshotUrl?: string;
  createdAt: string;
}

// Repair Ticket Status
export type RepairStatus = "Booked" | "Assigned" | "Diagnosing" | "Quoted" | "Repairing" | "Completed" | "Picked Up";

// Computer Repair Ticket
export interface RepairTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: "Laptop" | "Desktop" | "Printer" | "Network Device" | "UPS" | "Other";
  deviceName: string;
  issueDescription: string;
  status: RepairStatus;
  quotedPriceCFAF?: number;
  technicianNotes?: string;
  assignedTechnician?: string;
  imageUrl?: string;
  invoiceUrl?: string;
  createdAt: string;
}

// Documentation Service Type
export type DocServiceType =
  | "Typing"
  | "Printing"
  | "Color Printing"
  | "Photocopy"
  | "Scanning"
  | "Passport Photo"
  | "School ID Design"
  | "CV Creation"
  | "Cover Letter"
  | "Binding"
  | "Lamination"
  | "Flyers & Posters"
  | "Funeral Programs"
  | "Business Cards";

// Documentation Service Order Status
export type DocOrderStatus = "Submitted" | "Reviewing" | "In Progress" | "Completed" | "Delivered";

// Documentation Order
export interface DocumentationOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: DocServiceType;
  fileUrl?: string;
  fileName?: string;
  instructions?: string;
  quantity: number;
  calculatedPriceCFAF: number;
  paymentStatus: "Unpaid" | "Paid";
  paymentMethod?: string;
  status: DocOrderStatus;
  createdAt: string;
}

// Digital Certificate
export interface Certificate {
  id: string; // Unique Certificate Verification ID
  studentName: string;
  studentId: string;
  courseTitle: string;
  departmentName: string;
  grade: "Excellent" | "Very Good" | "Good" | "Satisfactory" | "Passed";
  issueDate: string;
  regNumber: string;
  qrUrl: string; // URL for validation
  verified: boolean;
}

// Product in Computer Shop
export interface Product {
  id: string;
  category: "Laptops" | "Desktops" | "Printers" | "Accessories" | "Networking" | "Software" | "Educational Books";
  name: string;
  description: string;
  priceCFAF: number;
  stock: number;
  imageUrl: string;
  specifications: string[];
}

// Shop Order Status
export type OrderStatus = "Pending" | "Paid" | "Processing" | "Shipped" | "Completed" | "Cancelled";

// E-Commerce Order
export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    priceCFAF: number;
  }[];
  totalCFAF: number;
  paymentMethod: "MTN Mobile Money" | "Orange Money" | "Stripe" | "PayPal" | "Cash";
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  status: OrderStatus;
  deliveryMethod: "Pickup" | "Delivery";
  deliveryAddress?: string;
  createdAt: string;
}

// Blog Post
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: "Technology" | "Programming" | "Networking" | "Cybersecurity" | "Hardware" | "Artificial Intelligence";
  summary: string;
  content: string;
  author: string;
  imageUrl: string;
  createdAt: string;
}

// Dashboard Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "Info" | "Success" | "Warning" | "Error";
  read: boolean;
  createdAt: string;
}

// Academic Record / Result
export interface AcademicRecord {
  id: string;
  studentId: string;
  courseId: string;
  subjectName: string;
  score: number; // Max 100
  grade: string;
  term: "First Term" | "Second Term" | "Final Examination";
  remarks: string;
  dateRecorded: string;
}

// Attendance Record
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  courseId: string;
}

// Timetable Entry
export interface TimetableEntry {
  id: string;
  courseId: string;
  subjectName: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  timeSlot: string; // e.g. "8:00 AM - 10:00 AM"
  classroom: string;
  instructorName: string;
}

// Assignment
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  pointsEarned?: number;
  submittedUrl?: string;
  submissionStatus: "Pending" | "Submitted" | "Graded";
  feedback?: string;
}
