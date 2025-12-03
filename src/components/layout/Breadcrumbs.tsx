import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../api';
import type { BreadcrumbItem } from '../../types';
import './Breadcrumbs.css';

function Breadcrumbs() {
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const [categoryTitle, setCategoryTitle] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      const loadCategoryTitle = async () => {
        try {
          const response = await api.api.findById(Number(params.id));
          if (response.data) {
            setCategoryTitle(response.data.title ?? null);
          }
        } catch (error) {
          console.error('Error loading category title for breadcrumbs:', error);
        }
      };

      loadCategoryTitle();
    }
  }, [params.id]);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    if (location.pathname === '/categories') {
      items.push({ label: 'Категории', path: '/categories' });
      return items;
    }

    if (location.pathname.startsWith('/categories/') && params.id) {
      items.push({ label: 'Категории', path: '/categories' });
      if (categoryTitle) {
        items.push({
          label: categoryTitle,
          path: `/categories/${params.id}`
        });
      }
      return items;
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="breadcrumbs-container" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((item, index) => {
          const isCurrentRoute = location.pathname === item.path;
          return (
            <li key={index} className="breadcrumbs-item">
              {index > 0 && <span className="breadcrumbs-separator"> &gt; </span>}
              {item.path && !isCurrentRoute ? (
                <Link to={item.path} className="breadcrumbs-link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs-current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;

