import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { api } from "../api";
import type { DraftInfoDTO, CalculateCpiDTO } from "../api";
import { logout } from "./authSlice";
import axios from "axios";

interface RequestsState {
  draftInfo: DraftInfoDTO | null;
  currentDraft: CalculateCpiDTO | null;
  currentRequest: CalculateCpiDTO | null;
  hasDraft: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  draftInfo: null,
  currentDraft: null,
  currentRequest: null,
  hasDraft: false,
  loading: false,
  error: null,
};

export const loadDraft = createAsyncThunk(
  "requests/loadDraft",
  async () => {
    try {
      const infoResponse = await api.api.getDraftInfo();
      const info = infoResponse.data;
      if (!info || !info.draftId) {
        return { info: null as DraftInfoDTO | null, draft: null as CalculateCpiDTO | null };
      }
      const draftResponse = await api.api.getById(info.draftId);
      return { info, draft: draftResponse.data };
    } catch (error) {
      return { info: null as DraftInfoDTO | null, draft: null as CalculateCpiDTO | null };
    }
  }
);

export const addService = createAsyncThunk(
  "requests/addService",
  async (categoryId: string | number) => {
    await api.api.addCategoryToDraft(Number(categoryId));
    const infoResponse = await api.api.getDraftInfo();
    const info = infoResponse.data;
    if (!info || !info.draftId) {
      return { info: null as DraftInfoDTO | null, draft: null as CalculateCpiDTO | null };
    }
    const draftResponse = await api.api.getById(info.draftId);
    return { info, draft: draftResponse.data };
  }
);

export const changeDraftItemQuantity = createAsyncThunk(
  "requests/changeDraftItemQuantity",
  async (params: { cpiId: string | number; categoryId: string | number; amount: number }) => {
    const response = await api.api.update2(
      Number(params.cpiId),
      Number(params.categoryId),
      { userSpent: params.amount }
    );
    // API возвращает CalculateCpiCategoryDTO, из которого нужно извлечь calculateCpi
    const result = response.data;
    if (result.calculateCpi) {
      return result.calculateCpi;
    }
    // Если calculateCpi нет, пытаемся получить обновленный черновик напрямую
    const draftResponse = await api.api.getById(Number(params.cpiId));
    return draftResponse.data;
  }
);

export const deleteDraftItem = createAsyncThunk(
  "requests/deleteDraftItem",
  async (params: { cpiId: string | number; categoryId: string | number }, { rejectWithValue }) => {
    try {
      // Сначала получаем текущий черновик, чтобы проверить количество категорий
      let currentDraft: CalculateCpiDTO | null = null;
      try {
        const draftResponse = await api.api.getById(Number(params.cpiId));
        currentDraft = draftResponse.data;
      } catch (error) {
        console.error("Failed to load current draft:", error);
      }
      
      const categoriesCount = currentDraft?.categories?.length || 0;
      const isLastCategory = categoriesCount === 1;
      
      // Удаляем категорию
      await api.api.delete1(Number(params.cpiId), Number(params.categoryId));
      
      // Если это была последняя категория и это черновик, удаляем весь черновик
      if (isLastCategory && currentDraft?.status === "DRAFT") {
        try {
          await api.api.delete2(Number(params.cpiId));
          console.log("Draft deleted because last category was removed");
          return { draft: null, info: null };
        } catch (error) {
          console.error("Failed to delete empty draft:", error);
          // Продолжаем обработку, даже если удаление черновика не удалось
        }
      }
      
      // Получаем обновленный draftInfo после удаления
      let info: DraftInfoDTO | null = null;
      try {
        const infoResponse = await api.api.getDraftInfo();
        info = infoResponse.data;
      } catch (error) {
        // Если черновик был удален (404), это нормально
        console.log("Draft info not found after deletion, draft may be empty");
      }
      
      // Если черновик еще существует, получаем его данные
      let draft: CalculateCpiDTO | null = null;
      if (info && info.draftId) {
        try {
          const draftResponse = await api.api.getById(info.draftId);
          draft = draftResponse.data;
        } catch (error) {
          console.error("Failed to load draft after deletion:", error);
        }
      }
      
      return { draft, info };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Не удалось удалить категорию");
    }
  }
);

// URL асинхронного Django сервиса
const ASYNC_SERVICE_URL = import.meta.env.VITE_ASYNC_SERVICE_URL || "http://localhost:8001/";
const ASYNC_SERVICE_TOKEN = "lab8token";

// Функция для вызова асинхронного сервиса
const callAsyncService = async (requestId: number) => {
  try {
    await axios.post(ASYNC_SERVICE_URL, {
      pk: requestId,
      token: ASYNC_SERVICE_TOKEN
    }, {
      timeout: 5000
    });
    console.log(`Async service called for request ${requestId}`);
  } catch (error) {
    // Логируем ошибку, но не прерываем процесс
    console.error(`Failed to call async service for request ${requestId}:`, error);
  }
};

export const confirmDraftThunk = createAsyncThunk(
  "requests/confirmDraft",
  async (draftId: string | number) => {
    const response = await api.api.formDraft(Number(draftId));
    const requestData = response.data;
    
    // После успешного формирования заявки вызываем асинхронный сервис
    if (requestData.id) {
      // Вызываем асинхронно, не блокируя ответ
      callAsyncService(requestData.id).catch(err => {
        console.error("Async service call failed:", err);
      });
    }
    
    return requestData;
  }
);

export const loadRequest = createAsyncThunk(
  "requests/loadRequest",
  async (requestId: string | number) => {
    const response = await api.api.getById(Number(requestId));
    return response.data;
  }
);

// Завершить или отклонить заявку (только для модераторов)
export const denyOrCompleteRequest = createAsyncThunk(
  "requests/denyOrComplete",
  async (params: { requestId: string | number; approve: boolean }) => {
    const response = await api.api.denyOrComplete(
      Number(params.requestId),
      { approve: params.approve }
    );
    return response.data;
  }
);

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loadDraft.fulfilled,
        (
          state,
          action: PayloadAction<{
            info: DraftInfoDTO | null;
            draft: CalculateCpiDTO | null;
          }>
        ) => {
          state.loading = false;
          state.draftInfo = action.payload.info;
          state.currentDraft = action.payload.draft;
          state.hasDraft = !!action.payload.info;
        }
      )
      .addCase(loadDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось загрузить черновик";
        state.draftInfo = null;
        state.currentDraft = null;
        state.hasDraft = false;
      })
      .addCase(addService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addService.fulfilled,
        (
          state,
          action: PayloadAction<{
            info: DraftInfoDTO | null;
            draft: CalculateCpiDTO | null;
          }>
        ) => {
          state.loading = false;
          state.draftInfo = action.payload.info;
          state.currentDraft = action.payload.draft;
          state.hasDraft = !!action.payload.info;
        }
      )
      .addCase(addService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось добавить категорию";
      })
      .addCase(
        changeDraftItemQuantity.fulfilled,
        (state, action: PayloadAction<CalculateCpiDTO>) => {
          const updatedRequest = action.payload;
          
          // Обновляем currentDraft если это черновик
          if (updatedRequest.status === "DRAFT") {
            state.currentDraft = updatedRequest;
            state.hasDraft = true;
          }
          
          // Также обновляем currentRequest если это текущая открытая заявка
          // Сравниваем по ID или по статусу и дате создания
          if (state.currentRequest && 
              (state.currentRequest.id === updatedRequest.id || 
               (state.currentRequest.status === updatedRequest.status && 
                state.currentRequest.createdAt === updatedRequest.createdAt))) {
            state.currentRequest = updatedRequest;
          }
        }
      )
      .addCase(deleteDraftItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteDraftItem.fulfilled,
        (
          state,
          action: PayloadAction<{
            draft: CalculateCpiDTO | null;
            info: DraftInfoDTO | null;
          }>
        ) => {
          state.loading = false;
          
          // Обновляем draftInfo
          state.draftInfo = action.payload.info;
          
          // Проверяем, есть ли категории в черновике
          const hasCategories = action.payload.draft?.categories && action.payload.draft.categories.length > 0;
          const hasValidDraftInfo = action.payload.info && 
                                    action.payload.info.countCategories !== undefined && 
                                    action.payload.info.countCategories > 0;
          
          // Если черновик пустой или удален (нет info или countCategories = 0)
          if (!action.payload.info || !hasValidDraftInfo || !hasCategories) {
            state.currentDraft = null;
            state.draftInfo = null;
            state.hasDraft = false;
          } else {
            // Если черновик еще существует, обновляем его
            state.currentDraft = action.payload.draft;
            state.hasDraft = true;
          }
          
          // Также обновляем currentRequest если это текущая открытая заявка
          if (state.currentRequest && action.payload.draft && 
              state.currentRequest.id === action.payload.draft.id) {
            state.currentRequest = action.payload.draft;
          }
        }
      )
      .addCase(deleteDraftItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось удалить категорию";
      })
      .addCase(confirmDraftThunk.fulfilled, (state, action: PayloadAction<CalculateCpiDTO>) => {
        state.currentRequest = action.payload;
        state.currentDraft = null;
        state.draftInfo = null;
        state.hasDraft = false;
      })
      .addCase(loadRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRequest.fulfilled, (state, action: PayloadAction<CalculateCpiDTO>) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(loadRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось загрузить заявку";
      })
      .addCase(denyOrCompleteRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(denyOrCompleteRequest.fulfilled, (state, action: PayloadAction<CalculateCpiDTO>) => {
        state.loading = false;
        // Обновляем текущую заявку после завершения/отклонения
        if (state.currentRequest && state.currentRequest.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      })
      .addCase(denyOrCompleteRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось завершить/отклонить заявку";
      })
      .addCase(logout, () => initialState);
  },
});

export const selectHasDraft = (state: RootState) => state.requests.hasDraft;
export const selectDraftInfo = (state: RootState) => state.requests.draftInfo;
export const selectCurrentDraft = (state: RootState) => state.requests.currentDraft;
export const selectCurrentRequest = (state: RootState) => state.requests.currentRequest;

export default requestsSlice.reducer;


