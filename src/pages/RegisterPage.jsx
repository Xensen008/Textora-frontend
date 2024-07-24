import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

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
            Register
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleOnChange}
              value={data.name}
              className="input py-2 text-base" // Increased padding and base text size
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleOnChange}
              value={data.email}
              className="input py-2 text-base" // Increased padding and base text size
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleOnChange}
              value={data.password}
              className="input py-2 text-base" // Increased padding and base text size
              required
            />
            <div className="flex items-center justify-between">
              <label
                htmlFor="profile_pic"
                className="flex items-center cursor-pointer text-[#082b1a]"
              >
                <span className="mr-2">Profile Picture</span>
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <span className="text-sm">
                    {data.profile_pic ? "File selected" : "Choose file"}
                  </span>
                )}
              </label>
              {data.profile_pic && (
                <IoClose
                  className="text-red-500 cursor-pointer"
                  onClick={handleClear}
                />
              )}
              <input
                type="file"
                id="profile_pic"
                name="profile_pic"
                onChange={handleUploadPic}
                className="hidden"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 rounded-full"
            style={{ backgroundColor: "#0a3822", color: "#fff" }}
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm" style={{ color: "#082b1a" }}>
          Already have an account?{" "}
          <a href="/email" className="font-medium underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
