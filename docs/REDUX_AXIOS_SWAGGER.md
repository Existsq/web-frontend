# Пояснение использования Redux, Axios и сгенерированного кода из Swagger

## Содержание
1. [Redux Toolkit - Управление состоянием](#redux-toolkit)
2. [Axios - HTTP клиент](#axios)
3. [Сгенерированный код из Swagger](#swagger-generated-code)
4. [Примеры использования](#examples)
5. [Поток данных](#data-flow)

---

## Redux Toolkit - Управление состоянием

### Архитектура Redux в проекте

Проект использует **Redux Toolkit** для управления глобальным состоянием приложения. Redux хранит данные в централизованном хранилище (store), что позволяет компонентам получать доступ к данным без prop drilling.

### Структура Store

**Файл: `src/store/store.ts`**

```typescript
import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "./filtersSlice";
import authReducer from "./authSlice";
import requestsReducer from "./requestsSlice";

// Важно: типы импортируем как type
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

// Создание store с тремя слайсами (slices)
export const store = configureStore({
  reducer: {
    filters: filtersReducer,    // Фильтры для категорий
    auth: authReducer,           // Авторизация пользователя
    requests: requestsReducer,   // Заявки и черновики
  },
});

// Типы стора
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Кастомный useDispatch с типами
export const useAppDispatch: () => AppDispatch = useDispatch;

// Кастомный useSelector с типами
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Ключевые моменты:**
- `configureStore` автоматически настраивает Redux DevTools и middleware
- Типизированные хуки (`useAppDispatch`, `useAppSelector`) обеспечивают типобезопасность
- Store разделен на логические слайсы для лучшей организации

### Redux Slices (Слайсы)

#### 1. Auth Slice - Авторизация

**Файл: `src/store/authSlice.ts`**

```typescript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";  // Используем сгенерированный API
import type { UserCredentialsDTO } from "../api";

// Асинхронное действие для входа
export const login = createAsyncThunk(
  "auth/login",
  async (data: UserCredentialsDTO) => {
    // Вызов API метода из сгенерированного кода
    await api.api.login(data);
    // Небольшая задержка, чтобы cookie успела установиться
    await new Promise((resolve) => setTimeout(resolve, 100));
    const response = await api.api.getCurrentUser();
    return response.data;  // Возвращаем данные пользователя
  }
);

// Слайс с редюсерами
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    // Обработка состояний асинхронных действий
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;  // Сохраняем данные пользователя
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      });
  },
});
```

**Ключевые концепции:**
- `createAsyncThunk` - создает асинхронное действие (thunk)
- `extraReducers` - обрабатывает состояния pending/fulfilled/rejected
- Immer автоматически позволяет мутировать state (на самом деле создается новый)

#### 2. Requests Slice - Заявки и черновики

**Файл: `src/store/requestsSlice.ts`**

```typescript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { DraftInfoDTO, CalculateCpiDTO } from "../api";

// Асинхронное действие для загрузки черновика
export const loadDraft = createAsyncThunk(
  "requests/loadDraft",
  async () => {
    try {
      // Используем сгенерированные методы API
      const infoResponse = await api.api.getDraftInfo();
      const info = infoResponse.data;
      
      if (!info || !info.draftId) {
        return { info: null, draft: null };
      }
      
      // Получаем детали черновика
      const draftResponse = await api.api.getById(info.draftId);
      return { info, draft: draftResponse.data };
    } catch (error) {
      return { info: null, draft: null };
    }
  }
);
```

### Использование Redux в компонентах

#### Пример 1: Получение данных из store

**Файл: `src/components/card/CategoryCard.tsx`**

```typescript
import { useAppDispatch, useAppSelector } from '../../store/store';
import { addService } from '../../store/requestsSlice';

function CategoryCard({ category }: CategoryCardProps) {
  // Получаем dispatch для отправки действий
  const dispatch = useAppDispatch();
  
  // Получаем данные из store (auth slice)
  const { user } = useAppSelector((s) => s.auth);
  
  const handleAddToDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Отправляем асинхронное действие
    try {
      await dispatch(addService(category.id)).unwrap();
      // .unwrap() позволяет обработать ошибки через try/catch
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };
  
  // ... остальной код компонента
}
```

**Ключевые моменты:**
- `useAppDispatch()` - для отправки действий (actions)
- `useAppSelector()` - для получения данных из store
- `.unwrap()` - преобразует rejected promise в исключение для try/catch

#### Пример 2: Использование в форме

**Файл: `src/components/auth/LoginForm.tsx`**

```typescript
import { useAppDispatch, useAppSelector } from "../../store/store";
import { login } from "../../store/authSlice";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  
  // Получаем состояние загрузки и ошибки из store
  const { loading, error, user } = useAppSelector((s) => s.auth);
  
  const submit = () => {
    // Отправляем действие login с данными формы
    dispatch(login({ username, password }));
  };
  
  return (
    <Form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      {/* Форма использует loading и error из Redux store */}
      {error && <div className="text-danger">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Загрузка..." : "Войти"}
      </Button>
    </Form>
  );
}
```

#### Пример 3: Использование селекторов

**Файл: `src/components/cart/CartIcon.tsx`**

```typescript
import { useAppSelector } from "../../store/store";
import { selectDraftInfo } from "../../store/requestsSlice";

function CartIcon() {
  // Используем именованный селектор для получения данных черновика
  const draftInfo = useAppSelector(selectDraftInfo);
  
  // draftInfo содержит { draftId, countCategories }
  if (draftInfo && draftInfo.countCategories && draftInfo.countCategories > 0) {
    return (
      <Button>
        {cartIconSvg}
        <Badge>{draftInfo.countCategories}</Badge>
      </Button>
    );
  }
  
  // ... остальной код
}
```

---

## Axios - HTTP клиент

### Настройка Axios

Axios используется через сгенерированный класс API, который оборачивает Axios и предоставляет типизированные методы.

**Файл: `src/api/index.ts`**

```typescript
import { Api } from './Api';

// Определяем baseURL в зависимости от окружения
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
const baseURL = isTauri ? 'http://localhost:8080' : '';

// Создаем экземпляр API с настройками
export const api = new Api({
  baseURL,
  withCredentials: true,  // Важно для работы с cookies (сессии)
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
```

**Ключевые настройки:**
- `withCredentials: true` - отправляет cookies с каждым запросом (для аутентификации)
- `baseURL` - базовый URL API (настраивается для Tauri или браузера)

### Использование Axios напрямую

В некоторых случаях используется прямой вызов Axios:

**Файл: `src/store/authSlice.ts`**

```typescript
import axios from "axios";

// Изменение пароля (метод не сгенерирован в Swagger)
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: { oldPassword: string; newPassword: string }) => {
    const response = await axios.post(
      "/api/users/change-password",
      data,
      { withCredentials: true }  // Отправляем cookies
    );
    return response.data;
  }
);
```

---

## Сгенерированный код из Swagger

### Генерация кода

Код был сгенерирован из OpenAPI/Swagger спецификации с помощью инструмента `swagger-typescript-api`.

**Команда генерации:**
```bash
npm run generate-api
```

**Скрипт: `scripts/generate-api.mjs`**

### Структура сгенерированного API

**Файл: `src/api/Api.ts`** (сгенерированный файл)

```typescript
/* 
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API ##
 * ## AUTHOR: acacode ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 */

// Интерфейсы данных (DTO - Data Transfer Objects)
export interface CategoryDTO {
  id?: number;
  title?: string;
  basePrice?: number;
  imageUUID?: string;
  description?: string;
  shortDescription?: string;
  coefficient?: number;
  userSpent?: number;
  status?: "ACTIVE" | "DELETED";
}

export interface UserDTO {
  id?: number;
  username?: string;
  moderator?: boolean;
}

export interface CalculateCpiDTO {
  id?: number;
  status?: "DRAFT" | "DELETED" | "FORMED" | "COMPLETED" | "REJECTED";
  createdAt?: string;
  personalCPI?: number;
  categories?: CategoryDTO[];
  // ... другие поля
}

// Класс API с методами для всех эндпоинтов
export class Api extends HttpClient {
  api = {
    /**
     * @description Возвращает информацию о текущем аутентифицированном пользователе
     * @request GET:/api/users/me
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<UserDTO, ErrorResponse>({
        path: `/api/users/me`,
        method: "GET",
        ...params,
      }),
    
    /**
     * @description Возвращает список категорий
     * @request GET:/api/categories
     */
    findAll: (params: RequestParams = {}) =>
      this.request<CategoryDTO[], ErrorResponse>({
        path: `/api/categories`,
        method: "GET",
        ...params,
      }),
    
    /**
     * @description Возвращает информацию о категории по её идентификатору
     * @request GET:/api/categories/{categoryId}
     */
    findById: (categoryId: number, params: RequestParams = {}) =>
      this.request<CategoryDTO, ErrorResponse>({
        path: `/api/categories/${categoryId}`,
        method: "GET",
        ...params,
      }),
    
    /**
     * @description Авторизация пользователя
     * @request POST:/api/users/login
     */
    login: (data: UserCredentialsDTO, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/users/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
    
    // ... другие методы
  };
}
```

### Использование сгенерированного API

#### Пример 1: Получение списка категорий

**Файл: `src/pages/categories/Categories.tsx`**

```typescript
import { api } from "../../api";
import type { Category } from "../../types";
import { filterMockCategories } from "../../mocks/categories";

function Categories() {
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const titleParam = searchParams.get("title") || undefined;

      try {
        // Вызов сгенерированного метода API
        const response = await api.api.findAll({ title: titleParam });
        
        // response.data имеет тип CategoryDTO[]
        const categories = response.data
          .filter((cat): cat is typeof cat & { id: number } => cat.id !== undefined)
          .map((cat) => ({
            id: cat.id,
            title: cat.title ?? '',
            basePrice: cat.basePrice ?? 0,
            // Преобразуем DTO в внутренний тип Category
          }));
        setCategories(categories);
      } catch (error) {
        // При ошибке API используем моки данных
        console.warn("Не удалось загрузить категории с API, используем моки данных:", error);
        const mockData = filterMockCategories(titleParam);
        setCategories(mockData);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, [searchParams]);
}
```

**Ключевые моменты:**
- `api.api.findAll()` - метод сгенерирован из Swagger
- `response.data` типизирован как `CategoryDTO[]`
- Преобразование DTO в внутренние типы приложения
- Использование моков при ошибках API

#### Пример 2: Использование в Redux Thunk

**Файл: `src/store/requestsSlice.ts`**

```typescript
import { api } from "../api";
import type { DraftInfoDTO, CalculateCpiDTO } from "../api";

// Асинхронное действие использует сгенерированные методы
export const addService = createAsyncThunk(
  "requests/addService",
  async (categoryId: string | number) => {
    // 1. Добавляем категорию в черновик
    await api.api.addCategoryToDraft(Number(categoryId));
    
    // 2. Получаем обновленную информацию о черновике
    const infoResponse = await api.api.getDraftInfo();
    const info = infoResponse.data;  // Тип: DraftInfoDTO
    
    if (!info || !info.draftId) {
      return { info: null, draft: null };
    }
    
    // 3. Получаем полные данные черновика
    const draftResponse = await api.api.getById(info.draftId);
    return { 
      info, 
      draft: draftResponse.data  // Тип: CalculateCpiDTO
    };
  }
);
```

#### Пример 3: Типизированные ответы

**Файл: `src/pages/categories/CategoryDetail.tsx`**

```typescript
import { api } from '../../api';
import type { Category } from '../../types';
import { getMockCategoryById } from '../../mocks/categories';

function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  
  useEffect(() => {
    const loadCategory = async () => {
      if (!id) return;
      
      try {
        // Сгенерированный метод с типизацией
        const response = await api.api.findById(Number(id));
        
        // response.data имеет тип CategoryDTO
        // Преобразуем в внутренний тип Category
        setCategory(response.data as Category);
      } catch (error) {
        // При ошибке API используем моки данных
        console.warn(`Не удалось загрузить категорию ${id} с API, используем моки данных:`, error);
        const mockCategory = getMockCategoryById(id);
        setCategory(mockCategory);
      }
    };
    
    loadCategory();
  }, [id]);
}
```

### Преимущества сгенерированного кода

1. **Типобезопасность** - все методы и типы данных типизированы
2. **Автодополнение** - IDE подсказывает доступные методы и их параметры
3. **Синхронизация** - код всегда соответствует актуальной API спецификации
4. **Документация** - комментарии из Swagger включены в код
5. **Валидация** - TypeScript проверяет правильность использования API

---

## Примеры использования

### Полный пример: Компонент с Redux и API

**Файл: `src/components/auth/LoginForm.tsx`**

```typescript
import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { login } from "../../store/authSlice";
import { loadDraft } from "../../store/requestsSlice";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  // 1. Redux: Получаем dispatch и состояние
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. Redux: Отправляем асинхронное действие
  const submit = () => {
    dispatch(login({ username, password }));
    // login thunk внутри вызывает:
    // - api.api.login() - сгенерированный метод из Swagger
    // - api.api.getCurrentUser() - получение данных пользователя
  };
  
  // 3. Redux: Автоматический редирект при успешной авторизации
  useEffect(() => {
    if (user) {
      // Обновляем корзину после входа
      dispatch(loadDraft());
      navigate("/");
    }
  }, [user, navigate, dispatch]);
  
  return (
    <Form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Form.Control
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Form.Control
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {/* Redux: Отображаем состояние загрузки и ошибки */}
      {error && <div className="text-danger">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Загрузка..." : "Войти"}
      </Button>
    </Form>
  );
}
```

---

## Поток данных: Redux + API

```
┌─────────────┐
│  Component  │
│  (LoginForm)│
└──────┬──────┘
       │ dispatch(login({ username, password }))
       ▼
┌─────────────────┐
│  Redux Thunk    │
│  (authSlice)    │
└──────┬──────────┘
       │ api.api.login()
       │ api.api.getCurrentUser()
       ▼
┌─────────────────┐
│  Generated API  │
│  (Api.ts)       │
└──────┬──────────┘
       │ Axios HTTP Request
       │ withCredentials: true
       ▼
┌─────────────────┐
│  Backend API     │
│  (localhost:8080)│
└─────────────────┘
       │
       │ Response (UserDTO)
       ▼
┌─────────────────┐
│  Redux Store     │
│  (auth.user)     │
└──────┬──────────┘
       │
       │ useAppSelector((s) => s.auth.user)
       ▼
┌─────────────┐
│  Component  │
│  (обновляется)│
└─────────────┘
```

### Обработка ошибок с моками

```
┌─────────────┐
│  Component  │
│  (Categories)│
└──────┬──────┘
       │ api.api.findAll()
       ▼
┌─────────────────┐
│  Generated API  │
│  (Api.ts)       │
└──────┬──────────┘
       │ Axios HTTP Request
       ▼
┌─────────────────┐
│  Backend API     │
│  (ошибка/недоступен)│
└─────────────────┘
       │
       │ Error
       ▼
┌─────────────────┐
│  Catch Block    │
│  filterMockCategories()│
└──────┬──────────┘
       │
       │ Mock Data
       ▼
┌─────────────┐
│  Component  │
│  (отображает моки)│
└─────────────┘
```

---

## Резюме

### Redux Toolkit
- ✅ Централизованное управление состоянием
- ✅ Типизированные хуки (`useAppDispatch`, `useAppSelector`)
- ✅ Асинхронные действия через `createAsyncThunk`
- ✅ Автоматическая обработка loading/error состояний

### Axios
- ✅ HTTP клиент для запросов к API
- ✅ Настроен для работы с cookies (`withCredentials`)
- ✅ Используется через сгенерированный класс API

### Сгенерированный код из Swagger
- ✅ Типобезопасные методы API
- ✅ Автоматическая синхронизация с бэкендом
- ✅ Встроенная документация
- ✅ Упрощает работу с API

### Рекомендации
1. Всегда используйте типизированные хуки Redux
2. Используйте `.unwrap()` для обработки ошибок в async thunks
3. Преобразуйте DTO в внутренние типы приложения
4. Используйте селекторы для получения данных из store
5. Обрабатывайте состояния loading/error в компонентах
6. Используйте моки данных как fallback при ошибках API

---

## Дополнительные ресурсы

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Axios Documentation](https://axios-http.com/)
- [Swagger TypeScript API Generator](https://github.com/acacode/swagger-typescript-api)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
