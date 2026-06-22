import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterForm from './components/RegisterForm'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/register" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
