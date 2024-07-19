import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../stores/userSlice';

function CheckPassPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    userId: '',
    password: '',
  });
  const location = useLocation();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!location?.state?.name) {
      navigate('/email');
    }
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/password`;
    try {
      const response = await axios.post(url, {
        userId: location?.state?._id,
        password: data.password,
      }, {
        withCredentials: true 
      });
      if (!response.data.error) {
        toast.success(response.data.message);
        dispatch(setToken(response?.data?.token))
        localStorage.setItem('token', response?.data?.token)
        console.log('Login successful, navigating to /');
        setData({
          password: '',
        });
        navigate('/');
      } else {
        console.log('Login not successful, response.data.error:', response.data.error);
        toast.error(response?.data?.message || "Login failed, please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data.message || "An error occurred during login.");
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#b7c0b3" }}>
      <div className="w-full max-w-lg p-8 rounded-xl shadow-lg" style={{ backgroundColor: "#fff" }}>
        <Toaster position="top-center" />
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: "#082b1a" }}>Welcome to Textora</h1>
          <h2 className="text-2xl mt-2" style={{ color: "#082b1a" }}>Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
            <Avatar 
              width={80}
              height={80}
              name={location?.state?.name}
              imageUrl={location?.state?.profile_pic}/>
            <h2 className='font-semibold text-xl' style={{ color: "#082b1a" }}>{location?.state?.name}</h2>
          </div>
          <div className="mb-1">
            <label htmlFor="password" className="block text-primary" style={{ color: "#082b1a" }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:outline-primary mt-3 focus:outline-none"
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 rounded hover:bg-primary focus:outline-none mt-3"
              style={{ backgroundColor: "#0a3822", color: "#fff" }}
            >
              Login
            </button>
            <p className="text-sm" style={{ color: "#082b1a" }}>
              Forgot password? <Link to="/forgot-password" className="hover:text-primary font-bold">Reset password</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckPassPage;