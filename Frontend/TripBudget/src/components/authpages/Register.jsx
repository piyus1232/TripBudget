import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import axios from "axios";
import { apiUrl } from "../../conf/api.js";

const Register = ({ onSwitchToLogin }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (formdata) => {
    try {
      const response = await axios.post(
        apiUrl("/api/v1/users/register"),
        formdata,
        { withCredentials: true }
      );
      toast.success(response.data.message || "Registered successfully!");
    } catch (error) {
     if (error.response?.status === 409) {
  toast.error("User already exists!");
} else if (error.response?.status === 401) {
  toast.error("Missing required fields!");
}
else if (error.response?.status === 500) {
  toast.error("Internal Server Error");
} else {
  toast.error("Registration failed. Please try again.");
}
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-1 text-white"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-[1.65rem] font-bold tracking-tight bg-gradient-to-r from-slate-100 via-white to-cyan-200/90 bg-clip-text text-transparent">
          Create your account
        </h2>
        <p className="text-slate-400 text-sm mt-2">Join TripBudget and start planning smarter trips.</p>
      </div>

      <Input
        label="Full Name"
        placeholder="Your full name"
        {...register("fullname", { required: "Full name is required" })}
        error={errors.fullname?.message}
      />

      <Input
        label="Username"
        placeholder="Choose a username"
        {...register("username", { required: "Username is required" })}
        error={errors.username?.message}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            message: "Email address must be valid",
          },
        })}
        error={errors.email?.message}
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Minimum 6 characters required",
          },
          pattern: {
            value:
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
            message:
              "Use upper, lower, number & symbol (6+ chars)",
          },
        })}
        error={errors.password?.message}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-cyan-400/90 hover:text-cyan-300 rounded-lg hover:bg-white/5 transition-colors"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        }
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:via-sky-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      {typeof onSwitchToLogin === "function" && (
        <p className="pt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Log in
          </button>
        </p>
      )}
    </motion.form>
  );
};

export default Register;
