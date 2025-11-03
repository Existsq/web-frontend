import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import Header from '../components/layout/Header';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <Header />
      <section className="hero-section">
        <Container className="hero-content">
          <h1 className="hero-title">Система расчета индекса потребительских цен</h1>
          <p className="hero-description">
            Комплексная платформа для расчета и анализа ИПЦ на основе категорий услуг 
            и их ценовых данных. Отслеживайте инфляцию и оценивайте изменения в стоимости жизни.
          </p>
          <div className="hero-buttons d-flex gap-3">
            <Button as={Link} to="/categories" variant="primary" size="lg" className="hero-button">
              Категории
            </Button>
            <Button variant="outline-secondary" size="lg" disabled className="hero-button">
              Расчеты
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Home;

