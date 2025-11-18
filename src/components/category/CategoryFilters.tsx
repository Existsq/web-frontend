import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Form, Card } from "react-bootstrap";
import type { RootState, AppDispatch } from "../../store/store";
import {
  setFilters,
  type SortBy,
  type SortOrder,
} from "../../store/filtersSlice";

export default function CategoryFilters() {
  const dispatch: AppDispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ ...filters, sortBy: e.target.value as SortBy }));
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ ...filters, order: e.target.value as SortOrder }));
  };

  return (
    <Card style={{ maxWidth: "600px", width: "100%" }} className="border-0">
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={12} md={6} className="mb-2 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Сортировать по:</Form.Label>
              <Form.Select value={filters.sortBy} onChange={handleSortByChange}>
                <option value="price">По цене</option>
                <option value="alphabet">По алфавиту</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="fw-bold">Порядок:</Form.Label>
              <Form.Select value={filters.order} onChange={handleOrderChange}>
                <option value="asc">По возрастанию</option>
                <option value="desc">По убыванию</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
