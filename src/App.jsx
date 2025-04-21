import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing';
import UserAuthSignIn from './pages/UserAuthSignIn';
import UserAuthSignUp from './pages/UserAuthSignUp';
import ChatRoom from './pages/ChatRoom';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profile from './pages/Profile';
import ProtectedRoute from './auth/ProtectedRoute';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <>
      <Router>
        <header>
          <Navbar/>
        </header>
        <Routes>
          <Route path='/' index element={<Landing/>}/>
          <Route path='/signup' element={<UserAuthSignUp/>}/>
          <Route path='/signin' element={<UserAuthSignIn/>}/>
          <Route path='/chatroom' element={
              <ProtectedRoute>
                <ChatRoom/>
              </ProtectedRoute>
            }
          />
          <Route  path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path='/verify-email' element={<VerifyEmail/>}/>
          </Routes>
      </Router>
      <ToastContainer 
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  )
}

export default App;