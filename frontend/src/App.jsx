import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./Login"
import Signup from "./Signup"
import TodoPage from "./TodoPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<TodoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
