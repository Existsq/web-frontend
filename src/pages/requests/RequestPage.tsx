import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Button, Container, Modal, Form } from "react-bootstrap";
import Header from "../../components/layout/Header";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  loadCpiDraft,
  loadCpiCalculation,
  updateCpiExpense,
  removeCpiCategory,
  submitCpiCalculation,
  approveCpiCalculation,
} from "../../store/requestsSlice";
import { api } from "../../api";
import "./RequestPage.css";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Функция для форматирования даты сравнения (формат YYYY-MM-DD)
const formatComparisonDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    // Если дата в формате YYYY-MM-DD, парсим её напрямую
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatCoefficient = (coefficient?: number) => {
  if (coefficient == null) return "0%";
  if (coefficient % 1 === 0) {
    return `${coefficient.toFixed(0)}%`;
  }
  return `${coefficient.toFixed(1)}%`;
};

// Функция для форматирования даты в формат ДД.ММ.ГГГГ для отображения
const formatDateForInputDisplay = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateString;
  }
};

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentDraft, currentRequest, loading, error } = useAppSelector(
    (s) => s.requests
  );
  const { user } = useAppSelector((s) => s.auth);

  const isDraft = !id;
  const request = isDraft ? currentDraft : currentRequest;
  
  // Получаем ID заявки: из URL, из request.id, или из currentDraft/currentRequest
  const requestId = id ? Number(id) : (request?.id ?? (isDraft ? currentDraft?.id : currentRequest?.id));
  
  // Проверяем, является ли пользователь владельцем заявки
  const isOwner = user?.username && request?.creatorUsername === user.username;
  
  // Проверяем, является ли пользователь модератором
  const isModerator = user?.moderator === true;
  
  // Можно редактировать только если:
  // 1. Пользователь является владельцем заявки
  // 2. Заявка в статусе DRAFT (черновик)
  // 3. Есть ID заявки (из URL или из объекта)
  const canEdit = !!(isOwner && request?.status === "DRAFT" && requestId);
  
  // Можно завершить/отклонить заявку только если:
  // 1. Пользователь является модератором
  // 2. Заявка в статусе FORMED (оформлена)
  // 3. Есть ID заявки
  const canModerate = !!(isModerator && request?.status === "FORMED" && requestId);
  
  // readOnly = true если нельзя редактировать (не владелец ИЛИ статус не DRAFT)
  const readOnly = !canEdit;

  // Отладочный вывод в консоль
  console.log("=== RequestPage Debug ===");
  console.log("URL id:", id);
  console.log("isDraft (no id in URL):", isDraft);
  console.log("currentDraft:", currentDraft);
  console.log("currentRequest:", currentRequest);
  console.log("request (selected):", request);
  console.log("requestId (resolved):", requestId);
  console.log("user:", user);
  console.log("user.username:", user?.username);
  console.log("request?.creatorUsername:", request?.creatorUsername);
  console.log("isOwner:", isOwner);
  console.log("request?.status:", request?.status);
  console.log("request?.id:", request?.id);
  console.log("canEdit:", canEdit);
  console.log("readOnly:", readOnly);
  console.log("========================");

  useEffect(() => {
    if (isDraft) {
      dispatch(loadCpiDraft());
    } else if (id) {
      dispatch(loadCpiCalculation(id));
    }
  }, [dispatch, isDraft, id]);

  const handleDelete = async (cpiId: string | number, categoryId: string | number) => {
    try {
      // Проверяем количество категорий перед удалением
      const currentCategoriesCount = request?.categories?.length || 0;
      const isLastCategory = currentCategoriesCount === 1;
      
      const result = await dispatch(removeCpiCategory({ cpiId, categoryId })).unwrap();
      
      // Проверяем, остались ли категории после удаления
      const hasCategories = result.draft?.categories && result.draft.categories.length > 0;
      const hasDraftInfo = result.info && result.info.countCategories && result.info.countCategories > 0;
      
      // Если это была последняя категория или черновик стал пустым, редиректим на страницу категорий
      if (isLastCategory || (!hasCategories && !hasDraftInfo)) {
        navigate("/categories");
        return;
      }
      
      // Перезагружаем данные в зависимости от типа заявки
      if (isDraft) {
        // Если это черновик, перезагружаем его
        await dispatch(loadCpiDraft());
      } else if (id) {
        // Если это конкретная заявка, перезагружаем её
        await dispatch(loadCpiCalculation(id));
      }
      // Всегда перезагружаем draftInfo для обновления корзины
      await dispatch(loadCpiDraft());
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleConfirm = (draftId: string | number) => {
    dispatch(submitCpiCalculation(draftId));
  };

  const handleModerateRequest = async (approve: boolean) => {
    if (!requestId) return;
    
    try {
      await dispatch(approveCpiCalculation({ requestId, approve })).unwrap();
      // После успешного одобрения/отклонения загружаем обновленный расчет
      await dispatch(loadCpiCalculation(requestId)).unwrap();
    } catch (error) {
      console.error(`Failed to ${approve ? 'complete' : 'reject'} request:`, error);
    }
  };

  const handleClearAll = async () => {
    if (!requestId || !request?.categories || request.categories.length === 0) {
      return;
    }

    try {
      // Удаляем все категории по очереди
      const categoriesToDelete = [...request.categories];
      
      for (const category of categoriesToDelete) {
        if (category.id) {
          try {
            await dispatch(removeCpiCategory({ cpiId: requestId, categoryId: category.id })).unwrap();
          } catch (error) {
            console.error(`Failed to delete category ${category.id}:`, error);
          }
        }
      }

      // После удаления всех категорий черновик будет удален автоматически
      // Редиректим на страницу категорий
      navigate("/categories");
    } catch (error) {
      console.error("Failed to clear all items:", error);
    }
  };

  const imageServerUrl = import.meta.env.VITE_MINIO_BASE_URL || 'http://127.0.0.1:9000';

  // Локальное состояние для редактируемых значений
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  
  // Состояние для модального окна выбора даты сравнения
  const [showDateModal, setShowDateModal] = useState(false);
  const [comparisonDate, setComparisonDate] = useState<string>("");
  const [updatingDate, setUpdatingDate] = useState(false);

  // Обновляем локальное состояние при загрузке данных
  useEffect(() => {
    if (request?.categories) {
      const initialValues: Record<number, string> = {};
      request.categories.forEach((cat) => {
        if (cat.id !== undefined) {
          initialValues[cat.id] = cat.userSpent?.toString() ?? "";
        }
      });
      setEditedValues(initialValues);
    }
    
    // Устанавливаем дату сравнения из заявки
    if (request?.comparisonDate) {
      // Преобразуем дату из формата YYYY-MM-DD в формат для input type="date"
      setComparisonDate(request.comparisonDate.split('T')[0]);
    } else {
      setComparisonDate("");
    }
  }, [request?.categories, request?.comparisonDate]);

  const handleInputChange = (categoryId: number, value: string) => {
    // Если значение пустое, сохраняем пустую строку
    setEditedValues((prev) => ({ ...prev, [categoryId]: value === "" ? "" : value }));
  };

  const handleSaveAmount = (categoryId: number) => {
    const value = editedValues[categoryId];
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0 || !requestId) return;

    dispatch(
      updateCpiExpense({
        cpiId: requestId,
        categoryId,
        amount,
      })
    ).then(() => {
      if (!isDraft && id) {
        dispatch(loadCpiCalculation(id));
      }
    });
  };

  const handleUpdateComparisonDate = async () => {
    if (!requestId) return;
    
    setUpdatingDate(true);
    try {
      await api.api.update1(requestId, {
        ...request,
        comparisonDate: comparisonDate || undefined,
      });
      
      // Перезагружаем расчет
      if (isDraft) {
        await dispatch(loadCpiDraft());
      } else if (id) {
        await dispatch(loadCpiCalculation(id));
      }
      
      setShowDateModal(false);
    } catch (error) {
      console.error("Failed to update comparison date:", error);
    } finally {
      setUpdatingDate(false);
    }
  };

  return (
    <div className="main-page-container">
      <Header />
      <Container className="request-page-container">
        <div className="request-page-header">
          <div>
            <h1 className="request-page-title">
              {isDraft ? "Черновик расчета CPI" : "Расчет CPI"}
            </h1>
            {request && (
              <div className="request-page-meta">
                {request.comparisonDate && (
                  <span className="request-meta-item">
                    Дата сравнения: {formatComparisonDate(request.comparisonDate)}
                  </span>
                )}
                {request.createdAt && (
                  <span className="request-meta-item">
                    Создан: {formatDate(request.createdAt)}
                  </span>
                )}
                {request.formedAt && (
                  <span className="request-meta-item">
                    Оформлен: {formatDate(request.formedAt)}
                  </span>
                )}
                {request.completedAt && (
                  <span className="request-meta-item">
                    Завершен: {formatDate(request.completedAt)}
                  </span>
                )}
              </div>
            )}
          </div>
          {request && canEdit && (
            <Button
              variant="outline-primary"
              onClick={() => setShowDateModal(true)}
              className="comparison-date-btn"
            >
              {request.comparisonDate 
                ? `Дата сравнения: ${formatDateForInputDisplay(request.comparisonDate)}`
                : "Выбрать дату сравнения"}
            </Button>
          )}
        </div>

        {loading && (
          <div className="request-page-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !request && (
          <Card className="request-page-empty">
            <Card.Body className="text-center py-5">
              <p className="text-muted mb-0">
                {isDraft
                  ? "Черновик отсутствует. Добавьте категории, чтобы создать расчет."
                  : "Расчет не найден."}
              </p>
            </Card.Body>
          </Card>
        )}

        {!loading && request && (
          <>
            {request.status === "COMPLETED" && request.calculationSuccess !== null && request.calculationSuccess !== undefined && (
              <div className="cpi-text-container">
                {request.calculationSuccess === true && request.personalCPI != null ? (
                  <p className="cpi-text">
                    Ваш персональный ИПЦ - <span>{request.personalCPI.toFixed(2)}%</span>
                  </p>
                ) : (
                  <p className="cpi-text cpi-text-error">
                    Произошла ошибка при расчете персонального ИПЦ
                  </p>
                )}
              </div>
            )}

            <div className="order-grid">
              {!request.categories || request.categories.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  Категории не добавлены
                </div>
              ) : (
                request.categories.map((cat, idx) => {
                  const imageUrl = cat.imageUUID
                    ? `${imageServerUrl}/categories/${cat.imageUUID}.jpg`
                    : undefined;

                  return (
                    <div key={cat.id} className="ordered-container">
                      <div className="number-container">
                        <p className="number-text">{idx + 1}</p>
                      </div>

                      <div className="horizontal-card-container">
                        <div
                          className="horizontal-card-image-container"
                          style={
                            imageUrl
                              ? {
                                  backgroundImage: `url(${imageUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : {
                                  backgroundColor: "#f5f5f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }
                          }
                        >
                          {!imageUrl && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ color: "#999" }}
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          )}
                        </div>

                        <div className="horizontal-card-content-container">
                          <div className="horizontal-card-title-container">
                            <p className="horizontal-card-title-text">{cat.title}</p>
                          </div>

                          <div className="horizontal-card-description-container">
                            <p className="horizontal-card-description-text">
                              {cat.shortDescription || cat.description || "—"}
                            </p>
                          </div>

                          <div className="horizontal-card-index-container">
                            <p className="horizontal-card-index-text">
                              {formatCoefficient(cat.coefficient)}
                            </p>
                          </div>

                          <div className="horizontal-card-actions">
                            {readOnly ? (
                              <div className="horizontal-card-input-container readonly">
                                {(cat.userSpent ?? 0).toLocaleString("ru-RU", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })} руб.
                              </div>
                            ) : (
                              <div className="input-with-button">
                              <div className="input-wrapper-with-label">
                                <input
                                  className="horizontal-card-input-container"
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  placeholder={cat.basePrice ? String(cat.basePrice) : "0"}
                                  value={cat.id !== undefined ? (editedValues[cat.id] ?? "") : ""}
                                  onChange={(e) => {
                                    if (cat.id !== undefined) {
                                      handleInputChange(cat.id, e.target.value);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && cat.id !== undefined) {
                                      handleSaveAmount(cat.id);
                                    }
                                  }}
                                />
                                <span className="input-currency-label">руб.</span>
                              </div>
                                <button
                                  className="save-amount-btn"
                                  onClick={() => {
                                    if (cat.id !== undefined) {
                                      handleSaveAmount(cat.id);
                                    }
                                  }}
                                  type="button"
                                >
                                  Сохранить
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {canEdit && (
                        <button
                          className="delete-icon-container delete-icon-external"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (requestId && cat.id) {
                              handleDelete(requestId, cat.id);
                            }
                          }}
                          type="button"
                          title="Удалить категорию из заявки"
                        >
                          <svg
                            className="delete-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 15 19"
                            fill="none"
                          >
                            <path
                              d="M11.7857 6.33333V16.8889H3.21429V6.33333H11.7857ZM10.1786 0H4.82143L3.75 1.05556H0V3.16667H15V1.05556H11.25L10.1786 0ZM13.9286 4.22222H1.07143V16.8889C1.07143 18.05 2.03571 19 3.21429 19H11.7857C12.9643 19 13.9286 18.05 13.9286 16.8889V4.22222Z"
                              fill="#dc3545"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {!readOnly && requestId && (
              <div className="cart-buttons-wrapper">
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleClearAll}
                  className="calculateCpi-button-container"
                  disabled={!request?.categories || request.categories.length === 0}
                >
                  Очистить все
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleConfirm(requestId)}
                  className="calculateCpi-button-container"
                >
                  Оформить расчет
                </Button>
              </div>
            )}

            {canModerate && requestId && (
              <div className="cart-buttons-wrapper mt-3">
                <div className="d-flex gap-3 justify-content-center">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => handleModerateRequest(true)}
                    className="calculateCpi-button-container"
                    disabled={loading}
                  >
                    {loading ? "Обработка..." : "Завершить заявку"}
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => handleModerateRequest(false)}
                    className="calculateCpi-button-container"
                    disabled={loading}
                  >
                    {loading ? "Обработка..." : "Отклонить заявку"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Модальное окно для выбора даты сравнения */}
        <Modal show={showDateModal} onHide={() => setShowDateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Выбор даты сравнения</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Дата сравнения</Form.Label>
              <Form.Control
                type="date"
                value={comparisonDate}
                onChange={(e) => setComparisonDate(e.target.value)}
              />
              <Form.Text className="text-muted">
                Выберите дату для базовой цены P_i(t0) в расчете персонального ИПЦ
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDateModal(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateComparisonDate}
              disabled={updatingDate}
            >
              {updatingDate ? "Сохранение..." : "Сохранить"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
