import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";

// Hooks
import { useForm } from "../../../hooks/useForm";
import { useValidation } from "../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../store/hooks";
import { useSignInUserMutation } from "../../../store/auth/authApi";
import { setUser, setAccessToken } from "../../../store/auth/authSlice";

// Utils
import { showError } from "../../../utils/showError";
import { isEmail, isPassword } from "../../../utils/validations";

function SignIn() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [ signInUser, { isLoading } ] = useSignInUserMutation();
  const [ showPassword, setShowPassword ] = useState(false);

  // Init Form
  const initialForm = useMemo(() => ({
    email: 'malaiko.denis@gmail.com',
    password: 'Ab12345$'
  }), []);

  // Form Hook
  const { form, handleChange } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    email: isEmail,
    password: isPassword
  });

  // Sign In
  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const { email, password } = form;
      const response = await signInUser({ email, password }).unwrap();
      dispatch(setUser(response.data.user));
      dispatch(setAccessToken(response.data.accessToken));
      toast.success(response.message);
      navigate("/profile/businesses");
    } catch (error) {
      showError(error);
    }
  }

  // Handle Change
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(e);
    validateField(name as keyof typeof form, value, form);
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                ...Sign In
              </>
              ) : ("Sign In")
            }
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