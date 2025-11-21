import { useState } from 'react'
import './App.css'
import Login from './panels/login'

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? <Login /> : <div>Not logged in</div>}
    </>
  )
}

export default App
