import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:id" element={<CategoryDetail />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);