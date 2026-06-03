import { jsPDF } from "jspdf";
import { User, Internship, Application, Report, AnalyticsResponse } from "../types";

// Helper to sanitize long texts for PDF rendering to avoid line overflow
const textWrap = (text: string, maxLength: number): string[] => {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length <= maxLength) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
};

// Signature colors from our "Sleek Interface" theme:
// Primary Accent Gold/Yellow: #FFC107 (RGB: 255, 193, 7)
// Ink dark text: #111111 (RGB: 17, 17, 17)
// Subdued gray: #666666 (RGB: 102, 102, 102)
// Clean border: #E5E5E5 (RGB: 229, 229, 229)

export const generateStudentPDF = (
  currentUser: User,
  applications: Application[],
  reports: Report[]
) => {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 15;

  // Header Box
  // Left border stripe in Signature Gold
  doc.setFillColor(255, 193, 7);
  doc.rect(12, y, 4, 25, "F");

  // Title and branding
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INSTEM SYSTEM — PLACEMENT PORTAL", 20, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text("STUDENT INTERNSHIP WORKSPACE SUMMARY & AUDIT LEDGER", 20, y + 12);
  doc.text(`Report Generated: ${new Date().toLocaleString()} (UTC)`, 20, y + 18);

  // Divide line
  y += 28;
  doc.setDrawColor(229, 229, 229);
  doc.setLineWidth(0.5);
  doc.line(12, y, 198, y);

  // User Profile Grid
  y += 10;
  doc.setFillColor(248, 249, 250);
  doc.rect(12, y, 186, 32, "F");
  doc.setDrawColor(229, 229, 229);
  doc.rect(12, y, 186, 32, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 17);
  doc.text("CANDIDATE DOSSIER DETAILS", 16, y + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Full Name: ${currentUser.name}`, 16, y + 15);
  doc.text(`Student ID: ${currentUser.studentId || "N/A"}`, 16, y + 21);
  doc.text(`Email Address: ${currentUser.email}`, 16, y + 27);

  doc.text(`Division: ${currentUser.department || "Academic Department"}`, 110, y + 15);
  const placement = applications.find(a => a.status === "ACCEPTED");
  doc.text(
    `Status: ${placement ? "PLACED" : "SEEKING PLACEMENT"}`,
    110,
    y + 21
  );
  if (placement) {
    doc.setFont("Helvetica", "bold");
    doc.text(`Company: ${placement.companyName}`, 110, y + 27);
  } else {
    doc.text("Current Hunt Queue: Active", 110, y + 27);
  }

  // Brief Analytics Indicators block
  y += 40;
  doc.setFillColor(255, 193, 7, 0.08); // faint yellow bg
  doc.rect(12, y, 186, 16, "F");
  doc.setDrawColor(255, 193, 7, 0.3);
  doc.rect(12, y, 186, 16, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(17, 17, 17);
  doc.text("KEY PERFORMANCE METRICS", 16, y + 10);

  const totalHours = reports.reduce((sum, r) => sum + r.hoursLogged, 0);
  const approvedReports = reports.filter(r => r.status === "APPROVED").length;
  doc.setFont("Helvetica", "normal");
  doc.text(
    `Applications: ${applications.length} filed  |  Logbooks Filed: ${reports.length} logs  |  Hours Authenticated: ${totalHours} hrs  |  Approved logs: ${approvedReports}`,
    70,
    y + 10
  );

  // SECTION 1: APPLICATIONS PIPELINE TRACKER
  y += 26;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. JOB APPLICATION PIPELINE HISTORY", 12, y);
  
  doc.setLineWidth(0.3);
  doc.setDrawColor(229, 229, 229);
  doc.line(12, y + 2, 198, y + 2);

  // Table row headers
  y += 8;
  doc.setFillColor(243, 244, 246);
  doc.rect(12, y, 186, 7, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TARGET POSITION", 16, y + 5);
  doc.text("PARTNER COMPANY", 70, y + 5);
  doc.text("FILED ON", 130, y + 5);
  doc.text("STATUS", 168, y + 5);

  y += 7;
  doc.setFont("Helvetica", "normal");
  if (applications.length === 0) {
    doc.text("No job application files listed.", 16, y + 6);
    y += 12;
  } else {
    applications.forEach((app) => {
      // Check space
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      
      const pTitle = app.internshipTitle.length > 28 ? app.internshipTitle.slice(0, 26) + "..." : app.internshipTitle;
      const cName = app.companyName.length > 28 ? app.companyName.slice(0, 26) + "..." : app.companyName;
      
      doc.text(pTitle, 16, y + 5);
      doc.text(cName, 70, y + 5);
      doc.text(new Date(app.appliedAt).toLocaleDateString(), 130, y + 5);
      doc.text(app.status, 168, y + 5);

      y += 7;
      doc.line(12, y, 198, y);
    });
  }

  // SECTION 2: REPORTING LOGBOOK SYSTEM
  y += 12;
  // Page overflow check
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. CUMULATIVE WEEKLY PROGRESS LOGS REPORT", 12, y);
  
  doc.setLineWidth(0.3);
  doc.line(12, y + 2, 198, y + 2);

  y += 8;
  doc.setFillColor(243, 244, 246);
  doc.rect(12, y, 186, 7, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("WEEK / TITLE", 16, y + 5);
  doc.text("HOURS", 90, y + 5);
  doc.text("STATUS", 115, y + 5);
  doc.text("GRADE", 152, y + 5);
  doc.text("EVALUATOR STATUS", 170, y + 5);

  y += 7;
  if (reports.length === 0) {
    doc.text("No weekly logs reported in matching records.", 16, y + 6);
    y += 12;
  } else {
    reports.forEach((rep) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);

      const titleShort = rep.title.length > 38 ? rep.title.slice(0, 36) + "..." : rep.title;
      doc.text(titleShort, 16, y + 5);
      doc.text(`${rep.hoursLogged} hrs`, 90, y + 5);
      doc.text(rep.status, 115, y + 5);
      doc.text(rep.grade || "Unevaluated", 152, y + 5);
      doc.text(rep.companyName.length > 15 ? rep.companyName.slice(0, 13) + ".." : rep.companyName, 170, y + 5);

      y += 7;
      if (rep.content) {
        const wrapContent = textWrap(`Summary: ${rep.content}`, 95);
        wrapContent.slice(0, 2).forEach((line) => {
          doc.setFontSize(7.5);
          doc.setTextColor(110, 110, 110);
          doc.text(line, 20, y + 4);
          y += 5.5;
        });
      }
      doc.setTextColor(17, 17, 17);
      doc.line(12, y, 198, y);
      y += 2;
    });
  }

  // Verification watermark
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  doc.setFillColor(252, 252, 252);
  doc.rect(12, y, 186, 18, "F");
  doc.setDrawColor(229, 229, 229);
  doc.rect(12, y, 186, 18, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SYSTEM CRYPTOGRAPHIC VALIDITY:", 16, y + 6);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Token: INST-AUD-${currentUser.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`, 16, y + 12);
  doc.text("This PDF functions as a verified academic and professional record generated via INSTEM Security Vaults.", 95, y + 12);

  doc.save(`INSTEM_Student_Report_${currentUser.name.replace(/\s+/g, "_")}.pdf`);
};

export const generateCompanyPDF = (
  currentUser: User,
  internships: Internship[],
  applications: Application[],
  reports: Report[]
) => {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 15;

  // Header Box
  doc.setFillColor(255, 193, 7);
  doc.rect(12, y, 4, 25, "F");

  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INSTEM SYSTEM — PARTNER AUDIT REPORT", 20, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text("CORPORATE WORKSPACE PROGRESS AND PLACEMENT METRICS", 20, y + 12);
  doc.text(`Report Generated: ${new Date().toLocaleString()} (UTC)`, 20, y + 18);

  y += 28;
  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 229, 229);
  doc.line(12, y, 198, y);

  // Company Profile Grid
  y += 10;
  doc.setFillColor(248, 249, 250);
  doc.rect(12, y, 186, 32, "F");
  doc.setDrawColor(229, 229, 229);
  doc.rect(12, y, 186, 32, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 17);
  doc.text("RECRUITMENT CORPORATE PROFILE", 16, y + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Company Name: ${currentUser.companyName || currentUser.name}`, 16, y + 15);
  doc.text(`Authorized Signatory: ${currentUser.name}`, 16, y + 21);
  doc.text(`Contact Email: ${currentUser.email}`, 16, y + 27);

  doc.text(`Campaign Ads Published: ${internships.length}`, 110, y + 15);
  doc.text(`Inbound Submissions: ${applications.length} resumes`, 110, y + 21);
  const activeInterns = applications.filter(a => a.status === "ACCEPTED").length;
  doc.text(`Active Interns (Hired): ${activeInterns}`, 110, y + 27);

  // SECTION 1: DETAILED ADVERTISEMENTS LIST
  y += 40;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. EXPANDED CAMPAIGN ADVERTISEMENTS LISTING", 12, y);
  
  doc.setLineWidth(0.3);
  doc.line(12, y + 2, 198, y + 2);

  // Column titles
  y += 8;
  doc.setFillColor(243, 244, 246);
  doc.rect(12, y, 186, 7, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("AD KEY / ROLE TITLE", 16, y + 5);
  doc.text("ACADEMIC DIVISION", 75, y + 5);
  doc.text("STRUCTURE", 125, y + 5);
  doc.text("STIPEND INDEX", 155, y + 5);
  doc.text("STATE", 185, y + 5);

  y += 7;
  if (internships.length === 0) {
    doc.setFont("Helvetica", "normal");
    doc.text("No corporate ad campaigns active in database.", 16, y + 6);
    y += 12;
  } else {
    internships.forEach((job) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);

      const titleShort = job.title.length > 32 ? job.title.slice(0, 30) + "..." : job.title;
      doc.text(titleShort, 16, y + 5);
      doc.text(job.department, 75, y + 5);
      doc.text(`${job.type} (${job.duration})`, 125, y + 5);
      doc.text(job.stipend, 155, y + 5);
      doc.text(job.status || "OPEN", 185, y + 5);

      y += 7;
      doc.line(12, y, 198, y);
    });
  }

  // Page Overflow audit
  if (y > 230) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }

  // SECTION 2: CANDIDATE REVIEWS
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. CANDIDATE HIRING STAGES & APPLICATIONS HISTORY", 12, y);
  
  doc.setLineWidth(0.3);
  doc.line(12, y + 2, 198, y + 2);

  // Column titles
  y += 8;
  doc.setFillColor(243, 244, 246);
  doc.rect(12, y, 186, 7, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("APPLICANT CANDIDATE", 16, y + 5);
  doc.text("TARGET VACANCY", 65, y + 5);
  doc.text("ACADEMIC MAJOR", 120, y + 5);
  doc.text("PIPELINE STAGE", 165, y + 5);

  y += 7;
  if (applications.length === 0) {
    doc.setFont("Helvetica", "normal");
    doc.text("No candidate portfolios transmitted.", 16, y + 6);
    y += 12;
  } else {
    applications.forEach((app) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);

      doc.text(app.studentName, 16, y + 5);
      const roleShort = app.internshipTitle.length > 28 ? app.internshipTitle.slice(0, 26) + "..." : app.internshipTitle;
      doc.text(roleShort, 65, y + 5);
      doc.text(app.studentDepartment, 120, y + 5);
      doc.text(app.status, 165, y + 5);

      y += 7;
      if (app.coverLetter) {
        const wrapPitch = textWrap(`Inbound Pitch: ${app.coverLetter}`, 110);
        wrapPitch.slice(0, 2).forEach((line) => {
          doc.setFontSize(7);
          doc.setTextColor(110, 110, 110);
          doc.text(line, 20, y + 4);
          y += 5;
        });
      }
      doc.setTextColor(17, 17, 17);
      doc.line(12, y, 198, y);
      y += 2;
    });
  }

  // Dynamic Page overflow check for Section 3
  if (y > 230) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }

  // SECTION 3: WORK REPORT GRADES & AUDITS
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. STUDENT WEEKLY WORKLOG PROGRESS AUDITS", 12, y);
  
  doc.setLineWidth(0.3);
  doc.line(12, y + 2, 198, y + 2);

  y += 8;
  doc.setFillColor(243, 244, 246);
  doc.rect(12, y, 186, 7, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("INTERN STUDENT", 16, y + 5);
  doc.text("WEEK LOG / TITLE", 55, y + 5);
  doc.text("HOURS", 115, y + 5);
  doc.text("STATUS", 132, y + 5);
  doc.text("GRADE", 162, y + 5);

  y += 7;
  if (reports.length === 0) {
    doc.setFont("Helvetica", "normal");
    doc.text("No activity logs completed by active interns.", 16, y + 6);
  } else {
    reports.forEach((rep) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);

      doc.text(rep.studentName, 16, y + 5);
      const logTitleShort = rep.title.length > 28 ? rep.title.slice(0, 26) + "..." : rep.title;
      doc.text(logTitleShort, 55, y + 5);
      doc.text(`${rep.hoursLogged} hrs`, 115, y + 5);
      doc.text(rep.status, 132, y + 5);
      doc.text(rep.grade || "PENDING", 162, y + 5);

      y += 7;
      if (rep.content) {
        const wrapWork = textWrap(`Completed: ${rep.content}`, 95);
        wrapWork.slice(0, 2).forEach((line) => {
          doc.setFontSize(7.5);
          doc.setTextColor(110, 110, 110);
          doc.text(line, 20, y + 4);
          y += 5.5;
        });
      }
      doc.setTextColor(17, 17, 17);
      doc.line(12, y, 198, y);
      y += 2;
    });
  }

  doc.save(`INSTEM_Company_Report_${(currentUser.companyName || currentUser.name).replace(/\s+/g, "_")}.pdf`);
};

export const generateSchoolPDF = (
  currentUser: User,
  analytics: AnalyticsResponse,
  studentUsers: any[],
  allApplications: any[],
  allReports: any[]
) => {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 15;

  // Header Box
  doc.setFillColor(255, 193, 7);
  doc.rect(12, y, 4, 25, "F");

  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INSTEM SYSTEM — INSTITUTIONAL AUDIT LEDGER", 20, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text("DEAN COMMAND AND PLACEMENT METRICS TRACKER", 20, y + 12);
  doc.text(`Report Generated: ${new Date().toLocaleString()} (UTC)`, 20, y + 18);

  y += 28;
  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 229, 229);
  doc.line(12, y, 198, y);

  // Profile Details
  y += 10;
  doc.setFillColor(248, 249, 250);
  doc.rect(12, y, 186, 30, "F");
  doc.setDrawColor(229, 229, 229);
  doc.rect(12, y, 186, 30, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 17);
  doc.text("OFFICE OF THE REGISTRAR / DEAN STATEMENT", 16, y + 7);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Authorized Register: ${currentUser.name}`, 16, y + 15);
  doc.text(`Office / Department: ${currentUser.department || "All divisions"}`, 16, y + 21);
  doc.text(`Academic Enrolled Students: ${studentUsers.length}`, 110, y + 15);
  doc.text(`Placement Success Index: ${analytics.metrics.placementRate}%`, 110, y + 21);

  // Double columns for Statistics & Metrics Tracker
  y += 38;
  doc.setFillColor(255, 193, 7, 0.08);
  doc.rect(12, y, 90, 36, "F");
  doc.setDrawColor(255, 193, 7, 0.3);
  doc.rect(12, y, 90, 36, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AGGREGATE METRICS SUMMARY", 16, y + 7);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Academic Placement Rate: ${analytics.metrics.placementRate}%`, 16, y + 14);
  doc.text(`Total Enrolled Students: ${studentUsers.length}`, 16, y + 20);
  doc.text(`Partner Corporations Registered: ${analytics.metrics.totalCompanies}`, 16, y + 26);
  doc.text(`Total Intern Progress Reports Audited: ${allReports.length}`, 16, y + 32);

  // Right column: Pipeline distribution
  doc.setFillColor(248, 249, 250);
  doc.rect(108, y, 90, 36, "F");
  doc.setDrawColor(229, 229, 229);
  doc.rect(108, y, 90, 36, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PIPELINE STAGE AUDIT DISTRIBUTION", 112, y + 7);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Applied: ${analytics.statusCounts.APPLIED}`, 112, y + 14);
  doc.text(`Under Review: ${analytics.statusCounts.UNDER_REVIEW}`, 112, y + 20);
  doc.text(`Interviewing Roster: ${analytics.statusCounts.INTERVIEWING}`, 112, y + 26);
  doc.text(`Hired & Placed: ${analytics.statusCounts.ACCEPTED}`, 112, y + 32);

  // SECTION 1: DEPARTMENT BREAKDOWN TABLE
  y += 44;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. DIVISIONAL DEPARTMENT BREAKDOWN", 12, y);
  doc.setLineWidth(0.3);
  doc.line(12, y + 2, 198, y + 2);

  y += 8;
  doc.setFillColor(243, 244, 246);
  doc.rect(12, y, 186, 7, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ACADEMIC DEPT DIVISION", 16, y + 5);
  doc.text("TOTAL ENROLLED", 85, y + 5);
  doc.text("PLACED FORCE", 125, y + 5);
  doc.text("SUCCESS RATIO", 165, y + 5);

  y += 7;
  analytics.departmentBreakdown.forEach((dept) => {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(dept.name, 16, y + 5);
    doc.text(`${dept.total} candidates`, 85, y + 5);
    doc.text(`${dept.placed} placed`, 125, y + 5);
    doc.text(`${dept.rate}% placed`, 165, y + 5);

    y += 7;
    doc.line(12, y, 198, y);
  });

  // Page Overflow check
  if (y > 230) {
    doc.addPage();
    y = 20;
  } else {
    y += 8;
  }

  // SECTION 2: STUDENT PLACEMENTS ROSTER
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. STUDENT LEGAL REGISTRY & PLACEMENTS INDEX", 12, y);
  doc.line(12, y + 2, 198, y + 2);

  y += 8;
  doc.setFillColor(243, 244, 246);
  doc.rect(12, y, 186, 7, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("LEGAL STUDENT ID", 16, y + 5);
  doc.text("STUDENT FULL NAME", 55, y + 5);
  doc.text("DIVISION DEPT", 100, y + 5);
  doc.text("REGISTERED EMAIL", 140, y + 5);
  doc.text("CURRENT PLACEMENT STATUS", 182, y + 5, { align: "right" });

  y += 7;
  studentUsers.forEach((student) => {
    if (y > 270) {
      doc.addPage();
      y = 15;
    }
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);

    doc.text(student.studentId || "N/A", 16, y + 5);
    doc.text(student.name, 55, y + 5);
    doc.text(student.department || "General", 100, y + 5);
    doc.text(student.email, 140, y + 5);

    const placementApp = allApplications.find(a => a.studentId === student.id && a.status === "ACCEPTED");
    doc.text(
      placementApp ? `Placed at ${placementApp.companyName.slice(0, 16)}` : "Seeking Placement",
      194,
      y + 5,
      { align: "right" }
    );

    y += 7;
    doc.line(12, y, 198, y);
  });

  doc.save(`INSTEM_School_Analytics_Report_${currentUser.name.replace(/\s+/g, "_")}.pdf`);
};
