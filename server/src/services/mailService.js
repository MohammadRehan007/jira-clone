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
      return nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user,
          pass
        }
      });
    }
    return this.transporter;
  }

  async sendMail({ to, subject, html }) {
    try {
      let activeTransporter = this.getTransporter();
      if (!activeTransporter) {
        await this.initFallbackTransporter();
        activeTransporter = this.transporter;
      }
      if (!activeTransporter) return;

      if (!to || (Array.isArray(to) && to.length === 0)) return;

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

  async sendTicketAssignedEmail({ ticket, assignee, reporter }) {
    if (!assignee || !assignee.email) return;

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

    const body = `
      <div class="badge">Status Update</div>
      <div class="ticket-title">[${ticket.ticketKey}] ${ticket.title}</div>
      <p>The status of ticket <strong>${ticket.ticketKey}</strong> has been updated by <strong>${updatedBy ? updatedBy.name : 'User'}</strong>.</p>
      <div style="background: #f4f5f7; padding: 12px 16px; border-radius: 6px; font-weight: bold;">
        Status changed: <span style="color: #de350b;">${oldStatus}</span> ➔ <span style="color: #00875a;">${newStatus}</span>
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

    const body = `
      <div class="badge">New Comment</div>
      <div class="ticket-title">[${ticket.ticketKey}] ${ticket.title}</div>
      <p><strong>${author ? author.name : 'Someone'}</strong> commented on <strong>${ticket.ticketKey}</strong>:</p>
      <div style="border-left: 4px solid #0052cc; padding: 10px 16px; background: #f4f5f7; margin: 12px 0;">
        ${comment.content}
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

    const body = `
      <div class="badge" style="background: #fffae6; color: #ff8b00;">You Were Mentioned</div>
      <div class="ticket-title">[${ticket.ticketKey}] ${ticket.title}</div>
      <p>Hello <strong>${mentionedUser.name}</strong>,</p>
      <p><strong>${author ? author.name : 'A team member'}</strong> tagged you in a comment on ticket <strong>${ticket.ticketKey}</strong>:</p>
      <div style="border-left: 4px solid #ff8b00; padding: 10px 16px; background: #fffbe6; margin: 12px 0;">
        ${comment.content}
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

    const body = `
      <div class="badge" style="background: #deebff; color: #0747a6;">Welcome to Jira Engine</div>
      <div class="ticket-title">Your Workspace Account Credentials</div>
      <p>Hello <strong>${name}</strong>,</p>
      <p>An account has been provisioned for you in Jira Engine by <strong>${createdBy ? createdBy.name : 'System Admin'}</strong>.</p>
      <div style="background: #f4f5f7; padding: 14px 18px; border-radius: 6px; border: 1px solid #dfe1e6; margin: 12px 0;">
        <p style="margin: 4px 0;"><strong>Assigned Role:</strong> ${role}</p>
        <p style="margin: 4px 0;"><strong>Email Address:</strong> ${email}</p>
        <p style="margin: 4px 0;"><strong>Initial Password:</strong> <code style="background: #ebecf0; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
      </div>
      <p>You can now log in using these credentials.</p>
    `;

    return await this.sendMail({
      to: email,
      subject: `Welcome to Jira Engine - Account Credentials`,
      html: this._baseTemplate(`Welcome to Jira Engine`, body)
    });
  }

  async sendForgotPasswordEmail({ name, email, newPassword }) {
    if (!email) return;

    const body = `
      <div class="badge" style="background: #ffebe6; color: #de350b;">Security Alert</div>
      <div class="ticket-title">Password Reset - Temporary Credentials</div>
      <p>Hello <strong>${name}</strong>,</p>
      <p>A password reset was requested for your Jira Engine account.</p>
      <div style="background: #f4f5f7; padding: 14px 18px; border-radius: 6px; border: 1px solid #dfe1e6; margin: 12px 0;">
        <p style="margin: 4px 0;"><strong>Account Email:</strong> ${email}</p>
        <p style="margin: 4px 0;"><strong>New Temporary Password:</strong> <code style="background: #ebecf0; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 15px; color: #0052cc;">${newPassword}</code></p>
      </div>
      <p>Please log in using this temporary password.</p>
    `;

    return await this.sendMail({
      to: email,
      subject: `[Jira Security] Password Reset Notification`,
      html: this._baseTemplate(`Password Reset Notification`, body)
    });
  }
}

module.exports = new MailService();
