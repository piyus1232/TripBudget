import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../utils/Input";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { login } from "../conf/authSlice.js";
import { login } from "../../conf/authSlice";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (formData) => {
    try {
      // Step 1: Login and receive tokens via cookies
      const session = await axios.post(
        "http://localhost:5000/api/v1/users/login",
        formData,
        { withCredentials: true }
      );
      if(session){
         // Step 2: Fetch user data securely
      const { data: userRes } = await axios.get(
        "http://localhost:5000/api/v1/users/getCurrentUser",
        { withCredentials: true }
      );

      // Step 3: Update Redux state
      dispatch(login({ userdata: userRes.data }));

      toast.success(session.data.message || "Login successful!");
      navigate("/Dashboard");

      }

     
    } catch (error) {
     if (error.response?.status === 401) {
       toast.error("User not Found Please Register!");
     } else if (error.response?.status === 402) {
       toast.error("Password is Incorrect ");
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
      className="space-y-5 bg-white/15 backdrop-blur-sm p-8 rounded-xl w-200 h-120 max-w-md mx-auto text-white shadow-lg  "
    >
      <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

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
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </motion.form>
  );
};

export default Login;
