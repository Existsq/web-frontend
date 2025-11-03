import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import type { CardsContainerProps } from '../../types';
import './CardsContainer.css';

function CardsContainer({ children }: CardsContainerProps) {
  return (
    <Container fluid className="cards-container pb-5">
      <Row className="g-4 px-5">
        {React.Children.map(children, (child, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            {child}
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default CardsContainer;

