const bcrypt = require('bcryptjs');

const { connectDB } = require('../src/config/db');
const Company = require('../src/models/Company');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');

async function ensureCompany({ name, slug }) {
  let company = await Company.findOne({ slug });
  if (!company) {
    company = await Company.create({ name, slug, isActive: true });
  }
  return company;
}

async function ensureUser({ companyId, name, email, password, role }) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      companyId,
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: true,
    });
    return user;
  }

  user.companyId = companyId;
  user.name = name;
  user.passwordHash = passwordHash;
  user.role = role;
  user.isActive = true;
  await user.save();
  return user;
}

async function ensureSampleExpense({ companyId, userId, createdBy }) {
  const existing = await Expense.findOne({
    companyId,
    userId,
    title: 'Welcome expense',
  });

  if (!existing) {
    await Expense.create({
      companyId,
      userId,
      createdBy,
      title: 'Welcome expense',
      amount: 199,
      category: 'Food & Drink',
      note: 'Seed data',
      date: new Date(),
    });
  }
}

async function run() {
  await connectDB();

  const amanCompany = await ensureCompany({
    name: 'Aman Technologies',
    slug: 'aman-technologies',
  });

  const zenCompany = await ensureCompany({
    name: 'Zen Logistics',
    slug: 'zen-logistics',
  });

  const amanAdmin = await ensureUser({
    companyId: amanCompany._id,
    name: 'Aman Admin',
    email: 'aman@gmail.com',
    password: 'aman123',
    role: 'company_admin',
  });

  const amanEmployee = await ensureUser({
    companyId: amanCompany._id,
    name: 'Aman Employee',
    email: 'employee@aman.com',
    password: 'aman123',
    role: 'employee',
  });

  await ensureUser({
    companyId: zenCompany._id,
    name: 'Zen Admin',
    email: 'admin@zen.com',
    password: 'aman123',
    role: 'company_admin',
  });

  await ensureSampleExpense({
    companyId: amanCompany._id,
    userId: amanEmployee._id,
    createdBy: amanAdmin._id,
  });

  console.log('Seed complete');
  console.log('Login 1: aman@gmail.com / aman123 (company admin)');
  console.log('Login 2: employee@aman.com / aman123 (employee)');
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
