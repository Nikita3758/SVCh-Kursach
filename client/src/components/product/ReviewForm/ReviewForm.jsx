import { useState, useEffect } from 'react';
import StarRating from '../StarRating/StarRating';

export default function ReviewForm({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
  editMode = false,
}) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 0);
      setComment(initialData.comment || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      setRatingError('Выберите оценку');
      return;
    }
    if (!comment.trim()) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3 className="review-form__title">
        {editMode ? 'Редактировать отзыв' : 'Написать отзыв'}
      </h3>
      <div className="review-form__field">
        <label>Ваша оценка *</label>
        <StarRating
          value={rating}
          editable
          size="large"
          onChange={(v) => {
            setRating(v);
            setRatingError('');
          }}
        />
        {ratingError && <div className="review-form__error">{ratingError}</div>}
      </div>
      <div className="review-form__field">
        <label>Комментарий *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          maxLength={1000}
        />
        <div className="review-form__counter">{comment.length}/1000</div>
      </div>
      <div className="review-form__actions">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Отмена
          </button>
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !rating || !comment.trim()}
        >
          {loading ? 'Сохранение...' : editMode ? 'Сохранить' : 'Опубликовать'}
        </button>
      </div>
    </form>
  );
}
