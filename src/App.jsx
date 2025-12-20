import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import HotelsList from './pages/HotelsList'
import HotelDetails from './pages/HotelDetails'
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

