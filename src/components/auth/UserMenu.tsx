import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { logoutAsync } from "../../store/authSlice";
import "./UserMenu.css";

export const UserMenu = () => {
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((s) => s.auth);

  if (!initialized) {
    return (
      <div className="user-menu-loading">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!user || !user.username) {
    return (
      <Link to="/login" className="user-login-btn">
        Войти
      </Link>
    );
  }

  return (
    <div className="user-menu-container">
      <Link to="/account" className="user-name-link">
        {user.username}
      </Link>
      <button
        onClick={() => dispatch(logoutAsync())}
        className="user-login-btn"
      >
        Выйти
      </button>
    </div>
  );
};
