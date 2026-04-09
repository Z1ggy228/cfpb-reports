import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AccessRestricted from './pages/AccessRestricted';

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/access-restricted" element={<AccessRestricted />} />
        <Route path="*" element={<Navigate to="/access-restricted" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
