'use strict';

const { Category, Product, sequelize } = require('../models');

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parentId: null },
      include: [
        {
          model: Category,
          as: 'subcategories',
          include: [{ model: Category, as: 'subcategories' }],
        },
      ],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error('getAllCategories error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'subcategories' },
        { model: Category, as: 'parent' },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const productCount = await Product.count({
      where: { categoryId: category.id, isActive: true },
    });

    return res.status(200).json({ category: { ...category.toJSON(), productCount } });
  } catch (error) {
    console.error('getCategoryById error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found.' });
      }
    }

    const category = await Category.create({
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      parentId: parentId || null,
    });

    return res.status(201).json({ message: 'Category created.', category });
  } catch (error) {
    console.error('createCategory error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const { name, description, imageUrl, parentId } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    if (parentId !== undefined) {
      if (parentId === null) {
        updates.parentId = null;
      } else {
        if (parseInt(parentId) === category.id) {
          return res.status(400).json({ message: 'Category cannot be its own parent.' });
        }
        const parent = await Category.findByPk(parentId);
        if (!parent) {
          return res.status(400).json({ message: 'Parent category not found.' });
        }
        updates.parentId = parentId;
      }
    }

    await category.update(updates);
    const updated = await Category.findByPk(category.id, {
      include: [{ model: Category, as: 'parent' }],
    });

    return res.status(200).json({ message: 'Category updated.', category: updated });
  } catch (error) {
    console.error('updateCategory error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const productCount = await Product.count({ where: { categoryId: category.id } });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${productCount} associated product(s). Reassign or delete products first.`,
      });
    }

    await category.destroy();
    return res.status(200).json({ message: 'Category deleted.' });
  } catch (error) {
    console.error('deleteCategory error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
