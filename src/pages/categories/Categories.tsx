import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import Header from "../../components/layout/Header";
import SearchBar from "../../components/search/SearchBar";
import CartIcon from "../../components/cart/CartIcon";
import CardsContainer from "../../components/card/CardsContainer";
import CategoryCard from "../../components/card/CategoryCard";
import CategoryFilters from "../../components/category/CategoryFilters";
import { api } from "../../api";
import type { Category } from "../../types";
import type { RootState } from "../../store/store";
import { filterMockCategories } from "../../mocks/categories";
import "./Categories.css";

function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState(
    searchParams.get("title") || ""
  );

  const filters = useSelector((state: RootState) => state.filters);

  // Загружаем категории с API, при ошибке используем моки
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const titleParam = searchParams.get("title") || undefined;

      try {
        // Пытаемся загрузить данные с API
        const response = await api.api.findAll({ title: titleParam });
        // Преобразуем CategoryDTO[] в Category[], фильтруя записи с undefined id
        const categories = response.data
          .filter((cat): cat is typeof cat & { id: number } => cat.id !== undefined)
          .map((cat) => ({
            id: cat.id,
            title: cat.title ?? '',
            basePrice: cat.basePrice ?? 0,
            imageUUID: cat.imageUUID ?? '',
            description: cat.description ?? '',
            shortDescription: cat.shortDescription ?? '',
          }));
        setCategories(categories);
      } catch (error) {
        // При ошибке API используем моки данных
        console.warn("Не удалось загрузить категории с API, используем моки данных:", error);
        const mockData = filterMockCategories(titleParam);
        // Имитируем небольшую задержку для реалистичности
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCategories(mockData);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [searchParams]);

  // Сортировка категорий в зависимости от фильтров
  const filteredCategories = [...categories].sort((a, b) => {
    if (filters.sortBy === "price") {
      return filters.order === "asc"
        ? a.basePrice - b.basePrice
        : b.basePrice - a.basePrice;
    } else {
      return filters.order === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });

  // Обработка поиска
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTitle) {
      params.set("title", searchTitle);
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
            <CartIcon />
          </div>
        </Container>
      </div>

      <div className="d-flex flex-column align-items-start w-100 px-5">
        <CategoryFilters />
      </div>

      {/* Карточки категорий */}
      {loading ? null : filteredCategories.length > 0 ? (
        <CardsContainer>
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </CardsContainer>
      ) : searchParams.get("title") ? (
        <div className="not-found-wrapper">
          <p className="not-found-text">Категории не найдены</p>
        </div>
      ) : null}
    </div>
  );
}

export default Categories;
