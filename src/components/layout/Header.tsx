import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Logo from './Logo';
import './Header.css';

function Header() {
  return (
    <Navbar bg="white" expand="lg" fixed="top" className="custom-navbar">
      <Container fluid className="px-5">
        <Navbar.Brand as={Link} to="/" className="p-0">
          <Logo />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/categories">
              Категории
            </Nav.Link>
            <Nav.Link disabled>
              Расчеты
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;