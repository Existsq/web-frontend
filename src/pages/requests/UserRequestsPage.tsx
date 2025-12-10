import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Table, Badge, Container, Card, Form, Row, Col } from "react-bootstrap";
import Header from "../../components/layout/Header";
import { useAppSelector } from "../../store/store";
import { api } from "../../api";
import type { CalculateCpiDTO } from "../../api";
import "./UserRequestsPage.css";

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: string; label: string }> = {
    DRAFT: { variant: "secondary", label: "Черновик" },
    FORMED: { variant: "info", label: "Оформлен" },
    COMPLETED: { variant: "success", label: "Завершен" },
    REJECTED: { variant: "danger", label: "Отклонен" },
    DELETED: { variant: "dark", label: "Удален" },
  };

  const statusInfo = statusMap[status] || { variant: "secondary", label: status };
  return <Badge bg={statusInfo.variant}>{statusInfo.label}</Badge>;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
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
  const [requests, setRequests] = useState<CalculateCpiDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры: по умолчанию сегодня-сегодня, статус - любой
  const today = new Date();
  const [dateFrom, setDateFrom] = useState<string>(formatDateForInput(today));
  const [dateTo, setDateTo] = useState<string>(formatDateForInput(today));
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.api.getAll();
        const data = response.data;
        
        // Логируем структуру данных для отладки
        if (data.length > 0) {
          console.log("First request structure:", data[0]);
          console.log("Request ID:", (data[0] as any).id);
        }
        
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
        setError("Не удалось загрузить список расчетов");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]);

  // Применяем фильтры к заявкам
  const filteredRequests = useMemo(() => {
    if (!requests.length) return [];

    const fromDate = getStartOfDay(new Date(dateFrom));
    const toDate = getEndOfDay(new Date(dateTo));

    const filtered = requests.filter((request) => {
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

    // Применяем сортировку к отфильтрованным заявкам
    return [...filtered].sort((a, b) => {
      if (a.status === "DRAFT" && b.status !== "DRAFT") return -1;
      if (a.status !== "DRAFT" && b.status === "DRAFT") return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [requests, dateFrom, dateTo, statusFilter]);

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
        <div className="requests-page-header">
          <h1 className="requests-page-title">Мои расчеты CPI</h1>
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
          <Card className="requests-filters-card mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Label>С даты</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>По дату</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Статус</Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">Любой</option>
                    <option value="DRAFT">Черновик</option>
                    <option value="FORMED">Оформлен</option>
                    <option value="COMPLETED">Завершен</option>
                    <option value="REJECTED">Отклонен</option>
                    <option value="DELETED">Удален</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>
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
              <div className="requests-table-wrapper">
                <Table striped bordered hover responsive className="requests-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ID</th>
                      <th>Статус</th>
                      <th>Дата создания</th>
                      <th>Категорий</th>
                      <th>Сумма расходов</th>
                      <th>Персональный CPI</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request, idx) => {
                  const totalSpent =
                    request.categories?.reduce(
                      (sum, cat) => sum + (cat.userSpent ?? 0),
                      0
                    ) ?? 0;
                  const categoriesCount = request.categories?.length ?? 0;
                  
                  // Получаем ID из request
                  const requestId = request.id;

                  return (
                    <tr key={requestId || idx}>
                      <td>{idx + 1}</td>
                      <td>{requestId ? `#${requestId}` : "—"}</td>
                      <td>{getStatusBadge(request.status || "")}</td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td>{categoriesCount}</td>
                      <td>
                        {totalSpent > 0
                          ? `${totalSpent.toLocaleString("ru-RU", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} руб.`
                          : "—"}
                      </td>
                      <td>
                        {request.personalCPI
                          ? `${request.personalCPI.toFixed(2)}%`
                          : "—"}
                      </td>
                      <td>
                        {requestId ? (
                          <Link
                            to={`/calculate-cpi/${requestId}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Открыть
                          </Link>
                        ) : (
                          <span className="text-muted">ID отсутствует</span>
                        )}
                      </td>
                    </tr>
                  );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
