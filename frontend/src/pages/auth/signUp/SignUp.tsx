import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

// Hooks
import { useForm } from "../../../hooks/useForm";
import { useValidation } from "../../../hooks/useValidation";

// Redux
import { useSignUpUserMutation } from "../../../store/auth/authApi";

// Utils
import { showError } from "../../../utils/showError";
import { isEmail, isPassword, isRepeatPassword, minLength } from "../../../utils/validations";

// Models
import { ApiResponse } from "../../../models/ApiResponse";
import { TUser } from "../../../models/User";

// Enums
import { Plans } from "../../../enum/Plans";
import { UserRole } from "../../../enum/UserRole";
import { UserStatus } from "../../../enum/UserStatus";

function SignUp() {
  const navigate = useNavigate();
  const [ signUpUser, { isLoading } ] = useSignUpUserMutation();
  const [ showPassword, setShowPassword ] = useState(false);
  const [ showRepeatPassword, setShowRepeatPassword ] = useState(false);
  const PlanList = Object.values(Plans);

  // Init Form
  const initialForm = useMemo(() => ({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    agencyName: "",
    plan: Plans.Free,
  }), []);

  // Form Hook
  const { form, handleChange } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    email: (value) => isEmail(value),
    password: (value) => isPassword(value),
    repeatPassword: (value, form) => isRepeatPassword(value, form.password),
    agencyName: (value) => minLength(value, 3),
    plan: (value) => minLength(value, 3),
  });

  // Sign Up
  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const { name, email, password, agencyName, plan } = form;
      const response: ApiResponse<TUser> = await signUpUser({
        user: { name, email, password, role: UserRole.Marketer, status: UserStatus.Active },
        agency: { name: agencyName, plan }
      }).unwrap();
      toast.success(response.message);
      navigate(`/signIn`);
    } catch (error) {
      showError(error);
    }
  }

  // Handle Change
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(e);
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign Up
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
              Agency Name
            </label>
            <input
              name="agencyName"
              value={form.agencyName}
              onChange={onChange}
              placeholder="you"
              autoComplete="off"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.agencyName && <p className="text-red-500 text-sm mt-2 text-left">{errors.agencyName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Plan</label>
            <select
              name="plan"
              value={form.plan}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {PlanList.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                Sign Up...
              </>
            ) : ("Sign Up")}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <p className="text-center text-sm text-gray-600">
          Have an account?{" "}
          <Link className="text-blue-600 font-medium hover:underline" to="/signIn">Sign in</Link>
        </p>
      </div>
    </section>
  )
}

export default SignUp;
