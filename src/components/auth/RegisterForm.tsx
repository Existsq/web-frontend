import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { register } from "../../store/authSlice";

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const submit = () => {
    if (!username || !password || password !== password2) {
      return;
    }
    dispatch(register({ username, password }));
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
        <Form.Label>Логин</Form.Label>
        <Form.Control
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Подтверждение пароля</Form.Label>
        <Form.Control
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          minLength={6}
          required
        />
      </Form.Group>

      {error && <div className="text-danger mb-2">{error}</div>}

      <div className="d-flex justify-content-center">
      <Button type="submit" disabled={loading}>
        {loading ? "Загрузка..." : "Зарегистрироваться"}
      </Button>
      </div>
    </Form>
  );
}
