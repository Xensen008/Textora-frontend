import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { PiUserCircle } from 'react-icons/pi';
import { BsChatSquareQuoteFill } from 'react-icons/bs';

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
        setTimeout(() => navigate(`/password`, {
          state: response?.data?.data
        }), 500);
      }
    } catch (error) {
      toast.error(error.response?.data.message);
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
              <h1 className="text-2xl xl:text-3xl font-bold text-white mb-3 xl:mb-4 text-center">Welcome Back!</h1>
              <p className="text-gray-300 text-sm xl:text-base leading-relaxed text-center mb-8 xl:mb-12">
                Sign in to continue your conversations and stay connected with your network on Textora.
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
                <h1 className="text-2xl font-bold text-white">Welcome to Textora</h1>
                <p className="text-gray-300 mt-2">Sign in to continue</p>
              </div>

              {/* Form Section */}
              <div className="max-w-sm mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 hidden lg:block">Sign In</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="text-gray-400">
                      <PiUserCircle size={72} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      onChange={handleOnChange}
                      value={data.email}
                      className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#505050] focus:border-transparent transition-all duration-200 ease-in-out text-white placeholder-gray-500"
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
                      <p className="text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link 
                          to="/register" 
                          className="font-medium text-white hover:text-gray-300 transition-colors duration-200 ease-in-out"
                        >
                          Register now
                        </Link>
                      </p>
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

export default CheckEmailPage;