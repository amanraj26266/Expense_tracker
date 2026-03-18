const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const config = require('../config/env');
const Invite = require('../models/Invite');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateInviteToken, hashToken } = require('../utils/crypto');

const router = express.Router();

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['employee', 'company_admin']).default('employee'),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  role: z.enum(['employee', 'company_admin']).default('employee'),
});

router.use(requireAuth);

router.get('/', requireRole('company_admin'), async (req, res, next) => {
  try {
    const users = await User.find({ companyId: req.auth.companyId, isActive: true })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireRole('company_admin'), async (req, res, next) => {
  try {
    const body = createUserSchema.parse(req.body);
    const normalizedEmail = body.email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({
      companyId: req.auth.companyId,
      name: body.name,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(body.password, 12),
      role: body.role,
    });

    return res.status(201).json({
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

router.post('/invite', requireRole('company_admin'), async (req, res, next) => {
  try {
    const body = inviteSchema.parse(req.body);
    const normalizedEmail = body.email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    await Invite.deleteMany({
      companyId: req.auth.companyId,
      email: normalizedEmail,
      acceptedAt: null,
    });

    const inviteToken = generateInviteToken();
    const tokenHash = hashToken(inviteToken);

    const invite = await Invite.create({
      companyId: req.auth.companyId,
      email: normalizedEmail,
      role: body.role,
      tokenHash,
      invitedBy: req.auth.userId,
      expiresAt: new Date(Date.now() + config.inviteTtlHours * 60 * 60 * 1000),
    });

    return res.status(201).json({
      message: 'Invite created',
      invite: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
      inviteToken,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
