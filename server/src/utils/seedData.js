const User = require('../models/User');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Ticket = require('../models/Ticket');

const seedInitialData = async () => {
  try {
    // Ensure default Admin account always exists with admin@gmail.com / Password@12345
    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminUser) {
      const existingAdmin = await User.findOne({ role: 'Admin' });
      if (existingAdmin) {
        existingAdmin.email = 'admin@gmail.com';
        existingAdmin.password = 'Password@12345';
        await existingAdmin.save();
        console.log('✅ [Seed] Updated existing Admin user credentials to admin@gmail.com / Password@12345');
      } else {
        await User.create({
          name: 'System Admin',
          email: 'admin@gmail.com',
          password: 'Password@12345',
          role: 'Admin',
          department: 'Management',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        });
        console.log('✅ [Seed] Created default Admin user (admin@gmail.com / Password@12345)');
      }
    }

    const userCount = await User.countDocuments();
    if (userCount > 1) {
      console.log('[Seed] Database already initialized with demo data.');
      return;
    }

    console.log('[Seed] Seeding initial Jira demo data...');

    // 1. Seed Users
    const admin = await User.findOne({ role: 'Admin' });

    const lead = await User.create({
      name: 'Sarah Lead',
      email: 'sarah.lead@jira.com',
      password: 'password123',
      role: 'ProjectLead',
      department: 'Engineering',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    });

    const dev = await User.create({
      name: 'Alex Developer',
      email: 'alex.dev@jira.com',
      password: 'password123',
      role: 'Developer',
      department: 'Frontend Dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    });

    const tester = await User.create({
      name: 'Taylor Tester',
      email: 'taylor.tester@jira.com',
      password: 'password123',
      role: 'Tester',
      department: 'QA & Testing',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor'
    });

    // 2. Seed Project
    const project = await Project.create({
      name: 'Core Platform Engineering',
      key: 'JIR',
      description: 'Primary software workspace for Jira clone development',
      lead: lead._id,
      members: [admin._id, lead._id, dev._id, tester._id],
      ticketCounter: 105
    });

    // 3. Seed Sprint (Weekly Sprint)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const sprint = await Sprint.create({
      name: 'Sprint 1 - Core MVP & Email Engine',
      goal: 'Deliver drag-and-drop Kanban board, sprint management, and email notifications',
      project: project._id,
      startDate,
      endDate,
      status: 'Active'
    });

    // 4. Seed Sample Tickets
    await Ticket.create([
      {
        ticketKey: 'JIR-101',
        title: 'Setup Node.js & Express REST API Server Architecture',
        description: 'Initialize Modular Express backend with Auth, RBAC, and MongoDB connection.',
        type: 'Task',
        status: 'Done',
        priority: 'High',
        project: project._id,
        sprint: sprint._id,
        assignee: dev._id,
        reporter: lead._id,
        storyPoints: 3,
        tags: ['backend', 'express', 'node']
      },
      {
        ticketKey: 'JIR-102',
        title: 'Build React Drag-and-Drop Kanban Board',
        description: 'Implement modern drag and drop columns using @hello-pangea/dnd with instant status updates.',
        type: 'Story',
        status: 'In Progress',
        priority: 'Highest',
        project: project._id,
        sprint: sprint._id,
        assignee: dev._id,
        reporter: lead._id,
        storyPoints: 8,
        tags: ['frontend', 'react', 'kanban']
      },
      {
        ticketKey: 'JIR-103',
        title: 'Implement Email Notification Engine on Ticket Assignment & @Mentions',
        description: 'Integrate Nodemailer HTML template engine triggering emails on ticket lifecycle events.',
        type: 'Bug',
        status: 'Testing',
        priority: 'High',
        project: project._id,
        sprint: sprint._id,
        assignee: tester._id,
        reporter: lead._id,
        storyPoints: 5,
        tags: ['email', 'nodemailer', 'notifications']
      },
      {
        ticketKey: 'JIR-104',
        title: 'Configure Render Backend & Vercel Frontend CI/CD Pipeline',
        description: 'Write render.yaml, vercel.json, Dockerfile, and GitHub Actions deploy workflows.',
        type: 'Task',
        status: 'To Do',
        priority: 'Medium',
        project: project._id,
        sprint: sprint._id,
        assignee: dev._id,
        reporter: admin._id,
        storyPoints: 5,
        tags: ['devops', 'render', 'vercel', 'github-actions']
      }
    ]);

    console.log('✅ [Seed Success] Initial users, project, weekly sprint, and tickets created successfully!');
  } catch (error) {
    console.error(`[Seed Error] Failed to seed initial data: ${error.message}`);
  }
};

module.exports = { seedInitialData };
