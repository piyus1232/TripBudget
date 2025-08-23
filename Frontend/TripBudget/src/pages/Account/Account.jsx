"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Input from "../../components/utils/Input";
import Button from "../../components/utils/Button";
import SideBar from "../../components/SideBar/SideBar";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

function Account() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
        "http://localhost:5000/api/v1/users/send-verification",
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
            "http://localhost:5000/api/v1/users/getCurrentUser",
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
          "http://localhost:5000/api/v1/users/getCurrentUser",
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
          "http://localhost:5000/api/v1/users/getsavetrip",
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
        "http://localhost:5000/api/v1/users/logout",
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
        "http://localhost:5000/api/v1/users/deleteaccount",
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
        "http://localhost:5000/api/v1/users/editprofile",
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
        "http://localhost:5000/api/v1/users/updateProfile",
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
      navigate("/login");
    }
  }, [loading, user, navigate]);

  return (
    <>
      <style jsx global>{`
        html, body {
          overflow: hidden;
          height: 100%;
        }
        .no-transition {
          transition: none !important;
        }
        .verify-message-container {
          min-height: 24px; /* Reserves space for the verification message */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .verify-status-container {
          min-height: 36px; /* Matches the height of the button/badge */
          display: flex;
          align-items: center;
        }
        .verify-button, .verified-badge {
          width: 120px; /* Fixed width for consistency */
          text-align: center;
          padding: 8px 16px;
          font-size: 14px;
          line-height: 20px;
        }
      `}</style>
      <div className="flex flex-col sm:flex-row bg-[#171221] text-white h-screen w-full overflow-hidden">
        <SideBar />
        <main className="flex-1 w-full py-10 ml-0 sm:ml-[280px] md:ml-[300px] overflow-hidden">
          <div className="max-w-full w-full mx-auto px-6 flex flex-col gap-4 h-full overflow-hidden" style={{ zoom: '0.75' }}>
            <div className="verify-message-container">
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
                  className="w-24 h-24 rounded-full object-cover border-2 border-white cursor-pointer no-transition"
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
                  className="bg-gradient-to-r from-green-500 to-lime-500 text-white px-5 no-transition"
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
                      <Button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 no-transition">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-green-500 to-lime-500 no-transition">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                  <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-2 right-3 text-white text-2xl font-bold no-transition"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center sm:justify-start mb-6">
              <div className="bg-gradient-to-r from-green-500 to-lime-500 px-4 py-2 rounded-xl text-center w-36 no-transition">
                <p className="text-sm">Groups Joined</p>
                <p className="text-lg font-bold">0</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-lime-500 px-4 py-2 rounded-xl text-center w-36 no-transition">
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
                <div className="verify-status-container">
                  {user?.verified ? (
                    <span className="verified-badge bg-gray-500 text-white font-semibold rounded-full shadow-md inline-block  no-transition">
                      Verified
                    </span>
                  ) : (
                    <Button
                      className="verify-button bg-gradient-to-r from-green-500 to-lime-500 mb-6 no-transition"
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
                  className="bg-red-600 text-white font-medium py-2 px-5 rounded-xl no-transition"
                  onClick={deleteAccount}
                >
                  Delete Account
                </Button>
              </div>
              <div className="flex justify-between items-center mt-12 ml-360">
                <Button
                  className="bg-red-600 px-5 py-2 font-medium rounded-xl text-white no-transition"
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