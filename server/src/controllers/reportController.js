'use strict';

const { Op, fn, col, literal } = require('sequelize');
const PDFDocument = require('pdfkit');
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
} = require('docx');

const { Order, OrderItem, Product, User, Category, Review, sequelize } = require('../models');

// ── GET /api/reports/dashboard ─────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      ordersByStatus,
      recentOrders,
      salesByMonth,
      topProducts,
    ] = await Promise.all([
      // Total users
      User.count(),

      // Total active products
      Product.count({ where: { isActive: true } }),

      // Total orders
      Order.count(),

      // Total revenue from delivered orders
      Order.findOne({
        attributes: [[fn('SUM', col('totalAmount')), 'total']],
        where: { status: { [Op.notIn]: ['cancelled'] } },
        raw: true,
      }),

      // Orders by status
      Order.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),

      // Recent 5 orders
      Order.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      }),

      // Sales by month (last 6 months)
      sequelize.query(
        `SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
          COUNT(id)::int AS "orderCount",
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM orders
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          AND status != 'cancelled'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC`,
        { type: sequelize.QueryTypes.SELECT }
      ),

      // Top 10 products by revenue
      sequelize.query(
        `SELECT
          p.id,
          p.name,
          SUM(oi.quantity) AS "totalSold",
          SUM(oi.quantity * oi.price)::float AS revenue
        FROM order_items oi
        JOIN products p ON p.id = oi."productId"
        JOIN orders o ON o.id = oi."orderId"
        WHERE o.status != 'cancelled'
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 10`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    return res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: parseFloat(revenueResult?.total || 0),
      recentOrders,
      ordersByStatus,
      salesByMonth,
      topProducts,
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ── Helpers for sales data ─────────────────────────────────────────────────────

const getSalesData = async (startDate, endDate) => {
  const where = { status: { [Op.notIn]: ['cancelled'] } };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = end;
    }
  }

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);

  const byMonthMap = {};
  orders.forEach((o) => {
    const month = o.createdAt.toISOString().slice(0, 7);
    if (!byMonthMap[month]) byMonthMap[month] = { month, orderCount: 0, revenue: 0 };
    byMonthMap[month].orderCount += 1;
    byMonthMap[month].revenue += parseFloat(o.totalAmount);
  });
  const salesByMonth = Object.values(byMonthMap).sort((a, b) => a.month.localeCompare(b.month));

  const topProductsRaw = await sequelize.query(
    `SELECT
      p.id,
      p.name,
      SUM(oi.quantity)::int AS "totalSold",
      SUM(oi.quantity * oi.price)::float AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi."productId"
    JOIN orders o ON o.id = oi."orderId"
    WHERE o.status != 'cancelled'
      ${startDate ? `AND o."createdAt" >= '${new Date(startDate).toISOString()}'` : ''}
      ${endDate ? `AND o."createdAt" <= '${new Date(endDate).setHours(23, 59, 59, 999) && new Date(endDate).toISOString()}'` : ''}
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 10`,
    { type: sequelize.QueryTypes.SELECT }
  );

  return { orders, totalRevenue, salesByMonth, topProducts: topProductsRaw };
};

const getInventoryData = async () => {
  const products = await Product.findAll({
    include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    order: [['stock', 'ASC']],
  });

  const lowStock = products.filter((p) => p.stock < 10);

  // By category summary
  const byCategoryMap = {};
  products.forEach((p) => {
    const catName = p.category ? p.category.name : 'Uncategorized';
    if (!byCategoryMap[catName]) byCategoryMap[catName] = { category: catName, count: 0, totalStock: 0 };
    byCategoryMap[catName].count += 1;
    byCategoryMap[catName].totalStock += p.stock;
  });
  const byCategory = Object.values(byCategoryMap);

  return { products, lowStock, byCategory };
};

// ── PDF builders ───────────────────────────────────────────────────────────────

const buildSalesPDF = (res, data, startDate, endDate) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="sales-report.pdf"');
  doc.pipe(res);

  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('Sales Report', { align: 'center' });
  doc.moveDown(0.5);
  const period =
    startDate || endDate
      ? `Period: ${startDate || 'beginning'} — ${endDate || 'now'}`
      : 'Period: All time';
  doc.fontSize(11).font('Helvetica').text(period, { align: 'center' });
  doc.moveDown(1);

  // Summary
  doc.fontSize(14).font('Helvetica-Bold').text('Summary');
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Orders: ${data.orders.length}`);
  doc.text(`Total Revenue: $${data.totalRevenue.toFixed(2)}`);
  doc.moveDown(1);

  // Sales by month
  doc.fontSize(14).font('Helvetica-Bold').text('Sales by Month');
  doc.moveDown(0.3);

  const monthColWidths = [180, 140, 140];
  const tableLeft = 50;
  let y = doc.y;

  // Header row
  doc.font('Helvetica-Bold').fontSize(10);
  doc.rect(tableLeft, y, monthColWidths[0], 20).fillAndStroke('#4a90d9', '#4a90d9');
  doc.rect(tableLeft + monthColWidths[0], y, monthColWidths[1], 20).fillAndStroke('#4a90d9', '#4a90d9');
  doc.rect(tableLeft + monthColWidths[0] + monthColWidths[1], y, monthColWidths[2], 20).fillAndStroke('#4a90d9', '#4a90d9');
  doc.fillColor('white');
  doc.text('Month', tableLeft + 5, y + 5, { width: monthColWidths[0] - 10 });
  doc.text('Orders', tableLeft + monthColWidths[0] + 5, y + 5, { width: monthColWidths[1] - 10 });
  doc.text('Revenue', tableLeft + monthColWidths[0] + monthColWidths[1] + 5, y + 5, { width: monthColWidths[2] - 10 });
  y += 20;
  doc.fillColor('black');

  data.salesByMonth.forEach((row, i) => {
    const bg = i % 2 === 0 ? '#f5f5f5' : 'white';
    doc.rect(tableLeft, y, monthColWidths[0] + monthColWidths[1] + monthColWidths[2], 18).fill(bg);
    doc.font('Helvetica').fontSize(9).fillColor('black');
    doc.text(row.month, tableLeft + 5, y + 4, { width: monthColWidths[0] - 10 });
    doc.text(String(row.orderCount), tableLeft + monthColWidths[0] + 5, y + 4, { width: monthColWidths[1] - 10 });
    doc.text(`$${parseFloat(row.revenue).toFixed(2)}`, tableLeft + monthColWidths[0] + monthColWidths[1] + 5, y + 4, { width: monthColWidths[2] - 10 });
    y += 18;

    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
  });

  doc.y = y + 10;
  doc.moveDown(1);

  // Top products
  doc.fontSize(14).font('Helvetica-Bold').text('Top 10 Products by Revenue');
  doc.moveDown(0.3);

  const prodColWidths = [220, 100, 140];
  y = doc.y;

  doc.font('Helvetica-Bold').fontSize(10);
  ['Product', 'Units Sold', 'Revenue'].forEach((header, i) => {
    const x = tableLeft + prodColWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.rect(x, y, prodColWidths[i], 20).fillAndStroke('#4a90d9', '#4a90d9');
    doc.fillColor('white').text(header, x + 5, y + 5, { width: prodColWidths[i] - 10 });
  });
  y += 20;
  doc.fillColor('black');

  data.topProducts.forEach((p, i) => {
    const bg = i % 2 === 0 ? '#f5f5f5' : 'white';
    doc.rect(tableLeft, y, prodColWidths.reduce((a, b) => a + b, 0), 18).fill(bg);
    doc.font('Helvetica').fontSize(9).fillColor('black');
    doc.text(p.name, tableLeft + 5, y + 4, { width: prodColWidths[0] - 10 });
    doc.text(String(p.totalSold), tableLeft + prodColWidths[0] + 5, y + 4, { width: prodColWidths[1] - 10 });
    doc.text(`$${parseFloat(p.revenue).toFixed(2)}`, tableLeft + prodColWidths[0] + prodColWidths[1] + 5, y + 4, { width: prodColWidths[2] - 10 });
    y += 18;

    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
  });

  doc.end();
};

const buildInventoryPDF = (res, data) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.pdf"');
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('Inventory Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(1);

  // Low stock alerts
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#c0392b').text(`Low Stock Alerts (< 10 units): ${data.lowStock.length} products`);
  doc.fillColor('black').moveDown(0.5);

  if (data.lowStock.length > 0) {
    data.lowStock.forEach((p) => {
      doc.fontSize(10).font('Helvetica').text(`• ${p.name} — Stock: ${p.stock}`, { indent: 10 });
    });
  } else {
    doc.fontSize(10).font('Helvetica').text('No low stock products.', { indent: 10 });
  }
  doc.moveDown(1);

  // By category
  doc.fontSize(14).font('Helvetica-Bold').text('Stock by Category');
  doc.moveDown(0.3);

  const catColWidths = [220, 100, 140];
  const tableLeft = 50;
  let y = doc.y;

  doc.font('Helvetica-Bold').fontSize(10);
  ['Category', 'Products', 'Total Stock'].forEach((header, i) => {
    const x = tableLeft + catColWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.rect(x, y, catColWidths[i], 20).fillAndStroke('#27ae60', '#27ae60');
    doc.fillColor('white').text(header, x + 5, y + 5, { width: catColWidths[i] - 10 });
  });
  y += 20;
  doc.fillColor('black');

  data.byCategory.forEach((cat, i) => {
    const bg = i % 2 === 0 ? '#f5f5f5' : 'white';
    doc.rect(tableLeft, y, catColWidths.reduce((a, b) => a + b, 0), 18).fill(bg);
    doc.font('Helvetica').fontSize(9).fillColor('black');
    doc.text(cat.category, tableLeft + 5, y + 4, { width: catColWidths[0] - 10 });
    doc.text(String(cat.count), tableLeft + catColWidths[0] + 5, y + 4, { width: catColWidths[1] - 10 });
    doc.text(String(cat.totalStock), tableLeft + catColWidths[0] + catColWidths[1] + 5, y + 4, { width: catColWidths[2] - 10 });
    y += 18;
  });

  doc.y = y + 10;
  doc.moveDown(1);

  // All products table
  doc.fontSize(14).font('Helvetica-Bold').text('All Products');
  doc.moveDown(0.3);

  const prodColWidths = [190, 120, 80, 80];
  y = doc.y;

  doc.font('Helvetica-Bold').fontSize(9);
  ['Product Name', 'Category', 'Stock', 'Price'].forEach((header, i) => {
    const x = tableLeft + prodColWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.rect(x, y, prodColWidths[i], 20).fillAndStroke('#27ae60', '#27ae60');
    doc.fillColor('white').text(header, x + 5, y + 5, { width: prodColWidths[i] - 10 });
  });
  y += 20;
  doc.fillColor('black');

  data.products.forEach((p, i) => {
    const isLow = p.stock < 10;
    const bg = isLow ? '#fde8e8' : i % 2 === 0 ? '#f5f5f5' : 'white';
    doc.rect(tableLeft, y, prodColWidths.reduce((a, b) => a + b, 0), 18).fill(bg);
    doc.font('Helvetica').fontSize(8).fillColor(isLow ? '#c0392b' : 'black');
    doc.text(p.name, tableLeft + 5, y + 4, { width: prodColWidths[0] - 10 });
    doc.text(p.category ? p.category.name : '-', tableLeft + prodColWidths[0] + 5, y + 4, { width: prodColWidths[1] - 10 });
    doc.text(String(p.stock), tableLeft + prodColWidths[0] + prodColWidths[1] + 5, y + 4, { width: prodColWidths[2] - 10 });
    doc.text(`$${parseFloat(p.price).toFixed(2)}`, tableLeft + prodColWidths[0] + prodColWidths[1] + prodColWidths[2] + 5, y + 4, { width: prodColWidths[3] - 10 });
    y += 18;
    doc.fillColor('black');

    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }
  });

  doc.end();
};

// ── DOCX builders ──────────────────────────────────────────────────────────────

const makeBorderless = () => ({
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
  insideH: { style: BorderStyle.NONE, size: 0 },
  insideV: { style: BorderStyle.NONE, size: 0 },
});

const makeHeaderCell = (text) =>
  new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF' })] })],
    shading: { fill: '4A90D9' },
    borders: makeBorderless(),
  });

const makeCell = (text, shade) =>
  new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: String(text) })] })],
    shading: shade ? { fill: 'F5F5F5' } : undefined,
    borders: makeBorderless(),
  });

const buildSalesDOCX = async (res, data, startDate, endDate) => {
  const period =
    startDate || endDate
      ? `Period: ${startDate || 'beginning'} — ${endDate || 'now'}`
      : 'All time';

  const monthRows = data.salesByMonth.map((row, i) => [
    new TableRow({
      children: [
        makeCell(row.month, i % 2 === 0),
        makeCell(row.orderCount, i % 2 === 0),
        makeCell(`$${parseFloat(row.revenue).toFixed(2)}`, i % 2 === 0),
      ],
    }),
  ]);

  const topProdRows = data.topProducts.map((p, i) => [
    new TableRow({
      children: [
        makeCell(p.name, i % 2 === 0),
        makeCell(p.totalSold, i % 2 === 0),
        makeCell(`$${parseFloat(p.revenue).toFixed(2)}`, i % 2 === 0),
      ],
    }),
  ]);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Sales Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: period, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun(`Total Orders: ${data.orders.length}`)] }),
          new Paragraph({ children: [new TextRun(`Total Revenue: $${data.totalRevenue.toFixed(2)}`)] }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Sales by Month', heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeHeaderCell('Month'),
                  makeHeaderCell('Orders'),
                  makeHeaderCell('Revenue'),
                ],
                tableHeader: true,
              }),
              ...monthRows.flat(),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Top 10 Products by Revenue', heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeHeaderCell('Product'),
                  makeHeaderCell('Units Sold'),
                  makeHeaderCell('Revenue'),
                ],
                tableHeader: true,
              }),
              ...topProdRows.flat(),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename="sales-report.docx"');
  res.send(buffer);
};

const buildInventoryDOCX = async (res, data) => {
  const catRows = data.byCategory.map((cat, i) =>
    new TableRow({
      children: [
        makeCell(cat.category, i % 2 === 0),
        makeCell(cat.count, i % 2 === 0),
        makeCell(cat.totalStock, i % 2 === 0),
      ],
    })
  );

  const prodRows = data.products.map((p, i) =>
    new TableRow({
      children: [
        makeCell(p.name, i % 2 === 0),
        makeCell(p.category ? p.category.name : '-', i % 2 === 0),
        makeCell(p.stock, i % 2 === 0),
        makeCell(`$${parseFloat(p.price).toFixed(2)}`, i % 2 === 0),
      ],
    })
  );

  const lowStockItems = data.lowStock.map(
    (p) =>
      new Paragraph({
        children: [
          new TextRun({ text: `• ${p.name} — Stock: ${p.stock}`, color: 'C0392B' }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Inventory Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Generated: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Low Stock Alerts (< 10 units): ${data.lowStock.length} products`,
                bold: true,
                color: 'C0392B',
              }),
            ],
          }),
          ...(lowStockItems.length > 0
            ? lowStockItems
            : [new Paragraph({ text: 'No low stock products.' })]),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Stock by Category', heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeHeaderCell('Category'),
                  makeHeaderCell('Products'),
                  makeHeaderCell('Total Stock'),
                ],
                tableHeader: true,
              }),
              ...catRows,
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'All Products', heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeHeaderCell('Product Name'),
                  makeHeaderCell('Category'),
                  makeHeaderCell('Stock'),
                  makeHeaderCell('Price'),
                ],
                tableHeader: true,
              }),
              ...prodRows,
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.docx"');
  res.send(buffer);
};

// ── GET /api/reports/sales ─────────────────────────────────────────────────────
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const data = await getSalesData(startDate, endDate);

    if (format === 'pdf') {
      return buildSalesPDF(res, data, startDate, endDate);
    }

    if (format === 'docx') {
      return buildSalesDOCX(res, data, startDate, endDate);
    }

    // JSON default
    return res.status(200).json({
      orders: data.orders,
      totalRevenue: data.totalRevenue,
      salesByMonth: data.salesByMonth,
      topProducts: data.topProducts,
    });
  } catch (error) {
    console.error('getSalesReport error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/reports/inventory ─────────────────────────────────────────────────
const getInventoryReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const data = await getInventoryData();

    if (format === 'pdf') {
      return buildInventoryPDF(res, data);
    }

    if (format === 'docx') {
      return buildInventoryDOCX(res, data);
    }

    return res.status(200).json({
      products: data.products,
      lowStockAlerts: data.lowStock,
      byCategory: data.byCategory,
      totalProducts: data.products.length,
      lowStockCount: data.lowStock.length,
    });
  } catch (error) {
    console.error('getInventoryReport error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getDashboard, getSalesReport, getInventoryReport };
