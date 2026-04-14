
import './css/App.css'
import Home from './pages/Home.tsx'
import Wishlist from './pages/Wishlist.tsx'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'

function App() {

  return (
    <div>
      <NavBar />
      <main className = "main-content">
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/wishlist" element = {<Wishlist />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
