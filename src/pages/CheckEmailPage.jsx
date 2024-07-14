import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {PiUserCircle} from 'react-icons/pi'

function CheckEmailPage() {
  const [data, setData] = useState({
    email: '',
  });
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/email`;
    try {
      const response = await axios.post(url, data);
      toast.success(response.data.message);
      if (response.data.success) {
        setData({
          email: '',
        }); 
        setTimeout(() => navigate(`/password`,{
          state:response?.data?.data
        }), 500);
      }
    } catch (error) {
      toast.error(error.response?.data.message);
     
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-3 bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-4xl font-bold text-primary mb-4">
          Welcome to Textora
        </h3>
        <h4 className="text-xl text-primary mb-6">
          Define your Aura
        </h4>
        <form onSubmit={handleSubmit}>
            <div className='w-fit mx-auto mb-2'>
            <PiUserCircle
            size={80}/>
          </div>
          <div className="mb-1">
            <label htmlFor="email" className="block text-primary">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:outline-primary mt-3 focus:outline-none"
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary focus:outline-none mt-3"
            >
              Lets go
            </button>
            <p className="text-sm text-primary hover:text-primary">
              Don't have an account? <Link to="/register" className="hover:text-primary font-bold">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckEmailPage