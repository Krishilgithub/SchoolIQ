import nodemailer from "nodemailer";
import type {
  SendEmailParams,
  AdminCredentialsEmailParams,
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
