const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send an email (non-blocking safe catch)
 */
const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Pairly" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Email send failed: ${error.message}`);
  }
};

/**
 * Inline Platform Icon SVG string for emails
 */
const platformLogoSvg = `
<svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
  <rect width="100" height="100" rx="28" fill="url(#logo-grad)" />
  <defs>
    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
  </defs>
  <path d="M 50 72 C 30 55, 10 38, 28 20 C 40 8, 50 30, 50 30 C 50 30, 60 8, 72 20 C 90 38, 70 55, 50 72 Z"
        fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="50" cy="40" r="4" fill="#ffffff" />
</svg>
`;

/**
 * Modern Responsive HTML Email Container Wrapper
 */
const renderEmailWrapper = (title, contentHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 20px 15px !important; }
      .card-body { padding: 20px !important; }
      .code-badge { font-size: 28px !important; letter-spacing: 4px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0c020d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c020d; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 580px; width: 100%; background: linear-gradient(145deg, #240a23 0%, #120315 100%); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 24px; padding: 32px; box-shadow: 0 12px 40px rgba(0,0,0,0.5);">
          <!-- Header with Platform Icon -->
          <tr>
            <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-right: 12px;">
                    ${platformLogoSvg}
                  </td>
                  <td align="left">
                    <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: block;">Pairly</span>
                    <span style="font-size: 10px; font-weight: 700; color: #f43f5e; text-transform: uppercase; letter-spacing: 2px; display: block;">Our Universe</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding-top: 24px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: rgba(244, 63, 94, 0.6);">
              Sent with care from Pairly — The Private Space for Two.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Email templates using platform icon and clean, responsive HTML
 */
const emailTemplates = {
  partnerInvite: (senderName, inviteCode) => ({
    subject: `${senderName} invited you to connect on Pairly`,
    html: renderEmailWrapper(
      'Partner Invitation',
      `
      <h2 style="color: #ffffff; font-size: 22px; margin-top: 0;">You have been invited!</h2>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
        <strong style="color: #f43f5e;">${senderName}</strong> wants to connect with you on Pairly — the platform built exclusively for couples to share time-capsule letters, memories, and relationship milestones.
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
        Open Pairly and enter your partner's invite code:
      </p>
      <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
        <span class="code-badge" style="font-size: 34px; font-weight: 800; font-family: monospace; color: #ffffff; letter-spacing: 8px;">${inviteCode}</span>
      </div>
      <p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.5;">
        Enter this code on the Partner Pairing screen to connect your accounts.
      </p>
      `
    ),
  }),

  passwordReset: (name, code) => ({
    subject: 'Reset your Pairly password',
    html: renderEmailWrapper(
      'Password Reset Code',
      `
      <h2 style="color: #ffffff; font-size: 22px; margin-top: 0;">Password Reset Code</h2>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
        Hello ${name}, use the 6-digit verification code below to reset your Pairly password:
      </p>
      <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
        <span class="code-badge" style="font-size: 34px; font-weight: 800; font-family: monospace; color: #ffffff; letter-spacing: 8px;">${code}</span>
      </div>
      <p style="color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.5;">
        This verification code expires in 15 minutes. If you did not request a password reset, you can safely ignore this email.
      </p>
      `
    ),
  }),

  letterUnlocked: (receiverName, senderName, letterTitle) => ({
    subject: `A capsule letter from ${senderName} has been unlocked`,
    html: renderEmailWrapper(
      'Capsule Letter Unlocked',
      `
      <h2 style="color: #ffffff; font-size: 22px; margin-top: 0;">Time Capsule Letter Unlocked!</h2>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
        Hello ${receiverName},
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
        <strong style="color: #f43f5e;">${senderName}</strong> wrote a time-capsule letter titled "<span style="color: #ffffff;">${letterTitle}</span>" — and it is now ready to be opened!
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
        Log into Pairly to break the seal and read your letter.
      </p>
      `
    ),
  }),
};

module.exports = { sendEmail, emailTemplates };
