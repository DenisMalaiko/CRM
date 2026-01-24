import React, {useState} from 'react';
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import { useSignUpAdminMutation } from "../../../store/admin/adminApi";
import { useSignUpUserMutation } from "../../../store/auth/authApi";

import { showError } from "../../../utils/showError";
import { AppDispatch } from "../../../store";
import { isEmail, isPassword, isRepeatPassword, isSecret, minLength } from "../../../utils/validations";
import { ApiResponse } from "../../../models/ApiResponse";
import { TUser } from "../../../models/User";
import { MiniTranslate } from "../../../enum/MiniTranslate";
import { UserRole } from "../../../enum/UserRole";
import { UserStatus } from "../../../enum/UserStatus";
import {TAdmin} from "../../../models/Admin";

function SignUpAdmin() {
  const [signUpAdmin] = useSignUpAdminMutation();

  const dispatch = useDispatch<AppDispatch>();
  const isAdmin = true;
  const [name, setName] = useState("Denis");
  const [email, setEmail] = useState("malaiko.denis@gmail.com");
  const [password, setPassword] = useState("Ab12345$");
  const [repeatPassword, setRepeatPassword] = useState("Ab12345$");
  const [secret, setSecret] = useState("secret_admin_key");
  const [errors, setErrors]: any = useState({});

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "name") error = minLength(data.value, 3);
    if (name === "email") error = isEmail(data.value);
    if (name === "password") error = isPassword(data.value);
    if (name === "repeatPassword") error = isRepeatPassword(data.value, data.repeatPassword);
    if (name === "secret") error = isSecret(data.value);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!window.utils.validateForm(errors)) return;

    try {
      const response: ApiResponse<TAdmin> = await signUpAdmin({
        name,
        email,
        password
      }).unwrap();

      toast.success(response.message);
    } catch (error) {
      showError(error)
    }
  }

  return(
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Sign Up
        </h2>

        <form className="space-y-5" onSubmit={signUp} action="">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Name {name}
            </label>
            <input
              type="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", { value: e.target.value })
              }}
              placeholder="you"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Email {email}
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
              Password {password}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Repeat Password {repeatPassword}
            </label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => {
                setRepeatPassword(e.target.value);
                validateField("repeatPassword", { value: e.target.value, repeatPassword: password });
              }}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.repeatPassword && <p className="text-red-500 text-sm mt-2 text-left">{errors.repeatPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Secret
            </label>
            <input
              type="text"
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                validateField("secret", { value: e.target.value });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.secret && <p className="text-red-500 text-sm mt-2 text-left">{errors.secret}</p>}
          </div>


          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Have an account?{" "}
          <Link className="text-blue-600 font-medium hover:underline" to="/admin/signIn">Sign in</Link>
        </p>
      </div>
    </section>
  )
}

export default SignUpAdmin;
