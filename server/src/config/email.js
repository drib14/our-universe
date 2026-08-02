const nodemailer = require('nodemailer');

/**
 * Clean & Format Credentials
 */
const getEmailUser = () => (process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '');
const getEmailPassword = () => (process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : '');

/**
 * Create Nodemailer Transporter for Gmail SMTP
 */
const createTransporter = () => {
  const user = getEmailUser();
  const pass = getEmailPassword();

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Send an email directly via SMTP (throws error on failure so callers handle errors properly)
 */
const sendEmail = async (to, subject, html) => {
  const user = getEmailUser();
  const pass = getEmailPassword();

  if (!user || !pass) {
    throw new Error('Email missing configuration: EMAIL_USER or EMAIL_PASSWORD environment variables are not set.');
  }

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: `"Pairly — Private Sanctuary" <${user}>`,
    to: to.trim(),
    subject,
    html,
  });

  console.log(`[SMTP Email Sent] Message ID: ${info.messageId} -> ${to}`);
  return info;
};

/**
 * App Logo SVG for HTML Email Templates
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
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 580px; width: 100%; background: linear-gradient(165deg, rgba(49, 16, 43, 0.95) 0%, rgba(21, 5, 23, 0.98) 60%, rgba(12, 2, 13, 1) 100%); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: 28px; padding: 36px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(244, 63, 94, 0.15);">
          
          <!-- Header with App Logo -->
          <tr>
            <td align="center" style="padding-bottom: 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-right: 14px;">
                    ${platformLogoSvg}
                  </td>
                  <td align="left" style="vertical-align: middle;">
                    <span style="font-size: 30px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: block; line-height: 1;">Pairly</span>
                    <span style="font-size: 10px; font-weight: 700; color: #fda4af; text-transform: uppercase; letter-spacing: 3px; display: block; margin-top: 3px;">Our Private Sanctuary</span>
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
              <strong style="color: rgba(255, 255, 255, 0.85);">Pairly — Private Relationship Sanctuary</strong>
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
 * Styled Email Templates matching the Pairly Romantic Glassmorphism Design
 */
const emailTemplates = {
  partnerInvite: (senderName, inviteCode) => {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:8081';
    const pairUrl = `${baseUrl.replace(/\/$/, '')}/pair?code=${inviteCode}`;

    return {
      subject: `${senderName} invited you to connect on Pairly 💕`,
      html: renderEmailWrapper(
        'Partner Invitation',
        `
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">You've Been Invited! 💕</h2>
        <p style="color: rgba(255, 255, 255, 0.88); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
          <strong style="color: #f43f5e;">${senderName}</strong> wants to connect with you on <strong>Pairly</strong> — your private relationship sanctuary to seal time-capsule letters, pin date spots on your story map, track moods, and build your shared story together.
        </p>
        <p style="color: rgba(255, 255, 255, 0.85); font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          Use your partner's unique invitation code below to link your accounts:
        </p>
        
        <!-- Code Badge Box -->
        <div style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.18), rgba(147, 51, 234, 0.18)); border: 2px dashed rgba(244, 63, 94, 0.5); border-radius: 20px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #fda4af; display: block; margin-bottom: 8px; letter-spacing: 2px;">Your Partner's Invite Code</span>
          <span class="code-badge" style="font-size: 38px; font-weight: 800; font-family: 'Courier New', Courier, monospace; color: #ffffff; letter-spacing: 8px; text-shadow: 0 0 15px rgba(244, 63, 94, 0.6);">${inviteCode}</span>
        </div>

        <div style="text-align: center; margin-top: 28px; margin-bottom: 20px;">
          <a href="${pairUrl}" class="cta-btn" style="display: inline-block; background: linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #9333ea 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 16px; box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);">
            Connect & Pair Accounts Now →
          </a>
        </div>
        <p style="color: rgba(253, 164, 175, 0.6); font-size: 12px; text-align: center; margin-top: 12px;">
          Or copy your code <strong style="color: #ffffff;">${inviteCode}</strong> and enter it on the pairing page.
        </p>
        `
      ),
    };
  },

  passwordReset: (name, code) => ({
    subject: 'Reset your Pairly password 🔑',
    html: renderEmailWrapper(
      'Password Reset Code',
      `
      <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Reset Password Code 🔑</h2>
      <p style="color: rgba(255, 255, 255, 0.88); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Hello <strong style="color: #ffffff;">${name}</strong>, use the 6-digit verification code below to reset your Pairly account password:
      </p>

      <!-- Code Badge Box -->
      <div style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.18), rgba(147, 51, 234, 0.18)); border: 2px dashed rgba(244, 63, 94, 0.5); border-radius: 20px; padding: 24px; text-align: center; margin: 24px 0;">
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
      <p style="color: rgba(255, 255, 255, 0.88); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Hello <strong style="color: #ffffff;">${receiverName}</strong>,
      </p>
      <p style="color: rgba(255, 255, 255, 0.88); font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <strong style="color: #f43f5e;">${senderName}</strong> wrote a time-capsule letter titled "<span style="color: #ffffff; font-weight: 700;">${letterTitle}</span>" — and the time has come to open it!
      </p>

      <div style="text-align: center; margin-top: 28px; margin-bottom: 16px;">
        <a href="${(process.env.CLIENT_URL || 'http://localhost:8081').replace(/\/$/, '')}/capsule-mail" class="cta-btn" style="display: inline-block; background: linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #9333ea 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 16px; box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);">
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
      <p style="color: rgba(255, 255, 255, 0.88); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Hi <strong style="color: #ffffff;">${name}</strong>, your private relationship sanctuary has been created!
      </p>
      <p style="color: rgba(255, 255, 255, 0.88); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        You can now pair with your partner to seal time-capsule letters, pin date spots on your story map, check in daily moods, and build your shared story together.
      </p>
      
      <div style="text-align: center; margin-top: 28px; margin-bottom: 16px;">
        <a href="${(process.env.CLIENT_URL || 'http://localhost:8081').replace(/\/$/, '')}/pair" class="cta-btn" style="display: inline-block; background: linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #9333ea 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 16px; box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);">
          Start Pairing Now →
        </a>
      </div>
      `
    ),
  }),
};

module.exports = { sendEmail, emailTemplates };
