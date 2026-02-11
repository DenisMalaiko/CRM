import React, { useState, useMemo } from 'react';
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

// Hooks
import { useForm } from "../../../hooks/useForm";
import { useValidation } from "../../../hooks/useValidation";

// Redux
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { useSignUpAdminMutation } from "../../../store/admin/adminApi";

// Utils
import { showError } from "../../../utils/showError";
import { isEmail, isPassword, isRepeatPassword, isSecret, minLength } from "../../../utils/validations";

// Models
import { ApiResponse } from "../../../models/ApiResponse";
import { TAdmin } from "../../../models/Admin";


function SignUpAdmin() {
  const navigate = useNavigate();
  const [ signUpAdmin, { isLoading } ] = useSignUpAdminMutation();
  const [ showPassword, setShowPassword ] = useState(false);
  const [ showRepeatPassword, setShowRepeatPassword ] = useState(false);

  // Init Form
  const initialForm = useMemo(() => ({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    secret: "",
  }), []);

  // Form Hook
  const { form, handleChange } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    email: (value) => isEmail(value),
    password: (value) => isPassword(value),
    repeatPassword: (value, form) => isRepeatPassword(value, form.password),
    secret: (value) => isSecret(value),
  });

  // Sign Up
  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const response: ApiResponse<TAdmin> = await signUpAdmin({
        name: form.name,
        email: form.email,
        password: form.password
      }).unwrap();
      toast.success(response.message);
      navigate(`/admin/signIn`);
    } catch (error) {
      showError(error)
    }
  }

  // Handle Change
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(e);
    validateField(name as keyof typeof form, value, form);
  };

  return(
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Sign Up
        </h2>

        <form className="space-y-5" onSubmit={signUp} action="">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="you"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoComplete="off"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
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
                onChange={onChange}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Repeat Password
            </label>

            <div className="relative">
              <input
                type={showRepeatPassword ? "text" : "password"}
                name="repeatPassword"
                value={form.repeatPassword}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowRepeatPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500
                 hover:text-gray-700"
              >
                {showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.repeatPassword && <p className="text-red-500 text-sm mt-2 text-left">{errors.repeatPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Secret
            </label>
            <input
              type="text"
              name="secret"
              value={form.secret}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.secret && <p className="text-red-500 text-sm mt-2 text-left">{errors.secret}</p>}
          </div>


          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                Sign Up...
              </>
            ) : ("Sign Up")}
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
