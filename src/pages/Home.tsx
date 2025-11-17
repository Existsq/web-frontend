import { Container } from "react-bootstrap";
import Header from "../components/layout/Header";
import Carousel from "react-bootstrap/Carousel";
import "./Home.css";

function Home() {
  const slides = [
    "https://media.istockphoto.com/id/1457979959/photo/snack-junk-fast-food-on-table-in-restaurant-soup-sauce-ornament-grill-hamburger-french-fries.jpg?s=612x612&w=0&k=20&c=QbFk2SfDb-7oK5Wo9dKmzFGNoi-h8HVEdOYWZbIjffo=",
    "https://media.istockphoto.com/id/1457979959/photo/snack-junk-fast-food-on-table-in-restaurant-soup-sauce-ornament-grill-hamburger-french-fries.jpg?s=612x612&w=0&k=20&c=QbFk2SfDb-7oK5Wo9dKmzFGNoi-h8HVEdOYWZbIjffo=",
    "https://media.istockphoto.com/id/1457979959/photo/snack-junk-fast-food-on-table-in-restaurant-soup-sauce-ornament-grill-hamburger-french-fries.jpg?s=612x612&w=0&k=20&c=QbFk2SfDb-7oK5Wo9dKmzFGNoi-h8HVEdOYWZbIjffo=",
  ];

  return (
    <div className="home-page">
      <Header />

      <section
        className="hero-section"
        style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Фоновая карусель */}
        <Carousel
          controls
          indicators={false}
          fade
          interval={5000}
          wrap
          className="home-carousel"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          {slides.map((url, idx) => (
            <Carousel.Item key={idx} style={{ height: "100vh" }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "brightness(55%)", // затемнение фона
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>

        {/* Контент поверх */}
        <Container
          className="hero-content"
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          <h1 className="hero-title">
            Система расчета индекса потребительских цен
          </h1>
          <p className="hero-description">
            Комплексная платформа для расчета и анализа ИПЦ на основе категорий
            услуг и их ценовых данных. Отслеживайте инфляцию и оценивайте
            изменения в стоимости жизни.
          </p>
        </Container>
      </section>
    </div>
  );
}

export default Home;
