import type { Category } from './models';

// Component props interfaces
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export interface CategoryCardProps {
  category: Category;
  onAddToCart?: (categoryId: string | number) => void;
}

export interface CardsContainerProps {
  children: React.ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

