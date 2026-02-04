import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {Eye, EyeOff} from "lucide-react";

import { useSignUpUserMutation } from "../../../store/auth/authApi";
import { showError } from "../../../utils/showError";
import { isEmail, isPassword, isRepeatPassword, minLength } from "../../../utils/validations";
import { ApiResponse } from "../../../models/ApiResponse";
import { Plans } from "../../../enum/Plans";
import { TUser } from "../../../models/User";
import { UserRole } from "../../../enum/UserRole";
import { UserStatus } from "../../../enum/UserStatus";


function SignUp() {
  const [signUpUser] = useSignUpUserMutation();

  /*const [name, setName] = useState("Denis");
  const [email, setEmail] = useState("malaiko.denis@gmail.com");
  const [password, setPassword] = useState("Ab12345$");
  const [repeatPassword, setRepeatPassword] = useState("Ab12345$");
  const [agencyName, setAgencyName] = useState("Marketing Agency");*/

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [plan, setPlan] = useState<Plans>(Plans.Free);

  const [errors, setErrors]: any = useState({});
  const PlanList = Object.values(Plans);

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "name") error = minLength(data.value, 3);
    if (name === "email") error = isEmail(data.value);
    if (name === "password") error = isPassword(data.value);
    if (name === "repeatPassword") error = isRepeatPassword(data.value, data.repeatPassword);

    if (name === "agencyName") error = minLength(data.value, 3);
    if (name === "plan") error = minLength(data.value, 3);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!window.utils.validateForm(errors)) return;

    try {
      const response: ApiResponse<TUser> = await signUpUser({
        user: {
          name,
          email,
          password,
          role: UserRole.Marketer,
          status: UserStatus.Active,
        },
        agency: {
          name: agencyName,
          plan
        }
      }).unwrap();

      toast.success(response.message);
    } catch (error) {
      showError(error);
    }
  }

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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validateField("password", { value: e.target.value });
                }}
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
                value={repeatPassword}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                  validateField("repeatPassword", { value: e.target.value, repeatPassword: password });
                }}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowRepeatPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500
                 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.repeatPassword && <p className="text-red-500 text-sm mt-2 text-left">{errors.repeatPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Agency Name
            </label>
            <input
              type="agencyName"
              value={agencyName}
              onChange={(e) => {
                setAgencyName(e.target.value);
                validateField("name", { value: e.target.value })
              }}
              placeholder="you"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.businessName && <p className="text-red-500 text-sm mt-2 text-left">{errors.businessName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Plan</label>
            <select
              name="plan"
              value={plan}
              onChange={(e) => {
                const selectedValue: Plans = e.target.value as Plans;
                setPlan(selectedValue);
                validateField("plan", { value: selectedValue })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { PlanList.map((plan: string) => (
                <option key={plan} value={plan}>{plan}</option>
              )) }
            </select>
          </div>


          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
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
