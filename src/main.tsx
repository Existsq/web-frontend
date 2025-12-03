import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/home/Home";
import Categories from "./pages/categories/Categories";
import CategoryDetail from "./pages/categories/CategoryDetail";
import "./index.css";
import { useEffect } from "react";
import { useAppDispatch } from "./store/store";
import { getMe } from "./store/authSlice";
import { loadDraft } from "./store/requestsSlice";
import { PublicRoute } from "./components/auth/PublicRoute";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import LoginPage from "./pages/auth/AuthPage";
import UserRequestsPage from "./pages/requests/UserRequestsPage";
import ProfilePage from "./pages/auth/ProfilePage";
import RequestPage from "./pages/requests/RequestPage";
import Header from "./components/layout/Header";

export function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getMe());
    dispatch(loadDraft());
  }, [dispatch]);

  // Определяем basename для роутера (если приложение в подпапке)
  const basename = import.meta.env.TAURI_ENV_PLATFORM ? undefined : "/web-frontend";

  return (
    <BrowserRouter basename={basename}>
      <Header />
      <Routes>
        {/* Публичные маршруты */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Доступно всем (гостям и пользователям) */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PublicRoute>
              <Categories />
            </PublicRoute>
          }
        />
        <Route
          path="/categories/:id"
          element={
            <PublicRoute>
              <CategoryDetail />
            </PublicRoute>
          }
        />

        {/* Только для авторизованных пользователей */}
        <Route
          path="/requests"
          element={
            <PrivateRoute>
              <UserRequestsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/calculate-cpi/:id"
          element={
            <PrivateRoute>
              <RequestPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
