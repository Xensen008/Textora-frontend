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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-primary-600">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={handleOnChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Send Reset Instructions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;