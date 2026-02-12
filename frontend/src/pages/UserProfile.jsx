/**
 * User Profile Page
 * - View/update profile fields
 * - Trigger password reset email
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import authService from "../services/authService";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [resetStatus, setResetStatus] = useState({
    sending: false,
    message: "",
    error: "",
  });

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const initialEmail = useMemo(() => user?.email || "", [user]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const profile = await userService.getProfile();

      setForm({
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        email: profile?.email || "",
      });

      // ✅ sync navbar + local storage (via your AuthContext write-through)
      if (typeof setUser === "function") setUser(profile);
    } catch (e) {
      const data = e?.response?.data;
      setError(
        data?.detail ||
          (typeof data === "object" ? JSON.stringify(data) : "") ||
          e?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await loadProfile();
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const onChange = (e) => {
    setSuccess("");
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await userService.updateProfile({
        first_name: (form.first_name || "").trim(),
        last_name: (form.last_name || "").trim(),
        email: (form.email || "").trim(),
      });

      // ✅ update navbar immediately
      if (typeof setUser === "function") setUser(updated);

      setSuccess("Profile updated.");
    } catch (e2) {
      const data = e2?.response?.data;
      setError(
        data?.detail ||
          (typeof data === "object" ? JSON.stringify(data) : "") ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordReset = async () => {
    setResetStatus({ sending: true, message: "", error: "" });

    try {
      const emailToUse = (form.email || initialEmail || "").trim();
      if (!emailToUse) {
        setResetStatus({
          sending: false,
          message: "",
          error: "Email address is missing. Please add your email and try again.",
        });
        return;
      }

      // ✅ expects a string
      await authService.requestPasswordReset(emailToUse);

      setResetStatus({
        sending: false,
        message: "Password reset email sent. Check your inbox.",
        error: "",
      });
    } catch (e) {
      setResetStatus({
        sending: false,
        message: "",
        error: e?.response?.data?.detail || e?.message || "Failed to send password reset email.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!ok) return;

    try {
      await userService.deleteAccount();
      await logout?.();
      navigate("/login");
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to delete account.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-gray-600">Loading profile…</div>
      </div>
    );
  }

  // ✅ If load failed, show error + retry instead of an endless spinner
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
        <button
          type="button"
          onClick={loadProfile}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry loading profile
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

      {success ? (
        <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      ) : null}

      <form onSubmit={onSave} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={onChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoComplete="given-name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={onChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoComplete="family-name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoComplete="email"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Password section */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Password</h2>
        <p className="text-gray-600 mb-4">For security, we’ll email you a password reset link.</p>

        {resetStatus.error ? (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {resetStatus.error}
          </div>
        ) : null}

        {resetStatus.message ? (
          <div className="mb-3 rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {resetStatus.message}
          </div>
        ) : null}

        <button
          type="button"
          onClick={sendPasswordReset}
          disabled={resetStatus.sending}
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-black disabled:opacity-60"
        >
          {resetStatus.sending ? "Sending…" : "Send password reset email"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="mt-8 bg-white shadow rounded-lg p-6 border border-red-200">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-gray-600 mb-4">Delete your account permanently.</p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Delete account
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
