import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateProfile from './pages/CreateProfile';
import MyProfiles from './pages/MyProfiles';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-profile" element={
            <ProtectedRoute>
              <CreateProfile />
            </ProtectedRoute>
          } />
          <Route path="/my-profiles" element={
            <ProtectedRoute>
              <MyProfiles />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;