import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing';
import UserAuthSignIn from './pages/UserAuthSignIn';
import UserAuthSignUp from './pages/UserAuthSignUp';
import ChatRoom from './pages/ChatRoom';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { read_cookie } from 'sfcookies';
import Profile from './pages/Profile';

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
          <Route path='/chatroom' element={<ChatRoom/>}/>
          <Route path='/profile' element={<Profile/>}/>
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