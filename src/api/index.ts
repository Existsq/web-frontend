import { Api } from './Api';

// Определяем baseURL: для Tauri используем полный URL бэкенда
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
const baseURL = isTauri ? 'http://localhost:8080' : '';

export const api = new Api({
  baseURL,
  withCredentials: true,
});

// Убеждаемся, что withCredentials установлен для всех запросов
if (api.instance) {
  api.instance.defaults.withCredentials = true;
}

// Экспортируем типы для удобства использования
export type {
  UserDTO,
  UserCredentialsDTO,
  CategoryDTO,
  CalculateCpiDTO,
  CalculateCpiCategoryDTO,
  DraftInfoDTO,
  ErrorResponse,
} from './Api';

