"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { apiUrl } from "../../conf/api.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Input from "../../components/utils/Input";
import Button from "../../components/utils/Button";
import SideBar from "../../components/SideBar/SideBar";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import PageLoader from "../../components/utils/PageLoader";

function Account() {
  const reduxUser = useSelector((state) => state.auth.userdata);
  const [user, setUser] = useState(reduxUser || null);
  const navigate = useNavigate();
  /** Session already restored in App + Redux — avoid full-screen flash when switching from Dashboard / Plan Trip */
  const [loading, setLoading] = useState(!reduxUser);
  const [showForm, setShowForm] = useState(false);
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const sendVerificationEmail = async () => {
    const toastId = toast.loading("Sending verification email...", { autoClose: false });
    try {
      await axios.post(
        apiUrl("/api/v1/users/send-verification"),
        {},
        { withCredentials: true }
      );
      toast.update(toastId, {
        render: "Verification email sent. Check your inbox.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: err?.response?.data || "Error sending verification email",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const verifyFromEmail = async () => {
      if (searchParams.get("verified") === "true") {
        const toastId = toast.loading("Verifying your email...", { autoClose: false });
        try {
          const res = await axios.get(
            apiUrl("/api/v1/users/getCurrentUser"),
            { withCredentials: true }
          );
          setUser(res.data.data);
          toast.update(toastId, {
            render: "✅ Verified successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        } catch (err) {
          toast.update(toastId, {
            render: "❌ Verification failed.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      }
    };
    verifyFromEmail();
  }, [searchParams]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          apiUrl("/api/v1/users/getCurrentUser"),
          { withCredentials: true }
        );
        setUser(res.data.data);
      } catch {
        toast.error("Session expired", { autoClose: 3000 });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const [trips, setTrips] = useState([]);
  useEffect(() => {
    const fetchAllTrips = async () => {
      try {
        const res = await axios.get(
          apiUrl("/api/v1/users/getsavetrip"),
          { withCredentials: true }
        );
        let fetchedTrips = res.data.data || [];
        fetchedTrips.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTrips(fetchedTrips);
      } catch (err) {
        console.error("Error fetching trips:", err);
      }
    };
    fetchAllTrips();
  }, []);

  const logout = async () => {
    try {
      await axios.post(
        apiUrl("/api/v1/users/logout"),
        {},
        { withCredentials: true }
      );
      toast.success("User logged out successfully", { autoClose: 3000 });
      navigate("/");
    } catch {
      toast.error("Error in logout", { autoClose: 3000 });
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.post(
        apiUrl("/api/v1/users/deleteaccount"),
        {},
        { withCredentials: true }
      );
      toast.success("Account deleted successfully", { autoClose: 3000 });
      navigate("/register");
    } catch {
      toast.error("Error deleting account", { autoClose: 3000 });
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.put(
        apiUrl("/api/v1/users/editprofile"),
        data,
        { withCredentials: true }
      );
      toast.success(response.data.message || "Profile updated!", { autoClose: 3000 });
      setUser(response.data.data);
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile", { autoClose: 3000 });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    const toastId = toast.loading("Uploading image...", { autoClose: false });

    try {
      const response = await axios.post(
        apiUrl("/api/v1/users/updateProfile"),
        formData,
        { withCredentials: true }
      );
      toast.update(toastId, {
        render: response.data.message || "Profile updated!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setUser((prev) => ({ ...prev, avatar: response.data.data.avatar }));
    } catch {
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
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <PageLoader
        message="Loading account"
        subMessage="Fetching your profile…"
      />
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-[#171221] text-white sm:h-screen sm:max-h-screen sm:flex-row sm:overflow-hidden">
        <SideBar />
        <main className="min-h-0 flex-1 overflow-y-auto pt-14 pb-6 sm:ml-[280px] sm:pt-10 sm:pb-10 md:ml-[300px]">
          <div className="mx-auto flex max-w-full min-h-0 flex-col gap-4 px-4 sm:px-6 [zoom:1] sm:h-full sm:overflow-y-auto sm:[zoom:0.75]">
            <div className="flex min-h-[24px] items-center justify-center">
              {!user?.verified && (
                <p className="text-sm text-center text-gray-400">
                  You have not verified your email yet. Please verify your email to unlock all features.
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-5">
              <div className="relative group">
                <img
                  src={user?.avatar || "/profileicon.jpg"}
                  alt="avatar"
                  onClick={() => document.getElementById("avatarInput").click()}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white cursor-pointer transition-none"
                />
                <input
                  type="file"
                  id="avatarInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs bg-black/60 px-2 py-1 rounded-md text-white">
                  Change
                </span>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">{user?.fullname}</h2>
                <p className="text-purple-300">@{user?.username}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-auto">
                <Button
                  className="bg-gradient-to-r from-green-500 to-lime-500 text-white px-5 transition-none"
                  onClick={() => setShowForm(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                <div className="bg-[#171221] rounded-xl shadow-lg p-6 w-full max-w-xl border border-white/20">
                  <h2 className="text-lg font-semibold text-white mb-4">Edit Profile</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Full Name" type="text" defaultValue={user?.fullname} {...register("fullname")} />
                    <Input label="username" type="username" defaultValue={user?.username} {...register("username")} />
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 transition-none">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-green-500 to-lime-500 transition-none">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                  <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-2 right-3 text-white text-2xl font-bold transition-none"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center sm:justify-start mb-6">
              <div className="bg-gradient-to-r from-green-500 to-lime-500 px-4 py-2 rounded-xl text-center w-36 transition-none">
                <p className="text-sm">Groups Joined</p>
                <p className="text-lg font-bold">0</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-lime-500 px-4 py-2 rounded-xl text-center w-36 transition-none">
                <p className="text-sm">Trips Planned</p>
                <p className="text-lg font-bold">{trips.length}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" defaultValue={user?.fullname} readOnly />
                <Input label="Username" defaultValue={user?.username} readOnly />
                <Input label="Email Address" defaultValue={user?.email} readOnly />
                <div className="flex min-h-[36px] items-center">
                  {user?.verified ? (
                    <span className="inline-block w-[120px] rounded-full bg-gray-500 px-4 py-2 text-center text-sm font-semibold leading-5 text-white shadow-md transition-none">
                      Verified
                    </span>
                  ) : (
                    <Button
                      className="mb-6 w-[120px] bg-gradient-to-r from-green-500 to-lime-500 px-4 py-2 text-center text-sm leading-5 transition-none"
                      onClick={sendVerificationEmail}
                    >
                      Verify Email
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Delete Account</h3>
              <p className="text-sm text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <div className="flex justify-between items-center mt-5">
                <Button
                  className="bg-red-600 text-white font-medium py-2 px-5 rounded-xl transition-none"
                  onClick={deleteAccount}
                >
                  Delete Account
                </Button>
              </div>
              <div className="flex justify-between items-center mt-12">
                <Button
                  className="bg-red-600 px-5 py-2 font-medium rounded-xl text-white transition-none"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Account;