// ===================================================
// TRAVEL KORI BANGLADESH - EMAIL SERVICE (NODEMAILER)
// Supports Gmail SMTP with graceful development sandbox mode
// ===================================================

const nodemailer = require("nodemailer");

function getTransporter() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const isSecure = port === 465;
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";

    // If credentials are empty or placeholders, return null so we use safe local sandbox logging
    if (!user || !pass || pass.includes("your-app-password") || user.includes("your-gmail")) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false
        }
    });
}

/**
 * Send Password Reset Email with responsive branded HTML template
 */
async function sendPasswordResetEmail(toEmail, resetToken, userName = "Traveler") {
    const port = process.env.PORT || 5000;
    const baseUrl = process.env.SITE_URL || `http://localhost:${port}`;
    const resetUrl = `${baseUrl}/reset-password.html?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(toEmail)}`;

    const fromAddress = process.env.EMAIL_FROM || `"Travel Kori Bangladesh" <${process.env.SMTP_USER || "support@travelkori.com"}>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
        .email-wrapper { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .email-header { background: #087f5b; padding: 28px 24px; text-align: center; }
        .brand-badge { display: inline-block; background: #ffffff; color: #087f5b; font-weight: 900; font-size: 16px; padding: 6px 14px; border-radius: 8px; margin-bottom: 8px; }
        .email-header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .email-body { padding: 32px 28px; line-height: 1.6; }
        .email-body h2 { color: #0f172a; font-size: 18px; margin-top: 0; }
        .btn-reset { display: inline-block; background: #087f5b; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 20px 0; box-shadow: 0 4px 12px rgba(8, 127, 91, 0.25); text-align: center; }
        .notice-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #991b1b; }
        .email-footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .email-footer a { color: #087f5b; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">
          <div class="brand-badge">TK</div>
          <h1>Travel Kori Bangladesh</h1>
        </div>
        <div class="email-body">
          <h2>Password Reset Request</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a request to reset the password for your Travel Kori Bangladesh account registered with <strong>${toEmail}</strong>.</p>
          <p>Click the button below to choose a new password. This reset link is valid for <strong>15 minutes</strong>:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn-reset" target="_blank">Reset My Password</a>
          </div>

          <p style="font-size: 13px; color: #64748b;">If the button above does not work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 6px;"><a href="${resetUrl}" style="color: #087f5b;">${resetUrl}</a></p>

          <div class="notice-box">
            <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Your current password remains safe and unchanged.
          </div>
        </div>
        <div class="email-footer">
          <p>© 2026 Travel Kori Bangladesh • Connecting 64 Districts</p>
          <p>Helpline: <a href="tel:01709146149">01709146149</a> | Support: <a href="mailto:stephensikder@gmail.com">stephensikder@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    const textContent = `
Hello ${userName},

We received a request to reset your password for Travel Kori Bangladesh.
Please open the following link to choose a new password (valid for 15 minutes):

${resetUrl}

If you did not request this, please ignore this message.

Travel Kori Bangladesh
Support: stephensikder@gmail.com | 01709146149
    `;

    const transporter = getTransporter();

    if (!transporter) {
        console.log("\n=======================================================");
        console.log("[SMTP Sandbox] PASSWORD RESET LINK GENERATED:");
        console.log(`Recipient : ${toEmail} (${userName})`);
        console.log(`Reset URL : ${resetUrl}`);
        console.log(`Token     : ${resetToken}`);
        console.log(`Expires In: 15 minutes`);
        console.log("=======================================================\n");
        return { success: true, sandbox: true, resetUrl };
    }

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: "Password Reset Request — Travel Kori Bangladesh",
            text: textContent,
            html: htmlContent
        });
        console.log(`[SMTP Live] Password reset email delivered to ${toEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[SMTP Error] Failed to send email to ${toEmail}:`, err.message);
        // Fallback to sandbox logging so user can still test locally
        console.log(`[SMTP Fallback Reset URL]: ${resetUrl}`);
        return { success: true, fallback: true, error: err.message, resetUrl };
    }
}

/**
 * Send Security Alert Email (e.g. repeated failed logins)
 */
async function sendSecurityAlertEmail(toEmail, alertDetails) {
    const fromAddress = process.env.EMAIL_FROM || `"Travel Kori Bangladesh Security" <${process.env.SMTP_USER || "security@travelkori.com"}>`;
    const transporter = getTransporter();

    const subject = `⚠️ Security Alert: Multiple Failed Login Attempts — Travel Kori Bangladesh`;
    const textContent = `
Security Alert:
Multiple failed login attempts were detected on your account (${toEmail}).
Details:
- IP Address: ${alertDetails.ip || 'Unknown'}
- Time: ${new Date().toLocaleString()}
- Total Attempts: ${alertDetails.attempts || 5}

If this was you, you can safely reset your password. If not, please monitor your account immediately.
    `;

    if (!transporter) {
        console.log(`[SMTP Sandbox Security Alert] Alert generated for ${toEmail} (${alertDetails.attempts} failed attempts).`);
        return { success: true, sandbox: true };
    }

    try {
        await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject,
            text: textContent
        });
        return { success: true };
    } catch (e) {
        console.error(`[SMTP Alert Error]:`, e.message);
        return { success: false, error: e.message };
    }
}

module.exports = {
    sendPasswordResetEmail,
    sendSecurityAlertEmail,
    getTransporter
};
