import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import type { CardsContainerProps } from "../../types";
import "./CardsContainer.css";

function CardsContainer({ children }: CardsContainerProps) {
  return (
    <Container fluid className="cards-container pb-5">
      <Row className="g-4 justify-content-start">
        {React.Children.map(children, (child, index) => (
          <Col
            key={index}
            xs={12} // 1 карточка на очень маленьких экранах
            sm={6} // 2 карточки на малых экранах ≥576px
            md={4} // 3 карточки на средних экранах ≥768px
            lg={4} // 4 карточки на больших экранах ≥992px
            xl={3} // 6 карточек на очень больших экранах ≥1200px
            className="d-flex"
          >
            {child}
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default CardsContainer;
