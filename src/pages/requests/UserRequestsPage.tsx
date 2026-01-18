import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Form, Row, Col, Button } from "react-bootstrap";
import Header from "../../components/layout/Header";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { api } from "../../api";
import { approveCpiCalculation } from "../../store/requestsSlice";
import type { CalculateCpiDTO } from "../../api";
import "./UserRequestsPage.css";

// Функция для форматирования даты в формат ДД.ММ.ГГГГ
const formatDateDDMMYYYY = (dateString?: string) => {
  if (!dateString) return "—";
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


// Функция для получения русского названия статуса
const getStatusLabel = (status?: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: "Черновик",
    FORMED: "Оформлен",
    COMPLETED: "Завершен",
    REJECTED: "Отклонен",
    DELETED: "Удален",
  };
  return statusMap[status || ""] || status || "—";
};

// Функция для форматирования даты в формат YYYY-MM-DD для input type="date"
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Функция для получения начала дня
const getStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Функция для получения конца дня
const getEndOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export default function UserRequestsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [requests, setRequests] = useState<CalculateCpiDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitialLoadRef = useRef(true);

  const isModerator = user?.moderator === true;

  // Фильтры: для модераторов - по дате формирования, для обычных пользователей - по дате создания
  const today = new Date();
  const [formedFrom, setFormedFrom] = useState<string>(formatDateForInput(today));
  const [formedTo, setFormedTo] = useState<string>(formatDateForInput(today));
  const [dateFrom, setDateFrom] = useState<string>(formatDateForInput(today));
  const [dateTo, setDateTo] = useState<string>(formatDateForInput(today));
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [creatorFilter, setCreatorFilter] = useState<string>("");

  const loadRequests = useCallback(async (isInitialLoad: boolean) => {
    if (!user) {
      setRequests([]);
      if (isInitialLoad) setLoading(false);
      return;
    }

    // Показываем индикатор загрузки только при первой загрузке или явном запросе
    if (isInitialLoad || isInitialLoadRef.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const queryParams: {
        formedFrom?: string;
        formedTo?: string;
        status?: "DRAFT" | "DELETED" | "FORMED" | "COMPLETED" | "REJECTED";
      } = {};

      if (isModerator) {
        // Для модераторов используем бэкенд-фильтрацию по дате формирования
        if (formedFrom) {
          queryParams.formedFrom = formedFrom;
        }
        if (formedTo) {
          queryParams.formedTo = formedTo;
        }
        if (statusFilter !== "ALL") {
          queryParams.status = statusFilter as "DRAFT" | "DELETED" | "FORMED" | "COMPLETED" | "REJECTED";
        }
      }

      const response = await api.api.getAll(queryParams);
      const data = response.data;
      
      // Сортируем: сначала черновики, потом по дате создания (новые сверху)
      const sorted = [...data].sort((a, b) => {
        if (a.status === "DRAFT" && b.status !== "DRAFT") return -1;
        if (a.status !== "DRAFT" && b.status === "DRAFT") return 1;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setRequests(sorted);
    } catch (err) {
      console.error("Failed to load requests:", err);
      // Показываем ошибку только при первой загрузке
      if (isInitialLoad || isInitialLoadRef.current) {
        setError("Не удалось загрузить список расчетов");
        setRequests([]);
      }
    } finally {
      if (isInitialLoad || isInitialLoadRef.current) {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }
  }, [user, isModerator, formedFrom, formedTo, statusFilter]);

  useEffect(() => {
    // Сбрасываем флаг первой загрузки при изменении фильтров
    isInitialLoadRef.current = true;
    loadRequests(true);

    // Short polling только для модераторов
    if (isModerator) {
      // Интервал поллинга из переменной окружения (по умолчанию 20 секунд)
      const pollingInterval = Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || 20000;
      
      pollingIntervalRef.current = setInterval(() => {
        loadRequests(false);
      }, pollingInterval);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [loadRequests, isModerator]);

  // Применяем фильтры к заявкам
  const filteredRequests = useMemo(() => {
    if (!requests.length) return [];

    let filtered = requests;

    // Для обычных пользователей применяем фронтенд-фильтрацию по дате создания
    if (!isModerator) {
      const fromDate = getStartOfDay(new Date(dateFrom));
      const toDate = getEndOfDay(new Date(dateTo));

      filtered = requests.filter((request) => {
        // Фильтр по дате
        if (request.createdAt) {
          const requestDate = new Date(request.createdAt);
          if (requestDate < fromDate || requestDate > toDate) {
            return false;
          }
        } else {
          // Если нет даты создания, пропускаем
          return false;
        }

        // Фильтр по статусу
        if (statusFilter !== "ALL" && request.status !== statusFilter) {
          return false;
        }

        return true;
      });
    } else {
      // Для модераторов фильтрация по статусу уже выполнена на бэкенде
      // Применяем только фильтр по создателю (фронтенд-фильтрация)
      if (creatorFilter) {
        filtered = requests.filter((request) => 
          request.creatorUsername?.toLowerCase().includes(creatorFilter.toLowerCase())
        );
      }
    }

    // Применяем сортировку к отфильтрованным заявкам
    return [...filtered].sort((a, b) => {
      if (a.status === "DRAFT" && b.status !== "DRAFT") return -1;
      if (a.status !== "DRAFT" && b.status === "DRAFT") return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [requests, dateFrom, dateTo, statusFilter, creatorFilter, isModerator]);

  const handleModerateRequest = async (requestId: number, approve: boolean) => {
    try {
      await dispatch(approveCpiCalculation({ requestId, approve })).unwrap();
      // После успешного изменения статуса сразу обновляем список
      // (для модераторов поллинг продолжит обновлять данные каждые 2.5 секунды)
      await loadRequests(false);
    } catch (error) {
      console.error(`Failed to ${approve ? 'complete' : 'reject'} request:`, error);
    }
  };

  if (!user) {
    return (
      <div className="main-page-container">
        <Header />
        <Container className="requests-page-container">
          <Card className="requests-empty-card">
            <Card.Body className="text-center py-5">
              <p className="text-muted mb-0">
                Для просмотра заявок выполните вход.
              </p>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="main-page-container">
      <Header />
      <Container className="requests-page-container">
        {/* Хлебные крошки */}
        <nav className="breadcrumbs-container" aria-label="Breadcrumb">
          <ol className="breadcrumbs-list">
            <li className="breadcrumbs-item">
              <Link to="/" className="breadcrumbs-link">Главная</Link>
            </li>
            <li className="breadcrumbs-item">
              <span className="breadcrumbs-separator"> / </span>
              <span className="breadcrumbs-current">Заявки</span>
            </li>
          </ol>
        </nav>

        <div className="requests-page-header">
          <h1 className="requests-page-title">
            {isModerator ? "Управление заявками" : "Мои расчеты CPI"}
          </h1>
        </div>

        {loading && (
          <div className="requests-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        )}

        {error && (
          <Card className="requests-error-card">
            <Card.Body className="text-center py-4">
              <p className="text-danger mb-0">{error}</p>
            </Card.Body>
          </Card>
        )}

        {!loading && !error && (
          <div className="requests-filters-row">
            <Row className="g-3 align-items-end">
              <Col md={isModerator ? 2 : 3}>
                <Form.Label className="filter-label">Статус</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-control"
                >
                  <option value="ALL">Любой</option>
                  <option value="DRAFT">Черновик</option>
                  <option value="FORMED">Оформлен</option>
                  <option value="COMPLETED">Завершен</option>
                  <option value="REJECTED">Отклонен</option>
                  <option value="DELETED">Удален</option>
                </Form.Select>
              </Col>
              {isModerator ? (
                <>
                  <Col md={3}>
                    <Form.Label className="filter-label">Дата начала</Form.Label>
                    <Form.Control
                      type="date"
                      value={formedFrom}
                      onChange={(e) => setFormedFrom(e.target.value)}
                      className="filter-control"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="filter-label">Дата окончания</Form.Label>
                    <Form.Control
                      type="date"
                      value={formedTo}
                      onChange={(e) => setFormedTo(e.target.value)}
                      className="filter-control"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="filter-label">Создатель</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введите имя создателя..."
                      value={creatorFilter}
                      onChange={(e) => setCreatorFilter(e.target.value)}
                      className="filter-control"
                    />
                  </Col>
                </>
              ) : (
                <>
                  <Col md={4}>
                    <Form.Label className="filter-label">Дата начала</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="filter-control"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="filter-label">Дата окончания</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="filter-control"
                    />
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <Card className="requests-empty-card">
            <Card.Body className="text-center py-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="empty-icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h3 className="mt-3 mb-2">У вас пока нет расчетов</h3>
              <p className="text-muted mb-4">
                Создайте черновик, добавив категории на странице категорий
              </p>
            </Card.Body>
          </Card>
        )}

        {!loading && !error && requests.length > 0 && (
          <>
            {filteredRequests.length === 0 && (
              <Card className="requests-empty-card mb-4">
                <Card.Body className="text-center py-4">
                  <p className="text-muted mb-0">
                    Нет заявок, соответствующих выбранным фильтрам
                  </p>
                </Card.Body>
              </Card>
            )}
            {filteredRequests.length > 0 && (
              <div className="requests-list">
                {filteredRequests.map((request, idx) => {
                  const totalSpent =
                    request.categories?.reduce(
                      (sum, cat) => sum + (cat.userSpent ?? 0),
                      0
                    ) ?? 0;
                  
                  // Получаем ID из request
                  const requestId = request.id;

                  return (
                    <Card key={requestId || idx} className="request-card-new">
                      <Card.Body>
                        {/* Номер заявки */}
                        <div className="request-number">
                          Заявка №{requestId || "—"}
                        </div>
                        
                        {/* Детали в одну строку */}
                        <div className="request-details-row">
                          <div className="request-detail-item">
                            <div className="request-detail-value">
                              {getStatusLabel(request.status)}
                            </div>
                            <div className="request-detail-label">Статус</div>
                          </div>
                          
                          <div className="request-detail-item">
                            <div className="request-detail-value">
                              {formatDateDDMMYYYY(request.createdAt)}
                            </div>
                            <div className="request-detail-label">Дата создания</div>
                          </div>
                          
                          {request.formedAt && (
                            <div className="request-detail-item">
                              <div className="request-detail-value">
                                {formatDateDDMMYYYY(request.formedAt)}
                              </div>
                              <div className="request-detail-label">Дата формирования</div>
                            </div>
                          )}
                          
                          {totalSpent > 0 && (
                            <div className="request-detail-item">
                              <div className="request-detail-value">
                                {totalSpent.toLocaleString("ru-RU", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })} ₽
                              </div>
                              <div className="request-detail-label">Сумма расходов</div>
                            </div>
                          )}
                          
                          {isModerator && (
                            <div className="request-detail-item">
                              <div className="request-detail-value">
                                {request.creatorUsername || "—"}
                              </div>
                              <div className="request-detail-label">Создатель</div>
                            </div>
                          )}
                          
                          {/* Персональный CPI - показываем всегда, если статус COMPLETED */}
                          {request.status === "COMPLETED" && (
                            <div className="request-detail-item">
                              <div className="request-detail-value">
                                {request.personalCPI != null ? (
                                  <span className="request-cpi-value">
                                    {request.personalCPI.toFixed(2)}%
                                  </span>
                                ) : (
                                  <span className="request-cpi-not-calculated">
                                    Не рассчитан
                                  </span>
                                )}
                              </div>
                              <div className="request-detail-label">Персональный CPI</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Кнопка открыть и кнопки модерации */}
                        <div className="request-card-actions-new">
                          {requestId ? (
                            <Link
                              to={`/calculate-cpi/${requestId}`}
                              className="btn btn-primary request-open-btn"
                            >
                              Открыть
                            </Link>
                          ) : (
                            <span className="text-muted">ID отсутствует</span>
                          )}

                          {isModerator && request.status === "FORMED" && requestId && (
                            <div className="moderator-actions-new">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleModerateRequest(requestId, true)}
                                className="moderator-action-btn-new"
                              >
                                Завершить
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleModerateRequest(requestId, false)}
                                className="moderator-action-btn-new"
                              >
                                Отклонить
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
