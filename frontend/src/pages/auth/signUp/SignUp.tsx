import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from '../../../store';
import {toast} from "react-toastify";
import {signUpUser} from "../../../store/auth/authThunks";

import {Link} from "react-router-dom";
import {isEmail, isPassword, isRepeatPassword, minLength} from "../../../utils/validations";
import {ApiResponse} from "../../../models/ApiResponse";
import {MiniTranslate} from "../../../enum/miniTranslate";
import {BusinessIndustry} from "../../../enum/BusinessIndustry";
import {Tiers} from "../../../enum/Tiers";
import {TUser} from "../../../models/User";

function SignUp() {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("Denis");
  const [email, setEmail] = useState("malaiko.denis@gmail.com");
  const [password, setPassword] = useState("Ab12345$");
  const [repeatPassword, setRepeatPassword] = useState("Ab12345$");

  const [businessName, setBusinessName] = useState("Online Store");
  const [industry, setIndustry] = useState<BusinessIndustry>(BusinessIndustry.RetailEcommerce);
  const [tier, setTier] = useState<Tiers>(Tiers.Free);

  const [errors, setErrors]: any = useState({});
  const Business = Object.values(BusinessIndustry);
  const TierList = Object.values(Tiers);

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "name") error = minLength(data.value, 3);
    if (name === "email") error = isEmail(data.value);
    if (name === "password") error = isPassword(data.value);
    if (name === "repeatPassword") error = isRepeatPassword(data.value, data.repeatPassword);

    if (name === "businessName") error = minLength(data.value, 3);
    if (name === "industry") error = minLength(data.value, 3);
    if (name === "tier") error = minLength(data.value, 3);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!window.utils.validateForm(errors)) return;

    try {
      const response: ApiResponse<TUser> = await dispatch(
        signUpUser({
          user: { name, email, password },
          business: { name: businessName, industry, tier }
        })
      ).unwrap();

      toast.success(response.message);
      toast.success(MiniTranslate.YouCanSignIn);
    } catch (error: any) {
      toast.error(error.message);
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
              Repeat Password
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
              Business Name
            </label>
            <input
              type="businessName"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                validateField("name", { value: e.target.value })
              }}
              placeholder="you"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.businessName && <p className="text-red-500 text-sm mt-2 text-left">{errors.businessName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Business Type</label>
            <select
              name="industry"
              value={industry}
              onChange={(e) => {
                const selectedValue: BusinessIndustry = e.target.value as BusinessIndustry;
                setIndustry(selectedValue);
                validateField("industry", { value: selectedValue });
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { Business.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              )) }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Tier</label>
            <select
              name="tier"
              value={tier}
              onChange={(e) => {
                const selectedValue: Tiers = e.target.value as Tiers;
                setTier(selectedValue);
                validateField("tier", { value: selectedValue })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { TierList.map((tier: string) => (
                <option key={tier} value={tier}>{tier}</option>
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