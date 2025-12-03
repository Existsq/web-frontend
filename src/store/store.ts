import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "./filtersSlice";
import authReducer from "./authSlice";
import requestsReducer from "./requestsSlice";

// Важно: типы импортируем как type
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    auth: authReducer,
    requests: requestsReducer,
  },
});

// Типы стора
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Кастомный useDispatch с типами
export const useAppDispatch: () => AppDispatch = useDispatch;

// Кастомный useSelector с типами
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
