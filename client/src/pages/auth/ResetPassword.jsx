import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Lock } from "lucide-react";

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-base)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  bgLines: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    opacity: 0.2,
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
    animation: "fadeUp 0.4s ease both",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.82rem",
    color: "var(--text-muted)",
    marginBottom: "24px",
    fontFamily: "IBM Plex Mono, monospace",
    letterSpacing: "0.05em",
    transition: "color var(--transition)",
  },
  card: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "36px",
    boxShadow: "var(--shadow)",
  },
  icon: {
    width: "52px",
    height: "52px",
    background: "var(--accent-dim)",
    border: "1px solid rgba(230,57,70,0.3)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    marginBottom: "20px",
  },
  title: {
    fontSize: "1.8rem",
    fontFamily: "Oswald, sans-serif",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "6px",
  },
  desc: {
    color: "var(--text-secondary)",
    fontSize: "0.875rem",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  passwordWrapper: {
    position: "relative",
  },
  toggleBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "0.78rem",
    fontFamily: "IBM Plex Mono, monospace",
    cursor: "pointer",
    padding: "2px 4px",
    letterSpacing: "0.05em",
    transition: "color var(--transition)",
  },
  passwordInput: {
    paddingRight: "56px",
  },
  requirements: {
    fontSize: "0.78rem",
    color: "var(--text-muted)",
    fontFamily: "IBM Plex Mono, monospace",
    marginTop: "-8px",
    paddingLeft: "2px",
  },
  successActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "4px",
  },
  successTitle: {
    fontSize: "1.4rem",
    fontFamily: "Oswald, sans-serif",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "6px",
  },
  successDesc: {
    color: "var(--text-secondary)",
    fontSize: "0.875rem",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.password || !form.confirmPassword) {
      setError("Both fields are required.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setStatus("loading");
    try {
      await api.put(`/auth/reset-password/${token}`, {
        password: form.password,
      });
      setStatus("success");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setStatus("idle");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgLines} />
      <div style={styles.container}>
        <Link to="/login" style={styles.backLink}>
          ← Back to sign in
        </Link>

        <div style={styles.card}>
          {status === "success" ? (
            <>
              <div style={styles.icon}>✓</div>
              <div style={styles.successTitle}>Password Reset!</div>
              <div style={styles.successDesc}>
                Your password has been updated successfully. You can now sign in
                with your new password.
              </div>
              <div style={styles.successActions}>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/login")}
                >
                  GO TO SIGN IN
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={styles.icon}><Lock size={24} /></div>
              <div style={styles.title}>Set New Password</div>
              <div style={styles.desc}>
                Choose a strong password for your account. It must be at least 6
                characters long.
              </div>

              <form style={styles.form} onSubmit={handleSubmit} noValidate>
                {error && <div className="error-msg">{error}</div>}

                {/* New Password */}
                <div className="field">
                  <label>New Password</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      style={styles.passwordInput}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      style={styles.toggleBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                <div style={styles.requirements}>
                  Minimum 6 characters required
                </div>

                {/* Confirm Password */}
                <div className="field">
                  <label>Confirm Password</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      style={styles.passwordInput}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      style={styles.toggleBtn}
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                    >
                      {showConfirm ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  type="submit"
                  disabled={status === "loading"}
                  style={{ marginTop: "4px" }}
                >
                  {status === "loading" ? "Resetting..." : "RESET PASSWORD"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
