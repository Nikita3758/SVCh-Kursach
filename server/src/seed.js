'use strict';

require('dotenv').config();

const bcrypt = require('bcryptjs');
const {
  sequelize,
  Role,
  User,
  Category,
  Product,
  ProductImage,
  Order,
  OrderItem,
  Favorite,
  Review,
} = require('./models');

async function seed() {
  try {
    // Connect & sync
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ force: false, alter: true });
    console.log('Database synced.');

    const t = await sequelize.transaction();

    try {
      // ── Roles ──────────────────────────────────────────────────────────────────
      const [adminRole] = await Role.findOrCreate({ where: { id: 1 }, defaults: { id: 1, name: 'admin' }, transaction: t });
      const [customerRole] = await Role.findOrCreate({ where: { id: 2 }, defaults: { id: 2, name: 'customer' }, transaction: t });
      console.log('Roles seeded.');

      // ── Users ──────────────────────────────────────────────────────────────────
      const hashedPassword = await bcrypt.hash('password123', 10);

      const [admin] = await User.findOrCreate({
        where: { email: 'admin@mebeldom.ru' },
        defaults: { email: 'admin@mebeldom.ru', password: hashedPassword, firstName: 'Александр', lastName: 'Петров', phone: '+7(999)123-45-67', roleId: 1 },
        transaction: t,
      });

      const [customer1] = await User.findOrCreate({
        where: { email: 'ivan@mail.ru' },
        defaults: { email: 'ivan@mail.ru', password: hashedPassword, firstName: 'Иван', lastName: 'Сидоров', phone: '+7(916)555-12-34', roleId: 2 },
        transaction: t,
      });

      const [customer2] = await User.findOrCreate({
        where: { email: 'maria@mail.ru' },
        defaults: { email: 'maria@mail.ru', password: hashedPassword, firstName: 'Мария', lastName: 'Козлова', phone: '+7(926)777-88-99', roleId: 2 },
        transaction: t,
      });

      const [customer3] = await User.findOrCreate({
        where: { email: 'dmitry@mail.ru' },
        defaults: { email: 'dmitry@mail.ru', password: hashedPassword, firstName: 'Дмитрий', lastName: 'Волков', phone: '+7(903)111-22-33', roleId: 2 },
        transaction: t,
      });

      console.log('Users seeded.');

      // ── Categories ─────────────────────────────────────────────────────────────
      const categoriesData = [
        { name: 'Диваны', description: 'Мягкие диваны для гостиной и спальни' },
        { name: 'Столы', description: 'Обеденные, журнальные и письменные столы' },
        { name: 'Стулья', description: 'Стулья для дома и офиса' },
        { name: 'Шкафы', description: 'Шкафы-купе и гардеробные' },
        { name: 'Кресла', description: 'Мягкие кресла и кресла-качалки' },
        { name: 'Кровати', description: 'Двуспальные и односпальные кровати' },
        { name: 'Стеллажи', description: 'Книжные стеллажи и полки' },
        { name: 'Комоды', description: 'Комоды и тумбы для хранения' },
      ];

      const categories = [];
      for (const cat of categoriesData) {
        const [c] = await Category.findOrCreate({
          where: { name: cat.name },
          defaults: cat,
          transaction: t,
        });
        categories.push(c);
      }
      console.log('Categories seeded.');

      // ── Products ───────────────────────────────────────────────────────────────
      const productsData = [
        // Диваны (categories[0])
        { name: 'Угловой диван Честер', price: 89900, stock: 5, material: 'Натуральная кожа', dimensions: '280x180x90 см', weight: 95, description: 'Роскошный угловой диван с каретной стяжкой в классическом стиле. Механизм трансформации для комфортного сна.', categoryId: categories[0].id, isActive: true },
        { name: 'Диван-кровать Скандинавия', price: 54900, stock: 8, material: 'Рогожка', dimensions: '220x95x85 см', weight: 65, description: 'Компактный раскладной диван в скандинавском стиле. Идеален для небольших гостиных.', categoryId: categories[0].id, isActive: true },
        { name: 'Модульный диван Лофт', price: 124900, stock: 3, material: 'Велюр', dimensions: '320x160x75 см', weight: 110, description: 'Большой модульный диван с возможностью комбинирования секций. Современный дизайн.', categoryId: categories[0].id, isActive: true },
        // Столы (categories[1])
        { name: 'Обеденный стол Мрамор', price: 45900, stock: 10, material: 'МДФ/мрамор', dimensions: '160x90x76 см', weight: 45, description: 'Элегантный обеденный стол с мраморной столешницей на 6-8 персон.', categoryId: categories[1].id, isActive: true },
        { name: 'Журнальный стол Геометрия', price: 18900, stock: 15, material: 'Закалённое стекло/металл', dimensions: '120x60x45 см', weight: 18, description: 'Современный журнальный стол с геометрическим основанием.', categoryId: categories[1].id, isActive: true },
        { name: 'Письменный стол Дуб', price: 32900, stock: 7, material: 'Массив дуба', dimensions: '140x70x75 см', weight: 35, description: 'Рабочий стол из натурального дуба с двумя выдвижными ящиками.', categoryId: categories[1].id, isActive: true },
        // Стулья (categories[2])
        { name: 'Стул обеденный Модерн', price: 8900, stock: 24, material: 'Бук/экокожа', dimensions: '45x52x88 см', weight: 5, description: 'Элегантный обеденный стул с мягким сиденьем и спинкой.', categoryId: categories[2].id, isActive: true },
        { name: 'Барный стул Лофт', price: 12900, stock: 12, material: 'Металл/дерево', dimensions: '43x43x105 см', weight: 7, description: 'Барный стул в индустриальном стиле с регулируемой высотой.', categoryId: categories[2].id, isActive: true },
        // Шкафы (categories[3])
        { name: 'Шкаф-купе Зеркальный', price: 67900, stock: 4, material: 'ЛДСП/зеркало', dimensions: '240x60x220 см', weight: 120, description: 'Вместительный шкаф-купе с зеркальными дверями и внутренней подсветкой.', categoryId: categories[3].id, isActive: true },
        { name: 'Гардеробная система Модуль', price: 94900, stock: 2, material: 'ЛДСП/МДФ', dimensions: '300x60x240 см', weight: 150, description: 'Полноценная гардеробная система с антресолями и выдвижными корзинами.', categoryId: categories[3].id, isActive: true },
        // Кресла (categories[4])
        { name: 'Кресло Barcelona', price: 34900, stock: 6, material: 'Натуральная кожа/хром', dimensions: '75x77x82 см', weight: 25, description: 'Классическое дизайнерское кресло в стиле Мис ван дер Роэ.', categoryId: categories[4].id, isActive: true },
        { name: 'Кресло-качалка Уют', price: 28900, stock: 8, material: 'Массив берёзы/ткань', dimensions: '70x95x100 см', weight: 15, description: 'Удобное кресло-качалка для расслабления с мягкой подушкой.', categoryId: categories[4].id, isActive: true },
        { name: 'Кресло офисное Директор', price: 42900, stock: 5, material: 'Экокожа/металл', dimensions: '70x70x120 см', weight: 22, description: 'Эргономичное офисное кресло с поддержкой поясницы и подголовником.', categoryId: categories[4].id, isActive: true },
        // Кровати (categories[5])
        { name: 'Кровать двуспальная Классика', price: 56900, stock: 6, material: 'Массив сосны/ткань', dimensions: '180x200x110 см', weight: 80, description: 'Двуспальная кровать с мягким изголовьем и подъёмным механизмом.', categoryId: categories[5].id, isActive: true },
        { name: 'Кровать односпальная Минимализм', price: 29900, stock: 10, material: 'ЛДСП/ткань', dimensions: '100x200x90 см', weight: 45, description: 'Компактная кровать в стиле минимализм с ящиками для хранения.', categoryId: categories[5].id, isActive: true },
        // Стеллажи (categories[6])
        { name: 'Стеллаж книжный Библиотека', price: 24900, stock: 9, material: 'МДФ/металл', dimensions: '100x35x200 см', weight: 30, description: 'Высокий стеллаж с открытыми полками для книг и декора.', categoryId: categories[6].id, isActive: true },
        { name: 'Стеллаж-перегородка Лофт', price: 36900, stock: 4, material: 'Металл/дерево', dimensions: '150x40x180 см', weight: 35, description: 'Стеллаж в стиле лофт, используется как зонирующая перегородка.', categoryId: categories[6].id, isActive: true },
        // Комоды (categories[7])
        { name: 'Комод Прованс', price: 31900, stock: 7, material: 'Массив берёзы', dimensions: '120x45x85 см', weight: 40, description: 'Комод в стиле прованс с резными ручками и патиной.', categoryId: categories[7].id, isActive: true },
        { name: 'Тумба прикроватная Модерн', price: 11900, stock: 14, material: 'МДФ', dimensions: '50x40x55 см', weight: 12, description: 'Компактная прикроватная тумба с двумя ящиками.', categoryId: categories[7].id, isActive: true },
        { name: 'Комод широкий Скандинавия', price: 38900, stock: 5, material: 'Массив дуба/МДФ', dimensions: '160x45x80 см', weight: 50, description: 'Широкий комод в скандинавском стиле с шестью ящиками.', categoryId: categories[7].id, isActive: true },
      ];

      const products = [];
      for (const prod of productsData) {
        const [p] = await Product.findOrCreate({
          where: { name: prod.name },
          defaults: prod,
          transaction: t,
        });
        products.push(p);
      }
      console.log('Products seeded.');

      // ── Product Images ─────────────────────────────────────────────────────────
      const furnitureImages = [
        // Диваны
        '/images/Угловой диван Честер.jpg',
        '/images/Диван-кровать Скандинавия.jfif',
        '/images/Модульный диван Лоф.jpg',
        // Столы
        '/images/Обеденный стол Мрамор.png',
        '/images/Журнальный стол Геометрия.jfif',
        '/images/Письменный стол Дуб.jpg',
        // Стулья
        '/images/Стул обеденный Модерн.jfif',
        '/images/Барный стул Лофт.jpg',
        // Шкафы
        '/images/Шкаф-купе Зеркальный.jpg',
        '/images/Гардеробная система Модуль.jpg',
        // Кресла
        '/images/Кресло Barcelona.jpg',
        '/images/Кресло-качалка Уют.jfif',
        '/images/Кресло офисное Директор.jfif',
        // Кровати
        '/images/Кровать двуспальная Классика.jpg',
        '/images/Кровать односпальная Минимализм.jpg',
        // Стеллажи
        '/images/Стеллаж книжный Библиотека.jpg',
        '/images/Стеллаж-перегородка Лофт.jpg',
        // Комоды
        '/images/Комод Прованс.jpg',
        '/images/Тумба прикроватная Модерн.jpg',
        '/images/Комод широкий Скандинавия.jpg',
      ];

      for (let i = 0; i < products.length; i++) {
        const imageUrl = furnitureImages[i] || furnitureImages[0];
        const [img, created] = await ProductImage.findOrCreate({
          where: { productId: products[i].id, isMain: true },
          defaults: { productId: products[i].id, url: imageUrl, isMain: true },
          transaction: t,
        });
        if (!created) {
          await img.update({ url: imageUrl }, { transaction: t });
        }
      }
      console.log('Product images seeded.');

      // ── Orders ─────────────────────────────────────────────────────────────────
      // Helper: product index is 0-based
      const ordersData = [
        {
          userId: customer1.id,
          status: 'delivered',
          deliveryAddress: 'Москва, ул. Ленина, д. 15, кв. 42',
          items: [
            { productIdx: 0, quantity: 1 }, // product 1
            { productIdx: 6, quantity: 4 }, // product 7
          ],
        },
        {
          userId: customer1.id,
          status: 'processing',
          deliveryAddress: 'Москва, ул. Ленина, д. 15, кв. 42',
          items: [
            { productIdx: 3, quantity: 1 }, // product 4
          ],
        },
        {
          userId: customer2.id,
          status: 'shipped',
          deliveryAddress: 'Санкт-Петербург, пр. Невский, д. 88, кв. 12',
          items: [
            { productIdx: 10, quantity: 1 }, // product 11
            { productIdx: 17, quantity: 1 }, // product 18
          ],
        },
        {
          userId: customer2.id,
          status: 'pending',
          deliveryAddress: 'Санкт-Петербург, пр. Невский, д. 88, кв. 12',
          items: [
            { productIdx: 13, quantity: 1 }, // product 14
            { productIdx: 18, quantity: 2 }, // product 19
          ],
        },
        {
          userId: customer3.id,
          status: 'cancelled',
          deliveryAddress: 'Казань, ул. Баумана, д. 5',
          items: [
            { productIdx: 1, quantity: 1 }, // product 2
          ],
        },
      ];

      for (const orderData of ordersData) {
        // Calculate total
        let totalAmount = 0;
        for (const item of orderData.items) {
          totalAmount += Number(products[item.productIdx].price) * item.quantity;
        }

        const order = await Order.create({
          userId: orderData.userId,
          status: orderData.status,
          totalAmount,
          deliveryAddress: orderData.deliveryAddress,
        }, { transaction: t });

        for (const item of orderData.items) {
          await OrderItem.create({
            orderId: order.id,
            productId: products[item.productIdx].id,
            quantity: item.quantity,
            price: products[item.productIdx].price,
          }, { transaction: t });
        }
      }
      console.log('Orders seeded.');

      // ── Reviews ────────────────────────────────────────────────────────────────
      const reviewsData = [
        { userId: customer1.id, productId: products[0].id, rating: 5, comment: 'Отличный диван! Кожа мягкая, сидеть очень удобно. Механизм трансформации работает плавно.' },
        { userId: customer2.id, productId: products[0].id, rating: 4, comment: 'Хороший диван, но доставка заняла больше времени чем обещали.' },
        { userId: customer1.id, productId: products[3].id, rating: 5, comment: 'Стол выглядит потрясающе. Мраморная столешница очень красивая.' },
        { userId: customer2.id, productId: products[10].id, rating: 5, comment: 'Кресло Barcelona — это произведение искусства. Очень стильное и удобное.' },
        { userId: customer3.id, productId: products[6].id, rating: 4, comment: 'Хорошие стулья за свою цену. Сборка простая.' },
        { userId: customer3.id, productId: products[13].id, rating: 5, comment: 'Спим на этой кровати уже месяц — очень довольны. Подъёмный механизм удобный.' },
        { userId: customer1.id, productId: products[17].id, rating: 4, comment: 'Красивый комод, но ручки немного шатаются. В целом доволен.' },
        { userId: customer2.id, productId: products[15].id, rating: 5, comment: 'Стеллаж отлично вписался в интерьер. Качество на высоте.' },
      ];

      for (const rev of reviewsData) {
        await Review.findOrCreate({
          where: { userId: rev.userId, productId: rev.productId },
          defaults: rev,
          transaction: t,
        });
      }
      console.log('Reviews seeded.');

      // ── Favorites ──────────────────────────────────────────────────────────────
      const favoritesData = [
        { userId: customer1.id, productId: products[0].id },   // product 1
        { userId: customer1.id, productId: products[3].id },   // product 4
        { userId: customer1.id, productId: products[10].id },  // product 11
        { userId: customer2.id, productId: products[0].id },   // product 1
        { userId: customer2.id, productId: products[13].id },  // product 14
        { userId: customer2.id, productId: products[17].id },  // product 18
        { userId: customer3.id, productId: products[1].id },   // product 2
        { userId: customer3.id, productId: products[6].id },   // product 7
      ];

      for (const fav of favoritesData) {
        await Favorite.findOrCreate({
          where: { userId: fav.userId, productId: fav.productId },
          defaults: fav,
          transaction: t,
        });
      }
      console.log('Favorites seeded.');

      await t.commit();
      console.log('\nSeed completed successfully!');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
