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

function SignUpComponent({ auth, setMessage, setIsLoading, setEmail, setPassword, email, password }) {
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!auth) {
      setMessage('Firebase Auth not initialized.');
      return;
    }
    try {
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Sign Up Successful! You are now logged in.');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Sign up error:", error);
      setMessage(`Sign Up Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-700">Sign Up</h2>
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="signup-email"
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="signup-password"
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        onClick={handleSignUp}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Sign Up
      </button>
    </div>
  );
}

export default SignUpComponent;