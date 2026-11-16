import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the EventHub brand', () => {
  render(<App />);
  expect(screen.getAllByText(/EventHub/i).length).toBeGreaterThan(0);
});
