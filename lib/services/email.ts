import nodemailer from "nodemailer";
import type {
  SendEmailParams,
  AdminCredentialsEmailParams,
  WelcomeEmailParams,
  EmailResponse,
} from "@/lib/types/email";

// Create reusable transporter
const createTransporter = () => {
  // Validate required environment variables
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.error("Missing SMTP configuration in environment variables");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Generic email sending function
 */
export async function sendEmail(
  params: SendEmailParams,
): Promise<EmailResponse> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return {
        success: false,
        error: "Email service not configured properly",
      };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send admin credentials email to newly created school admin
 */
export async function sendAdminCredentialsEmail(
  params: AdminCredentialsEmailParams,
): Promise<EmailResponse> {
  const loginUrl =
    params.loginUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 32px;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #ea580c;
            margin-bottom: 8px;
          }
          .title {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
          }
          .content {
            margin-bottom: 24px;
          }
          .credentials-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
          }
          .credential-item {
            margin: 8px 0;
          }
          .credential-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 14px;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background-color: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #d1d5db;
            margin-top: 4px;
            display: block;
            color: #111827;
          }
          .button {
            display: inline-block;
            background-color: #ea580c;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 16px 0;
          }
          .button:hover {
            background-color: #c2410c;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 16px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 SchoolIQ</div>
            <h1 class="title">Welcome to SchoolIQ!</h1>
          </div>

          <div class="content">
            <p>Hello ${params.adminName},</p>
            
            <p>Your administrator account has been created for <strong>${params.schoolName}</strong>. You can now access the SchoolIQ platform to manage your school.</p>

            <div class="credentials-box">
              <div class="credential-item">
                <div class="credential-label">Login Email</div>
                <code class="credential-value">${params.adminEmail}</code>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Temporary Password</div>
                <code class="credential-value">${params.temporaryPassword}</code>
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong><br>
              Please change your password immediately after your first login. This temporary password should not be shared with anyone.
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}/auth/login" class="button">Login to SchoolIQ</a>
            </div>

            <p><strong>Getting Started:</strong></p>
            <ol>
              <li>Click the button above to access the login page</li>
              <li>Enter your email and temporary password</li>
              <li>Change your password when prompted</li>
              <li>Complete your profile setup</li>
            </ol>

            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>

          <div class="footer">
            <p>This is an automated message from SchoolIQ.<br>
            Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} SchoolIQ. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to SchoolIQ!

Hello ${params.adminName},

Your administrator account has been created for ${params.schoolName}.

Login Credentials:
------------------
Email: ${params.adminEmail}
Temporary Password: ${params.temporaryPassword}

IMPORTANT: Please change your password immediately after your first login.

Login URL: ${loginUrl}/auth/login

Getting Started:
1. Visit the login page
2. Enter your email and temporary password
3. Change your password when prompted
4. Complete your profile setup

If you need assistance, please contact our support team.

© ${new Date().getFullYear()} SchoolIQ. All rights reserved.
  `;

  return sendEmail({
    to: params.adminEmail,
    subject: `Welcome to SchoolIQ - Your Admin Account for ${params.schoolName}`,
    html: htmlContent,
    text: textContent,
  });
}

/**
 * Send welcome email to school admin after registration
 */
export async function sendWelcomeEmail(
  params: WelcomeEmailParams,
): Promise<EmailResponse> {
  const loginUrl =
    params.loginUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #f97316;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          }
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 16px 0;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
          }
          .content {
            margin-bottom: 32px;
            color: #374151;
          }
          .content p {
            margin: 16px 0;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 24px;
          }
          .school-name {
            color: #ea580c;
            font-weight: 600;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
            transition: all 0.3s ease;
          }
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          .features {
            background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
            border-left: 4px solid #f97316;
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .features-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
          }
          .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .feature-item {
            padding: 8px 0;
            color: #374151;
            display: flex;
            align-items: center;
          }
          .feature-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            color: white;
            font-size: 14px;
            flex-shrink: 0;
          }
          .steps {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .steps-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
          }
          .steps ol {
            margin: 0;
            padding-left: 24px;
          }
          .steps li {
            margin: 12px 0;
            color: #374151;
          }
          .support {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #1e40af;
          }
          .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
          }
          .footer-links {
            margin: 16px 0;
          }
          .footer-link {
            color: #f97316;
            text-decoration: none;
            margin: 0 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 SchoolIQ</div>
            <h1 class="title">Welcome to SchoolIQ!</h1>
            <p class="subtitle">Your School Management Journey Starts Here</p>
          </div>

          <div class="content">
            <p class="greeting">Dear ${params.adminName},</p>
            
            <p>Congratulations! 🎉 Your school <span class="school-name">${params.schoolName}</span> has been successfully registered on SchoolIQ.</p>

            <p>We're thrilled to have you on board. SchoolIQ is designed to simplify school management and help you focus on what matters most - providing quality education.</p>

            <div class="button-container">
              <a href="${loginUrl}/auth/login" class="button">Access Your Dashboard →</a>
            </div>

            <div class="features">
              <h2 class="features-title">✨ What You Can Do with SchoolIQ</h2>
              <ul class="feature-list">
                <li class="feature-item">
                  <span class="feature-icon">📊</span>
                  <span><strong>Student Management:</strong> Track attendance, grades, and performance</span>
                </li>
                <li class="feature-item">
                  <span class="feature-icon">👨‍🏫</span>
                  <span><strong>Staff Management:</strong> Manage teachers, assign classes, and track workload</span>
                </li>
                <li class="feature-item">
                  <span class="feature-icon">📈</span>
                  <span><strong>Analytics:</strong> Make data-driven decisions with powerful insights</span>
                </li>
                <li class="feature-item">
                  <span class="feature-icon">💬</span>
                  <span><strong>Communication:</strong> Stay connected with parents and staff</span>
                </li>
                <li class="feature-item">
                  <span class="feature-icon">📝</span>
                  <span><strong>Assessments:</strong> Create and manage exams, assignments, and reports</span>
                </li>
              </ul>
            </div>

            <div class="steps">
              <h2 class="steps-title">🚀 Getting Started</h2>
              <ol>
                <li>Click the button above to log in to your dashboard</li>
                <li>Complete your school profile and settings</li>
                <li>Add your first teachers and students</li>
                <li>Explore the features and customize your workflow</li>
                <li>Check out our help center for tutorials and guides</li>
              </ol>
            </div>

            <div class="support">
              <strong>💡 Need Help?</strong><br>
              Our support team is here to assist you every step of the way. Feel free to reach out if you have any questions or need guidance.
            </div>

            <p style="margin-top: 32px; color: #374151;">
              We're excited to be part of your journey in transforming education management. Let's make school administration easier together!
            </p>

            <p style="color: #6b7280; margin-top: 24px;">
              Best regards,<br>
              <strong style="color: #111827;">The SchoolIQ Team</strong>
            </p>
          </div>

          <div class="footer">
            <p>This email was sent to <strong>${params.adminEmail}</strong></p>
            <div class="footer-links">
              <a href="${loginUrl}/help" class="footer-link">Help Center</a> |
              <a href="${loginUrl}/contact" class="footer-link">Contact Support</a> |
              <a href="${loginUrl}/docs" class="footer-link">Documentation</a>
            </div>
            <p>© ${new Date().getFullYear()} SchoolIQ. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to SchoolIQ!

Dear ${params.adminName},

Congratulations! Your school "${params.schoolName}" has been successfully registered on SchoolIQ.

We're thrilled to have you on board. SchoolIQ is designed to simplify school management and help you focus on what matters most - providing quality education.

Login URL: ${loginUrl}/auth/login

What You Can Do with SchoolIQ:
--------------------------------
✓ Student Management: Track attendance, grades, and performance
✓ Staff Management: Manage teachers, assign classes, and track workload
✓ Analytics: Make data-driven decisions with powerful insights
✓ Communication: Stay connected with parents and staff
✓ Assessments: Create and manage exams, assignments, and reports

Getting Started:
----------------
1. Visit the login page using the link above
2. Complete your school profile and settings
3. Add your first teachers and students
4. Explore the features and customize your workflow
5. Check out our help center for tutorials and guides

Need Help?
Our support team is here to assist you every step of the way. Feel free to reach out if you have any questions.

Best regards,
The SchoolIQ Team

© ${new Date().getFullYear()} SchoolIQ. All rights reserved.
  `;

  return sendEmail({
    to: params.adminEmail,
    subject: `🎉 Welcome to SchoolIQ - ${params.schoolName} Registration Successful!`,
    html: htmlContent,
    text: textContent,
  });
}
