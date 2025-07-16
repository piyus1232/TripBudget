// useAuth.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/v1/users/getCurrentUser", { withCredentials: true })
      .then((res) => setUser(res.data.data))
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
