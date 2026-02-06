import React from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useAppDispatch } from "../../../store/hooks";
import { useSignInUserMutation } from "../../../store/auth/authApi";
import { showError } from "../../../utils/showError";
import { isEmail, isPassword } from "../../../utils/validations";
import { setUser, setAccessToken } from "../../../store/auth/authSlice";
import { useForm } from "../../../hooks/useForm";

function SignIn() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signInUser] = useSignInUserMutation();

  /*const [password, setPassword] = useState("Ab12345$");*/

  const { form, handleChange } = useForm({
    email: 'malaiko.denis@gmail.com',
    password: 'Ab12345$'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]: any = useState({});

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "email") error = isEmail(data);
    if (name === "password") error = isPassword(data);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!window.utils.validateForm(errors)) return;

    try {
      const { email, password } = form;
      const response = await signInUser({ email, password }).unwrap();
      dispatch(setUser(response.data.user));
      dispatch(setAccessToken(response.data.accessToken));
      toast.success(response.data.message);
      navigate("/profile/businesses");
    } catch (error) {
      showError(error);
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    validateField("email", e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    validateField("password", e.target.value);
  };

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
              name="email"
              value={form.email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-2 text-left">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500
                 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && <p className="text-red-500 text-sm mt-2 text-left">{errors.password}</p>}
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