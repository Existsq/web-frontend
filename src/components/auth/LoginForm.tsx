import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { authLogin } from "../../store/authSlice";
import { loadCpiDraft } from "../../store/requestsSlice";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Автоматический редирект при успешной авторизации и обновление корзины
  useEffect(() => {
    if (user) {
      // Обновляем корзину после входа
      dispatch(loadCpiDraft());
      navigate("/"); // перенаправляем на главную
    }
  }, [user, navigate, dispatch]);

  const submit = () => {
    dispatch(authLogin({ username, password }));
  };

  return (
    <Form
      className="p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Form.Group className="mb-3">
        <Form.Label>Имя пользователя</Form.Label>
        <Form.Control
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      {error && <div className="text-danger mb-2">{error}</div>}

      <div className="d-flex justify-content-center">
      <Button type="submit" disabled={loading}>
        {loading ? "Загрузка..." : "Войти"}
      </Button>
      </div>
    </Form>
  );
}