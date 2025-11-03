import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import type { CategoryCardProps } from '../../types';
import './CategoryCard.css';

function CategoryCard({ category }: CategoryCardProps) {
  const imageServerUrl = import.meta.env.VITE_MINIO_BASE_URL || 'http://127.0.0.1:9000';
  const imageUrl = category.imageUUID ? `${imageServerUrl}/categories/${category.imageUUID}.jpg` : undefined;
  const imageStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : {};

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="category-card h-100">
      <Link to={`/categories/${category.id}`} className="text-decoration-none text-reset">
        <Card.Body className="d-flex flex-column">
          <div className="mb-3">
            <Card.Title className="mb-2">{category.title}</Card.Title>
            <Card.Text className="text-muted small mb-0">{category.shortDescription}</Card.Text>
          </div>
          <div className="mt-auto">
            <Card.Text className="text-muted small mb-2">
              Базовая стоимость: {category.basePrice} руб.
            </Card.Text>
            <div
              className={`card-image ${!imageUrl ? 'card-image-placeholder' : ''}`}
              style={{
                ...imageStyle,
                height: '205px',
                borderRadius: '4px',
                backgroundSize: imageUrl ? 'cover' : undefined,
                backgroundPosition: imageUrl ? 'center' : undefined
              }}
            >
              {!imageUrl && (
                <div className="card-image-placeholder-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Нет изображения</span>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Link>
      <Card.Footer className="bg-transparent border-0">
        <Button variant="outline-secondary" className="w-100" onClick={handleAddToCart}>
          Добавить категорию
        </Button>
      </Card.Footer>
    </Card>
  );
}

export default CategoryCard;

