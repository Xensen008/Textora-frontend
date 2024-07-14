import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';

function CheckPassPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    userId: '',
    password: '',
  });
  const location = useLocation();
  
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
      });
      console.log('response:', response);
      if (!response.data.error) {
        toast.success(response.data.message);
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-3 bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-4xl font-bold text-primary mb-4">
          Welcome to Textora
        </h3>
        <h4 className="text-xl text-primary mb-6">
          Define your Aura
        </h4>
        <form onSubmit={handleSubmit}>
            <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
            {/* <PiUserCircle
            size={80}/> */} 
            <Avatar 
            width={80}
            height={80}
            name={location?.state?.name}
            imageUrl={location?.state?.profile_pic}/>
            <h2 className='font-semibold text-xl'>{location?.state?.name}</h2>
          </div>
          <div className="mb-1">
            <label htmlFor="password" className="block text-primary">
              password
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
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary focus:outline-none mt-3"
            >
              Login
            </button>
            <p className="text-sm text-primary hover:text-primary">
              Forgot password? <Link to="/forgot-password" className="hover:text-primary font-bold">Reset passord</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckPassPage