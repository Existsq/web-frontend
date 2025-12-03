// src/pages/auth/AuthPage.tsx
import { useState } from "react";
import { Card, Button } from "react-bootstrap";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import "./AuthPage.css";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="auth-page-container">
      <Card className="auth-card p-3">
        <h3 className="mb-3 text-center">
          {mode === "login" ? "Вход" : "Регистрация"}
        </h3>

        {mode === "login" ? <LoginForm /> : <RegisterForm />}

        <Button
          variant="link"
          className="mt-2"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </Button>
      </Card>
    </div>
  );
}
