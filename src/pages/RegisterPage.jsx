import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { BsChatSquareQuoteFill } from 'react-icons/bs';

function RegisterPage() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: "",
  });
  const navigate = useNavigate();
  const [uploadPhoto, setUploadPhoto] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      toast.loading("Uploading...");
      try {
        const resData = await uploadFile(file);
        setUploadPhoto(file);
        setData({ ...data, profile_pic: resData.secure_url });
        toast.dismiss();
        toast.success("Upload successful!");
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.dismiss();
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto("");
    setData({ ...data, profile_pic: "" });
    toast("Photo removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/register`;
    try {
      const response = await axios.post(url, data);
      // console.log("Registration successful", response.data);
      toast.success(response.data.message);
      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: "",
        });
        navigate("/email");
      }
    } catch (error) {
      toast.error("Registration failed", error.response?.data.message);
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
              <h1 className="text-2xl xl:text-3xl font-bold text-white mb-3 xl:mb-4 text-center">Join Textora Today</h1>
              <p className="text-gray-300 text-sm xl:text-base leading-relaxed text-center mb-8 xl:mb-12">
                Create your account and experience seamless communication with friends and colleagues.
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
                <p className="text-gray-300 mt-2">Create your account</p>
              </div>

              {/* Form Section */}
              <div className="max-w-sm mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 hidden lg:block">Create Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        onChange={handleOnChange}
                        value={data.name}
                        className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#505050] focus:border-transparent transition-all duration-200 ease-in-out text-white placeholder-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
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

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Create a password"
                        onChange={handleOnChange}
                        value={data.password}
                        className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#404040] rounded-lg focus:ring-2 focus:ring-[#505050] focus:border-transparent transition-all duration-200 ease-in-out text-white placeholder-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="profile_pic"
                          className="flex items-center cursor-pointer text-gray-300 text-sm font-medium"
                        >
                          <span className="mr-2">Profile Picture</span>
                          {isUploading ? (
                            <span className="text-gray-400">Uploading...</span>
                          ) : (
                            <span className="text-gray-400">
                              {data.profile_pic ? "File selected" : "(optional)"}
                            </span>
                          )}
                        </label>
                        {data.profile_pic && (
                          <IoClose
                            className="text-red-400 hover:text-red-300 cursor-pointer transition-colors duration-200"
                            onClick={handleClear}
                            size={20}
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => document.getElementById('profile_pic').click()}
                        className="w-full px-4 py-2.5 bg-[#1e1e1e] border border-[#404040] rounded-lg text-left text-gray-400 hover:bg-[#252525] transition-colors duration-200"
                      >
                        Choose file...
                      </button>
                      <input
                        type="file"
                        id="profile_pic"
                        name="profile_pic"
                        onChange={handleUploadPic}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full px-4 py-2.5 text-white bg-[#404040] rounded-lg hover:bg-[#505050] transition-colors duration-200 ease-in-out font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUploading}
                    >
                      Create Account
                    </button>

                    <div className="text-center mt-5">
                      <p className="text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link 
                          to="/email" 
                          className="font-medium text-white hover:text-gray-300 transition-colors duration-200 ease-in-out"
                        >
                          Log in
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

export default RegisterPage;
