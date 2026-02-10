export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AdminCredentialsEmailParams {
  adminEmail: string;
  adminName: string;
  schoolName: string;
  temporaryPassword: string;
  loginUrl?: string;
}

export interface WelcomeEmailParams {
  adminEmail: string;
  adminName: string;
  schoolName: string;
  loginUrl?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
