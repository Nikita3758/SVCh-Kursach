import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="breadcrumb__item">
            {isLast || !item.href ? (
              <span className={isLast ? 'breadcrumb__current' : ''}>{item.label}</span>
            ) : (
              <Link to={item.href} className="breadcrumb__link">{item.label}</Link>
            )}
            {!isLast && <span className="breadcrumb__sep">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
