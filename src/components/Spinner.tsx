import './components.css';

// Shared loading indicator shown while an async request is in flight.
export function Spinner() {
  return <div className="ui_spinner" role="status" aria-label="Loading" />;
}
