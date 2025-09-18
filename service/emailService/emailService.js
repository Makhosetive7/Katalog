import nodemailer from "nodemailer";

const createTransporter = () => {
  const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } = process.env;

  if (EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  if (EMAIL_SERVICE === "sendgrid") {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  // fallback: custom SMTP
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email connection failed:", error.message);
    return false;
  }
};

export const sendVerificationEmail = async (user, token) => {
  try {
    const transporter = createTransporter();
   const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;


    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Verify Your Email Address - Reading Tracker",
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${user.username || "User"},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:5px;">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    return false;
  }
};

export const sendPasswordResetEmail = async (user, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#dc3545;color:#fff;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", user.email);
  } catch (error) {
    console.error("Error sending reset email:", error.message);
  }
};

export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Welcome to Reading Tracker!",
      html: `
        <h2>Welcome, ${user.username || "Reader"}!</h2>
        <p>Your account has been successfully verified. Here’s what you can do:</p>
        <ul>
          <li>Add books to your library</li>
          <li>Track your reading progress</li>
          <li>Set reading goals</li>
          <li>Join reading challenges</li>
        </ul>
        <p>Happy reading!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", user.email);
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
  }
};
