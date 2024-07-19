import React, { useState } from 'react';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement the logic to handle the submission, like sending the email to the backend
    console.log('Email submitted for password reset:', email);
  };

  const handleOnChange = (e) => {
    setEmail(e.target.value);
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
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: "#082b1a" }}>
            Forgot Password?
          </h1>
          <h2 className="text-2xl mt-2" style={{ color: "#082b1a" }}>
            No worries, we'll send you reset instructions.
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleOnChange}
            value={email}
            className="input py-2 text-base" // Increased padding and base text size
            required
          />
          <button
            type="submit"
            className="w-full py-2 mt-4 rounded-full"
            style={{ backgroundColor: "#0a3822", color: "#fff" }}
          >
            Send Reset Instructions
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;