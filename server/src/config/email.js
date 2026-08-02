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
 * Exact App Logo SVG String for HTML Email Clients
 */
const platformLogoSvg = `
<svg width="52" height="52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; display: inline-block;">
  <defs>
    <linearGradient id="email-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#email-logo-grad)" />
  <path d="M 50 72 C 30 55, 10 38, 28 20 C 40 8, 50 30, 50 30 C 50 30, 60 8, 72 20 C 90 38, 70 55, 50 72 Z"
        fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="50" cy="40" r="4.5" fill="#ffffff" />
</svg>
`;

/**
 * Modern Luxury Glassmorphic HTML Email Container Wrapper
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
      .email-container { width: 100% !important; padding: 24px 16px !important; }
      .code-badge { font-size: 28px !important; letter-spacing: 5px !important; }
      .cta-btn { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0c020d; font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: radial-gradient(circle at 50% 0%, #31102b 0%, #150517 60%, #0c020d 100%); padding: 40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 580px; width: 100%; background: linear-gradient(165deg, rgba(49, 16, 43, 0.95) 0%, rgba(21, 5, 23, 0.98) 60%, rgba(12, 2, 13, 1) 100%); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 28px; padding: 36px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(244, 63, 94, 0.15);">
          
          <!-- Header with Actual App Logo -->
          <tr>
            <td align="center" style="padding-bottom: 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-right: 14px;">
                    ${platformLogoSvg}
                  </td>
                  <td align="left" style="vertical-align: middle;">
                    <span style="font-size: 30px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: block; line-height: 1;">Pairly</span>
                    <span style="font-size: 10px; font-weight: 700; color: #fda4af; text-transform: uppercase; letter-spacing: 3px; display: block; margin-top: 3px;">Our Universe</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding-top: 28px; padding-bottom: 10px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; color: rgba(253, 164, 175, 0.6); line-height: 1.5;">
              Crafted with care for couples everywhere.<br>
              <strong style="color: rgba(255, 255, 255, 0.8);">Pairly — Private Relationship Sanctuary</strong>
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
 * Styled Email Templates matching the Pairly App Theme
 */
const emailTemplates = {
  partnerInvite: (senderName, inviteCode) => ({
    subject: `${senderName} invited you to connect on Pairly 💕`,
    html: renderEmailWrapper(
      'Partner Invitation',
      `
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">You've Been Invited! 💕</h2>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        <strong style="color: #f43f5e;">${senderName}</strong> wants to connect with you on Pairly — your private relationship sanctuary to store time-capsule letters, memory maps, mood check-ins, and couple quests.
      </p>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        Open Pairly and enter your partner's unique invite code:
      </p>
      
      <!-- Code Badge Box -->
      <div style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(147, 51, 234, 0.15)); border: 2px dashed rgba(244, 63, 94, 0.4); border-radius: 20px; padding: 24px; text-align: center; margin: 24px 0;">
        <span class="code-badge" style="font-size: 36px; font-weight: 800; font-family: 'Courier New', Courier, monospace; color: #ffffff; letter-spacing: 8px; text-shadow: 0 0 15px rgba(244, 63, 94, 0.6);">${inviteCode}</span>
      </div>

      <div style="text-align: center; margin-top: 28px; margin-bottom: 16px;">
        <a href="https://pairly-web.onrender.com/pair" class="cta-btn" style="display: inline-block; background: linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #9333ea 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);">
          Connect & Pair Accounts Now →
        </a>
      </div>
      `
    ),
  }),

  passwordReset: (name, code) => ({
    subject: 'Reset your Pairly password 🔑',
    html: renderEmailWrapper(
      'Password Reset Code',
      `
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Reset Password Code 🔑</h2>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Hello <strong style="color: #ffffff;">${name}</strong>, use the 6-digit verification code below to reset your Pairly account password:
      </p>

      <!-- Code Badge Box -->
      <div style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(147, 51, 234, 0.15)); border: 2px dashed rgba(244, 63, 94, 0.4); border-radius: 20px; padding: 24px; text-align: center; margin: 24px 0;">
        <span class="code-badge" style="font-size: 38px; font-weight: 800; font-family: 'Courier New', Courier, monospace; color: #ffffff; letter-spacing: 8px; text-shadow: 0 0 15px rgba(244, 63, 94, 0.6);">${code}</span>
      </div>

      <p style="color: rgba(253, 164, 175, 0.7); font-size: 13px; line-height: 1.5; text-align: center; margin-top: 20px;">
        This verification code expires in 15 minutes. If you did not request a password reset, you can safely ignore this email.
      </p>
      `
    ),
  }),

  letterUnlocked: (receiverName, senderName, letterTitle) => ({
    subject: `💌 A capsule letter from ${senderName} has been unlocked!`,
    html: renderEmailWrapper(
      'Capsule Letter Unlocked',
      `
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Time Capsule Unlocked! 💌</h2>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Hello <strong style="color: #ffffff;">${receiverName}</strong>,
      </p>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <strong style="color: #f43f5e;">${senderName}</strong> wrote a time-capsule letter titled "<span style="color: #ffffff; font-weight: 700;">${letterTitle}</span>" — and the time has come to open it!
      </p>

      <div style="text-align: center; margin-top: 28px; margin-bottom: 16px;">
        <a href="https://pairly-web.onrender.com/capsule-mail" class="cta-btn" style="display: inline-block; background: linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #9333ea 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);">
          Break Seal & Read Letter →
        </a>
      </div>
      `
    ),
  }),

  welcomeEmail: (name) => ({
    subject: `Welcome to Pairly, ${name}! ✨`,
    html: renderEmailWrapper(
      'Welcome to Pairly',
      `
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Welcome to Pairly! ✨</h2>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Hi <strong style="color: #ffffff;">${name}</strong>, your private relationship sanctuary has been created!
      </p>
      <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        You can now pair with your partner to seal time-capsule letters, pin date spots on your relationship map, check in daily moods, and build your shared story together.
      </p>
      
      <div style="text-align: center; margin-top: 28px; margin-bottom: 16px;">
        <a href="https://pairly-web.onrender.com/pair" class="cta-btn" style="display: inline-block; background: linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #9333ea 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);">
          Start Pairing Now →
        </a>
      </div>
      `
    ),
  }),
};

module.exports = { sendEmail, emailTemplates };
