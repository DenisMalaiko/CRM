import React from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";

import { useAppDispatch } from "../../../store/hooks";
import { useSignInUserMutation } from "../../../store/auth/authApi";
import { showError } from "../../../utils/showError";
import { isEmail, isPassword } from "../../../utils/validations";
import { setUser, setAccessToken } from "../../../store/auth/authSlice";

function SignIn() {
  const navigate = useNavigate();

  const [signInUser] = useSignInUserMutation();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("malaiko.denis@gmail.com");
  const [password, setPassword] = useState("Ab12345$");
  const [errors, setErrors]: any = useState({});

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "email") error = isEmail(data.value);
    if (name === "password") error = isPassword(data.value);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!window.utils.validateForm(errors)) return;

    try {
      const response = await signInUser({ email, password }).unwrap();
      dispatch(setUser(response.data.user));
      dispatch(setAccessToken(response.data.accessToken));
      toast.success(response.message);
      navigate("/profile/dashboard");
    } catch (error) {
      showError(error);
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign In
        </h2>

        <form className="space-y-5" onSubmit={signIn} action="">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField("email", { value: e.target.value });
              }}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-2 text-left">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", { value: e.target.value });
              }}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm mt-2 text-left">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link className="text-blue-600 font-medium hover:underline" to="/signUp">Sign up</Link>
        </p>
      </div>
    </section>
  )
}

export default SignIn;