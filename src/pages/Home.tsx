import { Container } from 'react-bootstrap';
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
        </Container>
      </section>
    </div>
  );
}

export default Home;

