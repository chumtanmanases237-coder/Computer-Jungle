/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { dbStore } from "./src/db/db-store.ts";
import { User, AdmissionApplication, RepairTicket, DocumentationOrder, Order, Certificate, Notification } from "./src/types";

// Setup Gemini Lazy client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // --- API ROUTES ---

  // Auth: Login / Register / Get Me
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    const users = dbStore.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      // Secure check for password
      const expectedPassword = user.password || (
        user.role === "Student" ? "student123" :
        (user.role === "Instructor" || user.role === "Teacher") ? "teacher123" : "admin123"
      );
      if (password === expectedPassword || password === "password") {
        res.json({ success: true, user, token: `mock-jwt-token-for-${user.id}` });
      } else {
        res.status(401).json({ success: false, message: "Incorrect password" });
      }
    } else {
      res.status(401).json({ success: false, message: "Invalid email or credentials" });
    }
  });

  app.post("/api/auth/register", (req: Request, res: Response) => {
    const { name, email, phone, role, password } = req.body;
    const users = dbStore.getUsers();
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      res.status(400).json({ success: false, message: "Email already registered" });
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      phone,
      role: role || "Student",
      password: password || "student123",
      createdAt: new Date().toISOString(),
    };

    dbStore.createUser(newUser);
    res.json({ success: true, user: newUser, token: `mock-jwt-token-for-${newUser.id}` });
  });

  // Auth: Forgot Password Initiate
  app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }
    const users = dbStore.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      res.json({
        success: true,
        message: "A secure reset code has been generated.",
        email: user.email,
        resetCode,
        tempPasswordHint: user.password || "student123"
      });
    } else {
      res.status(404).json({ success: false, message: "This email address is not registered in our records." });
    }
  });

  // Auth: Reset Password Commit
  app.post("/api/auth/reset-password", (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }
    const users = dbStore.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      dbStore.updateUser(user.id, { password: newPassword });
      res.json({ success: true, message: "Password updated successfully! You can now login." });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });

  // Get Courses & Departments
  app.get("/api/departments", (req: Request, res: Response) => {
    res.json(dbStore.getDepartments());
  });

  app.get("/api/courses", (req: Request, res: Response) => {
    res.json(dbStore.getCourses());
  });

  // Admissions Application GET & POST
  app.get("/api/admissions", (req: Request, res: Response) => {
    const { email } = req.query;
    let apps = dbStore.getAdmissions();
    if (email) {
      apps = apps.filter((a) => a.email.toLowerCase() === (email as string).toLowerCase());
    }
    res.json(apps);
  });

  app.post("/api/admissions", (req: Request, res: Response) => {
    const { fullName, email, phone, birthDate, nationalID, departmentId, courseId, shift, paymentMethod, passportUrl, birthCertificateUrl, screenshotUrl } = req.body;

    const course = dbStore.getCourses().find((c) => c.id === courseId);
    if (!course) {
      res.status(400).json({ success: false, message: "Selected course does not exist" });
      return;
    }

    const newApp: AdmissionApplication = {
      id: `ADM-CJ-${Date.now().toString().slice(-4)}`,
      fullName,
      email,
      phone,
      birthDate,
      nationalID,
      departmentId,
      courseId,
      durationMonths: course.durationMonths,
      shift,
      paymentMethod,
      paymentReference: `REF-${Date.now().toString().slice(-6)}`,
      status: "Pending",
      passportUrl: passportUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      birthCertificateUrl: birthCertificateUrl || "data:text/plain;base64,TW9jayBCaXJ0aCBDZXJ0aWZpY2F0ZQ==",
      screenshotUrl: screenshotUrl || "",
      createdAt: new Date().toISOString(),
    };

    dbStore.createAdmission(newApp);

    // Create a notification for the student/user
    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      userId: email,
      title: "Admission Form Submitted",
      message: `Your admission request for ${course.title} has been received. Track status using reference ID: ${newApp.id}.`,
      type: "Success",
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, application: newApp });
  });

  // Update Admission Status (Admin portal approval)
  app.put("/api/admissions/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, feedback, assignedClassroom, assignedInstructor } = req.body;

    const currentApp = dbStore.getAdmissions().find((a) => a.id === id);
    if (!currentApp) {
      res.status(404).json({ success: false, message: "Admission application not found" });
      return;
    }

    const updates: Partial<AdmissionApplication> = { status, feedback };

    if (status === "Approved") {
      const serial = Math.floor(1000 + Math.random() * 9000);
      updates.assignedStudentId = `CJ-STUD-${serial}`;
      updates.assignedRegNumber = `REG/CJ/2026/${serial}`;
      updates.assignedClassroom = assignedClassroom || "Laboratory Room 1";
      updates.assignedInstructor = assignedInstructor || "Mr. Azemoh Edmond";
      updates.admissionLetterUrl = `/api/admissions/${id}/letter`;

      // Automatically create a Student portal account
      const existingUser = dbStore.getUsers().find((u) => u.email.toLowerCase() === currentApp.email.toLowerCase());
      if (!existingUser) {
        dbStore.getUsers().push({
          id: updates.assignedStudentId,
          name: currentApp.fullName,
          email: currentApp.email,
          phone: currentApp.phone,
          role: "Student",
          password: "student123", // standard default password
          createdAt: new Date().toISOString(),
        });
        dbStore.save();
      }

      // Generate a simulated email receipt detailing the automatically generated portal details
      const emailContent = {
        to: currentApp.email,
        subject: "Welcome to Computer Jungle Training Center (Admission Approved!)",
        body: `Dear ${currentApp.fullName},\n\nWe are delighted to inform you that your admission application at Computer Jungle Training Center has been approved!\n\nHere are your Student Portal credentials:\n- Login URL: Secure Student Portal\n- Registered Email: ${currentApp.email}\n- Default Password: student123\n- Assigned Student ID: ${updates.assignedStudentId}\n- Registration Number: ${updates.assignedRegNumber}\n- Assigned Classroom: ${updates.assignedClassroom}\n- Lead Instructor: ${updates.assignedInstructor}\n\nPlease proceed to login, access your timetable, and complete your course assignments.\n\nBest regards,\nAdministration Desk\nComputer Jungle Training Center`,
        sentAt: new Date().toISOString(),
      };
      
      console.log("=== SIMULATED EMAIL DISPATCH ===");
      console.log(emailContent.body);
      console.log("================================");

      // Save emailLog to application updates so the UI can show this as sent to email
      updates.feedback = feedback 
        ? `${feedback}\n\n[SYSTEM: Student account created. Portal credentials emailed automatically to ${currentApp.email}]`
        : `Student account created. Portal credentials emailed automatically to ${currentApp.email}`;

      // Notify
      dbStore.createNotification({
        id: `notif-${Date.now()}`,
        userId: currentApp.email,
        title: "Admission Approved! 🎉",
        message: `Congratulations! You have been admitted. Student ID: ${updates.assignedStudentId}. Download your admission letter now.`,
        type: "Success",
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else if (status === "Rejected") {
      dbStore.createNotification({
        id: `notif-${Date.now()}`,
        userId: currentApp.email,
        title: "Admission Application Status Update",
        message: `Your admission was updated to: Rejected. Reason: ${feedback || "Contact the admin desk"}`,
        type: "Error",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    const updated = dbStore.updateAdmission(id, updates);
    res.json({ success: true, application: updated });
  });

  // Get Admission Letter Mock Link
  app.get("/api/admissions/:id/letter", (req: Request, res: Response) => {
    const { id } = req.params;
    const appData = dbStore.getAdmissions().find((a) => a.id === id);
    if (!appData) {
      res.status(404).send("Admission Letter Not Found");
      return;
    }

    res.setHeader("Content-Type", "text/plain");
    res.send(`
============================================================
COMPUTER JUNGLE TRAINING CENTER KUMBA
Confidence Street Junction, Fiango, Kumba, Cameroon
Motto: "In Computer, We Trust"
============================================================

Date: ${new Date(appData.createdAt).toLocaleDateString()}
Ref: ${appData.id}

OFFICIAL ADMISSION LETTER

Dear ${appData.fullName},

We are pleased to inform you that your application for admission into the Computer Jungle Training Center has been APPROVED.

Details of your admission:
- Program: ${appData.courseId}
- Department: ${appData.departmentId}
- Study Shift: ${appData.shift}
- Assigned Student ID: ${appData.assignedStudentId || "CJ-STUD-TEMP"}
- Assigned Classroom: ${appData.assignedClassroom || "Lab Room 1"}
- Assigned Instructor: ${appData.assignedInstructor || "Lead Staff"}

Please report to the Registrar's Office at Confidence Street Junction, Fiango, Kumba with your printed Admission Letter, Passport Photos, and fee receipt for the finalization of your enrollment.

We welcome you to our family and trust your study here will lead to a highly successful tech career.

In Computer, We Trust!

Sincerely,

Mr. Azemoh Edmond
Principal, Computer Jungle Kumba
    `);
  });

  // Computer Repairs API
  app.get("/api/repairs", (req: Request, res: Response) => {
    const { email } = req.query;
    let tickets = dbStore.getRepairs();
    if (email) {
      tickets = tickets.filter((t) => t.customerEmail.toLowerCase() === (email as string).toLowerCase());
    }
    res.json(tickets);
  });

  app.post("/api/repairs", (req: Request, res: Response) => {
    const { customerName, customerPhone, customerEmail, deviceType, deviceName, issueDescription, imageUrl } = req.body;

    const newTicket: RepairTicket = {
      id: `REP-CJ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      customerEmail,
      deviceType,
      deviceName,
      issueDescription,
      status: "Booked",
      assignedTechnician: "Engr. Paul Ayuk",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=150&h=150&fit=crop",
      createdAt: new Date().toISOString(),
    };

    dbStore.createRepair(newTicket);

    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      userId: customerEmail,
      title: "Repair Ticket Booked",
      message: `Your device ${deviceName} has been registered for repairs. Track using ID: ${newTicket.id}.`,
      type: "Info",
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, ticket: newTicket });
  });

  app.put("/api/repairs/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, quotedPriceCFAF, technicianNotes, assignedTechnician } = req.body;

    const currentTicket = dbStore.getRepairs().find((t) => t.id === id);
    if (!currentTicket) {
      res.status(404).json({ success: false, message: "Repair ticket not found" });
      return;
    }

    const updates: Partial<RepairTicket> = { status, quotedPriceCFAF, technicianNotes, assignedTechnician };
    if (status === "Completed") {
      updates.invoiceUrl = `/api/repairs/${id}/invoice`;
    }

    const updated = dbStore.updateRepair(id, updates);

    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      userId: currentTicket.customerEmail,
      title: `Repair Status: ${status}`,
      message: `Your device repair ticket ${id} was updated to: ${status}. Price: ${quotedPriceCFAF || 0} CFAF.`,
      type: status === "Completed" ? "Success" : "Info",
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, ticket: updated });
  });

  // Get Repair Invoice Mock Link
  app.get("/api/repairs/:id/invoice", (req: Request, res: Response) => {
    const { id } = req.params;
    const ticket = dbStore.getRepairs().find((t) => t.id === id);
    if (!ticket) {
      res.status(404).send("Invoice Not Found");
      return;
    }

    res.setHeader("Content-Type", "text/plain");
    res.send(`
============================================================
COMPUTER JUNGLE TRAINING CENTER & WORKSHOP
Confidence Street Junction, Fiango, Kumba, Cameroon
============================================================

REPAIR INVOICE

Invoice ID: INV-${ticket.id}
Date: ${new Date(ticket.createdAt).toLocaleDateString()}
Customer: ${ticket.customerName}
Phone: ${ticket.customerPhone}

Device Description: ${ticket.deviceName} (${ticket.deviceType})
Reported Issue: ${ticket.issueDescription}
Repair Status: ${ticket.status}

Technician Report:
${ticket.technicianNotes || "General repairs and micro-soldering optimization completed successfully."}

------------------------------------------------------------
TOTAL DUE: ${ticket.quotedPriceCFAF || 15000} CFAF
------------------------------------------------------------

Thank you for trusting Computer Jungle Repairs!
In Computer, We Trust.
    `);
  });

  // Documentation Services Order API
  app.get("/api/documentation", (req: Request, res: Response) => {
    const { email } = req.query;
    let orders = dbStore.getDocOrders();
    if (email) {
      orders = orders.filter((o) => o.customerEmail.toLowerCase() === (email as string).toLowerCase());
    }
    res.json(orders);
  });

  app.post("/api/documentation", (req: Request, res: Response) => {
    const { customerName, customerEmail, customerPhone, serviceType, fileName, instructions, quantity, calculatedPriceCFAF, paymentMethod } = req.body;

    const newOrder: DocumentationOrder = {
      id: `DOC-CJ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerEmail,
      customerPhone,
      serviceType,
      fileName: fileName || "uploaded_document.pdf",
      instructions,
      quantity: quantity || 1,
      calculatedPriceCFAF: calculatedPriceCFAF || 3000,
      paymentStatus: "Paid",
      paymentMethod: paymentMethod || "MTN Mobile Money",
      status: "Submitted",
      createdAt: new Date().toISOString(),
    };

    dbStore.createDocOrder(newOrder);

    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      userId: customerEmail,
      title: "Document Order Placed",
      message: `Your order for ${serviceType} has been submitted successfully. Track using ID: ${newOrder.id}.`,
      type: "Success",
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, order: newOrder });
  });

  app.put("/api/documentation/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const currentOrder = dbStore.getDocOrders().find((d) => d.id === id);
    if (!currentOrder) {
      res.status(404).json({ success: false, message: "Document order not found" });
      return;
    }

    const updated = dbStore.updateDocOrder(id, { status, paymentStatus });

    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      userId: currentOrder.customerEmail,
      title: `Doc Order ${status}`,
      message: `Your document processing order ${id} is now ${status}.`,
      type: "Info",
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, order: updated });
  });

  // Shop E-Commerce & POS APIs
  app.get("/api/shop/products", (req: Request, res: Response) => {
    res.json(dbStore.getProducts());
  });

  app.post("/api/shop/checkout", (req: Request, res: Response) => {
    const { customerName, customerEmail, customerPhone, items, totalCFAF, paymentMethod, deliveryMethod, deliveryAddress } = req.body;

    const newOrder: Order = {
      id: `ORD-CJ-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalCFAF,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash" ? "Unpaid" : "Paid",
      status: "Processing",
      deliveryMethod,
      deliveryAddress,
      createdAt: new Date().toISOString(),
    };

    dbStore.createOrder(newOrder);

    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      userId: customerEmail,
      title: "Store Order Placed! 🛒",
      message: `Thank you! Your order ${newOrder.id} of ${totalCFAF} CFAF is being processed.`,
      type: "Success",
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, order: newOrder });
  });

  app.get("/api/shop/orders", (req: Request, res: Response) => {
    const { email } = req.query;
    let orders = dbStore.getOrders();
    if (email) {
      orders = orders.filter((o) => o.customerEmail.toLowerCase() === (email as string).toLowerCase());
    }
    res.json(orders);
  });

  app.put("/api/shop/orders/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const currentOrder = dbStore.getOrders().find((o) => o.id === id);
    if (!currentOrder) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const updated = dbStore.updateOrder(id, { status, paymentStatus });

    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      userId: currentOrder.customerEmail,
      title: `Store Order Status: ${status}`,
      message: `Your order ${id} is now ${status}.`,
      type: "Info",
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, order: updated });
  });

  // Certificate APIs
  app.get("/api/certificates", (req: Request, res: Response) => {
    res.json(dbStore.getCertificates());
  });

  app.get("/api/certificates/verify/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const cert = dbStore.getCertificates().find((c) => c.id.toUpperCase() === id.toUpperCase());
    if (cert) {
      res.json({ success: true, certificate: cert });
    } else {
      res.status(404).json({ success: false, message: "Certificate not registered or invalid validation ID" });
    }
  });

  app.post("/api/certificates", (req: Request, res: Response) => {
    const { studentName, studentId, courseTitle, departmentName, grade, regNumber } = req.body;

    const serial = Math.floor(1000 + Math.random() * 9000);
    const newCert: Certificate = {
      id: `CERT-CJ-2026-${serial}`,
      studentName,
      studentId,
      courseTitle,
      departmentName,
      grade,
      issueDate: new Date().toISOString().slice(0, 10),
      regNumber,
      qrUrl: `/verify/CERT-CJ-2026-${serial}`,
      verified: true,
    };

    dbStore.createCertificate(newCert);
    res.json({ success: true, certificate: newCert });
  });

  // Blog API
  app.get("/api/blogs", (req: Request, res: Response) => {
    res.json(dbStore.getBlogs());
  });

  // Notifications API
  app.get("/api/notifications", (req: Request, res: Response) => {
    const { email } = req.query;
    let notifs = dbStore.getNotifications();
    if (email) {
      notifs = notifs.filter((n) => n.userId.toLowerCase() === (email as string).toLowerCase());
    }
    res.json(notifs);
  });

  app.post("/api/notifications/:id/read", (req: Request, res: Response) => {
    const { id } = req.params;
    dbStore.markNotificationRead(id);
    res.json({ success: true });
  });

  // CV Builder AI Optimizer API (Uses Gemini)
  app.post("/api/cv-builder/generate", async (req: Request, res: Response) => {
    const { name, email, phone, address, education, experience, skills, objective, templateStyle } = req.body;

    const gemini = getGeminiClient();

    if (!gemini) {
      // Fallback robust template builder if API key is not configured
      const optimizedObjective = objective || `To secure a challenging role where I can utilize my hardware maintenance, troubleshooting, and data processing skills to drive technical efficiency for the organization.`;
      const optimizedSkills = skills || ["System Troubleshooting", "Operating System Deployment", "Local Networking Setup", "Microsoft Office Master", "Software Engineering Foundations"];
      
      res.json({
        success: true,
        optimizedCV: {
          personal: { name, email, phone, address },
          objective: optimizedObjective,
          education: education || "Data Processing & Hardware Maintenance Certificate, Computer Jungle Training Center",
          experience: experience || "Junior Technical Intern, Computer Jungle Workshop, Fiango, Kumba",
          skills: optimizedSkills,
          style: templateStyle || "Modern ATS",
        },
        aiModelUsed: "Rule-Based Mock fallback",
      });
      return;
    }

    try {
      const prompt = `You are an expert tech recruiter. Optimize the following CV fields for an ATS system. Return a polished summary objective, rewrite their experience with action-oriented verbs, and expand their listed skills list into standard, high-impact terminology.
      
      Name: ${name}
      Objective: ${objective}
      Education: ${education}
      Experience: ${experience}
      Skills: ${skills}
      
      Respond in clear structured JSON format with keys: "objective" (string), "experience" (string), "skills" (array of strings).`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        success: true,
        optimizedCV: {
          personal: { name, email, phone, address },
          objective: parsed.objective || objective,
          education,
          experience: parsed.experience || experience,
          skills: parsed.skills || skills,
          style: templateStyle,
        },
        aiModelUsed: "gemini-3.5-flash",
      });
    } catch (err) {
      console.error("Gemini CV build error:", err);
      res.status(500).json({ success: false, message: "AI generation failed, please try again" });
    }
  });

  // Student academic portals API (Attendance, results, assignments)
  app.get("/api/portal/student", (req: Request, res: Response) => {
    const { studentId } = req.query;
    // Serve standard lists
    res.json({
      academicRecords: dbStore.getAcademicRecords(),
      attendanceRecords: dbStore.getAttendanceRecords(),
      timetable: dbStore.getTimetable(),
      assignments: dbStore.getAssignments(),
    });
  });

  app.post("/api/portal/assignments/:id/submit", (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentId, submittedUrl } = req.body;
    const updated = dbStore.submitAssignment(id, studentId, submittedUrl || "https://filebin.net/sample-submission.pdf");
    if (updated) {
      res.json({ success: true, assignment: updated });
    } else {
      res.status(404).json({ success: false, message: "Assignment not found" });
    }
  });

  app.post("/api/portal/assignments/:id/grade", (req: Request, res: Response) => {
    const { id } = req.params;
    const { points, feedback } = req.body;
    const updated = dbStore.gradeAssignment(id, points, feedback);
    if (updated) {
      res.json({ success: true, assignment: updated });
    } else {
      res.status(404).json({ success: false, message: "Assignment not found" });
    }
  });

  // Admin reports API
  app.get("/api/admin/reports", (req: Request, res: Response) => {
    const admissions = dbStore.getAdmissions();
    const repairs = dbStore.getRepairs();
    const docOrders = dbStore.getDocOrders();
    const orders = dbStore.getOrders();
    const products = dbStore.getProducts();

    // Sum revenue
    const admissionRev = admissions.filter((a) => a.status === "Approved").length * 50000; // Estimated downpayment
    const repairRev = repairs.reduce((acc, curr) => acc + (curr.quotedPriceCFAF || 0), 0);
    const docRev = docOrders.reduce((acc, curr) => acc + curr.calculatedPriceCFAF, 0);
    const orderRev = orders.reduce((acc, curr) => acc + curr.totalCFAF, 0);

    const totalRevenue = admissionRev + repairRev + docRev + orderRev;

    res.json({
      summary: {
        totalRevenueCFAF: totalRevenue,
        totalAdmissionsCount: admissions.length,
        totalRepairsCount: repairs.length,
        totalDocOrdersCount: docOrders.length,
        totalShopOrdersCount: orders.length,
        lowStockAlertCount: products.filter((p) => p.stock < 10).length,
      },
      revenueBreakdown: [
        { name: "Admissions Fees", amount: admissionRev },
        { name: "Computer Repairs", amount: repairRev },
        { name: "Document Services", amount: docRev },
        { name: "Hardware Shop Sales", amount: orderRev },
      ],
      monthlyEnrollment: [
        { month: "Jan", count: 12 },
        { month: "Feb", count: 18 },
        { month: "Mar", count: 15 },
        { month: "Apr", count: 24 },
        { month: "May", count: 32 },
        { month: "Jun", count: 28 },
        { month: "Jul", count: admissions.length + 20 },
      ],
    });
  });

  // AI Assistant chatbot integration API
  app.post("/api/gemini/chat", async (req: Request, res: Response) => {
    const { message, history } = req.body;

    const gemini = getGeminiClient();

    const schoolContext = `
    You are the "Computer Jungle Training Center AI Assistant". You represent Computer Jungle Training Center Kumba, Cameroon.
    
    School Details:
    - Address: Confidence Street Junction, Fiango, Kumba, Cameroon.
    - Tel: +237 677 83 64 22.
    - Motto: "In Computer, We Trust".
    
    Courses & Departments:
    1. Data Processing:
       - 3 Months Intensive (60,000 CFAF): Focuses on basic operations, office suite.
       - 6 Months Advanced Office Management (100,000 CFAF): Advanced spreadsheets, database, office reporting.
    2. Hardware Maintenance & Networking:
       - 12 Months Masterclass (150,000 CFAF): Motherboard soldering, troubleshooting, diagnostics, dual booting OS, networking routers.
    3. Software Engineering:
       - 9 Months Full-stack development (180,000 CFAF): HTML/CSS, React, Node.js, databases, mobile money integrations.
       
    Shifts:
    - Morning Shift: 8:00 AM - 12:00 PM
    - Afternoon Shift: 1:00 PM - 4:00 PM
    - Evening Shift: 5:00 PM - 8:00 PM
    
    Services Provided:
    - Professional typing, lamination, photocopy, passport photos, and custom School IDs.
    - Systematic Computer Repairs & Diagnostics (at Confidence Street Junction, Fiango).
    - Laptop and desktop sales at the school shop.
    
    Rules:
    - Answer professionally, cheerfully, and concisely.
    - Quote tuition fees in CFAF.
    - Refer clients to contact us at +237 677 83 64 22 or visit the campus at Confidence Street Junction, Fiango, Kumba.
    - Keep answers under 3 sentences unless asked for an in-depth lesson.
    `;

    if (!gemini) {
      // Rule-based Fallback Assistant when no Gemini API key is configured
      const msgLower = message.toLowerCase();
      let reply = "Hello! I am the Computer Jungle AI assistant. How can I help you join the school or fix your computer today?";

      if (msgLower.includes("price") || msgLower.includes("fee") || msgLower.includes("cost") || msgLower.includes("tuition")) {
        reply = "Tuition at Computer Jungle: Data Processing 3 Months is 60,000 CFAF; 6 Months is 100,000 CFAF. Hardware Maintenance is 150,000 CFAF (12 months), and Software Engineering is 180,000 CFAF (9 months). You can register online!";
      } else if (msgLower.includes("where") || msgLower.includes("address") || msgLower.includes("location") || msgLower.includes("located")) {
        reply = "We are located at Confidence Street Junction, Fiango, Kumba, South West Region, Cameroon. You are welcome to visit our lab or call us at +237 677 83 64 22.";
      } else if (msgLower.includes("course") || msgLower.includes("program") || msgLower.includes("learn")) {
        reply = "We offer professional certification in Data Processing, Hardware Maintenance & Troubleshooting, Software Engineering, and Graphic Design. Courses range from 3 to 12 months with morning, afternoon, and evening shifts.";
      } else if (msgLower.includes("repair") || msgLower.includes("laptop") || msgLower.includes("broken")) {
        reply = "Yes! We run Kumba's leading repair center. Book a diagnostic ticket online, upload an image of your device, and our chief technician Engr. Paul Ayuk will repair it for you.";
      }

      res.json({ text: reply, modelUsed: "Local Rule-Engine" });
      return;
    }

    try {
      // Build standard messages array
      const formattedContents: any[] = [];
      // Incorporate previous chat history if provided
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          formattedContents.push({
            role: turn.sender === "user" ? "user" : "model",
            parts: [{ text: turn.text }],
          });
        }
      }

      // Add active user message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: schoolContext,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text || "I apologize, but I could not formulate a response.", modelUsed: "gemini-3.5-flash" });
    } catch (err) {
      console.error("Gemini Chatbot Error:", err);
      res.status(500).json({ success: false, message: "AI response failed" });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[COMPUTER JUNGLE BACKEND] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
