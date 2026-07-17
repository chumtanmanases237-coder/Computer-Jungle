/**
 * db-postgres.ts
 *
 * PostgreSQL database connector using the "pg" library.
 * Designed to connect to your Neon Serverless Database.
 * This class mirrors the DatabaseStore interface to allow a smooth transition.
 *
 * To use this file on your hosting system (Render + Neon):
 * 1. Install the required libraries in your Render environment or local terminal:
 *    npm install pg
 *    npm install -D @types/pg
 *
 * 2. Set the DATABASE_URL environment variable in your Neon and Render panels.
 *    Format: postgresql://username:password@your-neon-host.neon.tech/neondb?sslmode=require
 */

import pg from "pg";
const { Pool } = pg;

// Load DATABASE_URL from environment variables (e.g., in Render / Neon)
const connectionString = process.env.DATABASE_URL;

export const pgPool = new Pool({
  connectionString,
  ssl: connectionString?.includes("neon.tech") || process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

export class PostgresDatabaseStore {
  // Example implementation mapping PostgreSQL snake_case columns back to Frontend camelCase objects

  // 1. Fetch all admissions applications
  async getAdmissions() {
    const query = `
      SELECT 
        id, 
        full_name AS "fullName", 
        email, 
        phone, 
        birth_date AS "birthDate", 
        national_id AS "nationalID", 
        department_id AS "departmentId", 
        course_id AS "courseId", 
        shift, 
        payment_method AS "paymentMethod", 
        payment_reference AS "paymentReference", 
        passport_url AS "passportUrl", 
        birth_certificate_url AS "birthCertificateUrl", 
        screenshot_url AS "screenshotUrl", 
        status, 
        assigned_student_id AS "assignedStudentId", 
        assigned_reg_number AS "assignedRegNumber", 
        assigned_classroom AS "assignedClassroom", 
        assigned_instructor AS "assignedInstructor", 
        admission_letter_url AS "admissionLetterUrl", 
        feedback, 
        created_at AS "createdAt"
      FROM admissions
      ORDER BY created_at DESC
    `;
    const res = await pgPool.query(query);
    return res.rows;
  }

  // 2. Create a new admission application
  async createAdmission(app: any) {
    const query = `
      INSERT INTO admissions (
        id, full_name, email, phone, birth_date, national_id, department_id, 
        course_id, shift, payment_method, payment_reference, passport_url, 
        birth_certificate_url, screenshot_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      app.id, app.fullName, app.email, app.phone, app.birthDate, app.nationalID, app.departmentId,
      app.courseId, app.shift, app.paymentMethod, app.paymentReference, app.passportUrl,
      app.birthCertificateUrl, app.screenshotUrl, app.status || "Pending"
    ];
    const res = await pgPool.query(query, values);
    return res.rows[0];
  }

  // 3. Approve or Update an admission application
  async updateAdmission(id: string, updates: any) {
    const query = `
      UPDATE admissions SET
        status = COALESCE($1, status),
        assigned_student_id = COALESCE($2, assigned_student_id),
        assigned_reg_number = COALESCE($3, assigned_reg_number),
        assigned_classroom = COALESCE($4, assigned_classroom),
        assigned_instructor = COALESCE($5, assigned_instructor),
        admission_letter_url = COALESCE($6, admission_letter_url),
        feedback = COALESCE($7, feedback)
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      updates.status,
      updates.assignedStudentId,
      updates.assignedRegNumber,
      updates.assignedClassroom,
      updates.assignedInstructor,
      updates.admissionLetterUrl,
      updates.feedback,
      id
    ];
    const res = await pgPool.query(query, values);
    return res.rows[0];
  }

  // 4. Fetch all users
  async getUsers() {
    const res = await pgPool.query('SELECT id, name, email, phone, role, password, created_at AS "createdAt" FROM users');
    return res.rows;
  }

  // 5. Create a user
  async createUser(user: any) {
    const query = 'INSERT INTO users (id, name, email, phone, role, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [user.id, user.name, user.email, user.phone, user.role, user.password];
    const res = await pgPool.query(query, values);
    return res.rows[0];
  }

  // 6. Fetch courses
  async getCourses() {
    const query = `
      SELECT 
        id, 
        department_id AS "departmentId", 
        title, 
        description, 
        duration_months AS "durationMonths", 
        subjects, 
        materials_required AS "materialsRequired", 
        fees_cfaf AS "feesCFAF", 
        schedule, 
        instructor, 
        career_opportunities AS "careerOpportunities"
      FROM courses
    `;
    const res = await pgPool.query(query);
    return res.rows;
  }
}

export const dbPostgres = new PostgresDatabaseStore();
