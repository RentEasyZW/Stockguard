import { useState } from "react";
import { supabase } from "../supabaseClient";

const PLANS = [
  { id: "monthly", label: "Monthly", price: "$5", period: "/mo", description: "Pay month to month", badge: null },
  { id: "quarterly", label: "Quarterly", price: "$13", period: "/qtr", description: "Save ~13%", badge: "Popular" },
  { id: "annual", label: "Annual", price: "$45", period: "/yr", description: "Save 25%", badge: "Best Value" },
];

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ businessName: "", ownerName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const validateStep1 = () => {
    if (!form.businessName.trim()) return "Business name is required.";
    if (!form.ownerName.trim()) return "Owner name is required.";
    if (!form.email.trim() || !form.email.includes("@")) return "Valid email is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNext = () => { const err = validateStep1(); if (err) { setError(err); return; } setStep(2); };

  const handleSignUp = async () => {
    setLoading(true); setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("User creation failed. Please try again.");
      const { data: bizData, error: bizError } = await supabase.from("businesses").insert([{ name: form.businessName, owner_name: form.ownerName, phone: form.phone, subscription_plan: selectedPlan, status: "active", user_id: userId }]).select().single();
      if (bizError) throw bizError;
      await supabase.from("profiles").upsert([{ id: userId, full_name: form.ownerName, business_id: bizData.id, role: "owner" }]);
      setStep(3);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGrid} />
      <div style={styles.logoBar}>
        <span style={styles.logoText}>⬛ StockGuard</span>
      </div>
      <div style={styles.card}>
        <div style={styles.stepRow}>
          {[1, 2].map((s) => (
            <div key={s} style={styles.stepItem}>
              <div style={{ ...styles.stepDot, background: step >= s ? "#00C48C" : "#1e2a24", border: step >= s ? "2px solid #00C48C" : "2px solid #2e3e34", color: step >= s ? "#0a0f0d" : "#4a6055" }}>{step > s ? "✓" : s}</div>
              <span style={{ ...styles.stepLabel, color: step >= s ? "#00C48C" : "#4a6055" }}>{s === 1 ? "Business Info" : "Choose Plan"}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 style={styles.heading}>Create your account</h1>
            <p style={styles.sub}>Set up StockGuard for your business in 2 minutes.</p>
            <div style={styles.fieldGroup}>
              {[["Business Name","businessName","text","e.g. Chisora Electrical"],["Your Name","ownerName","text","e.g. Tendai Chisora"],["Email Address","email","email","tendai@chisora.co.zw"],["WhatsApp Number (optional)","phone","text","+263 77 123 4567"],["Password","password","password","Min. 6 characters"],["Confirm Password","confirmPassword","password","Repeat password"]].map(([label, name, type, placeholder]) => (
                <div key={name} style={styles.field}>
                  <label style={styles.label}>{label}</label>
                  <input style={styles.input} type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} autoComplete="off" />
                </div>
              ))}
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.btn} onClick={handleNext}>Continue to Plan →</button>
            <p style={styles.loginLink}>Already have an account? <a href="/login" style={styles.link}>Sign in</a></p>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={styles.heading}>Choose your plan</h1>
            <p style={styles.sub}>All plans include full access. Cancel anytime.</p>
            <div style={styles.planGrid}>
              {PLANS.map((plan) => (
                <div key={plan.id} style={{ ...styles.planCard, border: selectedPlan === plan.id ? "2px solid #00C48C" : "2px solid #1e2a24", background: selectedPlan === plan.id ? "#0d1f18" : "#0a0f0d" }} onClick={() => setSelectedPlan(plan.id)}>
                  {plan.badge && <span style={styles.badge}>{plan.badge}</span>}
                  <div style={styles.planLabel}>{plan.label}</div>
                  <div style={styles.planPrice}>{plan.price}<span style={styles.planPeriod}>{plan.period}</span></div>
                  <div style={styles.planDesc}>{plan.description}</div>
                  <div style={{ ...styles.planRadio, background: selectedPlan === plan.id ? "#00C48C" : "transparent", border: selectedPlan === plan.id ? "2px solid #00C48C" : "2px solid #2e3e34" }}>
                    {selectedPlan === plan.id && <div style={styles.planRadioDot} />}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.planFeatures}>
              <p style={styles.featureTitle}>All plans include:</p>
              {["Unlimited product tracking","WhatsApp stock alerts","Sales & theft variance reports","Business owner dashboard"].map((f) => (
                <div key={f} style={styles.featureRow}><span style={styles.featureCheck}>✓</span><span style={styles.featureText}>{f}</span></div>
              ))}
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSignUp} disabled={loading}>{loading ? "Creating account..." : "Create Account →"}</button>
            <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
          </>
        )}

        {step === 3 && (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.heading}>You're in!</h1>
            <p style={styles.sub}>Your StockGuard account for <strong style={{ color: "#00C48C" }}>{form.businessName}</strong> is ready.</p>
            <p style={styles.successNote}>Check your email to verify your address, then log in to start tracking your stock.</p>
            <a href="/login" style={{ textDecoration: "none" }}><button style={styles.btn}>Go to Login →</button></a>
          </div>
        )}
      </div>
      <p style={styles.footer}>© 2025 StockGuard · Built for Zimbabwe</p>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#060b08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "32px 16px 48px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", position: "relative", overflow: "hidden" },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,196,140,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,196,140,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 },
  logoBar: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", zIndex: 1 },
  logoText: { fontSize: "20px", fontWeight: "700", color: "#e8f5f0", letterSpacing: "-0.5px" },
  card: { width: "100%", maxWidth: "480px", background: "#0d1510", border: "1px solid #1a2e22", borderRadius: "20px", padding: "36px 32px", zIndex: 1, position: "relative" },
  stepRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  stepItem: { display: "flex", alignItems: "center", gap: "8px", flex: 1 },
  stepDot: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 },
  stepLabel: { fontSize: "12px", fontWeight: "500" },
  heading: { fontSize: "24px", fontWeight: "700", color: "#e8f5f0", margin: "0 0 6px", letterSpacing: "-0.5px" },
  sub: { fontSize: "14px", color: "#6a8f7a", margin: "0 0 24px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#7aab90", letterSpacing: "0.3px", textTransform: "uppercase" },
  input: { background: "#0a0f0d", border: "1.5px solid #1a2e22", borderRadius: "10px", padding: "11px 14px", color: "#e8f5f0", fontSize: "14px", outline: "none", fontFamily: "inherit" },
  error: { background: "#1a0a0a", border: "1px solid #4a1515", color: "#e87070", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", marginBottom: "16px" },
  btn: { width: "100%", padding: "13px", background: "#00C48C", color: "#060b08", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" },
  backBtn: { width: "100%", padding: "11px", background: "transparent", color: "#6a8f7a", border: "1px solid #1a2e22", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", marginTop: "10px", fontFamily: "inherit" },
  loginLink: { textAlign: "center", fontSize: "13px", color: "#4a6055", marginTop: "16px" },
  link: { color: "#00C48C", textDecoration: "none", fontWeight: "600" },
  planGrid: { display: "flex", gap: "10px", marginBottom: "20px" },
  planCard: { flex: 1, borderRadius: "12px", padding: "16px 12px", cursor: "pointer", position: "relative", textAlign: "center" },
  badge: { position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#00C48C", color: "#060b08", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap" },
  planLabel: { fontSize: "11px", fontWeight: "600", color: "#7aab90", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" },
  planPrice: { fontSize: "22px", fontWeight: "800", color: "#e8f5f0", letterSpacing: "-1px", marginBottom: "2px" },
  planPeriod: { fontSize: "13px", fontWeight: "400", color: "#6a8f7a" },
  planDesc: { fontSize: "11px", color: "#4a6055", marginBottom: "12px" },
  planRadio: { width: "16px", height: "16px", borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" },
  planRadioDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#060b08" },
  planFeatures: { background: "#0a0f0d", border: "1px solid #1a2e22", borderRadius: "10px", padding: "14px", marginBottom: "20px" },
  featureTitle: { fontSize: "11px", fontWeight: "600", color: "#4a6055", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" },
  featureRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  featureCheck: { color: "#00C48C", fontSize: "12px", fontWeight: "700", flexShrink: 0 },
  featureText: { fontSize: "13px", color: "#7aab90" },
  successBox: { textAlign: "center", padding: "20px 0" },
  successIcon: { width: "64px", height: "64px", background: "#0d2e1f", border: "2px solid #00C48C", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#00C48C", margin: "0 auto 20px" },
  successNote: { fontSize: "13px", color: "#4a6055", margin: "12px 0 24px", lineHeight: "1.6" },
  footer: { fontSize: "12px", color: "#2e3e34", marginTop: "24px", zIndex: 1 },
};