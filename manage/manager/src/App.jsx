import { useState } from 'react'
import { BrowserRouter , Routes ,Route } from 'react-router-dom'
import Login from './pages/Login'
import Main from './pages/Main'
import './index.css';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/main/*' element={<Main />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
