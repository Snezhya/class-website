import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { SiteBranding } from './components/shared/SiteBranding';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Home } from './pages/Home';
import { Members } from './pages/Members';
import { Tasks } from './pages/Tasks';
import { Schedule } from './pages/Schedule';
import { Gallery } from './pages/Gallery';
import { Notes } from './pages/Notes';
import { Admin } from './pages/Admin';

function App() {
  return (
    <Router>
      <AppProvider>
        <SiteBranding />
        <ToastProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </MainLayout>
        </ToastProvider>
      </AppProvider>
    </Router>
  );
}

export default App;
