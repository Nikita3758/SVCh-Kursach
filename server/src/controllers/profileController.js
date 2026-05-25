'use strict';

const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { firstName, lastName, phone, avatar } = req.body;

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    // If a file was uploaded via multer
    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    await user.update(updates);

    const updated = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json({ message: 'Profile updated.', user: updated });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/profile/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashed });

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
