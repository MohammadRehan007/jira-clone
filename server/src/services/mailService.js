const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = null;
  }

  async initFallbackTransporter() {
    if (!this.transporter) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log(`[Email Engine] Auto-generated Ethereal Test Account: ${testAccount.user}`);
      } catch (err) {
        console.warn(`[Email Engine Warning] Fallback transporter creation error: ${err.message}`);
      }
    }
  }

  getTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    if (host && user) {
      if (host.includes('gmail') || user.endsWith('@gmail.com')) {
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user,
            pass
          },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 8000
        });
      }

      return nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user,
          pass
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000
      });
    }
    return this.transporter;
  }

  async sendViaBrevoApi({ to, subject, html }) {
    const toList = (Array.isArray(to) ? to : to.split(','))
      .map(email => (typeof email === 'string' ? email.trim() : email?.email?.trim()))
      .filter(Boolean)
      .map(email => ({ email }));

    if (toList.length === 0) return;

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'Jira Engine';

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: toList,
      subject: `[Jira Notification] ${subject}`,
      htmlContent: html
    };

    const rawKey = process.env.BREVO_API_KEY || '';
    const apiKey = rawKey.replace(/^BREVO_API_KEY=/, '').trim();

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Brevo API Error (${response.status}): ${JSON.stringify(data)}`);
    }

    console.log(`✉️ [Brevo Mail Sent] Subject: "${subject}" | To: ${toList.map(t => t.email).join(', ')} | ID: ${data.messageId}`);
    return data;
  }

  async sendMail({ to, subject, html }) {
    try {
      if (!to || (Array.isArray(to) && to.length === 0)) return;

      // Prioritize Brevo REST API (HTTPS port 443 - works reliably on Render free tier)
      if (process.env.BREVO_API_KEY) {
        return await this.sendViaBrevoApi({ to, subject, html });
      }

      let activeTransporter = this.getTransporter();
      if (!activeTransporter) {
        await this.initFallbackTransporter();
        activeTransporter = this.transporter;
      }
      if (!activeTransporter) return;

      const recipients = Array.isArray(to) ? to.join(', ') : to;
      const from = process.env.SMTP_FROM || '"Jira Ticketing System" <no-reply@jira.local>';

      const info = await activeTransporter.sendMail({
        from,
        to: recipients,
        subject: `[Jira Notification] ${subject}`,
        html
      });

      console.log(`✉️ [Mail Sent] Subject: "${subject}" | To: ${recipients} | ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`🔗 [Ethereal Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error) {
      console.error(`❌ [Mail Send Error] ${error.message}`);
    }
  }

  // Template Wrappers
  _baseTemplate(title, bodyHtml) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #172b4d; }
          .card { max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #dfe1e6; }
          .header { background: #0052cc; color: #ffffff; padding: 20px 24px; }
          .header h2 { margin: 0; font-size: 20px; font-weight: 600; }
          .content { padding: 24px; line-height: 1.6; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #deebff; color: #0747a6; margin-bottom: 12px; }
          .ticket-title { font-size: 18px; font-weight: bold; margin: 12px 0 8px; color: #091e42; }
          .footer { background: #fafbfc; padding: 16px 24px; border-top: 1px solid #dfe1e6; font-size: 12px; color: #6b778c; text-align: center; }
          .btn { display: inline-block; padding: 10px 18px; background: #0052cc; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>🔷 Jira Ticketing System</h2>
          </div>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            Sent automatically by Jira Ticketing & Sprint Management System. Please do not reply to this email.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getClientUrl() {
    let url = process.env.CLIENT_URL;
    if (!url || (url.includes('localhost') && process.env.NODE_ENV === 'production')) {
      return 'https://jira-clone-phi-blond.vercel.app';
    }
    return (url || 'https://jira-clone-phi-blond.vercel.app').replace(/\/+$/, '');
  }

  async sendTicketAssignedEmail({ ticket, assignee, reporter }) {
    if (!assignee || !assignee.email) return;

    const clientUrl = this.getClientUrl();
    const boardUrl = `${clientUrl}/board`;

    const title = `Ticket Assigned: ${ticket.ticketKey}`;
    const body = `
      <div class="badge">Assignment Alert</div>
      <div class="ticket-title">[${ticket.ticketKey}] ${ticket.title}</div>
      <p>Hello <strong>${assignee.name}</strong>,</p>
      <p>You have been assigned to ticket <strong>${ticket.ticketKey}</strong> by <strong>${reporter ? reporter.name : 'System Admin'}</strong>.</p>
      <ul>
        <li><strong>Type:</strong> ${ticket.type}</li>
        <li><strong>Priority:</strong> ${ticket.priority}</li>
        <li><strong>Status:</strong> ${ticket.status}</li>
      </ul>
      <p><strong>Description:</strong> ${ticket.description || 'No description provided.'}</p>
      <div style="margin-top: 18px;">
        <a href="${boardUrl}" class="btn" style="background-color: #0052cc; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
          📋 View on Kanban Board
        </a>
      </div>
    `;

    return await this.sendMail({
      to: assignee.email,
      subject: `[${ticket.ticketKey}] Assigned to you: ${ticket.title}`,
      html: this._baseTemplate(title, body)
    });
  }

  async sendTicketStatusChangedEmail({ ticket, oldStatus, newStatus, updatedBy, recipients }) {
    if (!recipients || recipients.length === 0) return;

    const emails = recipients.map(r => typeof r === 'string' ? r : r.email).filter(Boolean);
    if (emails.length === 0) return;

    const clientUrl = this.getClientUrl();
    const boardUrl = `${clientUrl}/board`;

    const body = `
      <div class="badge">Status Update</div>
      <div class="ticket-title">[${ticket.ticketKey}] ${ticket.title}</div>
      <p>The status of ticket <strong>${ticket.ticketKey}</strong> has been updated by <strong>${updatedBy ? updatedBy.name : 'User'}</strong>.</p>
      <div style="background: #f4f5f7; padding: 12px 16px; border-radius: 6px; font-weight: bold;">
        Status changed: <span style="color: #de350b;">${oldStatus}</span> ➔ <span style="color: #00875a;">${newStatus}</span>
      </div>
      <div style="margin-top: 18px;">
        <a href="${boardUrl}" class="btn" style="background-color: #0052cc; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
          📋 View Board
        </a>
      </div>
    `;

    return await this.sendMail({
      to: emails,
      subject: `[${ticket.ticketKey}] Status changed to ${newStatus}`,
      html: this._baseTemplate(`Status Updated`, body)
    });
  }

  async sendCommentAddedEmail({ ticket, comment, author, recipients }) {
    if (!recipients || recipients.length === 0) return;

    const emails = recipients.map(r => typeof r === 'string' ? r : r.email).filter(Boolean);
    if (emails.length === 0) return;

    const clientUrl = this.getClientUrl();
    const boardUrl = `${clientUrl}/board`;

    const body = `
      <div class="badge">New Comment</div>
      <div class="ticket-title">[${ticket.ticketKey}] ${ticket.title}</div>
      <p><strong>${author ? author.name : 'Someone'}</strong> commented on <strong>${ticket.ticketKey}</strong>:</p>
      <div style="border-left: 4px solid #0052cc; padding: 10px 16px; background: #f4f5f7; margin: 12px 0;">
        ${comment.content}
      </div>
      <div style="margin-top: 18px;">
        <a href="${boardUrl}" class="btn" style="background-color: #0052cc; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
          💬 View Comment on Board
        </a>
      </div>
    `;

    return await this.sendMail({
      to: emails,
      subject: `[${ticket.ticketKey}] New comment by ${author ? author.name : 'User'}`,
      html: this._baseTemplate(`New Comment`, body)
    });
  }

  async sendUserMentionedEmail({ ticket, comment, author, mentionedUser }) {
    if (!mentionedUser || !mentionedUser.email) return;

    const clientUrl = this.getClientUrl();
    const boardUrl = `${clientUrl}/board`;

    const body = `
      <div class="badge" style="background: #fffae6; color: #ff8b00;">You Were Mentioned</div>
      <div class="ticket-title">[${ticket.ticketKey}] ${ticket.title}</div>
      <p>Hello <strong>${mentionedUser.name}</strong>,</p>
      <p><strong>${author ? author.name : 'A team member'}</strong> tagged you in a comment on ticket <strong>${ticket.ticketKey}</strong>:</p>
      <div style="border-left: 4px solid #ff8b00; padding: 10px 16px; background: #fffbe6; margin: 12px 0;">
        ${comment.content}
      </div>
      <div style="margin-top: 18px;">
        <a href="${boardUrl}" class="btn" style="background-color: #0052cc; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600; display: inline-block;">
          🔔 View Mentioned Ticket
        </a>
      </div>
    `;

    return await this.sendMail({
      to: mentionedUser.email,
      subject: `[${ticket.ticketKey}] You were tagged by ${author ? author.name : 'User'}`,
      html: this._baseTemplate(`Mention Notification`, body)
    });
  }

  async sendWelcomeUserEmail({ name, email, password, role, createdBy }) {
    if (!email) return;

    const clientUrl = this.getClientUrl();
    const loginUrl = `${clientUrl}/login`;

    const body = `
      <div class="badge" style="background: #deebff; color: #0747a6;">Welcome to Jira Engine</div>
      <div class="ticket-title">Your Workspace Account Credentials</div>
      <p>Hello <strong>${name}</strong>,</p>
      <p>An account has been provisioned for you in Jira Engine by <strong>${createdBy ? createdBy.name : 'System Admin'}</strong>.</p>
      <div style="background: #f4f5f7; padding: 14px 18px; border-radius: 6px; border: 1px solid #dfe1e6; margin: 16px 0;">
        <p style="margin: 6px 0;"><strong>Assigned Role:</strong> <span style="background: #ebecf0; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${role}</span></p>
        <p style="margin: 6px 0;"><strong>Email Address:</strong> ${email}</p>
        <p style="margin: 6px 0;"><strong>Initial Password:</strong> <code style="background: #ebecf0; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 14px; color: #0052cc;">${password}</code></p>
      </div>
      <p>You can now log in to the workspace directly by clicking the button below:</p>
      <div style="margin: 22px 0 16px; text-align: center;">
        <a href="${loginUrl}" class="btn" style="background-color: #0052cc; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
          🚀 Log In to Jira Engine
        </a>
      </div>
      <p style="font-size: 12px; color: #6b778c; margin-top: 14px; word-break: break-all;">
        Website URL: <a href="${loginUrl}" style="color: #0052cc; text-decoration: underline;">${loginUrl}</a>
      </p>
    `;

    return await this.sendMail({
      to: email,
      subject: `Welcome to Jira Engine - Account Credentials`,
      html: this._baseTemplate(`Welcome to Jira Engine`, body)
    });
  }

  async sendPasswordResetEmail({ name, email, resetUrl, expireMinutes = 60 }) {
    if (!email) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%); padding: 32px 30px; text-align: center;">
                    <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); border-radius: 14px; margin-bottom: 12px; font-size: 26px;">
                      🔐
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                      Password Reset Request
                    </h1>
                    <p style="margin: 6px 0 0; color: #bfdbfe; font-size: 13px; font-weight: 500;">
                      Jira Engine Security & Authentication Service
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px; background-color: #ffffff;">
                    <p style="margin: 0 0 16px; font-size: 15px; color: #1e293b; line-height: 1.6;">
                      Hello <strong>${name || 'Team Member'}</strong>,
                    </p>
                    <p style="margin: 0 0 22px; font-size: 14px; color: #475569; line-height: 1.6;">
                      We received a request to reset the password for your account associated with <strong style="color: #1e3a8a;">${email}</strong>.
                    </p>
                    <p style="margin: 0 0 28px; font-size: 14px; color: #475569; line-height: 1.6;">
                      Click the button below to open the secure page and enter your new password:
                    </p>

                    <!-- Reset Button -->
                    <div style="text-align: center; margin: 30px 0 34px;">
                      <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff !important; padding: 14px 34px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35); letter-spacing: 0.3px;">
                        🔑 Set New Password
                      </a>
                    </div>

                    <!-- Security Alert Callout -->
                    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 14px 18px; margin: 24px 0 20px;">
                      <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #1e3a8a;">
                        ⏱️ Security Notice
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                        This password reset link is valid for <strong>${expireMinutes} minutes</strong> only. You will be able to manually specify your new password on the page.
                      </p>
                    </div>

                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 12px 18px; margin: 0 0 24px;">
                      <p style="margin: 0; font-size: 12px; color: #991b1b; line-height: 1.5;">
                        If you did not request a password reset, please ignore this email. Your current password remains completely unchanged and secure.
                      </p>
                    </div>

                    <!-- Direct Link Fallback -->
                    <p style="margin: 20px 0 6px; font-size: 12px; color: #94a3b8;">
                      Having trouble with the button? Copy and paste this URL into your browser:
                    </p>
                    <p style="margin: 0; font-size: 11px; word-break: break-all; color: #2563eb; background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px;">
                      <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                      Sent automatically by Jira Engine Security. Please do not reply to this email.<br/>
                      © 2026 Jira Engine. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await this.sendMail({
      to: email,
      subject: `[Jira Engine] Password Reset Request`,
      html
    });
  }

  // Backward compatibility alias
  async sendForgotPasswordEmail(args) {
    return await this.sendPasswordResetEmail(args);
  }
}

module.exports = new MailService();
