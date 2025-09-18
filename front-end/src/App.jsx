import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import MainDash from './pages/MainDash';
import ProtectedRoute from './component/ProtectedRoute';


function App() {
  return(
    <div>
      <Routes>
        <Route path='/' element={<Signup /> } />
        <Route path='/login' element={<Login /> } />
        <Route path='/home' element={
          <ProtectedRoute>
          <Home /> 
          </ProtectedRoute>
          } />
          <Route path='/maindashboard' element={
          <ProtectedRoute>
          <MainDash /> 
          </ProtectedRoute>
          } />
      </Routes>

    </div>
  )
}

export default App;