'use strict';

const { Op } = require('sequelize');
const { User, Role } = require('../models');

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      users: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { firstName, lastName, phone, avatar, roleId } = req.body;

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    // Admin can change role
    if (roleId !== undefined) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Role not found.' });
      }
      updates.roleId = roleId;
    }

    await user.update(updates);

    const updated = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json({ message: 'User updated.', user: updated });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account via this endpoint.' });
    }

    await user.destroy();
    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
