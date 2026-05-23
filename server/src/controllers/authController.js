'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role ? user.role.name : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Email, password, firstName and lastName are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const customerRole = await Role.findOne({ where: { name: 'customer' } });
    if (!customerRole) {
      return res.status(500).json({ message: 'Default role not found. Please seed the database.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      roleId: customerRole.id,
    });

    const userWithRole = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] },
    });

    const token = generateToken(userWithRole);

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: userWithRole,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, getMe };
