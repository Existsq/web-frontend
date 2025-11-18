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
    <Form onSubmit={handleSubmit} className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 w-100">
      <InputGroup className="flex-grow-1">
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