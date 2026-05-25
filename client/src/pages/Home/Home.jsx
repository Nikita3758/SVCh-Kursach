import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useCart } from '../../context/AppContext';
import { useFetch } from '../../hooks/useFetch';
import { productsApi, categoriesApi } from '../../api/endpoints';
import { formatPrice } from '../../utils/formatters';
import './Home.css';

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconTool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconSofa = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/>
    <path d="M2 14h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z"/>
    <path d="M4 11h16"/>
    <path d="M8 20v2"/>
    <path d="M16 20v2"/>
  </svg>
);

const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M3 8h18"/>
    <path d="M5 8v10"/>
    <path d="M19 8v10"/>
    <path d="M22 8H2v2h20V8z"/>
  </svg>
);

const IconChair = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M5 12h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9z"/>
    <path d="M5 12V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/>
    <path d="M8 22v-3"/>
    <path d="M16 22v-3"/>
  </svg>
);

const IconWardrobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <path d="M12 2v20"/>
    <path d="M9 12v2"/>
    <path d="M15 12v2"/>
  </svg>
);

const IconArmchair = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M6 14H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/>
    <path d="M18 14h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/>
    <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"/>
    <path d="M8 6h8v8H8z"/>
    <path d="M8 20v2"/>
    <path d="M16 20v2"/>
  </svg>
);

const IconBed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M2 4v16"/>
    <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
    <path d="M2 17h20"/>
    <path d="M6 8v9"/>
  </svg>
);

const IconBookshelf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M4 3h16v18H4z"/>
    <path d="M4 9h16"/>
    <path d="M4 15h16"/>
    <path d="M8 3v6"/>
    <path d="M12 15v6"/>
    <path d="M16 9v6"/>
  </svg>
);

const IconDresser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <path d="M4 9h16"/>
    <path d="M4 15h16"/>
    <path d="M10 6h4"/>
    <path d="M10 12h4"/>
    <path d="M10 18h4"/>
  </svg>
);

const CATEGORY_ICONS = {
  Диваны: <IconSofa />,
  Столы: <IconTable />,
  Стулья: <IconChair />,
  Шкафы: <IconWardrobe />,
  Кресла: <IconArmchair />,
  Кровати: <IconBed />,
  Стеллажи: <IconBookshelf />,
  Комоды: <IconDresser />,
};

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { cartItems, addCartItem } = useCart();

  const { data: productsData, isLoading } = useFetch(
    () => productsApi.list({ limit: 6, page: 1 }),
    [],
  );
  const { data: categoriesData } = useFetch(() => categoriesApi.list(), []);

  const featured = productsData?.data ?? [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [featured.length, categories.length]);

  const isInCart = (productId) => cartItems.some((item) => item.productId === productId);

  const handleAddToCart = (product) => {
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    addCartItem({
      id: Date.now(),
      userId: 0,
      productId: product.id,
      product,
      quantity: 1,
      price: product.price,
    });
  };

  const features = [
    { Icon: IconShield, title: 'Гарантия качества', desc: 'Вся мебель изготовлена из сертифицированных материалов с гарантией 10 лет' },
    { Icon: IconTruck, title: 'Быстрая доставка', desc: 'Доставляем по всей Беларуси в течение 3–7 рабочих дней' },
    { Icon: IconTool, title: 'Сборка в подарок', desc: 'Профессиональная сборка мебели включена в стоимость заказа' },
  ];

  const stats = [
    { value: '15+', label: 'лет на рынке' },
    { value: '5 000+', label: 'довольных клиентов' },
    { value: '500+', label: 'товаров в каталоге' },
    { value: '10 лет', label: 'гарантия' },
  ];

  const testimonials = [
    { name: 'Иван Сидоров', text: 'Отличный сервис! Угловой диван доставили быстро, сборщики — профессионалы. Рекомендую всем!', rating: 5 },
    { name: 'Мария Козлова', text: 'Кресло Barcelona — это произведение искусства. Очень стильное и удобное, идеально в мой интерьер.', rating: 5 },
    { name: 'Дмитрий Волков', text: 'Красивый стол с мраморной столешницей. Полностью соответствует описанию, качество на высоте.', rating: 4 },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <p className="hero__eyebrow">Мебельный Дом — ваш надёжный партнёр</p>
            <h1 className="hero__title">Мебель для вашего идеального дома</h1>
            <p className="hero__subtitle">Широкий выбор качественной мебели от производителя. Более 500 позиций в наличии.</p>
            <div className="hero__buttons">
              <Link to="/catalog" className="hero__btn hero__btn--primary">Перейти в каталог</Link>
              <Link to="/about" className="hero__btn hero__btn--outline">О компании</Link>
            </div>
          </div>
        </div>
        <div className="hero__wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8f9fc" />
          </svg>
        </div>
      </section>

      <section className="stats">
        <div className="stats__container">
          {stats.map((s, i) => (
            <div className="stat-item animate" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="stat-item__value">{s.value}</span>
              <span className="stat-item__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="categories">
        <div className="section-container">
          <div className="section-header animate">
            <h2 className="section-title">Категории мебели</h2>
            <p className="section-subtitle">Найдите именно то, что подходит вашему интерьеру</p>
          </div>
          <div className="categories__grid">
            {categories.slice(0, 8).map((cat, i) => (
              <Link
                to={`/catalog?categoryId=${cat.id}`}
                className="category-card animate"
                key={cat.id}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <span className="category-card__icon">{CATEGORY_ICONS[cat.name] || <IconChair />}</span>
                <span className="category-card__name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="section-container">
          <div className="section-header animate">
            <h2 className="section-title">Популярные товары</h2>
            <p className="section-subtitle">Самые востребованные позиции нашего каталога</p>
          </div>
          <div className="featured__grid">
            {isLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div className="featured-card featured-card--skeleton" key={i} />
                ))
              : featured.map((product, i) => (
                  <div
                    className="featured-card animate"
                    key={product.id}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div
                      className="featured-card__image-wrap"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <img
                        src={
                          product.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop'
                        }
                        alt={product.name}
                        className="featured-card__image"
                      />
                      <span className="featured-card__category">
                        {product.category?.name || 'Мебель'}
                      </span>
                    </div>
                    <div className="featured-card__body">
                      <h3 className="featured-card__name">{product.name}</h3>
                      <p className="featured-card__price">{formatPrice(product.price)}</p>
                      <button
                        className={`featured-card__btn${
                          isInCart(product.id) ? ' featured-card__btn--in-cart' : ''
                        }`}
                        onClick={() => handleAddToCart(product)}
                      >
                        {isInCart(product.id) ? 'В корзине' : 'В корзину'}
                      </button>
                    </div>
                  </div>
                ))}
          </div>
          <div className="featured__footer">
            <Link to="/catalog" className="btn-catalog">Смотреть весь каталог →</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-container">
          <div className="section-header animate">
            <h2 className="section-title">Почему выбирают нас</h2>
            <p className="section-subtitle">Мы заботимся о каждом клиенте на всех этапах покупки</p>
          </div>
          <div className="features__grid">
            {features.map(({ Icon, title, desc }, i) => (
              <div
                className="feature-item animate"
                key={i}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="feature-item__icon">
                  <Icon />
                </div>
                <div>
                  <h3 className="feature-item__title">{title}</h3>
                  <p className="feature-item__desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="section-container">
          <div className="section-header animate">
            <h2 className="section-title">Отзывы клиентов</h2>
            <p className="section-subtitle">Что говорят наши покупатели</p>
          </div>
          <div className="testimonials__grid">
            {testimonials.map((t, i) => (
              <div
                className="testimonial-card animate"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="testimonial-card__stars">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <IconStar key={j} />
                  ))}
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <p className="testimonial-card__author">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-banner__inner animate">
          <h2 className="cta-banner__title">Готовы обновить интерьер?</h2>
          <p className="cta-banner__subtitle">Перейдите в каталог и выберите мебель своей мечты прямо сейчас</p>
          <Link to="/catalog" className="cta-banner__btn">Открыть каталог</Link>
        </div>
      </section>
    </div>
  );
}
