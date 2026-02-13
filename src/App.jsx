import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import HotelsList from './pages/HotelsList'
import HotelDetails from './pages/HotelDetails'
import HotelLogin from './pages/HotelLogin'
import HotelDashboard from './pages/HotelDashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import Contact from './pages/Contact'
import './styles.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<HotelsList />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/hotel/login" element={<HotelLogin />} />
            <Route path="/hotel/dashboard" element={<HotelDashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

