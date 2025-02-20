import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../stores/userSlice';
import { BsChatSquareQuoteFill } from 'react-icons/bs';

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
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl border border-[#404040]">
        <div className="flex flex-col lg:flex-row min-h-[550px] lg:min-h-0">
          {/* Left Section - Welcome/Illustration */}
          <div className="hidden lg:flex lg:w-5/12 bg-[#2a2a2a] flex-col items-center justify-center p-8 xl:p-12">
            <div className="w-full max-w-sm">
              <BsChatSquareQuoteFill className="w-16 h-16 xl:w-20 xl:h-20 mx-auto mb-6 xl:mb-8 text-gray-400" />
              <h1 className="text-2xl xl:text-3xl font-bold text-white mb-3 xl:mb-4 text-center">Almost There!</h1>
              <p className="text-gray-300 text-sm xl:text-base leading-relaxed text-center mb-8 xl:mb-12">
                Enter your password to access your account and continue your conversations on Textora.
              </p>
              <div className="pt-6 xl:pt-8 border-t border-[#404040]">
                <p className="text-gray-500 text-xs xl:text-sm text-center">
                  Secure • Fast • Reliable
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="w-full lg:w-7/12 lg:border-l lg:border-[#404040] flex items-center">
            <div className="w-full px-6 py-8 lg:px-8 xl:px-12 xl:py-10">
              <Toaster position="top-center" />
              
              {/* Mobile Header - Only visible on mobile */}
              <div className="text-center mb-6 lg:hidden">
                <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
                <p className="text-gray-300 mt-2">Please enter your password to continue</p>
              </div>

              {/* Form Section */}
              <div className="max-w-sm mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 hidden lg:block">Enter Password</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center gap-3 mb-6">
                    <Avatar 
                      width={72}
                      height={72}
                      name={location?.state?.name}
                      imageUrl={location?.state?.profile_pic}
                    />
                    <h2 className="text-xl font-semibold text-white">
                      {location?.state?.name}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#505050] focus:border-transparent transition-all duration-200 ease-in-out text-white placeholder-gray-500"
                      value={data.password}
                      onChange={handleOnChange}
                      required
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full px-4 py-2.5 text-white bg-[#404040] rounded-lg hover:bg-[#505050] transition-colors duration-200 ease-in-out font-medium"
                    >
                      Continue
                    </button>
                    
                    <div className="text-center mt-5">
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200 ease-in-out"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckPassPage;