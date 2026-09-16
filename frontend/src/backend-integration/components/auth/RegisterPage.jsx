import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Microscope,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Check,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Logo } from "../common/Logo";
import { SectionLabel } from "../common/SectionLabel";
import { Field } from "../common/Field";
import { authApi } from "../../../api/authApi";

const STEPS = [
  { step: 1, title: "Personal Details", short: "Personal" },
  { step: 2, title: "Email Verification", short: "Email OTP" },
  { step: 3, title: "Select Institution", short: "Institution" },
  { step: 4, title: "Select Department", short: "Department" },
  { step: 5, title: "Academic Details", short: "Academic" },
  { step: 6, title: "Review & Submit", short: "Review" },
];

export function RegisterPage({ goTo, toast, initialRole }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Personal Details & Role Selection
    role: initialRole?.id === "researcher" ? "RESEARCHER" : "STUDENT", // STUDENT or RESEARCHER
    firstName: "",
    lastName: "",
    phone: "",
    // Step 2: Email & OTP
    email: "",
    // Step 3: Institution
    institutionId: "",
    institutionName: "",
    institutionCode: "",
    // Step 4: Department
    departmentId: "",
    departmentName: "",
    departmentCode: "",
    // Step 5: Academic Identifiers
    rollNumber: "",
    researcherId: "",
    // Step 6: Declaration
    authorized: false,
  });

  const [errors, setErrors] = useState({});

  // Dynamic Backend Data State
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Email OTP State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Load Active Institutions on mount
  useEffect(() => {
    async function fetchInstitutions() {
      setLoadingInstitutions(true);
      try {
        const data = await authApi.listActiveInstitutions();
        setInstitutions(data || []);
      } catch (err) {
        toast?.(err?.message || "Failed to load active institutions.", "error");
        setInstitutions([]);
      } finally {
        setLoadingInstitutions(false);
      }
    }
    fetchInstitutions();
  }, []);

  // Load Departments when selected institution changes
  useEffect(() => {
    if (!form.institutionId) {
      setDepartments([]);
      return;
    }

    async function fetchDepartments() {
      setLoadingDepartments(true);
      try {
        const data = await authApi.listDepartments(form.institutionId);
        setDepartments(data || []);
      } catch (err) {
        toast?.(err?.message || "Failed to load departments.", "error");
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    }
    fetchDepartments();
  }, [form.institutionId]);

  // Handle role switch between Student and Researcher
  const handleRoleChange = (newRole) => {
    setForm((f) => ({
      ...f,
      role: newRole,
      // Clear opposing field
      rollNumber: newRole === "STUDENT" ? f.rollNumber : "",
      researcherId: newRole === "RESEARCHER" ? f.researcherId : "",
    }));
    // Clear errors on academic fields
    setErrors((prev) => ({ ...prev, rollNumber: undefined, researcherId: undefined }));
  };

  // Handle general form input change
  const handleChange = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Reset OTP verification if email changes
    if (field === "email" && otpVerified) {
      setOtpVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

  // Handle institution selection
  const handleInstitutionChange = (e) => {
    const instId = e.target.value;
    const selectedInst = institutions.find((inst) => String(inst.institutionId) === String(instId));

    setForm((f) => ({
      ...f,
      institutionId: instId,
      institutionName: selectedInst ? selectedInst.name : "",
      institutionCode: selectedInst ? selectedInst.code : "",
      // Strict requirement: changing institution clears department selection
      departmentId: "",
      departmentName: "",
      departmentCode: "",
    }));

    setErrors((prev) => ({ ...prev, institutionId: undefined, departmentId: undefined }));
  };

  // Handle department selection
  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    const selectedDept = departments.find((dept) => String(dept.departmentId) === String(deptId));

    setForm((f) => ({
      ...f,
      departmentId: deptId,
      departmentName: selectedDept ? selectedDept.name : "",
      departmentCode: selectedDept ? selectedDept.code : "",
    }));

    setErrors((prev) => ({ ...prev, departmentId: undefined }));
  };

  const inputClass = (err) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      err ? "border-red-400 bg-red-50/20" : "border-slate-200 bg-white"
    }`;

  // -------------------------------------------------------------
  // Step 1 Validation & Proceed to Step 2
  // -------------------------------------------------------------
  const validateStep1 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (!validateStep1()) {
      toast?.("Please fill in all personal details.", "error");
      return;
    }
    setCurrentStep(2);
  };

  // -------------------------------------------------------------
  // Step 2: Send & Verify Institutional Email OTP
  // -------------------------------------------------------------
  const handleSendOtp = async () => {
    const email = form.email.trim();
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Institutional email is required." }));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid institutional email address." }));
      return;
    }

    setOtpSending(true);
    try {
      await authApi.sendOtp(email, "REGISTRATION");
      setOtpSent(true);
      setResendTimer(60);
      toast?.(`Verification code sent to ${email}`, "success");
    } catch (err) {
      toast?.(err?.message || "Failed to send verification code.", "error");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = form.email.trim();
    const code = otp.trim();
    if (!code || code.length < 6) {
      toast?.("Please enter the complete 6-digit verification code.", "error");
      return;
    }

    setOtpVerifying(true);
    try {
      await authApi.verifyOtp(email, "REGISTRATION", code);
      setOtpVerified(true);
      toast?.("Institutional email verified successfully!", "success");
      // Auto-advance to Step 3 (Institution selection)
      setCurrentStep(3);
    } catch (err) {
      toast?.(err?.message || "Invalid or expired verification code.", "error");
    } finally {
      setOtpVerifying(false);
    }
  };

  // -------------------------------------------------------------
  // Step 3 Validation & Proceed to Step 4
  // -------------------------------------------------------------
  const validateStep3 = () => {
    const errs = {};
    if (!form.institutionId) errs.institutionId = "Please select your institution.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep3 = () => {
    if (!validateStep3()) {
      toast?.("Please select an institution.", "error");
      return;
    }
    setCurrentStep(4);
  };

  // -------------------------------------------------------------
  // Step 4 Validation & Proceed to Step 5
  // -------------------------------------------------------------
  const validateStep4 = () => {
    const errs = {};
    if (!form.departmentId) errs.departmentId = "Please select your department.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep4 = () => {
    if (!validateStep4()) {
      toast?.("Please select a department.", "error");
      return;
    }
    setCurrentStep(5);
  };

  // -------------------------------------------------------------
  // Step 5 Validation & Proceed to Step 6
  // -------------------------------------------------------------
  const validateStep5 = () => {
    const errs = {};
    if (form.role === "STUDENT") {
      if (!form.rollNumber.trim()) {
        errs.rollNumber = "Student Roll Number is required.";
      }
    } else {
      if (!form.researcherId.trim()) {
        errs.researcherId = "Researcher / Scholar ID is required.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep5 = () => {
    if (!validateStep5()) {
      toast?.("Please fill in your academic identifier.", "error");
      return;
    }
    setCurrentStep(6);
  };

  // -------------------------------------------------------------
  // Step 6: Final Submission
  // -------------------------------------------------------------
  const handleSubmit = async () => {
    if (!form.authorized) {
      setErrors((prev) => ({
        ...prev,
        authorized: "You must accept the academic declaration.",
      }));
      toast?.("Please check the declaration box.", "error");
      return;
    }

    if (!otpVerified) {
      toast?.("Institutional email must be verified via OTP.", "error");
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role, // "STUDENT" or "RESEARCHER"
      institutionId: Number(form.institutionId),
      departmentId: Number(form.departmentId),
      rollNumber: form.role === "STUDENT" ? form.rollNumber.trim() : null,
      researcherId: form.role === "RESEARCHER" ? form.researcherId.trim() : null,
      // No password sent
    };

    try {
      const result = await authApi.register(payload);
      setSubmittedData(result);
      setIsSubmitted(true);
      toast?.("Registration application submitted successfully!", "success");
    } catch (err) {
      const msg = err?.message || "Failed to submit registration. Please verify your details and try again.";
      setSubmitError(msg);
      toast?.(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Render: Submitted / Pending Screen
  // -------------------------------------------------------------
  if (isSubmitted) {
    const isStudent = form.role === "STUDENT";
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
            <Logo onClick={() => goTo?.("landing")} />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="text-2xl font-black text-slate-900">Registration Submitted</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Your {isStudent ? "Student" : "Researcher"} registration request has been submitted successfully and is awaiting Institution Administrator approval.
            </p>

            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-bold text-amber-700">
              <Clock size={14} className="animate-spin-slow" />
              STATUS: PENDING APPROVAL
            </div>

            {/* Real Application Details Card */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5 text-left space-y-2.5 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">User Reference</span>
                <span className="font-mono font-bold text-slate-900">#{submittedData?.userId || "—"}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Applicant Name</span>
                <span className="font-semibold text-slate-900">{form.firstName} {form.lastName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Applicant Role</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded text-xs">
                  {isStudent ? "STUDENT" : "RESEARCHER"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Institutional Email</span>
                <span className="font-medium text-slate-800">{form.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Institution</span>
                <span className="font-semibold text-slate-900">
                  {form.institutionName}{form.institutionCode && <span className="text-xs text-slate-400 font-mono ml-1">({form.institutionCode})</span>}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-semibold text-slate-900">
                  {form.departmentName}{form.departmentCode && <span className="text-xs text-slate-400 font-mono ml-1">({form.departmentCode})</span>}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  {isStudent ? "Roll Number" : "Researcher / Scholar ID"}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {isStudent ? form.rollNumber : form.researcherId}
                </span>
              </div>
            </div>

            {/* Guidance Card */}
            <div className="mt-6 text-xs text-slate-500 leading-relaxed bg-blue-50/60 border border-blue-100 rounded-lg p-4 text-left">
              <span className="font-bold text-blue-900 block mb-1">What happens next?</span>
              1. Your Institution Administrator reviews and approves your academic credentials.<br />
              2. Upon approval, an account setup email with a secure link will be dispatched to <strong>{form.email}</strong>.<br />
              3. You will click the setup link to configure your password and access equipment and lab resources.
            </div>

            <button
              onClick={() => goTo?.("login")}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Back to Sign In
            </button>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-400">
          Lab Resource Utilization Platform • Centralized Research Infrastructure
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: 6-Step Registration Wizard
  // -------------------------------------------------------------
  const isStudent = form.role === "STUDENT";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo onClick={() => goTo?.("landing")} />
          <button
            type="button"
            onClick={() => goTo?.("roles")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={15} /> Change Role
          </button>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3 shadow-inner">
              {isStudent ? <GraduationCap size={24} /> : <Microscope size={24} />}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isStudent ? "Student Registration" : "Researcher Registration"}
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-lg mx-auto">
              Register for laboratory resource access, equipment reservations, and research infrastructure.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="mb-8">
            <div className="grid grid-cols-6 gap-1 sm:gap-2 relative">
              {STEPS.map((s) => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;
                return (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 mb-1.5 ${
                        isPassed
                          ? "bg-emerald-600 text-white shadow-sm"
                          : isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? <Check size={14} strokeWidth={3} /> : s.step}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] leading-tight font-medium hidden sm:block ${
                        isActive ? "text-blue-600 font-bold" : isPassed ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {s.short}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Stepper Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* =========================================================
              STEP 1: Personal Details & Registration Type
             ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>1. Personal Details & Registration Type</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Select your academic role and enter your primary identification details.
                </p>
              </div>

              {/* Registration Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Registration Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("STUDENT")}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all font-bold text-sm ${
                      isStudent
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <GraduationCap size={18} />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("RESEARCHER")}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all font-bold text-sm ${
                      !isStudent
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Microscope size={18} />
                    <span>Researcher</span>
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" required error={errors.firstName}>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="e.g. Arun"
                    className={inputClass(errors.firstName)}
                  />
                </Field>

                <Field label="Last Name" required error={errors.lastName}>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="e.g. Prasad"
                    className={inputClass(errors.lastName)}
                  />
                </Field>
              </div>

              <Field label="Contact Phone Number" required error={errors.phone}>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+91 98765 43210"
                  className={inputClass(errors.phone)}
                />
              </Field>

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => goTo?.("roles")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Email Verification <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 2: Email OTP Verification
             ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>2. Institutional Email Verification</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Authenticate your institutional email address with a 6-digit OTP code.
                </p>
              </div>

              <div className="space-y-4">
                <Field label="Institutional Email Address" required error={errors.email}>
                  <div className="flex gap-2">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      disabled={otpVerified}
                      onChange={handleChange("email")}
                      placeholder="e.g. arun.prasad@kce.ac.in"
                      className={`${inputClass(errors.email)} flex-1`}
                    />
                    <button
                      type="button"
                      disabled={otpSending || resendTimer > 0 || otpVerified || !form.email.trim()}
                      onClick={handleSendOtp}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {otpSending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Mail size={14} />
                      )}
                      {otpSent ? (resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend OTP") : "Send OTP"}
                    </button>
                  </div>
                </Field>

                {otpSent && !otpVerified && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                    <div className="text-xs text-slate-600 font-medium">
                      Enter the 6-digit verification code dispatched to <span className="font-mono font-bold text-blue-700">{form.email}</span>:
                    </div>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-44 text-center text-xl tracking-[0.4em] font-mono font-bold rounded-lg border border-slate-300 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <button
                        type="button"
                        disabled={otpVerifying || otp.length < 6}
                        onClick={handleVerifyOtp}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        {otpVerifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}

                {otpVerified && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    Institutional email address verified successfully!
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Personal Details
                </button>
                <button
                  type="button"
                  disabled={!otpVerified}
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Select Institution <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 3: Select Institution
             ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>3. Select Approved Institution</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Select your enrolled or affiliated educational/research institution.
                </p>
              </div>

              {loadingInstitutions ? (
                <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                  <span className="text-xs">Loading approved institutions...</span>
                </div>
              ) : institutions.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  No approved institutions are currently available. Please contact your administrator.
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Institution" required error={errors.institutionId}>
                    <select
                      name="institutionId"
                      value={form.institutionId}
                      onChange={handleInstitutionChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choose your Institution --</option>
                      {institutions.map((inst) => (
                        <option key={inst.institutionId} value={inst.institutionId}>
                          {inst.name}{inst.code ? ` (${inst.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Read-Only Selected Institution Display */}
                  {form.institutionId && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Selected Institution:</span>
                        <span className="font-semibold text-slate-900">{form.institutionName}</span>
                      </div>
                      {form.institutionCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Institution Code (Read-Only):</span>
                          <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                            {form.institutionCode}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Email OTP
                </button>
                <button
                  type="button"
                  disabled={!form.institutionId}
                  onClick={handleNextFromStep3}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Select Department <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 4: Select Department
             ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>4. Select Department</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Select your academic or research department in <span className="font-semibold text-slate-700">{form.institutionName}</span>.
                </p>
              </div>

              {loadingDepartments ? (
                <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                  <span className="text-xs">Loading departments for {form.institutionName}...</span>
                </div>
              ) : departments.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  No active departments found for this institution.
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Department" required error={errors.departmentId}>
                    <select
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handleDepartmentChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choose your Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.departmentId} value={dept.departmentId}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Read-Only Selected Department Display */}
                  {form.departmentId && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Selected Department:</span>
                        <span className="font-semibold text-slate-900">{form.departmentName}</span>
                      </div>
                      {form.departmentCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Department Code (Read-Only):</span>
                          <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                            {form.departmentCode}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Institution
                </button>
                <button
                  type="button"
                  disabled={!form.departmentId}
                  onClick={handleNextFromStep4}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Academic Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 5: Academic Details (Role Dependent)
             ========================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>
                  5. Academic Details ({isStudent ? "Student Identification" : "Researcher Identification"})
                </SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  {isStudent
                    ? "Provide your official student roll number / registration number."
                    : "Provide your institutional researcher ID, scholar ID, or grant registration code."}
                </p>
              </div>

              {/* Role Indicator Badge */}
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                {isStudent ? <GraduationCap size={16} /> : <Microscope size={16} />}
                APPLYING AS: {isStudent ? "STUDENT" : "RESEARCHER"}
              </div>

              {isStudent ? (
                <Field label="Student Roll Number" required error={errors.rollNumber}>
                  <input
                    name="rollNumber"
                    value={form.rollNumber}
                    onChange={handleChange("rollNumber")}
                    placeholder="e.g. 21CS101 or 2024-UG-042"
                    className={inputClass(errors.rollNumber)}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the official roll number printed on your student identity card.
                  </p>
                </Field>
              ) : (
                <Field label="Researcher / Scholar ID" required error={errors.researcherId}>
                  <input
                    name="researcherId"
                    value={form.researcherId}
                    onChange={handleChange("researcherId")}
                    placeholder="e.g. RES-PHD-2024-09 or SCH-8821"
                    className={inputClass(errors.researcherId)}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter your official scholar ID, faculty/fellowship code, or research grant identifier.
                  </p>
                </Field>
              )}

              {/* Password notice banner */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="font-bold">Password Setup After Approval:</span> You do not need to enter a password right now. After your Institution Administrator reviews and approves your registration, a single-use setup link will be emailed to your institutional email to create your password.
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Department
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep5}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Review & Submit <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 6: Summary Review & Declaration
             ========================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>6. Review & Submit Application</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Please review all verified information before submitting your application.
                </p>
              </div>

              {/* Summary Card 1: Personal */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {isStudent ? <GraduationCap size={16} className="text-blue-600" /> : <Microscope size={16} className="text-blue-600" />}
                    Applicant Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-slate-500 block">Full Name</span>
                    <span className="font-semibold text-slate-800">{form.firstName} {form.lastName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Application Type</span>
                    <span className="font-bold text-blue-700">{isStudent ? "Student" : "Researcher"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Institutional Email</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      {form.email} <CheckCircle2 size={13} className="text-emerald-600" />
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone</span>
                    <span className="font-medium text-slate-800">{form.phone}</span>
                  </div>
                </div>
              </div>

              {/* Summary Card 2: Institution & Department */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building size={16} className="text-blue-600" /> Institution & Department
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-slate-500 block">Institution</span>
                    <span className="font-semibold text-slate-800">{form.institutionName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Institution Code</span>
                    <span className="font-mono font-bold text-blue-700">{form.institutionCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department</span>
                    <span className="font-semibold text-slate-800">{form.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department Code</span>
                    <span className="font-mono font-bold text-blue-700">{form.departmentCode}</span>
                  </div>
                </div>
              </div>

              {/* Summary Card 3: Academic */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen size={16} className="text-blue-600" /> Academic Identifier
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{isStudent ? "Roll Number:" : "Researcher / Scholar ID:"}</span>
                  <span className="font-mono font-bold text-slate-900">{isStudent ? form.rollNumber : form.researcherId}</span>
                </div>
              </div>

              {/* Error banner if submit failed */}
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <span className="font-bold block mb-0.5">Submission Error</span>
                    {submitError}
                  </div>
                </div>
              )}

              {/* Declaration Checkbox */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.authorized}
                    onChange={handleChange("authorized")}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I hereby certify and declare that all academic credentials and identification details submitted above are authentic and accurate as per my institution's records.
                  </span>
                </label>
                {errors.authorized && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.authorized}</p>}
              </div>

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Academic Details
                </button>
                <button
                  type="button"
                  disabled={submitting || !form.authorized}
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting Registration...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Submit Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Link */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an active account?{" "}
            <button
              type="button"
              onClick={() => goTo?.("login")}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign In to Platform
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400">
        Lab Resource Utilization Platform • Centralized Research Infrastructure
      </footer>
    </div>
  );
}
