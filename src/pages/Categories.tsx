import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from '../components/layout/Header';
import SearchBar from '../components/search/SearchBar';
import CartIcon from '../components/cart/CartIcon';
import CardsContainer from '../components/card/CardsContainer';
import CategoryCard from '../components/card/CategoryCard';
import { fetchCategories } from '../services/api';
import type { Category } from '../types';
import './Categories.css';

function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState(searchParams.get('title') || '');

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const titleParam = searchParams.get('title') || undefined;
        const data = await fetchCategories(titleParam);
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTitle) {
      params.set('title', searchTitle);
    }
    setSearchParams(params);
  };

  return (
    <div className="main-page-container">
      <Header />
      <div className="search-section">
        <Container fluid className="py-4">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <SearchBar
              value={searchTitle}
              onChange={setSearchTitle}
              onSubmit={handleSearch}
            />
            <CartIcon count={0} />
          </div>
        </Container>
      </div>

      {loading ? null : categories.length > 0 ? (
        <CardsContainer>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </CardsContainer>
      ) : searchParams.get('title') ? (
        <div className="not-found-wrapper">
          <p className="not-found-text">Категории не найдены</p>
        </div>
      ) : null}
    </div>
  );
}

export default Categories;

