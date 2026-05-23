'use strict';

const { Op, fn, col, literal } = require('sequelize');
const { Product, ProductImage, Category, Review, User, sequelize } = require('../models');

// ── helpers ────────────────────────────────────────────────────────────────────

const buildOrderClause = (sort) => {
  switch (sort) {
    case 'price_asc':
      return [['price', 'ASC']];
    case 'price_desc':
      return [['price', 'DESC']];
    case 'name_asc':
      return [['name', 'ASC']];
    case 'name_desc':
      return [['name', 'DESC']];
    case 'newest':
      return [['createdAt', 'DESC']];
    case 'rating':
      return [[literal('"avgRating"'), 'DESC NULLS LAST']];
    default:
      return [['createdAt', 'DESC']];
  }
};

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { category, minPrice, maxPrice, material, sort, search } = req.query;

    const where = {};

    // Only admins can see inactive products
    if (!req.user || req.user.role.name !== 'admin') {
      where.isActive = true;
    } else if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (material) {
      where.material = { [Op.iLike]: `%${material}%` };
    }

    const orderClause = buildOrderClause(sort);

    const { count, rows } = await Product.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            literal(
              `(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r."productId" = "Product".id)`
            ),
            'avgRating',
          ],
        ],
      },
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { isMain: true },
          required: false,
          attributes: ['id', 'url', 'isMain'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: orderClause,
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      products: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: {
        include: [
          [
            literal(
              `(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r."productId" = "Product".id)`
            ),
            'avgRating',
          ],
          [
            literal(
              `(SELECT COUNT(r.id) FROM reviews r WHERE r."productId" = "Product".id)`
            ),
            'reviewCount',
          ],
        ],
      },
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'isMain'],
          order: [['isMain', 'DESC']],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'avatar'],
            },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Non-admins cannot see inactive products
    if (!product.isActive && (!req.user || req.user.role.name !== 'admin')) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, price, stock, categoryId, material, dimensions, weight, isActive, imageUrls } =
      req.body;

    if (!name || price === undefined) {
      await t.rollback();
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    if (categoryId) {
      const cat = await Category.findByPk(categoryId, { transaction: t });
      if (!cat) {
        await t.rollback();
        return res.status(400).json({ message: 'Category not found.' });
      }
    }

    const product = await Product.create(
      {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: stock !== undefined ? parseInt(stock) : 0,
        categoryId: categoryId || null,
        material: material || null,
        dimensions: dimensions || null,
        weight: weight !== undefined ? parseFloat(weight) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      { transaction: t }
    );

    // Handle image URLs from body
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url, index) => ({
        productId: product.id,
        url,
        isMain: index === 0,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction: t });
    }

    // Handle uploaded files via multer
    if (req.files && req.files.length > 0) {
      const fileRecords = req.files.map((file, index) => ({
        productId: product.id,
        url: `/uploads/${file.filename}`,
        isMain: !imageUrls || imageUrls.length === 0 ? index === 0 : false,
      }));
      await ProductImage.bulkCreate(fileRecords, { transaction: t });
    }

    await t.commit();

    const created = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    return res.status(201).json({ message: 'Product created.', product: created });
  } catch (error) {
    await t.rollback();
    console.error('createProduct error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(req.params.id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Product not found.' });
    }

    const { name, description, price, stock, categoryId, material, dimensions, weight, isActive, imageUrls } =
      req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (material !== undefined) updates.material = material;
    if (dimensions !== undefined) updates.dimensions = dimensions;
    if (weight !== undefined) updates.weight = parseFloat(weight);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    if (categoryId !== undefined) {
      if (categoryId === null) {
        updates.categoryId = null;
      } else {
        const cat = await Category.findByPk(categoryId, { transaction: t });
        if (!cat) {
          await t.rollback();
          return res.status(400).json({ message: 'Category not found.' });
        }
        updates.categoryId = categoryId;
      }
    }

    await product.update(updates, { transaction: t });

    // Replace images if new ones supplied
    if (Array.isArray(imageUrls)) {
      await ProductImage.destroy({ where: { productId: product.id }, transaction: t });
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          productId: product.id,
          url,
          isMain: index === 0,
        }));
        await ProductImage.bulkCreate(imageRecords, { transaction: t });
      }
    }

    await t.commit();

    const updated = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    return res.status(200).json({ message: 'Product updated.', product: updated });
  } catch (error) {
    await t.rollback();
    console.error('updateProduct error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const orderItemsCount = await sequelize.models.OrderItem.count({ where: { productId: product.id } });
    if (orderItemsCount > 0) {
      return res.status(400).json({ 
        message: 'Невозможно удалить товар, так как он уже есть в заказах. Вы можете только деактивировать его.',
        code: 'HAS_ORDERS'
      });
    }

    await sequelize.models.ProductImage.destroy({ where: { productId: product.id } });
    await sequelize.models.CartItem.destroy({ where: { productId: product.id } });
    await sequelize.models.Favorite.destroy({ where: { productId: product.id } });
    await sequelize.models.Review.destroy({ where: { productId: product.id } });

    await product.destroy();
    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
