import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import HotelsList from './pages/HotelsList'
import HotelDetails from './pages/HotelDetails'
import HotelLogin from './pages/HotelLogin'
import HotelDashboard from './pages/HotelDashboard'
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

