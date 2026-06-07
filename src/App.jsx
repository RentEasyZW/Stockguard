import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from './supabaseClient';

// ─────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────────
// ROUTER (simple hash-based)
// ─────────────────────────────────────────────
function useRoute() {
  const [route, setRoute] = useState(window.location.hash || "#login");
  useEffect(() => {
    const handler = () => setRoute(window.location.hash || "#login");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (path) => { window.location.hash = path; };
  return { route, navigate };
}

// ─────────────────────────────────────────────
// FONTS + GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0d1117;
      --ink2: #1c2433;
      --surface: #f5f4f0;
      --card: #ffffff;
      --accent: #00c48c;
      --accent2: #ff6b35;
      --warn: #f5a623;
      --danger: #e53e3e;
      --muted: #8a94a6;
      --border: #e8e6e0;
      --font-display: 'Syne', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --radius: 12px;
      --shadow: 0 2px 16px rgba(0,0,0,0.08);
      --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
    }

    body { font-family: var(--font-body); background: var(--surface); color: var(--ink); min-height: 100vh; }

    .btn {
      font-family: var(--font-body); font-weight: 500; font-size: 14px;
      padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;
      transition: all 0.18s ease; display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary { background: var(--ink); color: #fff; }
    .btn-primary:hover { background: var(--ink2); transform: translateY(-1px); }
    .btn-accent { background: var(--accent); color: #fff; }
    .btn-accent:hover { background: #00b07d; transform: translateY(-1px); }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-danger:hover { opacity: 0.88; }
    .btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid var(--border); }
    .btn-ghost:hover { border-color: var(--ink); }
    .btn-warn { background: var(--warn); color: #fff; }
    .btn-sm { padding: 6px 14px; font-size: 13px; }
    .btn-full { width: 100%; justify-content: center; }

    input, select, textarea {
      font-family: var(--font-body); font-size: 14px;
      width: 100%; padding: 11px 14px; border: 1.5px solid var(--border);
      border-radius: 8px; background: #fff; color: var(--ink);
      transition: border-color 0.15s; outline: none;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--accent); }

    .tag {
      display: inline-block; font-size: 11px; font-weight: 600;
      padding: 3px 10px; border-radius: 20px; letter-spacing: 0.03em;
    }
    .tag-active { background: #d4f7ed; color: #00875a; }
    .tag-pending { background: #fff3cd; color: #856404; }
    .tag-expired { background: #fde8e8; color: #c0392b; }
    .tag-suspended { background: #e8e6e0; color: #555; }
    .tag-low { background: #fde8e8; color: #c0392b; }
    .tag-ok { background: #d4f7ed; color: #00875a; }
    .tag-profit { background: #d4f7ed; color: #00875a; }
    .tag-loss { background: #fde8e8; color: #c0392b; }

    .card {
      background: var(--card); border-radius: var(--radius);
      border: 1px solid var(--border); padding: 24px;
      box-shadow: var(--shadow);
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(13,17,23,0.55);
      backdrop-filter: blur(4px); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal {
      background: #fff; border-radius: 16px; padding: 32px;
      width: 100%; max-width: 480px; box-shadow: var(--shadow-lg);
      animation: modalIn 0.22s ease;
    }
    @keyframes modalIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .fade-up { animation: fadeUp 0.4s ease both; }
    .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
    .fade-up-3 { animation: fadeUp 0.4s 0.2s ease both; }
    .fade-up-4 { animation: fadeUp 0.4s 0.3s ease both; }

    table { width: 100%; border-collapse: collapse; }
    th { font-family: var(--font-display); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); padding: 10px 14px; text-align: left; border-bottom: 1.5px solid var(--border); }
    td { padding: 12px 14px; font-size: 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafaf8; }

    .sidebar { width: 220px; min-height: 100vh; background: var(--ink); padding: 28px 0; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
    .sidebar-logo { padding: 0 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .sidebar-logo h1 { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: #fff; }
    .sidebar-logo span { color: var(--accent); }
    .sidebar-logo p { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .sidebar nav { padding: 20px 12px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; transition: all 0.15s; text-decoration: none; margin-bottom: 4px; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.08); color: #fff; }
    .nav-item.active { color: var(--accent); }
    .nav-icon { font-size: 16px; width: 20px; text-align: center; }
    .main-content { margin-left: 220px; padding: 32px; min-height: 100vh; }
    .page-header { margin-bottom: 28px; }
    .page-header h2 { font-family: var(--font-display); font-size: 26px; font-weight: 800; }
    .page-header p { color: var(--muted); font-size: 14px; margin-top: 4px; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: var(--card); border-radius: var(--radius); padding: 20px 24px; border: 1px solid var(--border); }
    .stat-card .label { font-size: 12px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
    .stat-card .value { font-family: var(--font-display); font-size: 32px; font-weight: 800; margin-top: 6px; }
    .stat-card .sub { font-size: 12px; color: var(--muted); margin-top: 4px; }

    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--ink); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .alert-banner { padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
    .alert-error { background: #fde8e8; color: #c0392b; border: 1px solid #f5c6c6; }
    .alert-success { background: #d4f7ed; color: #00875a; border: 1px solid #b2e8d6; }
    .alert-warn { background: #fff3cd; color: #856404; border: 1px solid #ffe08a; }

    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    @media (max-width: 768px) {
      .sidebar { width: 100%; min-height: auto; position: relative; }
      .main-content { margin-left: 0; padding: 16px; }
      .form-row { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
  `}</style>
);

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
function LoginPage({ navigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await login(form.email, form.password);
      if (isAdmin) {
        navigate("#admin");
      } else {
        navigate("#dashboard");
      }
    } catch (err) {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--surface)" }}>
      <div style={{ flex: 1, background: "var(--ink)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(0,196,140,0.08)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,107,53,0.06)" }} />
        <div className="fade-up">
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
            Stock<span style={{ color: "var(--accent)" }}>Guard</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 12, fontSize: 16, lineHeight: 1.6 }}>
            Smart stock management for Zimbabwean businesses. Track, alert, grow.
          </p>
        </div>
        <div className="fade-up-2" style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: "📦", text: "Real-time stock tracking" },
            { icon: "🔔", text: "WhatsApp low-stock alerts" },
            { icon: "💳", text: "EcoCash & Paynow payments" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
        <div style={{ width: "100%" }} className="fade-up">
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800 }}>Welcome back</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Sign in to your StockGuard account</p>
          </div>

          <div style={{ display: "flex", background: "var(--surface)", borderRadius: 8, padding: 4, marginBottom: 24, gap: 4 }}>
            {["Business Login", "Admin Login"].map((label, i) => (
              <button key={i} className="btn" onClick={() => { setIsAdmin(i === 1); setError(""); }}
                style={{ flex: 1, justifyContent: "center", fontSize: 13,
                  background: isAdmin === (i === 1) ? "var(--ink)" : "transparent",
                  color: isAdmin === (i === 1) ? "#fff" : "var(--muted)",
                  border: "none", padding: "8px" }}>
                {label}
              </button>
            ))}
          </div>

          {error && <div className="alert-banner alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label>Email address</label>
            <input type="email" placeholder="you@business.co.zw" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}
            style={{ marginTop: 8, padding: "13px", fontSize: 15 }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
            New business?{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}
              onClick={() => navigate("#register")}>
              Create account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────
function RegisterPage({ navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ businessName: "", ownerName: "", email: "", phone: "", businessType: "retail", password: "", confirm: "", plan: "monthly" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const PLANS = [
    { id: "monthly", label: "Monthly", price: "$30", period: "/month", note: "Early adopter rate" },
    { id: "quarterly", label: "Quarterly", price: "$81", period: "/quarter", note: "Save 10%" },
    { id: "annual", label: "Annual", price: "$288", period: "/year", note: "Best value — save 20%" },
  ];

  const handleSubmit = async () => {
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Account creation failed. Please try again.");
      const { error: bizError } = await supabase.from("businesses").insert([{
        name: form.businessName,
        owner_name: form.ownerName,
        phone: form.phone,
        business_type: form.businessType,
        subscription_plan: form.plan,
        subscription_status: "pending",
        user_id: userId,
      }]);
      if (bizError) throw bizError;
      setLoading(false);
      setDone(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card fade-up" style={{ maxWidth: 480, textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Account Created!</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>
          Your <strong>{form.businessName}</strong> account is pending activation.<br />
          Pay <strong>{PLANS.find(p => p.id === form.plan)?.price}</strong> via EcoCash or Paynow, then WhatsApp your proof to activate.
        </p>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "20px", marginBottom: 24, textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Payment Instructions</p>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
            📱 EcoCash: Send to <strong>0783464169</strong><br />
            💳 Paynow: Use reference <strong>{form.email.slice(0, 8).toUpperCase()}</strong><br />
            📲 WhatsApp proof to: <strong>+263 78 346 4169</strong>
          </p>
        </div>
        <button className="btn btn-primary btn-full" onClick={() => navigate("#login")}>Back to Login</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--surface)" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }} className="fade-up">
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800 }}>
            Stock<span style={{ color: "var(--accent)" }}>Guard</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Create your business account</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }} className="fade-up">
          {["Business Info", "Account", "Choose Plan"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: step > i ? "var(--accent)" : step === i + 1 ? "var(--ink)" : "var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {step > i ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 12, color: step === i + 1 ? "var(--ink)" : "var(--muted)", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1.5, background: step > i + 1 ? "var(--accent)" : "var(--border)", margin: "0 8px" }} />}
            </div>
          ))}
        </div>

        <div className="card fade-up-2">
          {error && <div className="alert-banner alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

          {step === 1 && (
            <>
              <div className="form-group"><label>Business Name</label><input placeholder="e.g. Moyo General Store" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} /></div>
              <div className="form-group"><label>Owner Full Name</label><input placeholder="Your full name" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Phone (WhatsApp)</label><input placeholder="077XXXXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group">
                  <label>Business Type</label>
                  <select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })}>
                    <option value="retail">Retail Shop</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="hardware">Hardware</option>
                    <option value="grocery">Grocery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { if (!form.businessName || !form.ownerName || !form.phone) { setError("Fill in all fields."); return; } setError(""); setStep(2); }}>Next →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@business.co.zw" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Password</label><input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} /></div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (!form.email || !form.password) { setError("Fill in all fields."); return; } setError(""); setStep(3); }}>Next →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Choose your subscription plan:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {PLANS.map(plan => (
                  <div key={plan.id} onClick={() => setForm({ ...form, plan: plan.id })}
                    style={{ padding: "16px 20px", border: `2px solid ${form.plan === plan.id ? "var(--accent)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: form.plan === plan.id ? "#f0fdf8" : "#fff", transition: "all 0.15s" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{plan.label}</p>
                      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{plan.note}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>{plan.price}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{plan.period}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-accent" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating account..." : "Create Account →"}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
          Already have an account?{" "}
          <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }} onClick={() => navigate("#login")}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BUSINESS DASHBOARD LAYOUT
// ─────────────────────────────────────────────
function DashboardLayout({ children, activeTab, setActiveTab, navigate }) {
  const { user, logout } = useAuth();
  const tabs = [
    { id: "overview", icon: "⊞", label: "Overview" },
    { id: "products", icon: "📦", label: "Products" },
    { id: "movements", icon: "↕️", label: "Stock Movements" },
    { id: "profit", icon: "📊", label: "Profit & Loss" },
    { id: "alerts", icon: "🔔", label: "Alerts" },
    { id: "payments", icon: "💳", label: "Payments" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Stock<span>Guard</span></h1>
          <p>{user?.email}</p>
        </div>
        <nav>
          {tabs.map(t => (
            <div key={t.id} className={`nav-item ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
            <div className="nav-item" onClick={() => { logout(); navigate("#login"); }}>
              <span className="nav-icon">⏻</span>
              <span>Sign Out</span>
            </div>
          </div>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}// ----------------------------------
// SEND LOW STOCK ALERT VIA SMS
// ----------------------------------
const sendLowStockAlert = async (phone, businessName, lowStockItems) => {
  if (!phone || lowStockItems.length === 0) return;
  try {
    const response = await fetch('https://gajykjeeguixknjjnohw.supabase.co/functions/v1/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify({ phone, businessName, lowStockItems }),
    });
    console.log('Alert sent:', await response.json());
  } catch (err) {
    console.error('Alert failed:', err);
  }
};

// ─────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────
function OverviewTab({ products }) {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalValue = products.reduce((s, p) => s + p.current_stock * p.selling_price, 0);
  const lowStock = products.filter(p => p.current_stock <= p.low_stock_threshold);
  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.current_stock, 0);

  // Profit calculation for overview
  const totalCostValue = products.reduce((s, p) => s + p.current_stock * p.cost_price, 0);
  const potentialProfit = totalValue - totalCostValue;
  
  useEffect(() => {
    if (lowStock.length > 0) {
      supabase
        .from('businesses')
        .select('id, name, phone')
        .eq('user_id', user?.id)
        .single()
        .then(({ data }) => {
          if (data?.phone) {
            sendLowStockAlert(data.phone, data.name, lowStock);
          }
        });
    }
  }, [products.length, lowStock.length]);

  return (
    <div>
      <div className="page-header fade-up">
        <h2>{greeting} 👋</h2>
        <p>Here's your stock overview for today</p>
      </div>

      <div className="stats-grid fade-up-2">
        {[
          { label: "Total Products", value: totalProducts, sub: "active SKUs", color: "var(--ink)" },
          { label: "Total Stock", value: totalStock, sub: "units across all items", color: "var(--accent)" },
          { label: "Stock Value", value: `$${totalValue.toLocaleString()}`, sub: "at selling price", color: "var(--accent2)" },
          { label: "Low Stock", value: lowStock.length, sub: "items need restocking", color: "var(--danger)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
            <div className="sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="card fade-up-3" style={{ marginBottom: 24, border: "1.5px solid #fde8e8" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--danger)" }}>⚠️ Low Stock Alerts</h3>
          <table>
            <thead><tr><th>Product</th><th>Current</th><th>Minimum</th><th>Status</th></tr></thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.current_stock} {p.unit}</td>
                  <td>{p.low_stock_threshold} {p.unit}</td>
                  <td><span className="tag tag-low">Low Stock</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card fade-up-4">
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>All Stock Levels</h3>
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong><br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{p.sku}</span></td>
                <td>{p.category}</td>
                <td>{p.current_stock} {p.unit}</td>
                <td>${(p.current_stock * p.selling_price).toLocaleString()}</td>
                <td><span className={`tag ${p.current_stock <= p.low_stock_threshold ? "tag-low" : "tag-ok"}`}>{p.current_stock <= p.low_stock_threshold ? "Low Stock" : "OK"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCTS TAB — FIX: removed 2-product limit
// ─────────────────────────────────────────────
function ProductsTab({ products, setProducts }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", sku: "", category: "", cost_price: "", selling_price: "", current_stock: "", low_stock_threshold: "", unit: "units", supplier: "" });
  const [saveError, setSaveError] = useState("");

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditProduct(null);
    setSaveError("");
    setForm({ name: "", sku: "", category: "", cost_price: "", selling_price: "", current_stock: "", low_stock_threshold: "", unit: "units", supplier: "" });
    setShowModal(true);
  };
  const openEdit = (p) => { setEditProduct(p); setSaveError(""); setForm({ ...p }); setShowModal(true); };

  const handleSave = async () => {
    setSaveError("");
    if (!form.name || !form.sku || !form.selling_price) {
      setSaveError("Name, SKU and Selling Price are required.");
      return;
    }
    const payload = {
      name: form.name, sku: form.sku, category: form.category,
      cost_price: +form.cost_price || 0, selling_price: +form.selling_price,
      current_stock: +form.current_stock || 0, low_stock_threshold: +form.low_stock_threshold || 0,
      unit: form.unit, supplier: form.supplier,
    };
    if (editProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
      if (error) { setSaveError("Update failed: " + error.message); return; }
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...payload } : p));
    } else {
      // FIX: fetch business_id properly — no artificial limit
      const { data: bizData, error: bizErr } = await supabase
        .from("businesses").select("id").eq("user_id", user?.id).single();
      if (bizErr || !bizData) { setSaveError("Could not find your business. Please try again."); return; }
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...payload, business_id: bizData.id }])
        .select()
        .single();
      if (error) { setSaveError("Save failed: " + error.message); return; }
      setProducts(prev => [...prev, data]);
    }
    setShowModal(false);
    setSaveError("");
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div>
      <div className="page-header fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Products</h2><p>Manage your stock catalogue ({products.length} products)</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="card fade-up-2">
        <input placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 20 }} />
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
            <p>{search ? "No products match your search." : "No products yet. Click '+ Add Product' to get started."}</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{p.sku}</span></td>
                  <td>{p.category}</td>
                  <td>${p.cost_price}</td>
                  <td>${p.selling_price}</td>
                  <td>{p.current_stock} {p.unit}</td>
                  <td><span className={`tag ${p.current_stock <= p.low_stock_threshold ? "tag-low" : "tag-ok"}`}>{p.current_stock <= p.low_stock_threshold ? "Low" : "OK"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, marginBottom: 20 }}>{editProduct ? "Edit Product" : "Add New Product"}</h3>
            {saveError && <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>⚠️ {saveError}</div>}
            <div className="form-group"><label>Product Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Samsung 320L Fridge" /></div>
            <div className="form-row">
              <div className="form-group"><label>SKU / Code *</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SAM-F320" /></div>
              <div className="form-group"><label>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Fridges" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Cost Price ($)</label><input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} /></div>
              <div className="form-group"><label>Selling Price ($) *</label><input type="number" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Current Stock</label><input type="number" value={form.current_stock} onChange={e => setForm({ ...form, current_stock: e.target.value })} /></div>
              <div className="form-group"><label>Low Stock Alert At</label><input type="number" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Unit</label>
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option>units</option><option>kg</option><option>litres</option><option>boxes</option><option>pairs</option>
                </select>
              </div>
              <div className="form-group"><label>Supplier</label><input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" /></div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STOCK MOVEMENTS TAB — FIX: filter by business_id
// ─────────────────────────────────────────────
function MovementsTab({ products, setProducts }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [movements, setMovements] = useState([]);
  const [msg, setMsg] = useState("");
  const [businessId, setBusinessId] = useState(null);
  const [form, setForm] = useState({ product_id: "", movement_type: "stock_in", quantity: "", reference: "", notes: "" });

  useEffect(() => {
    const fetchMovements = async () => {
      // FIX: fetch business_id first, then filter movements by it
      const { data: bizData } = await supabase
        .from("businesses").select("id").eq("user_id", user?.id).single();
      if (!bizData) return;
      setBusinessId(bizData.id);

      const { data } = await supabase
        .from("stock_movements")
        .select("*, products(name)")
        .eq("business_id", bizData.id)   // ← THIS is the fix
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setMovements(data);
    };
    if (user) fetchMovements();
  }, [user]);

  const handleRecord = async () => {
    if (!form.product_id || !form.quantity) { setMsg("Please select a product and quantity."); return; }

    const product = products.find(p => String(p.id) === String(form.product_id));
    if (!product) { setMsg("Product not found. Please try again."); return; }

    const qty = parseFloat(form.quantity);
    let newStock = product.current_stock;

    if (form.movement_type === "stock_in" || form.movement_type === "return") {
      newStock += qty;
    } else if (form.movement_type === "stock_out") {
      if (qty > product.current_stock) { setMsg("Insufficient stock."); return; }
      newStock -= qty;
    } else if (form.movement_type === "adjustment") {
      newStock = qty;
    }

    const { data: bizData } = await supabase
      .from("businesses").select("id").eq("user_id", user?.id).single();

    const { data, error } = await supabase.from("stock_movements").insert([{
      product_id: form.product_id,
      business_id: bizData?.id,
      user_id: user?.id,
      movement_type: form.movement_type,
      quantity: qty,
      previous_stock: product.current_stock,
      new_stock: newStock,
      reference: form.reference,
      notes: form.notes,
    }]).select("*, products(name)").single();

    if (error) { setMsg("Error: " + error.message); return; }

    await supabase.from("products").update({ current_stock: newStock }).eq("id", form.product_id);
    setMovements(prev => [data, ...prev]);
    setProducts(prev => prev.map(p =>
      String(p.id) === String(form.product_id) ? { ...p, current_stock: newStock } : p
    ));
    setShowModal(false);
    setForm({ product_id: "", movement_type: "stock_in", quantity: "", reference: "", notes: "" });
    setMsg("");
  };

  const typeColors = { stock_in: "tag-ok", stock_out: "tag-low", adjustment: "tag-pending", return: "tag-active" };
  const typeLabels = { stock_in: "Stock In", stock_out: "Stock Out", adjustment: "Adjustment", return: "Return" };

  return (
    <div>
      <div className="page-header fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Stock Movements</h2><p>Record stock in, out, adjustments and returns</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Movement</button>
      </div>

      <div className="card fade-up-2">
        {movements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>↕️</div>
            <p>No movements recorded yet.<br />Click "Record Movement" to start tracking.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Before</th><th>After</th><th>Reference</th><th>Date</th></tr></thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.products?.name || "—"}</strong></td>
                  <td><span className={`tag ${typeColors[m.movement_type]}`}>{typeLabels[m.movement_type]}</span></td>
                  <td>{m.quantity}</td>
                  <td>{m.previous_stock}</td>
                  <td><strong>{m.new_stock}</strong></td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{m.reference || "—"}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, marginBottom: 20 }}>Record Stock Movement</h3>
            {msg && <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>⚠️ {msg}</div>}
            <div className="form-group">
              <label>Product</label>
              <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}>
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.current_stock})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Movement Type</label>
              <select value={form.movement_type} onChange={e => setForm({ ...form, movement_type: e.target.value })}>
                <option value="stock_in">Stock In (receiving goods)</option>
                <option value="stock_out">Stock Out (sale / issue)</option>
                <option value="adjustment">Adjustment (set exact count)</option>
                <option value="return">Return (goods returned)</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Quantity</label><input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
              <div className="form-group"><label>Reference / Invoice</label><input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="INV-001" /></div>
            </div>
            <div className="form-group"><label>Notes (optional)</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." rows={2} style={{ resize: "vertical" }} /></div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setShowModal(false); setMsg(""); }}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleRecord}>Record →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFIT & LOSS TAB — NEW FEATURE
// ─────────────────────────────────────────────
function ProfitTab({ products }) {
  const { user } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: bizData } = await supabase
        .from("businesses").select("id").eq("user_id", user?.id).single();
      if (!bizData) { setLoading(false); return; }

      const { data } = await supabase
        .from("stock_movements")
        .select("*, products(name, cost_price, selling_price)")
        .eq("business_id", bizData.id)
        .eq("movement_type", "stock_out")
        .order("created_at", { ascending: false });
      if (data) setMovements(data);
      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  // Filter by period
  const now = new Date();
  const filtered = movements.filter(m => {
    const d = new Date(m.created_at);
    if (period === "today") return d.toDateString() === now.toDateString();
    if (period === "week") return (now - d) <= 7 * 24 * 60 * 60 * 1000;
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });

  // Calculate revenue and cost from stock_out movements
  const revenue = filtered.reduce((sum, m) => {
    const price = m.products?.selling_price || 0;
    return sum + (m.quantity * price);
  }, 0);
  const cost = filtered.reduce((sum, m) => {
    const cp = m.products?.cost_price || 0;
    return sum + (m.quantity * cp);
  }, 0);
  const grossProfit = revenue - cost;
  const margin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;
  const isProfit = grossProfit >= 0;

  // Per-product breakdown
  const productSummary = {};
  filtered.forEach(m => {
    const name = m.products?.name || "Unknown";
    const sp = m.products?.selling_price || 0;
    const cp = m.products?.cost_price || 0;
    if (!productSummary[name]) productSummary[name] = { qty: 0, revenue: 0, cost: 0 };
    productSummary[name].qty += m.quantity;
    productSummary[name].revenue += m.quantity * sp;
    productSummary[name].cost += m.quantity * cp;
  });
  const productRows = Object.entries(productSummary).map(([name, d]) => ({
    name, qty: d.qty, revenue: d.revenue, cost: d.cost, profit: d.revenue - d.cost
  })).sort((a, b) => b.profit - a.profit);

  // Current inventory value
  const inventoryCost = products.reduce((s, p) => s + p.current_stock * p.cost_price, 0);
  const inventoryRetail = products.reduce((s, p) => s + p.current_stock * p.selling_price, 0);

  return (
    <div>
      <div className="page-header fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Profit & Loss</h2><p>Track your earnings and margins</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["all","All Time"],["month","This Month"],["week","This Week"],["today","Today"]].map(([val, label]) => (
            <button key={val} className={`btn btn-sm ${period === val ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setPeriod(val)}>{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="stats-grid fade-up-2">
            <div className="stat-card" style={{ border: "1.5px solid var(--accent)" }}>
              <div className="label">Total Revenue</div>
              <div className="value" style={{ color: "var(--accent)" }}>${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="sub">from {filtered.length} sales</div>
            </div>
            <div className="stat-card">
              <div className="label">Cost of Goods Sold</div>
              <div className="value" style={{ color: "var(--muted)", fontSize: 26 }}>${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="sub">total cost of items sold</div>
            </div>
            <div className="stat-card" style={{ border: `1.5px solid ${isProfit ? "var(--accent)" : "var(--danger)"}` }}>
              <div className="label">Gross Profit</div>
              <div className="value" style={{ color: isProfit ? "var(--accent)" : "var(--danger)" }}>
                {isProfit ? "+" : ""}${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="sub">
                <span className={`tag ${isProfit ? "tag-profit" : "tag-loss"}`}>{isProfit ? "▲ Profit" : "▼ Loss"}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Gross Margin</div>
              <div className="value" style={{ color: isProfit ? "var(--accent2)" : "var(--danger)" }}>{margin}%</div>
              <div className="sub">profit per $1 of revenue</div>
            </div>
          </div>

          {/* Visual profit bar */}
          {revenue > 0 && (
            <div className="card fade-up-3" style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>Revenue Breakdown</p>
              <div style={{ display: "flex", height: 36, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ width: `${(cost/revenue)*100}%`, background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Cost {((cost/revenue)*100).toFixed(0)}%</span>
                </div>
                <div style={{ flex: 1, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Profit {margin}%</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: "var(--muted)", display: "inline-block" }} />Cost: ${cost.toFixed(2)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: "var(--accent)", display: "inline-block" }} />Profit: ${grossProfit.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Per-product table */}
          {productRows.length > 0 ? (
            <div className="card fade-up-3" style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>Profit by Product</h3>
              <table>
                <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Status</th></tr></thead>
                <tbody>
                  {productRows.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.name}</strong></td>
                      <td>{r.qty}</td>
                      <td>${r.revenue.toFixed(2)}</td>
                      <td>${r.cost.toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: r.profit >= 0 ? "var(--accent)" : "var(--danger)" }}>
                        {r.profit >= 0 ? "+" : ""}${r.profit.toFixed(2)}
                      </td>
                      <td><span className={`tag ${r.profit >= 0 ? "tag-profit" : "tag-loss"}`}>{r.profit >= 0 ? "Profit" : "Loss"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card fade-up-3" style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <p style={{ color: "var(--muted)" }}>No sales recorded yet for this period.<br />Record stock-out movements to see your profit analysis.</p>
            </div>
          )}

          {/* Inventory value card */}
          <div className="card fade-up-4">
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>Current Inventory Value</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>AT COST PRICE</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>${inventoryCost.toLocaleString()}</p>
              </div>
              <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>AT SELLING PRICE</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>${inventoryRetail.toLocaleString()}</p>
              </div>
              <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>POTENTIAL PROFIT</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--accent2)" }}>${(inventoryRetail - inventoryCost).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ALERTS TAB
// ─────────────────────────────────────────────
function AlertsTab({ products }) {
  const lowStock = products.filter(p => p.current_stock <= p.low_stock_threshold);
  const outOfStock = products.filter(p => p.current_stock === 0);

  return (
    <div>
      <div className="page-header fade-up">
        <h2>Alerts</h2>
        <p>Stock warnings and notifications</p>
      </div>

      {outOfStock.length > 0 && (
        <div className="card fade-up-2" style={{ marginBottom: 20, border: "1.5px solid var(--danger)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--danger)", marginBottom: 16 }}>
            🚨 Out of Stock ({outOfStock.length})
          </h3>
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Supplier</th></tr></thead>
            <tbody>
              {outOfStock.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{p.sku}</td>
                  <td>{p.category}</td>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{p.supplier || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lowStock.length > 0 ? (
        <div className="card fade-up-3" style={{ border: "1.5px solid #ffe08a" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--warn)", marginBottom: 16 }}>
            ⚠️ Low Stock ({lowStock.length})
          </h3>
          <table>
            <thead><tr><th>Product</th><th>Current Stock</th><th>Minimum</th><th>Shortfall</th><th>Status</th></tr></thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{p.sku}</span></td>
                  <td>{p.current_stock} {p.unit}</td>
                  <td>{p.low_stock_threshold} {p.unit}</td>
                  <td style={{ color: "var(--danger)", fontWeight: 600 }}>
                    {p.current_stock === 0 ? "Out of stock" : `-${p.low_stock_threshold - p.current_stock} ${p.unit}`}
                  </td>
                  <td>
                    <span className={`tag ${p.current_stock === 0 ? "tag-expired" : "tag-low"}`}>
                      {p.current_stock === 0 ? "Out of Stock" : "Low Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card fade-up-2" style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <p style={{ color: "var(--muted)" }}>All stock levels are healthy. No alerts at this time.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAYMENTS TAB
// ─────────────────────────────────────────────
function PaymentsTab() {
  const { user } = useAuth();
  const [step, setStep] = useState("choose");
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [payMethod, setPayMethod] = useState("ecocash");
  const [phone, setPhone] = useState("");
  const [bizInfo, setBizInfo] = useState(null);

  const PLANS = [
    { id: "monthly", label: "Monthly", price: 30, period: "/month" },
    { id: "quarterly", label: "Quarterly", price: 81, period: "/quarter" },
    { id: "annual", label: "Annual", price: 288, period: "/year" },
  ];

  useEffect(() => {
    const fetchBiz = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("subscription_status, subscription_plan, subscription_expires_at")
        .eq("user_id", user?.id)
        .single();
      if (data) setBizInfo(data);
    };
    if (user) fetchBiz();
  }, [user]);

  const plan = PLANS.find(p => p.id === selectedPlan);

  return (
    <div>
      <div className="page-header fade-up"><h2>Payments</h2><p>Manage your StockGuard subscription</p></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 800 }} className="fade-up-2">
        <div className="card">
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>Current Subscription</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--muted)", fontSize: 14 }}>Status</span>
            <span className={`tag tag-${bizInfo?.subscription_status || "pending"}`}>
              {bizInfo?.subscription_status || "pending"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--muted)", fontSize: 14 }}>Plan</span>
            <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {bizInfo?.subscription_plan || "—"} — ${PLANS.find(p => p.id === bizInfo?.subscription_plan)?.price || "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--muted)", fontSize: 14 }}>Expires</span>
            <span style={{ fontWeight: 600 }}>{bizInfo?.subscription_expires_at || "—"}</span>
          </div>
        </div>

        <div className="card">
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>Renew Subscription</p>
          {step === "choose" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {PLANS.map(p => (
                  <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                    style={{ padding: "10px 14px", border: `2px solid ${selectedPlan === p.id ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", background: selectedPlan === p.id ? "#f0fdf8" : "#fff" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                      ${p.price}<span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-body)", fontWeight: 400 }}>{p.period}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["ecocash", "paynow"].map(m => (
                  <button key={m} className={`btn btn-sm ${payMethod === m ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setPayMethod(m)} style={{ flex: 1, justifyContent: "center" }}>
                    {m === "ecocash" ? "EcoCash" : "Paynow"}
                  </button>
                ))}
              </div>
              <button className="btn btn-accent btn-full" onClick={() => setStep("pay")}>Pay ${plan.price} →</button>
            </>
          )}
          {step === "pay" && payMethod === "ecocash" && (
            <div>
              <div className="alert-banner alert-warn" style={{ marginBottom: 16 }}>📱 EcoCash Payment Instructions</div>
              <div style={{ background: "var(--surface)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 13, lineHeight: 2 }}>
                  1. Open EcoCash on your phone<br />
                  2. Send <strong>${plan.price} USD</strong> to <strong>0783464169</strong><br />
                  3. Use reference: <strong>{user?.email?.slice(0, 8).toUpperCase()}</strong><br />
                  4. WhatsApp proof to: <strong>+263 78 346 4169</strong>
                </p>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Your account will be activated within 2 hours of payment confirmation.</p>
              <button className="btn btn-ghost btn-full" onClick={() => setStep("choose")}>← Change Plan</button>
            </div>
          )}
          {step === "pay" && payMethod === "paynow" && (
            <div>
              <div className="alert-banner" style={{ background: "#e8f4ff", color: "#1a5276", border: "1px solid #bee3f8", marginBottom: 16 }}>💳 You'll be redirected to Paynow</div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Enter your email to receive the Paynow payment link:</p>
              <div className="form-group"><input placeholder="your@email.com" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <button className="btn btn-accent btn-full" onClick={() => alert("In production: redirects to Paynow checkout for $" + plan.price)}>Open Paynow →</button>
              <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setStep("choose")}>← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BUSINESS DASHBOARD (container)
// ─────────────────────────────────────────────
function BusinessDashboard({ navigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: bizData } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user?.id)
        .single();
      if (bizData) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", bizData.id);
        setProducts(data || []);
      }
    };
    if (user) fetchProducts();
  }, [user]);

  const tabs = {
    overview: <OverviewTab products={products} />,
    products: <ProductsTab products={products} setProducts={setProducts} />,
    movements: <MovementsTab products={products} setProducts={setProducts} />,
    profit: <ProfitTab products={products} />,
    alerts: <AlertsTab products={products} />,
    payments: <PaymentsTab />,
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate}>
      {tabs[activeTab]}
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────
function AdminPanel({ navigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [businesses, setBusinesses] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: biz } = await supabase.from("businesses").select("*");
      const { data: pay } = await supabase.from("payments").select("*, businesses(name, owner_name, phone)");
      if (biz) setBusinesses(biz);
      if (pay) setPayments(pay);
    };
    fetchData();
  }, []);

  const stats = {
    total: businesses.length,
    active: businesses.filter(b => b.subscription_status === "active").length,
    pending: businesses.filter(b => b.subscription_status === "pending").length,
    mrr: businesses.filter(b => b.subscription_status === "active" && b.subscription_plan === "monthly").length * 30
      + businesses.filter(b => b.subscription_status === "active" && b.subscription_plan === "quarterly").length * (81 / 3)
      + businesses.filter(b => b.subscription_status === "active" && b.subscription_plan === "annual").length * (288 / 12),
  };

  const toggleBusiness = async (id) => {
    const biz = businesses.find(b => b.id === id);
    const newStatus = biz.subscription_status === "active" ? "suspended" : "active";
    await supabase.from("businesses").update({ subscription_status: newStatus }).eq("id", id);
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, subscription_status: newStatus } : b));
  };

  const verifyPayment = async (payId, bizId) => {
    await supabase.from("payments").update({ payment_status: "verified" }).eq("id", payId);
    await supabase.from("businesses").update({ subscription_status: "active" }).eq("id", bizId);
    setPayments(prev => prev.map(p => p.id === payId ? { ...p, payment_status: "verified" } : p));
    setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, subscription_status: "active" } : b));
  };

  const tabs = [
    { id: "overview", icon: "⊞", label: "Overview" },
    { id: "businesses", icon: "🏢", label: "Businesses" },
    { id: "payments", icon: "💳", label: "Payments" },
  ];

  const statusTag = (s) => {
    const map = { active: "tag-active", pending: "tag-pending", expired: "tag-expired", suspended: "tag-suspended" };
    return <span className={`tag ${map[s] || "tag-pending"}`}>{s}</span>;
  };

  return (
    <div style={{ display: "flex" }}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Stock<span>Guard</span></h1>
          <p style={{ color: "var(--accent)", fontSize: 11 }}>⚡ Admin Panel</p>
        </div>
        <nav>
          {tabs.map(t => (
            <div key={t.id} className={`nav-item ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              <span className="nav-icon">{t.icon}</span><span>{t.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
            <div className="nav-item" onClick={() => { logout(); navigate("#login"); }}>
              <span className="nav-icon">⏻</span><span>Sign Out</span>
            </div>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === "overview" && (
          <div>
            <div className="page-header fade-up">
              <h2>Admin Overview</h2>
              <p>Platform snapshot — {new Date().toLocaleDateString("en-ZW", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="stats-grid fade-up-2">
              {[
                { label: "Total Businesses", value: stats.total, color: "var(--ink)" },
                { label: "Active Subscribers", value: stats.active, color: "var(--accent)" },
                { label: "Pending Activation", value: stats.pending, color: "var(--warn)" },
                { label: "Est. MRR", value: `$${stats.mrr.toFixed(0)}`, color: "var(--accent2)" },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="label">{s.label}</div>
                  <div className="value" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {payments.filter(p => p.payment_status === "pending").length > 0 && (
              <div className="card fade-up-3" style={{ border: "1.5px solid #fff3cd" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16, color: "var(--warn)" }}>⏳ Pending Payment Verifications</h3>
                {payments.filter(p => p.payment_status === "pending").map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{p.businesses?.name}</p>
                      <p style={{ color: "var(--muted)", fontSize: 12 }}>{p.businesses?.owner_name} · {p.payment_method} · ${p.amount} · {p.plan}</p>
                    </div>
                    <button className="btn btn-accent btn-sm" onClick={() => verifyPayment(p.id, p.business_id)}>✓ Verify & Activate</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "businesses" && (
          <div>
            <div className="page-header fade-up"><h2>Businesses</h2><p>Manage all subscribed businesses</p></div>
            <div className="card fade-up-2">
              <table>
                <thead><tr><th>Business</th><th>Owner</th><th>Plan</th><th>Status</th><th>Expires</th><th>Actions</th></tr></thead>
                <tbody>
                  {businesses.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.name}</strong><br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{b.email}</span></td>
                      <td>{b.owner_name}<br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{b.phone}</span></td>
                      <td style={{ textTransform: "capitalize" }}>{b.subscription_plan}</td>
                      <td>{statusTag(b.subscription_status)}</td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>{b.subscription_expires_at || "—"}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${b.subscription_status === "active" ? "btn-danger" : "btn-accent"}`}
                          onClick={() => toggleBusiness(b.id)}>
                          {b.subscription_status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div>
            <div className="page-header fade-up"><h2>Payments</h2><p>Review and verify incoming payments</p></div>
            <div className="card fade-up-2">
              {payments.length === 0 ? (
                <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px 0" }}>No payments yet.</p>
              ) : (
                <table>
                  <thead><tr><th>Business</th><th>Amount</th><th>Method</th><th>Plan</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.businesses?.name}</strong><br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{p.businesses?.owner_name}</span></td>
                        <td><strong>${p.amount}</strong></td>
                        <td style={{ textTransform: "capitalize" }}>{p.payment_method}</td>
                        <td style={{ textTransform: "capitalize" }}>{p.plan}</td>
                        <td><span className={`tag ${p.payment_status === "verified" ? "tag-active" : "tag-pending"}`}>{p.payment_status}</span></td>
                        <td style={{ fontSize: 12, color: "var(--muted)" }}>{p.created_at}</td>
                        <td>
                          {p.payment_status === "pending"
                            ? <button className="btn btn-accent btn-sm" onClick={() => verifyPayment(p.id, p.business_id)}>✓ Verify</button>
                            : <span style={{ color: "var(--muted)", fontSize: 12 }}>Done</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
function App() {
  const { user, loading } = useAuth();
  const { route, navigate } = useRoute();

  useEffect(() => {
    if (!loading && !user && route !== "#register") navigate("#login");
  }, [user, loading, route]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 20, color: "var(--muted)" }}>
      Loading...
    </div>
  );

  const page = () => {
    if (route === "#register") return <RegisterPage navigate={navigate} />;
    if (!user) return <LoginPage navigate={navigate} />;
    if (user.email === "admin@stockguard.co.zw") return <AdminPanel navigate={navigate} />;
    return <BusinessDashboard navigate={navigate} />;
  };

  return (
    <>
      <GlobalStyle />
      {page()}
    </>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
