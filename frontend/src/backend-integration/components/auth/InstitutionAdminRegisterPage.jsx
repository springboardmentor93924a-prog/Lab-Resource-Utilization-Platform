import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Check,
  Loader2,
} from "lucide-react";
import { Logo } from "../common/Logo";
import { SectionLabel } from "../common/SectionLabel";
import { Field } from "../common/Field";
import { authApi } from "../../../api/authApi";

const INSTITUTION_TYPES = [
  "University",
  "Autonomous Engineering College",
  "Affiliated College",
  "National Research Institute",
  "Government Polytechnic College",
  "Private Institute of Technology",
  "Corporate R&D Center",
  "Other",
];

const STEPS = [
  { step: 1, title: "Institution Details", short: "Details" },
  { step: 2, title: "Institution Email OTP", short: "Inst. Email" },
  { step: 3, title: "Administrator Details", short: "Admin Info" },
  { step: 4, title: "Administrator Email OTP", short: "Admin Email" },
  { step: 5, title: "Review & Submit", short: "Review" },
];

export function InstitutionAdminRegisterPage({ goTo, toast }) {
  const fileInputRef = useRef(null);

  // Current wizard step (1 to 5) or 'submitted'
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Institution Details
    name: "",
    code: "",
    institutionType: "Autonomous Engineering College",
    officialEmail: "",
    officialPhone: "",
    website: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    country: "India",
    pincode: "",
    logoUrl: "",
    // Step 3: Administrator Details (NO password fields)
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    // Step 5: Declaration
    authorized: false,
  });

  const [errors, setErrors] = useState({});
  const [logoName, setLogoName] = useState("");

  // Step 1: Code availability state
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeStatus, setCodeStatus] = useState(null); // null | { available: boolean, message: string }

  // Step 2: Institution Email OTP State
  const [instOtp, setInstOtp] = useState("");
  const [instOtpSent, setInstOtpSent] = useState(false);
  const [instOtpSending, setInstOtpSending] = useState(false);
  const [instOtpVerifying, setInstOtpVerifying] = useState(false);
  const [instOtpVerified, setInstOtpVerified] = useState(false);
  const [instResendTimer, setInstResendTimer] = useState(0);

  // Step 4: Admin Email OTP State
  const [adminOtp, setAdminOtp] = useState("");
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [adminOtpSending, setAdminOtpSending] = useState(false);
  const [adminOtpVerifying, setAdminOtpVerifying] = useState(false);
  const [adminOtpVerified, setAdminOtpVerified] = useState(false);
  const [adminResendTimer, setAdminResendTimer] = useState(0);

  // Submission loading & error state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Countdown timers for OTP resend
  useEffect(() => {
    let timer;
    if (instResendTimer > 0) {
      timer = setTimeout(() => setInstResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [instResendTimer]);

  useEffect(() => {
    let timer;
    if (adminResendTimer > 0) {
      timer = setTimeout(() => setAdminResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [adminResendTimer]);

  // Debounced live institution code check
  useEffect(() => {
    const rawCode = form.code.trim().toUpperCase();
    if (!rawCode || rawCode.length < 2) {
      setCodeStatus(null);
      setCodeChecking(false);
      return;
    }

    setCodeChecking(true);
    const handler = setTimeout(async () => {
      try {
        const res = await authApi.checkInstitutionCode(rawCode);
        if (res && res.available) {
          setCodeStatus({ available: true, message: `Code "${rawCode}" is available` });
        } else {
          setCodeStatus({ available: false, message: `Code "${rawCode}" is already registered` });
        }
      } catch (err) {
        setCodeStatus(null);
      } finally {
        setCodeChecking(false);
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [form.code]);

  // Handle generic form input changes
  const handleChange = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));

    // Clear error for that field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Reset OTP verification if email changed
    if (field === "officialEmail" && instOtpVerified) {
      setInstOtpVerified(false);
      setInstOtpSent(false);
      setInstOtp("");
    }
    if (field === "adminEmail" && adminOtpVerified) {
      setAdminOtpVerified(false);
      setAdminOtpSent(false);
      setAdminOtp("");
    }
  };

  const inputClass = (err) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      err ? "border-red-400 bg-red-50/20" : "border-slate-200 bg-white"
    }`;

  const handleLogoClick = () => fileInputRef.current?.click();
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoName(file.name);
      setForm((f) => ({ ...f, logoUrl: `/assets/logos/${file.name}` }));
      toast?.(`Logo "${file.name}" selected.`, "success");
    }
  };

  // -------------------------------------------------------------
  // Step 1 Validation & Proceed to Step 2
  // -------------------------------------------------------------
  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Institution name is required.";
    if (!form.code.trim()) {
      errs.code = "Institution code is required.";
    } else if (form.code.trim().length < 2) {
      errs.code = "Code must be at least 2 characters.";
    } else if (codeStatus && !codeStatus.available) {
      errs.code = "This institution code is already in use.";
    }

    if (!form.officialEmail.trim()) {
      errs.officialEmail = "Official institution email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.officialEmail.trim())) {
      errs.officialEmail = "Enter a valid official email address.";
    }

    if (!form.address.trim()) errs.address = "Address is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (!form.state.trim()) errs.state = "State is required.";
    if (!form.country.trim()) errs.country = "Country is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep1 = async () => {
    if (!validateStep1()) {
      toast?.("Please correct the highlighted errors before continuing.", "error");
      return;
    }

    // Auto-send OTP to official email if not sent or verified yet
    if (!instOtpVerified && !instOtpSent) {
      await handleSendInstOtp();
    }

    setCurrentStep(2);
  };

  // -------------------------------------------------------------
  // Step 2: Send & Verify Official Email OTP
  // -------------------------------------------------------------
  const handleSendInstOtp = async () => {
    const email = form.officialEmail.trim();
    if (!email) return;

    setInstOtpSending(true);
    try {
      await authApi.sendOtp(email, "EMAIL_VERIFICATION");
      setInstOtpSent(true);
      setInstResendTimer(60);
      toast?.(`Verification code sent to ${email}`, "success");
    } catch (err) {
      toast?.(err?.message || "Failed to send verification code.", "error");
    } finally {
      setInstOtpSending(false);
    }
  };

  const handleVerifyInstOtp = async () => {
    const email = form.officialEmail.trim();
    const otp = instOtp.trim();
    if (!otp || otp.length < 6) {
      toast?.("Please enter the complete 6-digit verification code.", "error");
      return;
    }

    setInstOtpVerifying(true);
    try {
      await authApi.verifyOtp(email, "EMAIL_VERIFICATION", otp);
      setInstOtpVerified(true);
      toast?.("Official institution email verified successfully!", "success");
      // Advance to Step 3
      setCurrentStep(3);
    } catch (err) {
      toast?.(err?.message || "Invalid or expired verification code.", "error");
    } finally {
      setInstOtpVerifying(false);
    }
  };

  // -------------------------------------------------------------
  // Step 3 Validation & Proceed to Step 4
  // -------------------------------------------------------------
  const validateStep3 = () => {
    const errs = {};
    if (!form.adminFirstName.trim()) errs.adminFirstName = "Administrator first name is required.";
    if (!form.adminEmail.trim()) {
      errs.adminEmail = "Administrator work email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.adminEmail.trim())) {
      errs.adminEmail = "Enter a valid work email address.";
    } else if (form.adminEmail.trim().toLowerCase() === form.officialEmail.trim().toLowerCase()) {
      errs.adminEmail = "Work email must be different from official contact email.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep3 = async () => {
    if (!validateStep3()) {
      toast?.("Please fill in administrator details correctly.", "error");
      return;
    }

    // Auto-send OTP to admin email if not sent or verified yet
    if (!adminOtpVerified && !adminOtpSent) {
      await handleSendAdminOtp();
    }

    setCurrentStep(4);
  };

  // -------------------------------------------------------------
  // Step 4: Send & Verify Administrator Email OTP
  // -------------------------------------------------------------
  const handleSendAdminOtp = async () => {
    const email = form.adminEmail.trim();
    if (!email) return;

    setAdminOtpSending(true);
    try {
      await authApi.sendOtp(email, "REGISTRATION");
      setAdminOtpSent(true);
      setAdminResendTimer(60);
      toast?.(`Verification code sent to ${email}`, "success");
    } catch (err) {
      toast?.(err?.message || "Failed to send verification code.", "error");
    } finally {
      setAdminOtpSending(false);
    }
  };

  const handleVerifyAdminOtp = async () => {
    const email = form.adminEmail.trim();
    const otp = adminOtp.trim();
    if (!otp || otp.length < 6) {
      toast?.("Please enter the complete 6-digit verification code.", "error");
      return;
    }

    setAdminOtpVerifying(true);
    try {
      await authApi.verifyOtp(email, "REGISTRATION", otp);
      setAdminOtpVerified(true);
      toast?.("Administrator email verified successfully!", "success");
      // Advance to Step 5
      setCurrentStep(5);
    } catch (err) {
      toast?.(err?.message || "Invalid or expired verification code.", "error");
    } finally {
      setAdminOtpVerifying(false);
    }
  };

  // -------------------------------------------------------------
  // Step 5: Final Submission to Backend
  // -------------------------------------------------------------
  const handleSubmit = async () => {
    if (!form.authorized) {
      setErrors((prev) => ({
        ...prev,
        authorized: "You must confirm you are authorized to register this institution.",
      }));
      toast?.("Please accept the authorization declaration.", "error");
      return;
    }

    if (!instOtpVerified) {
      toast?.("Official institution email must be verified.", "error");
      setCurrentStep(2);
      return;
    }

    if (!adminOtpVerified) {
      toast?.("Administrator email must be verified.", "error");
      setCurrentStep(4);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      institutionType: form.institutionType,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim() || undefined,
      country: form.country.trim() || "India",
      officialEmail: form.officialEmail.trim(),
      officialPhone: form.officialPhone.trim() || undefined,
      website: form.website.trim() || undefined,
      description: `${form.institutionType} registered via official portal.`,
      logoUrl: form.logoUrl || undefined,
      adminEmail: form.adminEmail.trim(),
      adminFirstName: form.adminFirstName.trim(),
      adminLastName: form.adminLastName.trim() || undefined,
      adminPhone: form.adminPhone.trim() || undefined,
    };

    try {
      const result = await authApi.registerInstitution(payload);
      setSubmittedData(result);
      setIsSubmitted(true);
      toast?.("Institution registration application submitted successfully!", "success");
    } catch (err) {
      const msg = err?.message || "Failed to submit registration. Please check your details and try again.";
      setSubmitError(msg);
      toast?.(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Render: Submitted / Pending View
  // -------------------------------------------------------------
  if (isSubmitted) {
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

            <h1 className="text-2xl font-black text-slate-900">Application Submitted</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Your institution registration application has been submitted and is currently pending review by a System Administrator.
            </p>

            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-bold text-amber-700">
              <Clock size={14} className="animate-spin-slow" />
              STATUS: PENDING APPROVAL
            </div>

            {/* Real Application Details Card */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5 text-left space-y-2.5 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Institution ID</span>
                <span className="font-mono font-bold text-slate-900">#{submittedData?.institutionId || "—"}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Institution Name</span>
                <span className="font-semibold text-slate-900">{submittedData?.name || form.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Institution Code</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {submittedData?.code || form.code.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Administrator</span>
                <span className="font-semibold text-slate-900">
                  {form.adminFirstName} {form.adminLastName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Setup Link Destination</span>
                <span className="font-medium text-slate-800">{form.adminEmail}</span>
              </div>
            </div>

            {/* Next Steps Guidance */}
            <div className="mt-6 text-xs text-slate-500 leading-relaxed bg-blue-50/60 border border-blue-100 rounded-lg p-4 text-left">
              <span className="font-bold text-blue-900 block mb-1">What happens next?</span>
              1. A System Administrator reviews your institution accreditation and credentials.<br />
              2. Once approved, an account setup email will be dispatched to <strong>{form.adminEmail}</strong>.<br />
              3. You will click the secure link to set your password and gain immediate administrative access.
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
  // Render: 5-Step Registration Wizard
  // -------------------------------------------------------------
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

      {/* Main Container */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          {/* Header Title */}
          <div className="text-center mb-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3 shadow-inner">
              <Landmark size={24} />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register New Institution</h1>
            <p className="mt-1 text-sm text-slate-600 max-w-lg mx-auto">
              Follow the 5-step verification process to register your institution and designate the initial institution administrator.
            </p>
          </div>

          {/* 5-Step Progress Stepper */}
          <div className="mb-8">
            <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
              {STEPS.map((s) => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;
                return (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 mb-1.5 ${
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
                      className={`text-[11px] leading-tight font-medium hidden sm:block ${
                        isActive ? "text-blue-600 font-bold" : isPassed ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {s.short}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress Bar Line */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* =========================================================
              STEP 1: Institution Details
             ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>1. Institution Details</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Provide primary administrative details and accredited identifiers for your institution.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Institution Full Name" required error={errors.name}>
                  <input
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="e.g. Karpagam College of Engineering"
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field label="Institution Short Code" required error={errors.code}>
                  <div className="relative">
                    <input
                      value={form.code}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") }))
                      }
                      placeholder="e.g. KCE"
                      maxLength={20}
                      className={`${inputClass(errors.code)} uppercase font-mono tracking-wider pr-10`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                      {codeChecking && <Loader2 size={16} className="animate-spin text-slate-400" />}
                      {!codeChecking && codeStatus?.available && (
                        <span title="Code is available" className="text-emerald-600 flex items-center gap-1 font-semibold">
                          <Check size={16} />
                        </span>
                      )}
                      {!codeChecking && codeStatus && !codeStatus.available && (
                        <span title="Code is taken" className="text-red-500 flex items-center gap-1 font-semibold">
                          <AlertCircle size={16} />
                        </span>
                      )}
                    </div>
                  </div>
                  {codeStatus && (
                    <p className={`mt-1 text-xs ${codeStatus.available ? "text-emerald-600" : "text-red-500"}`}>
                      {codeStatus.message}
                    </p>
                  )}
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Institution Type" required>
                  <select
                    value={form.institutionType}
                    onChange={handleChange("institutionType")}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {INSTITUTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Official Institution Contact Email" required error={errors.officialEmail}>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.officialEmail}
                      onChange={handleChange("officialEmail")}
                      placeholder="contact@kce.ac.in"
                      className={inputClass(errors.officialEmail)}
                    />
                    {instOtpVerified && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck size={16} /> Verified
                      </span>
                    )}
                  </div>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Official Contact Phone" error={errors.officialPhone}>
                  <input
                    value={form.officialPhone}
                    onChange={handleChange("officialPhone")}
                    placeholder="+91 422 2619045"
                    className={inputClass(errors.officialPhone)}
                  />
                </Field>

                <Field label="Institution Website" error={errors.website}>
                  <input
                    value={form.website}
                    onChange={handleChange("website")}
                    placeholder="https://www.kce.ac.in"
                    className={inputClass(errors.website)}
                  />
                </Field>
              </div>

              <Field label="Campus Address" required error={errors.address}>
                <input
                  value={form.address}
                  onChange={handleChange("address")}
                  placeholder="Myleripalayam Village, Othakkalmandapam Post"
                  className={inputClass(errors.address)}
                />
              </Field>

              <div className="grid sm:grid-cols-4 gap-4">
                <Field label="City" required error={errors.city}>
                  <input value={form.city} onChange={handleChange("city")} placeholder="Coimbatore" className={inputClass(errors.city)} />
                </Field>
                <Field label="State" required error={errors.state}>
                  <input value={form.state} onChange={handleChange("state")} placeholder="Tamil Nadu" className={inputClass(errors.state)} />
                </Field>
                <Field label="Pincode" error={errors.pincode}>
                  <input value={form.pincode} onChange={handleChange("pincode")} placeholder="641032" className={inputClass(errors.pincode)} />
                </Field>
                <Field label="Country" required error={errors.country}>
                  <input value={form.country} onChange={handleChange("country")} placeholder="India" className={inputClass(errors.country)} />
                </Field>
              </div>

              <Field label="Institution Logo (Optional)">
                <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleLogoChange} className="hidden" />
                <button
                  type="button"
                  onClick={handleLogoClick}
                  className="w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 transition-colors py-4 flex flex-col items-center justify-center gap-1 text-slate-500"
                >
                  <span className="text-blue-600 font-semibold text-xs">⬆ Click to choose logo image</span>
                  <span className="text-[11px] text-slate-400">{logoName || "PNG / JPG / WEBP"}</span>
                </button>
              </Field>

              {/* Navigation Actions */}
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
                  Next: Verify Institution Email <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 2: Official Institution Email OTP Verification
             ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>2. Verify Official Institution Email</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  A 6-digit verification code has been dispatched to authenticate domain ownership of this institution.
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm flex items-start gap-3">
                <Mail className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-semibold text-slate-900">Official Contact Address</div>
                  <div className="font-mono text-blue-700 font-medium">{form.officialEmail}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the code received in your inbox. Check spam/junk folders if not received within 1 minute.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Enter 6-Digit OTP Code</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={instOtp}
                    onChange={(e) => setInstOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-48 text-center text-xl tracking-[0.5em] font-mono font-bold rounded-lg border border-slate-300 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={instOtpVerifying || instOtp.length < 6}
                    onClick={handleVerifyInstOtp}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {instOtpVerifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Verify OTP
                  </button>
                </div>
              </div>

              {/* Resend Control */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  disabled={instResendTimer > 0 || instOtpSending}
                  onClick={handleSendInstOtp}
                  className="font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {instOtpSending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  {instResendTimer > 0 ? `Resend in ${instResendTimer}s` : "Resend OTP"}
                </button>
              </div>

              {instOtpVerified && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  Institution official email verified successfully!
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Institution Details
                </button>
                <button
                  type="button"
                  disabled={!instOtpVerified}
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Administrator Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 3: Administrator Details
             ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>3. Administrator Details</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Designate the primary Institution Administrator account. No password is required now; a secure account setup link will be emailed once approved.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Administrator First Name" required error={errors.adminFirstName}>
                  <input
                    value={form.adminFirstName}
                    onChange={handleChange("adminFirstName")}
                    placeholder="e.g. Anand"
                    className={inputClass(errors.adminFirstName)}
                  />
                </Field>

                <Field label="Administrator Last Name" error={errors.adminLastName}>
                  <input
                    value={form.adminLastName}
                    onChange={handleChange("adminLastName")}
                    placeholder="e.g. Kumar"
                    className={inputClass(errors.adminLastName)}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Administrator Work Email" required error={errors.adminEmail}>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.adminEmail}
                      onChange={handleChange("adminEmail")}
                      placeholder="e.g. anand.admin@kce.ac.in"
                      className={inputClass(errors.adminEmail)}
                    />
                    {adminOtpVerified && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck size={16} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Approval notification and password setup links are sent here. Must differ from general contact email.
                  </p>
                </Field>

                <Field label="Administrator Phone Number" error={errors.adminPhone}>
                  <input
                    value={form.adminPhone}
                    onChange={handleChange("adminPhone")}
                    placeholder="+91 98765 43210"
                    className={inputClass(errors.adminPhone)}
                  />
                </Field>
              </div>

              {/* Password notice banner */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="font-bold">Password Setup via Approval Email:</span> For enhanced enterprise security, administrator passwords are not created during initial application. You will set a secure password using a single-use cryptographic token sent to your work email upon System Administrator approval.
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Institution OTP
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Verify Admin Email <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 4: Administrator Email OTP Verification
             ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>4. Verify Administrator Work Email</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Confirm administrator identity by verifying the work email address provided.
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm flex items-start gap-3">
                <Mail className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-semibold text-slate-900">Administrator Work Email</div>
                  <div className="font-mono text-blue-700 font-medium">{form.adminEmail}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the 6-digit registration verification code sent to this address.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Enter 6-Digit OTP Code</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={adminOtp}
                    onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-48 text-center text-xl tracking-[0.5em] font-mono font-bold rounded-lg border border-slate-300 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={adminOtpVerifying || adminOtp.length < 6}
                    onClick={handleVerifyAdminOtp}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {adminOtpVerifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Verify OTP
                  </button>
                </div>
              </div>

              {/* Resend Control */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  disabled={adminResendTimer > 0 || adminOtpSending}
                  onClick={handleSendAdminOtp}
                  className="font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {adminOtpSending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  {adminResendTimer > 0 ? `Resend in ${adminResendTimer}s` : "Resend OTP"}
                </button>
              </div>

              {adminOtpVerified && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  Administrator work email verified successfully!
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Admin Details
                </button>
                <button
                  type="button"
                  disabled={!adminOtpVerified}
                  onClick={() => setCurrentStep(5)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Next: Review & Submit <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 5: Review & Submit Application
             ========================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <SectionLabel>5. Review Application & Declaration</SectionLabel>
                <p className="text-xs text-slate-500 -mt-3 mb-4">
                  Please review the verified institution and administrator information prior to final submission.
                </p>
              </div>

              {/* Summary Card 1: Institution */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Building size={18} className="text-blue-600" /> Institution Profile
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Institution Name</span>
                    <span className="font-semibold text-slate-800">{form.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Short Code</span>
                    <span className="font-mono font-bold text-blue-700">{form.code.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Institution Type</span>
                    <span className="font-medium text-slate-800">{form.institutionType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Official Contact Email</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      {form.officialEmail}
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">Campus Address</span>
                    <span className="font-medium text-slate-800">
                      {form.address}, {form.city}, {form.state}, {form.country} {form.pincode ? `- ${form.pincode}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Card 2: Administrator */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <User size={18} className="text-blue-600" /> Designated Administrator
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Administrator Name</span>
                    <span className="font-semibold text-slate-800">
                      {form.adminFirstName} {form.adminLastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Administrator Work Email</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      {form.adminEmail}
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone</span>
                    <span className="font-medium text-slate-800">{form.adminPhone || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Status</span>
                    <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-bold">
                      PENDING REVIEW
                    </span>
                  </div>
                </div>
              </div>

              {/* Error notification if submit failed */}
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
                    I hereby certify and solemnly declare that I am authorized on behalf of this institution to register for the Lab Resource Utilization Platform and administer its research infrastructure.
                  </span>
                </label>
                {errors.authorized && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.authorized}</p>}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} /> Back to Admin OTP
                </button>
                <button
                  type="button"
                  disabled={submitting || !form.authorized}
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Login Link */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered your institution?{" "}
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

