import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Keeping for future potential use

function LoginComponent({ auth, setMessage, setIsLoading, setEmail, setPassword, email, password, handleGoogleLogin }) {
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) {
      setMessage('Firebase Auth not initialized.');
      return;
    }
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login Successful!');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Login error:", error);
      setMessage(`Login Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="login-email"
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="login-password"
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        onClick={handleLogin}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        Login
      </button>

      <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.211c-.135-.63-.223-1.42-.223-2.317 0-2.457 1.705-4.546 4.398-4.546 2.378 0 3.738 1.493 3.738 3.639 0 2.45-1.706 4.539-4.399 4.539-2.28 0-3.666-1.503-3.666-3.79zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm-1.077 17.518c-3.13 0-5.67-2.54-5.67-5.67s2.54-5.67 5.67-5.67c1.393 0 2.686.51 3.69 1.413l1.83-1.83c-1.39-1.393-3.21-2.26-5.52-2.26-4.965 0-8.992 4.027-8.992 8.992S7.035 21 12 21c4.437 0 7.973-3.03 8.76-7.07l-3.29-1.32c-.52 2.113-2.54 3.63-5.22 3.63z"/>
        </svg>
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}

export default LoginComponent