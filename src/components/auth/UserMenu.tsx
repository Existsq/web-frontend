import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { logoutAsync } from "../../store/authSlice";
import { Dropdown } from "react-bootstrap";
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
    <Dropdown className="user-menu-dropdown">
      <Dropdown.Toggle
        variant="light"
        id="user-menu-dropdown"
        className="user-menu-toggle"
      >
        <span className="user-name-text">{user.username}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="dropdown-arrow"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="user-menu-dropdown-menu">
        <Dropdown.Item as={Link} to="/account" className="user-menu-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="menu-icon"
          >
            <path
              d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
              fill="currentColor"
            />
            <path
              d="M8 10C4.68629 10 2 12.6863 2 16H14C14 12.6863 11.3137 10 8 10Z"
              fill="currentColor"
            />
          </svg>
          Личный кабинет
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          as="button"
          onClick={() => dispatch(logoutAsync())}
          className="user-menu-item user-menu-logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="menu-icon"
          >
            <path
              d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 11L13 8L10 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 8H6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Выйти
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
