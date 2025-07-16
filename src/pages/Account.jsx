"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import SideBar from "../components/SideBar/SideBar";
// import useAuth from "../components/Myhook/Auth";

function Account() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
//   const isAuthenticated = useSelector((state) => state.auth.status);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/users/getCurrentUser", {
        withCredentials: true,
      });
      setUser(res.data.data);
    } catch {
      toast.error("Session expired");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  fetchUser(); 
}, [navigate]);



  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    const toastId = toast.loading("Uploading image...");
    // setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/users/updateProfile",
        formData,
        { withCredentials: true }

      );
              toast.update(toastId, {
      render: response.data.message || "Profile updated!",
      type: "success",
      isLoading: false,
      autoClose: 2000,
    });
    //   toast.success(response.data.message || "Profile updated!");
      setUser((prev) => ({
        ...prev,
        avatar: response.data.data.avatar  ,
      }));
    } catch(error) {
         toast.update(toastId, {
      render: "Failed to update profile",
      type: "error",
      isLoading: false,
      autoClose: 2000,
    });
    }
    
  };

useEffect(() => {
  if (!loading && !user) {
    navigate("/login");
  }
}, [loading,user, navigate]);

  return (
    
    
    <div className="flex min-h-screen bg-[#0f0b1d] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] hidden sm:block">
        <SideBar  />
      </div>
{/* {loading && (
  <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white text-black rounded-lg px-6 py-4 shadow-lg text-center font-semibold">
      Please wait... uploading image
    </div>
  </div>
)} */}
      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-12 py-8  ml-25  ">
        <p className="text-sm text-center text-gray-400 mb-6 ">
          You have not verified your email yet. Please verify your email to unlock all features.
        </p>

        <div className="w-full">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative group w-fit">
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt="avatar"
                onClick={() => document.getElementById("avatarInput").click()}
                className="w-24 h-24 rounded-full object-cover border-2 border-white cursor-pointer hover:opacity-80 transition"
              />
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-white bg-black/60 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                Change
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{user?.fullname}</h2>
              <p className="text-sm text-purple-300">@{user?.username}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
            <div className="ml-auto">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-5">Edit Profile</Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 justify-center sm:justify-start mb-10">
            <div className="bg-purple-700 px-4 py-2 rounded-xl text-center w-fit">
              <p className="text-sm">Groups Joined</p>
              <p className="text-lg font-bold">0</p>
            </div>
            <div className="bg-purple-700 px-4 py-2 rounded-xl text-center w-fit">
              <p className="text-sm">Trips Planned</p>
              <p className="text-lg font-bold">1</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4 mb-10">
            <h3 className="text-lg font-semibold mb-2">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue={user?.fullname} readOnly />
              <Input label="Username" defaultValue={user?.username} readOnly />
              <Input label="Email address" defaultValue={user?.email} readOnly />

              <div className="flex items-end">
                {user?.isVerified ? (
                  <span className="px-3 py-1 rounded-md bg-green-700 text-sm">Verified</span>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700 text-sm px-4">
                    Verify Email
                  </Button>
                )}
              </div>
            </div>
            <p className="text-s text-gray-500 mt-2">
              Member since {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Delete Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
            <p className="text-sm text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">Delete Account</Button>
          </div>
        </div>
        
      </div>
      
    </div>
  );
}

export default Account;
