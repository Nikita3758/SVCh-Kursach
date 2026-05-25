import { useEffect } from 'react';
import './About.css';

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const advantages = [
  { Icon: IconAward, title: 'Сертифицированная мебель', desc: 'Работаем только с проверенными производителями, вся мебель имеет сертификаты качества.' },
  { Icon: IconUsers, title: '5 000+ довольных клиентов', desc: 'За 15 лет работы мы помогли тысячам семей обустроить уютный дом.' },
  { Icon: IconMap, title: 'Шоурум в Минске', desc: 'Приходите лично оценить качество и дизайн нашей мебели по адресу: ул. Мебельная, 1.' },
  { Icon: IconPackage, title: 'Доставка по всей Беларуси', desc: 'Собственная логистика и партнёры обеспечивают доставку в течение 3–7 рабочих дней.' },
];

const timeline = [
  { year: '2009', text: 'Основание компании «Мебельный Дом» в Минске. Первый шоурум площадью 200 м².' },
  { year: '2012', text: 'Расширение ассортимента до 500+ позиций. Запуск собственного производства корпусной мебели.' },
  { year: '2016', text: 'Открытие интернет-магазина. Запуск доставки по всей Беларуси. 1 000 довольных клиентов.' },
  { year: '2020', text: 'Партнёрство с европейскими производителями. Ассортимент дизайнерской мебели.' },
  { year: '2024', text: 'Запуск новой онлайн-платформы. 5 000+ клиентов. Рейтинг 4.9/5 на маркетплейсах.' },
];

const team = [
  { name: 'Александр Петров', role: 'Генеральный директор', initials: 'АП' },
  { name: 'Елена Соколова', role: 'Дизайнер интерьеров', initials: 'ЕС' },
  { name: 'Сергей Морозов', role: 'Руководитель логистики', initials: 'СМ' },
  { name: 'Анна Новикова', role: 'Менеджер по качеству', initials: 'АН' },
];

export default function About() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.about-animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero__inner">
          <h1 className="about-hero__title">О компании Мебельный Дом</h1>
          <p className="about-hero__subtitle">15 лет создаём уют в ваших домах</p>
        </div>
      </section>

      <section className="about-intro">
        <div className="about-container">
          <div className="about-intro__grid">
            <div className="about-intro__text about-animate">
              <h2>Кто мы</h2>
              <p>
                <strong>Мебельный Дом</strong> — одна из ведущих мебельных компаний Беларуси, работающая
                с 2009 года. Мы предлагаем широкий ассортимент качественной мебели для любого интерьера:
                от классики до современного минимализма и лофта.
              </p>
              <p>
                Наша миссия — сделать ваш дом уютным, стильным и функциональным. Мы тщательно отбираем
                каждый товар, чтобы вы получали только лучшее: от сырья до финального изделия.
              </p>
              <ul className="about-checklist">
                {[
                  'Только сертифицированные материалы',
                  'Гарантия 10 лет на всю продукцию',
                  'Бесплатная сборка при заказе от 1 500 Br',
                  'Рассрочка без переплат до 12 месяцев',
                  'Индивидуальный дизайн-проект',
                ].map((item, i) => (
                  <li key={i} className="about-checklist__item">
                    <span className="about-checklist__icon">
                      <IconCheck />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="about-intro__image about-animate">
              <img
                src="/images/about/about-team.jpg"
                alt="Интерьер с мебелью Мебельный Дом"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="about-advantages">
        <div className="about-container">
          <div className="about-section-header about-animate">
            <h2>Наши преимущества</h2>
            <p>Почему тысячи клиентов выбирают именно нас</p>
          </div>
          <div className="about-advantages__grid">
            {advantages.map(({ Icon, title, desc }, i) => (
              <div className="advantage-card about-animate" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="advantage-card__icon">
                  <Icon />
                </div>
                <h3 className="advantage-card__title">{title}</h3>
                <p className="advantage-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-timeline">
        <div className="about-container">
          <div className="about-section-header about-animate">
            <h2>История компании</h2>
            <p>Как мы развивались на протяжении 15 лет</p>
          </div>
          <div className="timeline">
            {timeline.map((item, i) => (
              <div className="timeline__item about-animate" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="timeline__year">{item.year}</div>
                <div className="timeline__dot" />
                <div className="timeline__text">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-team">
        <div className="about-container">
          <div className="about-section-header about-animate">
            <h2>Наша команда</h2>
            <p>Профессионалы, которые делают всё возможное для вас</p>
          </div>
          <div className="about-team__grid">
            {team.map((member, i) => (
              <div className="team-card about-animate" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="team-card__avatar">{member.initials}</div>
                <h3 className="team-card__name">{member.name}</h3>
                <p className="team-card__role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-contacts">
        <div className="about-container">
          <div className="about-contacts__grid">
            <div className="about-contact-block about-animate">
              <h3>Шоурум</h3>
              <p>г. Минск, ул. Мебельная, д. 1</p>
              <p>Пн–Вс: 10:00 – 21:00</p>
            </div>
            <div className="about-contact-block about-animate">
              <h3>Телефон</h3>
              <p>+7 (800) 123-45-67</p>
              <p>Бесплатно по Беларуси</p>
            </div>
            <div className="about-contact-block about-animate">
              <h3>Email</h3>
              <p>info@mebeldom.ru</p>
              <p>Ответим в течение 2 часов</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
