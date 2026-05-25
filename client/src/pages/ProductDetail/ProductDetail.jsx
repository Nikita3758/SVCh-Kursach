import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useCart, useFavorites, useNotification } from '../../context/AppContext';
import { useFetch } from '../../hooks/useFetch';
import { productsApi, reviewsApi } from '../../api/endpoints';
import ImageGallery from '../../components/product/ImageGallery/ImageGallery';
import StarRating from '../../components/product/StarRating/StarRating';
import ReviewCard from '../../components/product/ReviewCard/ReviewCard';
import ReviewForm from '../../components/product/ReviewForm/ReviewForm';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import Loader from '../../components/common/Loader/Loader';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import { formatPrice } from '../../utils/formatters';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);

  const { user, token } = useAuth();
  const { addCartItem } = useCart();
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();
  const { notifySuccess, notifyError } = useNotification();

  const isFavorite = favoriteIds.includes(productId);

  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading } = useFetch(
    () => productsApi.getById(productId),
    [productId],
  );
  const { data: reviewsData, refetch: refetchReviews } = useFetch(
    () => reviewsApi.listForProduct(productId),
    [productId],
  );
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  const { data: similarData } = useFetch(
    () =>
      product?.categoryId
        ? productsApi.list({ category: product.categoryId, limit: 4 })
        : Promise.resolve({ data: [] }),
    [product?.categoryId],
  );
  const similar = (similarData?.data ?? []).filter((p) => p.id !== productId).slice(0, 4);

  if (isLoading) return <Loader message="Загрузка товара..." />;
  if (!product) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <p>Товар не найден</p>
        </div>
      </div>
    );
  }

  const userReview = reviews.find((r) => r.userId === user?.id);

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    addCartItem({
      id: Date.now(),
      userId: 0,
      productId: product.id,
      product,
      quantity,
      price: product.price,
    });
    notifySuccess(`${product.name} добавлен в корзину`);
  };

  const handleFavorite = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (isFavorite) {
      removeFavorite(product.id);
      notifySuccess('Удалено из избранного');
    } else {
      addFavorite(product.id);
      notifySuccess('Добавлено в избранное');
    }
  };

  const handleAddReview = async (data) => {
    setSubmitting(true);
    try {
      await reviewsApi.add({ productId: product.id, ...data });
      notifySuccess('Отзыв опубликован!');
      setShowReviewForm(false);
      refetchReviews();
    } catch {
      notifyError('Ошибка при публикации отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async (data) => {
    if (!editingReview) return;
    setSubmitting(true);
    try {
      await reviewsApi.update(editingReview.id, data);
      notifySuccess('Отзыв обновлён!');
      setEditingReview(null);
      refetchReviews();
    } catch {
      notifyError('Ошибка при обновлении отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    setSubmitting(true);
    try {
      await reviewsApi.remove(deleteReviewId);
      notifySuccess('Отзыв удалён');
      setDeleteReviewId(null);
      refetchReviews();
    } catch {
      notifyError('Ошибка при удалении отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        <Breadcrumb
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Каталог', href: '/catalog' },
            ...(product.category
              ? [{ label: product.category.name, href: `/catalog?categoryId=${product.categoryId}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="product-detail__main">
          <div className="product-detail__gallery">
            <ImageGallery
              images={product.images || []}
              productName={product.name}
              productId={product.id}
            />
          </div>

          <div className="product-detail__info">
            {product.category && (
              <span className="product-detail__category-chip">{product.category.name}</span>
            )}

            <h1 className="product-detail__name">{product.name}</h1>

            <div className="product-detail__rating-row">
              <StarRating value={Number(product.avgRating || 0)} size="small" />
              <span className="product-detail__rating-text">
                {product.reviewCount > 0 ? Number(product.avgRating).toFixed(1) : 'Нет оценок'} ({product.reviewCount || 0} отзывов)
              </span>
            </div>

            <p className="product-detail__price">{formatPrice(product.price)}</p>

            <div className="product-detail__specs">
              {product.material && (
                <div className="product-detail__spec-row">
                  <span className="product-detail__spec-label">Материал</span>
                  <span className="product-detail__spec-value">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="product-detail__spec-row">
                  <span className="product-detail__spec-label">Размеры</span>
                  <span className="product-detail__spec-value">{product.dimensions}</span>
                </div>
              )}
              {product.weight && (
                <div className="product-detail__spec-row">
                  <span className="product-detail__spec-label">Вес</span>
                  <span className="product-detail__spec-value">{product.weight} кг</span>
                </div>
              )}
              <div className="product-detail__spec-row">
                <span className="product-detail__spec-label">Наличие</span>
                <span
                  className={`product-detail__spec-value ${
                    product.stock > 0 ? 'product-detail__stock--ok' : 'product-detail__stock--out'
                  }`}
                >
                  {product.stock > 0 ? `В наличии (${product.stock} шт.)` : 'Нет в наличии'}
                </span>
              </div>
            </div>

            <div className="product-detail__actions">
              <div className="product-detail__qty">
                <button
                  className="product-detail__qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="product-detail__qty-value">{quantity}</span>
                <button
                  className="product-detail__qty-btn"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                >
                  +
                </button>
              </div>

              <button
                className="product-detail__add-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !product.isActive}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                Добавить в корзину
              </button>

              <button
                className={`product-detail__fav-btn ${isFavorite ? 'product-detail__fav-btn--active' : ''}`}
                onClick={handleFavorite}
                title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={isFavorite ? '#ffd700' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  width="22"
                  height="22"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            <div className="product-detail__divider" />

            <p className="product-detail__description">{product.description}</p>
          </div>
        </div>

        <div className="product-detail__tabs-wrap">
          <div className="product-detail__tabs">
            <button
              className={`product-detail__tab ${tab === 0 ? 'product-detail__tab--active' : ''}`}
              onClick={() => setTab(0)}
            >
              Описание
            </button>
            <button
              className={`product-detail__tab ${tab === 1 ? 'product-detail__tab--active' : ''}`}
              onClick={() => setTab(1)}
            >
              Отзывы ({reviews.length})
            </button>
          </div>

          <div className="product-detail__tab-body">
            {tab === 0 && <p className="product-detail__tab-text">{product.description}</p>}

            {tab === 1 && (
              <div>
                {token && !userReview && !showReviewForm && !editingReview && (
                  <button
                    className="product-detail__write-review"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Написать отзыв
                  </button>
                )}

                {showReviewForm && (
                  <ReviewForm
                    onSubmit={handleAddReview}
                    onCancel={() => setShowReviewForm(false)}
                    loading={submitting}
                  />
                )}

                {editingReview && (
                  <ReviewForm
                    onSubmit={handleUpdateReview}
                    onCancel={() => setEditingReview(null)}
                    initialData={editingReview}
                    loading={submitting}
                    editMode
                  />
                )}

                {reviews.length === 0 ? (
                  <p className="product-detail__no-reviews">Нет отзывов. Будьте первым!</p>
                ) : (
                  <div className="product-detail__reviews">
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        currentUserId={user?.id}
                        onEdit={(r) => {
                          setEditingReview(r);
                          setShowReviewForm(false);
                        }}
                        onDelete={(rid) => setDeleteReviewId(rid)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="product-detail__similar">
            <h2 className="product-detail__similar-title">Похожие товары</h2>
            <div className="product-detail__similar-grid">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteReviewId !== null}
        title="Удалить отзыв"
        message="Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить."
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteReviewId(null)}
        severity="error"
        loading={submitting}
        confirmLabel="Удалить"
      />
    </div>
  );
}
