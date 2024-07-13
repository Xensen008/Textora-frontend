import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';

function RegisterPage() {
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    profile_pic: '',
  });
  const [uploadPhoto, setUploadPhoto] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadPic = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setUploadPhoto(file);
        setData({ ...data, profile_pic: file.name });
        setIsUploading(false);
      }, 2000);
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
    setUploadPhoto('');
    setData({ ...data, profile_pic: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(data);
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
          <div className="mb-4 flex flex-col gap-1">
            <label htmlFor="name" className="block text-primary">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:outline-primary focus:outline-none"
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-primary">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:outline-primary focus:outline-none"
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-primary">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:outline-primary focus:outline-none"
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="profile_pic" className="block text-primary">
              Profile pic
              <div className="h-14 bg-slate-200 flex justify-center items-center border hover:border-primary rounded text-sm cursor-pointer">
                {isUploading ? (
                  <p>Uploading...</p>
                ) : (
                  <p className="text-sm max-w-[300px] text-ellipsis line-clamp-1">
                    {uploadPhoto?.name || "Upload profile Photo"}
                  </p>
                )}
                {uploadPhoto?.name && (
                  <button type="button" className="text-lg ml-2 hover:text-red-600" onClick={handleClear}>
                    <IoClose />
                  </button>
                )}
              </div>
            </label>
            <input
              type="file"
              id="profile_pic"
              name="profile_pic"
              onChange={handleUploadPic}
              className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:outline-primary focus:outline-none hidden"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary focus:outline-none"
            >
              Register
            </button>
            <p className="text-sm text-primary hover:text-primary">
              Already have an account? <Link to="/login" className="hover:text-primary font-bold">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;