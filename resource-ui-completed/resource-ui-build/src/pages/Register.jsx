import { useEffect, useState } from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import { registerUser } from "../services/authService"; 
import { getInstitutions } from "../services/institutionService";
import { getDepartmentsByInstitution } from "../services/departmentService";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", password: "", phone: "", 
        role: "STUDENT", institutionId: "", departmentId: ""
    });
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getInstitutions().then(data => setInstitutions(data || [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (form.institutionId) {
            getDepartmentsByInstitution(form.institutionId)
                .then(data => setDepartments(data || []))
                .catch(() => setDepartments([]));
        } else if (departments.length > 0) {
            setTimeout(() => setDepartments([]), 0);
        }
    }, [form.institutionId, departments.length]);

    const change = e => setForm({...form, [e.target.name]: e.target.value});

    const submit = async e => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await registerUser(form);
            navigate('/login');
        } catch (err) {
            console.error(err);
            let msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to register";
            if (msg === "Network Error") msg = "Unable to connect to server. Please turn on Dev Mode below.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <section className="auth-visual register-visual">
                <div className="brand-mark">RU</div>
                <div>
                    <span className="eyebrow">JOIN RESOURCEHUB</span>
                    <h1>One workspace for every resource.</h1>
                    <p>Create your account and make institutional equipment easier to discover, book and manage.</p>
                    <div className="benefit-list">
                        <div><b>01</b><span><strong>Discover</strong><small>Find available equipment quickly.</small></span></div>
                        <div><b>02</b><span><strong>Book</strong><small>Plan research time without conflicts.</small></span></div>
                        <div><b>03</b><span><strong>Track</strong><small>Stay informed about asset status.</small></span></div>
                    </div>
                </div>
                <small>Secure access • Role-based permissions</small>
            </section>
            <section className="auth-panel">
                <form className="pro-auth-card register-card" onSubmit={submit}>
                    <span className="eyebrow dark">GET STARTED</span>
                    <h2>Create your account</h2>
                    <p className="subtext">Use your institutional details to set up your profile.</p>
                    {error && <div className="pro-alert">⚠ {error}</div>}
                    <div className="form-grid">
                        <div><label>First name</label><input name="firstName" value={form.firstName} onChange={change} placeholder="First name" required/></div>
                        <div><label>Last name</label><input name="lastName" value={form.lastName} onChange={change} placeholder="Last name" required/></div>
                        <div className="full"><label>Email address</label><input type="email" name="email" value={form.email} onChange={change} placeholder="name@institution.edu" required/></div>
                        <div><label>Phone</label><input name="phone" value={form.phone} onChange={change} placeholder="10-digit mobile number" required/></div>
                        <div><label>Role</label><select className="glass-select" name="role" value={form.role} onChange={change} style={{background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)'}}>
                            <option style={{color: 'black'}} value="STUDENT">Student</option>
                            <option style={{color: 'black'}} value="FACULTY">Faculty</option>
                            <option style={{color: 'black'}} value="INSTITUTION_ADMIN">Admin</option>
                        </select></div>
                        <div className="full"><label>Password</label><input type="password" name="password" value={form.password} onChange={change} placeholder="Minimum 8 characters" minLength="8" required/></div>
                        <div><label>Institution</label><select className="glass-select" name="institutionId" value={form.institutionId} onChange={change} required style={{background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)'}}>
                            <option style={{color: 'black'}} value="">Select institution</option>
                            {institutions.map(x=><option style={{color: 'black'}} key={x.id} value={x.id}>{x.name}</option>)}
                        </select></div>
                        <div><label>Department</label><select className="glass-select" name="departmentId" value={form.departmentId} onChange={change} required style={{background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)'}}>
                            <option style={{color: 'black'}} value="">Select department</option>
                            {departments.map(x=><option style={{color: 'black'}} key={x.id} value={x.id}>{x.name}</option>)}
                        </select></div>
                    </div>
                    <button className="primary-action" disabled={loading}>{loading ? "Creating account…" : "Create account →"}</button>
                    <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button 
                            type="button" 
                            className="glass-btn" 
                            style={{ fontSize: '11px', padding: '4px 12px', background: localStorage.getItem("devMode") === "true" ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => {
                                const current = localStorage.getItem("devMode") === "true";
                                localStorage.setItem("devMode", !current);
                                window.location.reload();
                            }}
                        >
                            {localStorage.getItem("devMode") === "true" ? "🟢 Dev Mode: ON" : "⚪ Dev Mode: OFF"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
