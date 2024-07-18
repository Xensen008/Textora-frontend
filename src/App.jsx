import React from 'react'
import { Outlet } from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import './App.css'
function App() {
  return (
  <>
      <Toaster/>
      <Outlet />
  </>
  )
}

export default App