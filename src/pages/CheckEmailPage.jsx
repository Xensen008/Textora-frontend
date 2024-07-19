import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { PiUserCircle } from 'react-icons/pi';

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
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "#b7c0b3", paddingTop: 0 }}
    >
      <div
        className="w-full max-w-lg p-8 rounded-xl shadow-lg"
        style={{ backgroundColor: "#fff" }}
      >
        <Toaster position="top-center" />
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: "#082b1a" }}>
            Welcome To Textora
          </h1>
          <h2 className="text-2xl mt-2" style={{ color: "#082b1a" }}>
            Check Your Email
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className='w-fit mx-auto mb-2'>
              <PiUserCircle size={80} />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleOnChange}
              value={data.email}
              className="input py-2 text-base" // Adjusted for consistency
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 rounded-full"
            style={{ backgroundColor: "#0a3822", color: "#fff" }}
          >
            Let's Go
          </button>
          <p className="mt-4 text-center text-sm" style={{ color: "#082b1a" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-medium underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default CheckEmailPage;