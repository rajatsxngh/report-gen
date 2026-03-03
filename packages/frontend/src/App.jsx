import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SchedulerPage from './pages/SchedulerPage.jsx';
import TemplateBuilder from './pages/TemplateBuilder';

function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <Link to="/" style={{
        fontSize: '1.125rem',
        fontWeight: 700,
        color: '#111827',
        textDecoration: 'none',
      }}>
        ReportGen
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isActive('/') ? '#2563eb' : '#6b7280',
          textDecoration: 'none',
        }}>
          Dashboard
        </Link>
        <Link to="/schedules" style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isActive('/schedules') ? '#2563eb' : '#6b7280',
          textDecoration: 'none',
        }}>
          Schedules
        </Link>
        <Link to="/templates/new" style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isActive('/templates/new') ? '#2563eb' : '#6b7280',
          textDecoration: 'none',
        }}>
          New Template
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/schedules" element={<SchedulerPage />} />
        <Route path="/templates/new" element={<TemplateBuilder />} />
        <Route path="/templates/:id" element={<TemplateBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
