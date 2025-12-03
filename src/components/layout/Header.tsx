import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Logo from "./Logo";
import { UserMenu } from "../../components/auth/UserMenu";
import { useAppSelector } from "../../store/store";
import "./Header.css";

function Header() {
  const { user, initialized } = useAppSelector((s) => s.auth);
  
  // Показываем кнопку "Мои заявки" только для авторизованных пользователей
  const isAuthenticated = initialized && user && user.username;

  return (
    <Navbar bg="white" expand="lg" fixed="top" className="custom-navbar">
      <Container fluid className="px-5">
        <Navbar.Brand as={Link} to="/" className="p-0">
          <Logo />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/categories">
              Категории
            </Nav.Link>

            {isAuthenticated && (
              <Nav.Link as={Link} to="/requests">
                Мои заявки
              </Nav.Link>
            )}

            <UserMenu />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
