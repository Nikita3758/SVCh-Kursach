import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column">
          <h3>Мебельный Дом</h3>
          <p>Широкий выбор качественной мебели от производителя. Доставка по всей Беларуси.</p>
        </div>
        <div className="footer-column">
          <h4>Навигация</h4>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/catalog">Каталог</Link></li>
            <li><Link to="/cart">Корзина</Link></li>
            <li><Link to="/about">О нас</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Контакты</h4>
          <p>+7 (495) 123-45-67</p>
          <p>info@mebeldom.ru</p>
          <p>Минск, ул. Мебельная, 1</p>
        </div>
        <div className="footer-column">
          <h4>Мы в соцсетях</h4>
          <a href="#">Instagram</a>
          <a href="#">ВКонтакте</a>
          <a href="#">Telegram</a>
          <a href="#">YouTube</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Мебельный Дом. Все права защищены.</p>
      </div>
    </footer>
  );
}
