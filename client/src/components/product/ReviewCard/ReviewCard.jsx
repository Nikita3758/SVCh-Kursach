import { getInitials, formatDate } from '../../../utils/formatters';
import StarRating from '../StarRating/StarRating';

export default function ReviewCard({ review, currentUserId, isAdmin, onEdit, onDelete }) {
  const canModify = isAdmin || review.userId === currentUserId;

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__author">
          <div className="review-card__avatar">
            {review.user
              ? getInitials(review.user.firstName, review.user.lastName)
              : '?'}
          </div>
          <div>
            <div className="review-card__name">
              {review.user
                ? `${review.user.firstName} ${review.user.lastName}`
                : 'Анонимный пользователь'}
            </div>
            <div className="review-card__date">{formatDate(review.createdAt)}</div>
          </div>
        </div>
        <div className="review-card__actions">
          <StarRating value={review.rating} size="small" />
          {canModify && (
            <div className="review-card__buttons">
              {onEdit && (
                <button className="icon-btn" onClick={() => onEdit(review)} title="Редактировать">
                  ✎
                </button>
              )}
              {onDelete && (
                <button
                  className="icon-btn icon-btn--danger"
                  onClick={() => onDelete(review.id)}
                  title="Удалить"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="review-card__comment">{review.comment}</p>
    </div>
  );
}
