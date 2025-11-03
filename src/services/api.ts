import type { Category } from '../types';

const API_BASE_URL = '/api';

// Mock data for fallback when backend is unavailable
const mockCategories: Category[] = [
  {
    id: 1,
    title: 'Healthcare Services',
    shortDescription: 'Medical and health-related services',
    basePrice: 5000,
    imageId: 'healthcare',
  },
  {
    id: 2,
    title: 'Education Services',
    shortDescription: 'Educational and training services',
    basePrice: 3000,
    imageId: 'education',
  },
  {
    id: 3,
    title: 'Transportation Services',
    shortDescription: 'Public and private transportation',
    basePrice: 2500,
    imageId: 'transport',
  },
];

/**
 * Fetches categories from the backend API
 * Falls back to mock data if backend is unavailable
 */
export async function fetchCategories(title?: string): Promise<Category[]> {
  try {
    const url = title 
      ? `${API_BASE_URL}/categories?title=${encodeURIComponent(title)}`
      : `${API_BASE_URL}/categories`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Failed to fetch from backend, using mock data:', error);
    
    // Fallback to mock data
    if (title) {
      // Filter mock data by title if search is provided
      const searchTitleLower = title.toLowerCase();
      return mockCategories.filter(category => 
        category.title.toLowerCase().includes(searchTitleLower)
      );
    }
    
    return mockCategories;
  }
}

/**
 * Fetches a single category by ID from the backend API
 * Falls back to mock data if backend is unavailable
 */
export async function fetchCategory(id: string | number): Promise<Category | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch category from backend, using mock data:', error);
    
    // Fallback to mock data
    const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
    const category = mockCategories.find(cat => cat.id === categoryId);
    return category || null;
  }
}
