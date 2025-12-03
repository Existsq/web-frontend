import { Form, InputGroup, Button } from 'react-bootstrap';
import SearchIcon from './SearchIcon';
import type { SearchBarProps } from '../../types';
import './SearchBar.css';

function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Form onSubmit={handleSubmit} className="search-form d-flex flex-column flex-sm-row gap-2 gap-sm-3">
      <InputGroup className="search-input-group">
        <InputGroup.Text className="search-icon-container">
          <SearchIcon />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Введите название категории"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="search-input"
        />
      </InputGroup>

      <Button type="submit" variant="primary" className="search-submit-button flex-shrink-0">
        Найти
      </Button>
    </Form>
  );
}

export default SearchBar;