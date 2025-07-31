import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import axios from "axios";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (formdata) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/users/register",
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
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 bg-white/10 backdrop-blur-sm p-8 rounded-xl w-200 h-120 max-w-md mx-auto text-white shadow-lg"
    >
      <h2 className="text-2xl font-semibold text-center mb-4">
        Create your account
      </h2>

      <Input
        label="Full Name"
        placeholder="Piyush Gupta"
        {...register("fullname", { required: "Full name is required" })}
        error={errors.fullname?.message}
      />

      <Input
        label="Username"
        placeholder="piyushgupta"
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

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="********"
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
                "Password must contain uppercase, lowercase, number & symbol",
            },
          })}
          error={errors.password?.message}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-sm text-blue-300 hover:underline"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Registering..." : "Register"}
      </button>
    </motion.form>
  );
};

export default Register;
