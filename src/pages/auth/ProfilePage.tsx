import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { authUpdateProfile, authChangePassword } from "../../store/authSlice";
import "./ProfilePage.css";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const submitProfile = () => {
    dispatch(authUpdateProfile({ username }));
  };

  const submitPassword = () => {
    if (!oldPassword || !newPassword || newPassword !== newPassword2) return;
    dispatch(authChangePassword({ oldPassword, newPassword }));
  };

  if (!user) {
    return (
      <div className="container mt-5">
        Для доступа к личному кабинету необходимо войти в систему.
      </div>
    );
  }

  return (
    <div className="container profile-container">
      <h2 className="mb-4 profile-title">Личный кабинет</h2>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <Card className="p-3 h-100">
          <h4>Профиль</h4>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submitProfile();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            {error && <div className="text-danger mb-2">{error}</div>}

            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </Form>
        </Card>
        </div>

        <div className="col-12 col-lg-6">
        <Card className="p-3 h-100">
          <h4>Смена пароля</h4>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submitPassword();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Текущий пароль</Form.Label>
              <Form.Control
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Новый пароль</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Подтверждение нового пароля</Form.Label>
              <Form.Control
                type="password"
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                minLength={6}
              />
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? "Изменение..." : "Изменить пароль"}
            </Button>
          </Form>
        </Card>
        </div>
      </div>
    </div>
  );
}


