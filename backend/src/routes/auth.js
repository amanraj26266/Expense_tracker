const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const config = require('../config/env');
const Company = require('../models/Company');
const User = require('../models/User');
const Invite = require('../models/Invite');
const { hashToken } = require('../utils/crypto');
const { slugify } = require('../utils/slug');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const registerCompanySchema = z.object({
  companyName: z.string().min(2).max(80),
  adminName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const acceptInviteSchema = z.object({
  inviteToken: z.string().min(10),
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z.string().min(6).max(128),
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      companyId: user.companyId.toString(),
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function generateUniqueSlug(companyName) {
  const baseSlug = slugify(companyName);
  let candidate = baseSlug;
  let count = 1;

  while (await Company.exists({ slug: candidate })) {
    count += 1;
    candidate = `${baseSlug}-${count}`;
  }

  return candidate;
}

router.post('/register-company', async (req, res, next) => {
  try {
    const body = registerCompanySchema.parse(req.body);

    const existingUser = await User.findOne({ email: body.email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    const company = await Company.create({
      name: body.companyName,
      slug: await generateUniqueSlug(body.companyName),
    });

    const user = await User.create({
      companyId: company._id,
      name: body.adminName,
      email: body.email.toLowerCase(),
      passwordHash: await bcrypt.hash(body.password, 12),
      role: 'company_admin',
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        companyId: user.companyId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const company = await Company.findById(user.companyId).select('name slug');
    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        companyId: user.companyId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: company
        ? {
            id: company._id,
            name: company.name,
            slug: company.slug,
          }
        : null,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/accept-invite', async (req, res, next) => {
  try {
    const body = acceptInviteSchema.parse(req.body);

    const invite = await Invite.findOne({ tokenHash: hashToken(body.inviteToken) });
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (invite.acceptedAt) {
      return res.status(409).json({ message: 'Invite already accepted' });
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: 'Invite expired' });
    }

    if (invite.email !== body.email.toLowerCase()) {
      return res.status(400).json({ message: 'Invite email does not match' });
    }

    const existingUser = await User.findOne({ email: body.email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    const user = await User.create({
      companyId: invite.companyId,
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash: await bcrypt.hash(body.password, 12),
      role: invite.role,
    });

    invite.acceptedAt = new Date();
    await invite.save();

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        companyId: user.companyId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const company = await Company.findById(req.auth.user.companyId).select('name slug');
  res.json({
    user: req.auth.user,
    company: company
      ? {
          id: company._id,
          name: company.name,
          slug: company.slug,
        }
      : null,
  });
});

module.exports = router;
