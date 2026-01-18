import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../../components/layout/Header';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { api } from '../../api';
import type { Category } from '../../types';
import { getMockCategoryById } from '../../mocks/categories';
import './CategoryDetail.css';

function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Пытаемся загрузить данные с API
        const response = await api.api.findById(Number(id));
        setCategory(response.data as Category);
      } catch (error) {
        // При ошибке API используем моки данных
        console.warn(`Не удалось загрузить категорию ${id} с API, используем моки данных:`, error);
        const mockCategory = getMockCategoryById(id);
        // Имитируем небольшую задержку для реалистичности
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCategory(mockCategory);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id]);

  if (loading) {
    return (
      <div className="detailed-page-container">
        <Header />
        <Breadcrumbs />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="detailed-page-container">
        <Header />
        <Breadcrumbs />
        <div className="category-not-found-wrapper">
          <p className="category-not-found-text">Категория не найдена</p>
        </div>
      </div>
    );
  }

  const imageServerUrl = import.meta.env.VITE_MINIO_BASE_URL || 'http://127.0.0.1:9000';
  const imageUrl = category.imageUUID ? `${imageServerUrl}/categories/${category.imageUUID}.jpg` : undefined;
  const imageStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : {};

  return (
    <div className="detailed-page-container">
      <Header />
      <Breadcrumbs />
      <Container fluid className="content-container px-5">
        <Row className="g-5 py-4">
          <Col lg={7}>
            <div className="inner-text-container">
              <h1 className="mb-4">{category.title}</h1>
              <h5 className="mb-4 text-muted">
                Базовая стоимость: {category.basePrice} руб
              </h5>
              <p className="text-muted">
                {category.description || category.shortDescription}
              </p>
            </div>
          </Col>
          <Col lg={5}>
            <div 
              className={`inner-image-container ${!imageUrl ? 'inner-image-placeholder' : ''}`}
              style={{ 
                ...imageStyle, 
                width: '100%', 
                height: '520px', 
                borderRadius: '4px', 
                backgroundSize: imageUrl ? 'cover' : undefined, 
                backgroundPosition: imageUrl ? 'center' : undefined 
              }}
            >
              {!imageUrl && (
                <div className="inner-image-placeholder-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Нет изображения</span>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CategoryDetail;

