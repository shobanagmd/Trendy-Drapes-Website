/**
 * ─────────────────────────────────────────────────────────────────
 *  SellerOnboarding.jsx  —  /seller/onboarding
 *
 *  TRENDY DRAPES — Seller Onboarding Flow
 *  Place this file at: src/seller/pages/SellerOnboarding.jsx
 *
 *  Register route in seller/src/App.jsx:
 *    import SellerOnboarding from "../pages/SellerOnboarding";
 *    <Route path="onboarding" element={<ProtectedRoute><SellerOnboarding /></ProtectedRoute>} />
 *
 *  After seller login → check localStorage "td_onboarding_done"
 *    false  → navigate to /seller/onboarding
 *    true   → navigate to /seller/dashboard
 *
 *  7 Steps:
 *    1. Basic Info       (name, email, mobile + OTP)
 *    2. Business Info    (type, name, address, city, state, pin, country)
 *    3. Tax Details      (PAN, GSTIN)
 *    4. Bank Details     (account holder, bank, acc no., IFSC)
 *    5. Store Setup      (store name, logo, description, pickup/return address, socials, banner)
 *    6. Agreements       (T&C, privacy, seller policy checkboxes)
 *    7. KYC              (doc type, doc number, doc upload)
 *
 *  Draft auto-saved to localStorage "td_onboarding_draft" on every change.
 *  Final submit → sets "td_onboarding_done" = "true" → navigates to dashboard.
 *
 *  Brand: Trendy Drapes — cream/ivory light mode, Cormorant Garamond + Jost,
 *         gold accent #C9A84C, charcoal text #1C1A16
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/* ── Brand tokens — Trendy Drapes ───────────────────────────────── */
const T = {
  // Backgrounds
  bg:          "#FAF8F4",
  bgAlt:       "#F5F1EA",
  surface:     "#FFFFFF",
  surfaceWarm: "#FEFCF8",

  // Gold accent (from index.css --accent: 38 60% 50%)
  gold:        "#C9A84C",
  goldLight:   "#E2C97A",
  goldDark:    "#A07C2A",
  goldBg:      "rgba(201,168,76,0.08)",
  goldBorder:  "rgba(201,168,76,0.30)",
  goldFocus:   "rgba(201,168,76,0.50)",

  // Text
  text:        "#1C1A16",
  textMid:     "#4A4438",
  muted:       "#9A8E7C",
  mutedLight:  "#C4B89E",

  // Borders
  border:      "#E8E0D0",
  borderDark:  "#D4C8B0",

  // States
  error:       "#C0392B",
  errorBg:     "rgba(192,57,43,0.06)",
  errorBorder: "rgba(192,57,43,0.30)",
  success:     "#2E7D52",
  successBg:   "rgba(46,125,82,0.06)",
  successBorder:"rgba(46,125,82,0.30)",

  // Primary charcoal
  primary:     "#1C1A16",
  primaryHover:"#2E2B24",
};

/* ── Steps ──────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, key: "basic",      label: "Basic Info",    icon: "01", desc: "Personal details" },
  { id: 2, key: "business",   label: "Business",      icon: "02", desc: "Business details" },
  { id: 3, key: "tax",        label: "Tax Details",   icon: "03", desc: "PAN & GSTIN" },
  { id: 4, key: "bank",       label: "Bank Details",  icon: "04", desc: "Account info" },
  { id: 5, key: "store",      label: "Store Setup",   icon: "05", desc: "Your storefront" },
  { id: 6, key: "compliance", label: "Agreements",    icon: "06", desc: "Legal & policies" },
  { id: 7, key: "kyc",        label: "KYC",           icon: "07", desc: "Verification docs" },
];

/* ── Initial state ──────────────────────────────────────────────── */
const INIT_STATE = {
  basic: {
    fullName: "", email: "", mobile: "",
    otp: "", mobileVerified: false, otpSent: false, otpTimer: 0, devOtp: "",
  },
  business: {
    businessType: "", businessName: "", legalName: "", address: "",
    city: "", state: "", pincode: "", country: "India",
  },
  tax: { panNumber: "", gstin: "" },
  bank: { accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", branchName: "", accountType: "Savings" },
  store: {
    storeName: "", storeDescription: "",
    pickupAddress: "", pickupCity: "", pickupState: "", pickupPincode: "",
    returnAddress: "",
    instagramUrl: "", facebookUrl: "", twitterUrl: "",
    logoFile: null, logoPreview: "",
    bannerFile: null, bannerPreview: "",
  },
  compliance: {
    termsAccepted: false, privacyAccepted: false, sellerPolicyAccepted: false,
  },
  kyc: {
    kycType: "pan_aadhaar",
    panNumber: "", aadhaarNumber: "",
    gstinNumber: "",
    documentNumber: "",
    documentFile: null, documentPreview: "",
  },
};

/* ── Indian States ──────────────────────────────────────────────── */
const IN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
  "Puducherry","Chandigarh","Dadra & Nagar Haveli","Daman & Diu","Lakshadweep","Andaman & Nicobar",
];

/* ── Validators ─────────────────────────────────────────────────── */
const V = {
  required: v => (v && String(v).trim() ? null : "This field is required"),
  email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email address"),
  mobile: v => (/^\d{10}$/.test(v) ? null : "Enter a valid 10-digit mobile number"),
  pan: v => (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase()) ? null : "Enter a valid PAN (e.g. ABCDE1234F)"),
  gstin: v => (!v || /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(v.toUpperCase()) ? null : "Enter a valid GSTIN"),
  ifsc: v => (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase()) ? null : "Enter a valid IFSC code (e.g. SBIN0001234)"),
  pincode: v => (/^\d{6}$/.test(v) ? null : "Enter a valid 6-digit pincode"),
  aadhaar: v => (/^\d{12}$/.test(v) ? null : "Enter a valid 12-digit Aadhaar number"),
  url: v => (!v || /^(https?:\/\/)?([\w.-]+\.[\w.]{2,})(\/\S*)?$/.test(v) ? null : "Enter a valid URL"),
};

/* ═══════════════════════════════════════════════════════════════ */
/*  CSS                                                            */
/* ═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ob-bg: ${T.bg};
  --ob-gold: ${T.gold};
  --ob-text: ${T.text};
  --ob-border: ${T.border};
  --ob-surface: ${T.surface};
}

.ob-root {
  min-height: 100vh;
  background: ${T.bg};
  font-family: 'Jost', 'Segoe UI', sans-serif;
  color: ${T.text};
  display: flex;
  flex-direction: column;
}

/* ── HEADER ─────────────────────────────────────────────────── */
.ob-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250,248,244,0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${T.border};
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.ob-header-brand {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.ob-header-logo {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 600;
  color: ${T.text};
  letter-spacing: 0.03em;
  line-height: 1;
}

.ob-header-logo em {
  font-style: italic;
  color: ${T.gold};
}

.ob-header-badge {
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${T.muted};
  border: 1px solid ${T.borderDark};
  padding: 2px 8px;
  border-radius: 2px;
}

.ob-header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.ob-header-save {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.7rem;
  color: ${T.muted};
  letter-spacing: 0.05em;
}

.ob-save-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: ${T.success};
  animation: ob-pulse 2.5s ease-in-out infinite;
}

@keyframes ob-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.4; transform:scale(0.8); }
}

.ob-header-step-count {
  font-size: 0.72rem;
  color: ${T.muted};
  letter-spacing: 0.06em;
}
.ob-header-step-count strong { color: ${T.gold}; font-weight: 600; }

/* ── LAYOUT ─────────────────────────────────────────────────── */
.ob-layout {
  display: flex;
  flex: 1;
}

/* ── SIDEBAR ────────────────────────────────────────────────── */
.ob-sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid ${T.border};
  background: ${T.surfaceWarm};
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 2rem 0;
}

.ob-sidebar-inner {
  padding: 0;
}

.ob-sidebar-eyebrow {
  font-size: 0.58rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${T.muted};
  padding: 0 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* Progress bar in sidebar */
.ob-sidebar-progress {
  margin: 0 1.75rem 2rem;
}
.ob-sidebar-progress-track {
  height: 3px;
  background: ${T.border};
  border-radius: 3px;
  overflow: hidden;
}
.ob-sidebar-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, ${T.gold}, ${T.goldLight});
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(.4,0,.2,1);
}
.ob-sidebar-progress-label {
  font-size: 0.65rem;
  color: ${T.muted};
  margin-top: 0.5rem;
  letter-spacing: 0.05em;
}

/* Step items */
.ob-step-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.75rem;
  width: 100%;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.ob-step-btn:hover { background: ${T.goldBg}; }

.ob-step-btn.active {
  background: ${T.goldBg};
}

.ob-step-btn.active::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: ${T.gold};
  border-radius: 0 2px 2px 0;
}

.ob-step-num {
  width: 34px; height: 34px;
  border-radius: 50%;
  border: 1.5px solid ${T.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: ${T.muted};
  flex-shrink: 0;
  transition: all 0.2s;
  background: ${T.surface};
}

.ob-step-btn.active .ob-step-num {
  border-color: ${T.gold};
  color: ${T.gold};
  background: ${T.goldBg};
}

.ob-step-btn.done .ob-step-num {
  background: ${T.gold};
  border-color: ${T.gold};
  color: white;
  font-size: 0.75rem;
}

.ob-step-info { flex: 1; min-width: 0; }

.ob-step-label-text {
  font-size: 0.8rem;
  font-weight: 500;
  color: ${T.textMid};
  letter-spacing: 0.02em;
  line-height: 1;
  margin-bottom: 2px;
}

.ob-step-btn.active .ob-step-label-text { color: ${T.text}; font-weight: 600; }

.ob-step-desc-text {
  font-size: 0.65rem;
  color: ${T.muted};
  letter-spacing: 0.03em;
}

.ob-step-btn.done .ob-step-desc-text { color: ${T.success}; }

.ob-step-check {
  font-size: 0.7rem;
  color: ${T.success};
  flex-shrink: 0;
}

/* Sidebar divider */
.ob-sidebar-divider {
  height: 1px;
  background: ${T.border};
  margin: 1rem 1.75rem;
}

/* ── MAIN ───────────────────────────────────────────────────── */
.ob-main {
  flex: 1;
  padding: 3rem 3.5rem 4rem;
  max-width: 780px;
}

/* Step transition */
.ob-step-panel {
  animation: ob-fadeUp 0.3s ease;
}

@keyframes ob-fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Step header */
.ob-panel-header {
  margin-bottom: 2.5rem;
}

.ob-panel-eyebrow {
  font-size: 0.58rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: ${T.gold};
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.ob-panel-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.9rem, 3vw, 2.5rem);
  font-weight: 500;
  color: ${T.text};
  line-height: 1.15;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.ob-panel-title em {
  font-style: italic;
  color: ${T.gold};
}

.ob-panel-desc {
  font-size: 0.82rem;
  color: ${T.muted};
  line-height: 1.65;
  max-width: 520px;
  letter-spacing: 0.02em;
}

/* ── FORM ELEMENTS ──────────────────────────────────────────── */
.ob-form-body { }

.ob-section-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 500;
  font-style: italic;
  color: ${T.textMid};
  padding-bottom: 0.6rem;
  border-bottom: 1px solid ${T.border};
  margin-bottom: 1.25rem;
  margin-top: 1.75rem;
  letter-spacing: 0.02em;
}
.ob-section-title:first-child { margin-top: 0; }

.ob-row { display: grid; gap: 1.1rem; margin-bottom: 1.1rem; }
.ob-row-1 { grid-template-columns: 1fr; }
.ob-row-2 { grid-template-columns: 1fr 1fr; }
.ob-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.ob-row-211 { grid-template-columns: 2fr 1fr 1fr; }

.ob-field { display: flex; flex-direction: column; gap: 0.4rem; }

.ob-label {
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${T.textMid};
  font-weight: 600;
}
.ob-label .req { color: ${T.gold}; margin-left: 2px; }

.ob-input {
  background: ${T.surface};
  border: 1.5px solid ${T.border};
  border-radius: 6px;
  padding: 0.72rem 0.9rem;
  font-family: 'Jost', sans-serif;
  font-size: 0.84rem;
  color: ${T.text};
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  width: 100%;
  -webkit-appearance: none;
}

.ob-input:hover { border-color: ${T.borderDark}; }

.ob-input:focus {
  border-color: ${T.gold};
  box-shadow: 0 0 0 3px ${T.goldBg};
  background: ${T.surfaceWarm};
}

.ob-input::placeholder { color: ${T.mutedLight}; }

.ob-input.err {
  border-color: ${T.errorBorder};
  background: ${T.errorBg};
}

.ob-input.ok {
  border-color: ${T.successBorder};
}

.ob-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239A8E7C' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 14px;
  padding-right: 2.5rem;
  cursor: pointer;
}

.ob-select option { background: ${T.surface}; color: ${T.text}; }

.ob-textarea {
  min-height: 88px;
  resize: vertical;
  font-family: 'Jost', sans-serif;
  line-height: 1.55;
}

.ob-err-msg {
  font-size: 0.65rem;
  color: ${T.error};
  letter-spacing: 0.04em;
  margin-top: -0.1rem;
}

.ob-hint {
  font-size: 0.65rem;
  color: ${T.muted};
  letter-spacing: 0.03em;
  margin-top: -0.1rem;
  line-height: 1.4;
}

/* OTP row */
.ob-otp-row {
  display: flex;
  gap: 0.7rem;
  align-items: flex-end;
}
.ob-otp-row .ob-field { flex: 1; }

.ob-btn-secondary {
  background: ${T.goldBg};
  border: 1.5px solid ${T.goldBorder};
  color: ${T.goldDark};
  border-radius: 6px;
  padding: 0.72rem 1.1rem;
  font-family: 'Jost', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
  height: fit-content;
  align-self: flex-end;
}
.ob-btn-secondary:hover:not(:disabled) {
  background: rgba(201,168,76,0.15);
  border-color: ${T.gold};
  color: ${T.gold};
}
.ob-btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

.ob-verified {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  font-weight: 600;
  color: ${T.success};
  background: ${T.successBg};
  border: 1px solid ${T.successBorder};
  border-radius: 4px;
  padding: 0.3rem 0.7rem;
  margin-top: 0.2rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Radio grid */
.ob-radio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.ob-radio-card {
  padding: 0.85rem 1rem;
  border: 1.5px solid ${T.border};
  border-radius: 8px;
  background: ${T.surface};
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  user-select: none;
}
.ob-radio-card:hover { border-color: ${T.borderDark}; background: ${T.bgAlt}; }
.ob-radio-card.selected {
  border-color: ${T.gold};
  background: ${T.goldBg};
}

.ob-radio-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 1.5px solid ${T.border};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}
.ob-radio-card.selected .ob-radio-dot {
  border-color: ${T.gold};
  background: ${T.gold};
}
.ob-radio-card.selected .ob-radio-dot::after {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: white;
}

.ob-radio-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: ${T.textMid};
}
.ob-radio-card.selected .ob-radio-label { color: ${T.text}; }

/* File upload */
.ob-upload {
  border: 1.5px dashed ${T.borderDark};
  border-radius: 8px;
  padding: 1.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${T.bgAlt};
  position: relative;
  overflow: hidden;
}
.ob-upload:hover {
  border-color: ${T.gold};
  background: ${T.goldBg};
}
.ob-upload input[type="file"] {
  position: absolute; inset: 0;
  opacity: 0; cursor: pointer; width: 100%; height: 100%;
}
.ob-upload-icon { font-size: 2rem; margin-bottom: 0.5rem; display: block; }
.ob-upload-text { font-size: 0.78rem; color: ${T.muted}; line-height: 1.5; }
.ob-upload-text strong { color: ${T.gold}; }
.ob-upload-sub { font-size: 0.65rem; color: ${T.mutedLight}; margin-top: 0.25rem; }

.ob-upload-preview { width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px; }
.ob-upload-preview-doc {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.5rem;
  font-size: 0.72rem; color: ${T.gold};
}

/* Checkbox agreements */
.ob-check-row {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  border: 1.5px solid ${T.border};
  border-radius: 8px;
  background: ${T.surface};
  cursor: pointer;
  transition: all 0.18s;
  margin-bottom: 0.75rem;
  user-select: none;
}
.ob-check-row:hover { border-color: ${T.borderDark}; }
.ob-check-row.checked { border-color: ${T.goldBorder}; background: ${T.goldBg}; }

.ob-check-box {
  width: 18px; height: 18px;
  border-radius: 4px;
  border: 1.5px solid ${T.border};
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all 0.18s;
  font-size: 0.7rem;
  color: transparent;
}
.ob-check-row.checked .ob-check-box {
  background: ${T.gold};
  border-color: ${T.gold};
  color: white;
}

.ob-check-title { font-size: 0.82rem; font-weight: 600; color: ${T.text}; margin-bottom: 2px; }
.ob-check-desc  { font-size: 0.72rem; color: ${T.muted}; line-height: 1.5; }

/* KYC type tabs */
.ob-kyc-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.ob-kyc-tab {
  padding: 0.5rem 1.1rem;
  border: 1.5px solid ${T.border};
  border-radius: 4px;
  background: ${T.surface};
  color: ${T.muted};
  font-size: 0.73rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.18s;
  font-family: 'Jost', sans-serif;
}
.ob-kyc-tab:hover { border-color: ${T.borderDark}; color: ${T.textMid}; }
.ob-kyc-tab.active {
  border-color: ${T.gold};
  background: ${T.goldBg};
  color: ${T.goldDark};
}

/* Alert */
.ob-alert {
  padding: 0.8rem 1rem;
  border-radius: 6px;
  font-size: 0.78rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  letter-spacing: 0.02em;
}
.ob-alert.error {
  background: ${T.errorBg};
  border: 1px solid ${T.errorBorder};
  color: ${T.error};
}
.ob-alert.success {
  background: ${T.successBg};
  border: 1px solid ${T.successBorder};
  color: ${T.success};
}
.ob-alert.info {
  background: ${T.goldBg};
  border: 1px solid ${T.goldBorder};
  color: ${T.goldDark};
}

/* Navigation */
.ob-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2.5rem;
  padding-top: 1.75rem;
  border-top: 1px solid ${T.border};
}

.ob-nav-back {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: ${T.muted};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.6rem 0;
  transition: color 0.18s;
  font-family: 'Jost', sans-serif;
  letter-spacing: 0.05em;
}
.ob-nav-back:hover { color: ${T.text}; }
.ob-nav-back:disabled { opacity: 0.35; cursor: default; }

.ob-nav-right { display: flex; gap: 0.75rem; align-items: center; }

.ob-nav-save {
  font-size: 0.73rem;
  font-weight: 500;
  color: ${T.muted};
  background: none;
  border: 1.5px solid ${T.border};
  border-radius: 6px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  font-family: 'Jost', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: all 0.18s;
}
.ob-nav-save:hover { border-color: ${T.borderDark}; color: ${T.textMid}; }

.ob-nav-next {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${T.text};
  color: ${T.bg};
  border: none;
  border-radius: 6px;
  padding: 0.72rem 1.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: 'Jost', sans-serif;
  transition: all 0.2s;
}
.ob-nav-next:hover {
  background: ${T.primaryHover};
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(28,26,22,0.18);
}
.ob-nav-next:active { transform: translateY(0); }
.ob-nav-next:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

.ob-nav-submit {
  background: linear-gradient(135deg, ${T.gold}, ${T.goldLight});
  color: white;
}
.ob-nav-submit:hover {
  background: linear-gradient(135deg, ${T.goldDark}, ${T.gold});
  box-shadow: 0 4px 20px rgba(201,168,76,0.35);
}

/* ── SUCCESS screen ───────────────────────────────────────────── */
.ob-success {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  animation: ob-fadeUp 0.5s ease;
}

.ob-success-icon {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: ${T.goldBg};
  border: 2px solid ${T.goldBorder};
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
  margin: 0 auto 2rem;
  animation: ob-pop 0.5s cubic-bezier(.34,1.56,.64,1);
}
@keyframes ob-pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.ob-success-eyebrow {
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: ${T.gold};
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.ob-success-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.8rem;
  font-weight: 500;
  color: ${T.text};
  margin-bottom: 0.75rem;
  line-height: 1.15;
}
.ob-success-title em { font-style: italic; color: ${T.gold}; }

.ob-success-desc {
  font-size: 0.88rem;
  color: ${T.muted};
  max-width: 420px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.ob-success-btn {
  background: ${T.text};
  color: ${T.bg};
  border: none;
  border-radius: 6px;
  padding: 0.85rem 2.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: 'Jost', sans-serif;
  transition: all 0.2s;
}
.ob-success-btn:hover {
  background: ${T.primaryHover};
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(28,26,22,0.18);
}

/* ── MOBILE ─────────────────────────────────────────────────── */
.ob-mobile-steps {
  display: none;
  padding: 0 1.25rem 1.25rem;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.ob-mobile-steps::-webkit-scrollbar { display: none; }

.ob-mobile-step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1.5px solid ${T.border};
  font-size: 0.58rem;
  font-weight: 700;
  color: ${T.muted};
  background: ${T.surface};
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.ob-mobile-step-dot.active { border-color: ${T.gold}; color: ${T.gold}; background: ${T.goldBg}; }
.ob-mobile-step-dot.done   { background: ${T.gold}; border-color: ${T.gold}; color: white; }

@media (max-width: 820px) {
  .ob-sidebar { display: none; }
  .ob-mobile-steps { display: flex; }
  .ob-main { padding: 1.75rem 1.25rem 3rem; }
  .ob-row-2 { grid-template-columns: 1fr; }
  .ob-row-3 { grid-template-columns: 1fr 1fr; }
  .ob-row-211 { grid-template-columns: 1fr; }
  .ob-radio-grid { grid-template-columns: 1fr; }
  .ob-header { padding: 0 1.25rem; }
  .ob-header-badge { display: none; }
}
`;

/* ═══════════════════════════════════════════════════════════════ */
/*  REUSABLE UI ATOMS                                             */
/* ═══════════════════════════════════════════════════════════════ */

function Field({ label, required, error, hint, children }) {
  return (
    <div className="ob-field">
      {label && (
        <label className="ob-label">
          {label}{required && <span className="req"> *</span>}
        </label>
      )}
      {children}
      {error && <span className="ob-err-msg">⚠ {error}</span>}
      {hint && !error && <span className="ob-hint">{hint}</span>}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      className={`ob-input ${error ? "err" : ""} ${className}`}
      {...props}
    />
  );
}

function Select({ error, children, ...props }) {
  return (
    <select className={`ob-input ob-select ${error ? "err" : ""}`} {...props}>
      {children}
    </select>
  );
}

function Textarea({ error, ...props }) {
  return <textarea className={`ob-input ob-textarea ${error ? "err" : ""}`} {...props} />;
}

function RadioCard({ label, value, selected, onSelect }) {
  return (
    <div className={`ob-radio-card ${selected ? "selected" : ""}`} onClick={() => onSelect(value)}>
      <div className="ob-radio-dot" />
      <span className="ob-radio-label">{label}</span>
    </div>
  );
}

function CheckRow({ title, desc, checked, onToggle }) {
  return (
    <div className={`ob-check-row ${checked ? "checked" : ""}`} onClick={onToggle}>
      <div className="ob-check-box">{checked && "✓"}</div>
      <div>
        <div className="ob-check-title">{title}</div>
        {desc && <div className="ob-check-desc">{desc}</div>}
      </div>
    </div>
  );
}

function FileUpload({ label, accept = "image/*", preview, previewType = "image", onChange, hint }) {
  return (
    <div className="ob-field">
      {label && <label className="ob-label">{label}</label>}
      <div className="ob-upload">
        <input type="file" accept={accept} onChange={onChange} />
        {preview ? (
          previewType === "image" ? (
            <img src={preview} alt="preview" className="ob-upload-preview" />
          ) : (
            <div className="ob-upload-preview-doc">📄 <span>{preview}</span></div>
          )
        ) : (
          <>
            <span className="ob-upload-icon">🖼</span>
            <div className="ob-upload-text"><strong>Click to upload</strong> or drag & drop</div>
            {hint && <div className="ob-upload-sub">{hint}</div>}
          </>
        )}
      </div>
    </div>
  );
}

function Alert({ type = "info", children }) {
  const icons = { error: "⚠", success: "✓", info: "ℹ" };
  return <div className={`ob-alert ${type}`}>{icons[type]} {children}</div>;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STEP 1 — Basic Info                                           */
/* ═══════════════════════════════════════════════════════════════ */
function StepBasic({ data, setData, errors, setErrors, user }) {
  const [sending, setSending] = useState(false);
  const timerRef = useRef(null);

  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));

  // Countdown timer
  useEffect(() => {
    if (data.otpTimer > 0) {
      timerRef.current = setTimeout(() => setData(d => ({ ...d, otpTimer: d.otpTimer - 1 })), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [data.otpTimer, setData]);

  const handleSendOtp = async () => {
    const err = V.mobile(data.mobile);
    if (err) { setErrors(e => ({ ...e, mobile: err })); return; }
    setSending(true);
    
    try {
      const res = await fetch("http://localhost:5000/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: data.mobile }),
      });
      const result = await res.json();
      
      if (result.success) {
        // In a real app, the OTP is sent via SMS. Here we get it in response for demo.
        setData(d => ({ ...d, otpSent: true, otpTimer: 300, devOtp: result.otp }));
        setErrors(e => ({ ...e, mobile: null }));
      } else {
        setErrors(e => ({ ...e, mobile: result.message }));
      }
    } catch (err) {
      setErrors(e => ({ ...e, mobile: "Could not connect to server" }));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!data.otp) { setErrors(e => ({ ...e, otp: "Enter the OTP" })); return; }
    
    try {
      const res = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: data.mobile, otp: data.otp }),
      });
      const result = await res.json();

      if (result.success) {
        setData(d => ({ ...d, mobileVerified: true }));
        setErrors(e => ({ ...e, otp: null }));
      } else {
        setErrors(e => ({ ...e, otp: result.message || "Invalid OTP" }));
      }
    } catch (err) {
      setErrors(e => ({ ...e, otp: "Verification failed. Try again." }));
    }
  };

  // Pre-fill email and name from user prop or session
  useEffect(() => {
    // Identity fields should follow the account data
    if (user?.email || user?.name || user?.fullName) {
      setData(d => ({ 
        ...d, 
        email: user.email || d.email, 
        fullName: user.fullName || user.name || d.fullName || "" 
      }));
    }
  }, [user, setData]);

  return (
    <div className="ob-form-body">
      {data.devOtp && !data.mobileVerified && (
        <Alert type="info">Dev mode — Your OTP is: <strong>{data.devOtp}</strong></Alert>
      )}

      <div className="ob-row ob-row-2">
        <Field label="Full Name" required error={errors.fullName}>
          <Input value={data.fullName} onChange={set("fullName")} placeholder="e.g. Priya Sharma" error={errors.fullName} />
        </Field>
        <Field label="Email Address" required error={errors.email} hint="This email was used during signup">
          <Input type="email" value={data.email} onChange={set("email")} placeholder="you@example.com" error={errors.email} className="ok" disabled={!!data.email} />
        </Field>
      </div>

      <div className="ob-section-title">Mobile Verification</div>

      <div className="ob-row ob-row-1">
        <Field label="Mobile Number" required error={errors.mobile}>
          <div className="ob-otp-row">
            <div className="ob-field" style={{ flex: 1 }}>
              <Input
                type="tel" value={data.mobile} onChange={set("mobile")}
                placeholder="10-digit mobile number" maxLength={10}
                error={errors.mobile} disabled={data.mobileVerified}
                className={data.mobileVerified ? "ok" : ""}
              />
            </div>
            {!data.mobileVerified && (
              <button
                type="button" className="ob-btn-secondary"
                onClick={handleSendOtp}
                disabled={sending || data.otpTimer > 0}
                style={{ alignSelf: "flex-end", marginBottom: 0 }}
              >
                {sending ? "Sending…" : data.otpTimer > 0 ? `Resend (${data.otpTimer}s)` : data.otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            )}
          </div>
          {data.mobileVerified && <div className="ob-verified">✓ Mobile Verified</div>}
        </Field>
      </div>

      {data.otpSent && !data.mobileVerified && (
        <div className="ob-row ob-row-1">
          <Field label="Enter OTP" required error={errors.otp} hint="Enter the 6-digit OTP sent to your mobile">
            <div className="ob-otp-row">
              <div className="ob-field" style={{ flex: 1 }}>
                <Input
                  type="text" value={data.otp} onChange={set("otp")}
                  placeholder="6-digit OTP" maxLength={6} error={errors.otp}
                />
              </div>
              <button type="button" className="ob-btn-secondary" onClick={handleVerifyOtp} style={{ alignSelf: "flex-end" }}>
                Verify
              </button>
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

function validateBasic(d) {
  const e = {};
  if (!d.fullName.trim()) e.fullName = "Full name is required";
  const emailErr = V.email(d.email); if (emailErr) e.email = emailErr;
  if (!d.mobileVerified) e.mobile = "Please verify your mobile number";
  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STEP 2 — Business Info                                        */
/* ═══════════════════════════════════════════════════════════════ */
const BIZ_TYPES = [
  { value: "individual",     label: "Individual" },
  { value: "sole_proprietor",label: "Sole Proprietor" },
  { value: "partnership",    label: "Partnership" },
  { value: "pvt_ltd_llp",   label: "Pvt Ltd / LLP" },
];

function StepBusiness({ data, setData, errors }) {
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="ob-form-body">
      <div className="ob-section-title">Business Type</div>
      <div className="ob-row ob-row-1" style={{ marginBottom: "1.5rem" }}>
        <Field label="Select Business Type" required error={errors.businessType}>
          <div className="ob-radio-grid">
            {BIZ_TYPES.map(b => (
              <RadioCard key={b.value} label={b.label} value={b.value}
                selected={data.businessType === b.value}
                onSelect={v => setData(d => ({ ...d, businessType: v }))} />
            ))}
          </div>
          {errors.businessType && <span className="ob-err-msg">⚠ {errors.businessType}</span>}
        </Field>
      </div>

      <div className="ob-section-title">Business Details</div>

      <div className="ob-row ob-row-2">
        <Field label="Business Name" required error={errors.businessName}>
          <Input value={data.businessName} onChange={set("businessName")} placeholder="Your registered business name" error={errors.businessName} />
        </Field>
        <Field label="Legal Name" error={errors.legalName} hint="As per your PAN/GST registration">
          <Input value={data.legalName} onChange={set("legalName")} placeholder="Official legal name" error={errors.legalName} />
        </Field>
      </div>
      <div className="ob-row ob-row-1">
        <Field label="Country" required error={errors.country}>
          <Select value={data.country} onChange={set("country")} error={errors.country}>
            <option value="India">India</option>
            <option value="Other">Other</option>
          </Select>
        </Field>
      </div>

      <div className="ob-row ob-row-1">
        <Field label="Business Address" required error={errors.address}>
          <Textarea value={data.address} onChange={set("address")} placeholder="Full address including building, street, landmark" error={errors.address} />
        </Field>
      </div>

      <div className="ob-row ob-row-3">
        <Field label="City" required error={errors.city}>
          <Input value={data.city} onChange={set("city")} placeholder="e.g. Varanasi" error={errors.city} />
        </Field>
        <Field label="State" required error={errors.state}>
          <Select value={data.state} onChange={set("state")} error={errors.state}>
            <option value="">Select state…</option>
            {IN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Pincode" required error={errors.pincode}>
          <Input value={data.pincode} onChange={set("pincode")} placeholder="6-digit pincode" maxLength={6} error={errors.pincode} />
        </Field>
      </div>
    </div>
  );
}

function validateBusiness(d) {
  const e = {};
  if (!d.businessType) e.businessType = "Please select a business type";
  if (!d.businessName.trim()) e.businessName = "Business name is required";
  if (d.businessType !== "individual" && !d.legalName.trim()) e.legalName = "Legal name is required";
  if (!d.address.trim()) e.address = "Address is required";
  if (!d.city.trim()) e.city = "City is required";
  if (!d.state) e.state = "State is required";
  const pinErr = V.pincode(d.pincode); if (pinErr) e.pincode = pinErr;
  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STEP 3 — Tax Details                                          */
/* ═══════════════════════════════════════════════════════════════ */
function StepTax({ data, setData, errors, bizType }) {
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value.toUpperCase() }));
  const isGst = bizType !== "individual";
  return (
    <div className="ob-form-body">
      <Alert type="info">
        {isGst
          ? "For businesses, GSTIN is required if your annual turnover exceeds ₹40 lakhs."
          : "As an Individual seller, you need to provide your PAN card details."}
      </Alert>

      <div className="ob-section-title">Tax Identification</div>

      <div className="ob-row ob-row-2">
        <Field label="PAN Card Number" required error={errors.panNumber} hint="10-character PAN (e.g. ABCDE1234F)">
          <Input value={data.panNumber} onChange={set("panNumber")} placeholder="ABCDE1234F" maxLength={10} error={errors.panNumber} />
        </Field>
        {isGst && (
          <Field label="GSTIN" error={errors.gstin} hint="15-digit GST Identification Number (optional for small sellers)">
            <Input value={data.gstin} onChange={set("gstin")} placeholder="22AAAAA0000A1Z5" maxLength={15} error={errors.gstin} />
          </Field>
        )}
      </div>

      <div className="ob-hint" style={{ marginTop: "1rem", padding: "0.85rem 1rem", background: T.goldBg, borderRadius: 6, border: `1px solid ${T.goldBorder}`, fontSize: "0.75rem", color: T.textMid, lineHeight: 1.6 }}>
        <strong>🔒 Your tax information is encrypted</strong> and only used for government-mandated reporting and payout processing. Trendy Drapes complies with all applicable Indian taxation regulations.
      </div>
    </div>
  );
}

function validateTax(d, bizType) {
  const e = {};
  const panErr = V.pan(d.panNumber); if (panErr) e.panNumber = panErr;
  if (bizType !== "individual" && d.gstin) {
    const gErr = V.gstin(d.gstin); if (gErr) e.gstin = gErr;
  }
  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STEP 4 — Bank Details                                         */
/* ═══════════════════════════════════════════════════════════════ */
function StepBank({ data, setData, errors }) {
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  const setUpper = k => e => setData(d => ({ ...d, [k]: e.target.value.toUpperCase() }));
  return (
    <div className="ob-form-body">
      <Alert type="info">
        Your payouts will be deposited to this bank account. Ensure the details match your KYC documents.
      </Alert>

      <div className="ob-section-title">Bank Account Details</div>

      <div className="ob-row ob-row-2">
        <Field label="Account Holder Name" required error={errors.accountHolderName}>
          <Input value={data.accountHolderName} onChange={set("accountHolderName")} placeholder="Exactly as on your passbook" error={errors.accountHolderName} />
        </Field>
        <Field label="Bank Name" required error={errors.bankName}>
          <Input value={data.bankName} onChange={set("bankName")} placeholder="e.g. State Bank of India" error={errors.bankName} />
        </Field>
      </div>

      <div className="ob-row ob-row-2">
        <Field label="Account Number" required error={errors.accountNumber}>
          <Input type="text" value={data.accountNumber} onChange={set("accountNumber")} placeholder="Your account number" maxLength={20} error={errors.accountNumber} />
        </Field>
        <Field label="IFSC Code" required error={errors.ifscCode} hint="11-character code (e.g. SBIN0001234)">
          <Input value={data.ifscCode} onChange={setUpper("ifscCode")} placeholder="SBIN0001234" maxLength={11} error={errors.ifscCode} />
        </Field>
      </div>

      <div className="ob-row ob-row-2">
        <Field label="Branch Name" error={errors.branchName}>
          <Input value={data.branchName} onChange={set("branchName")} placeholder="e.g. Varanasi Main Branch" error={errors.branchName} />
        </Field>
        <Field label="Account Type" required error={errors.accountType}>
          <Select value={data.accountType} onChange={set("accountType")} error={errors.accountType}>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
          </Select>
        </Field>
      </div>

      <div className="ob-hint" style={{ marginTop: "1rem", padding: "0.85rem 1rem", background: T.goldBg, borderRadius: 6, border: `1px solid ${T.goldBorder}`, fontSize: "0.75rem", color: T.textMid, lineHeight: 1.6 }}>
        <strong>💳 Payout Schedule:</strong> Trendy Drapes processes seller payouts every 7 days after order delivery confirmation. Minimum payout threshold is ₹500.
      </div>
    </div>
  );
}

function validateBank(d) {
  const e = {};
  if (!d.accountHolderName.trim()) e.accountHolderName = "Account holder name is required";
  if (!d.bankName.trim()) e.bankName = "Bank name is required";
  if (!d.accountNumber.trim()) e.accountNumber = "Account number is required";
  const ifscErr = V.ifsc(d.ifscCode); if (ifscErr) e.ifscCode = ifscErr;
  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STEP 5 — Store Setup                                          */
/* ═══════════════════════════════════════════════════════════════ */
function StepStore({ data, setData, errors }) {
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));

  const handleFile = (key, previewKey) => e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setData(d => ({ ...d, [key]: file, [previewKey]: url }));
  };

  return (
    <div className="ob-form-body">
      <div className="ob-section-title">Store Identity</div>

      <div className="ob-row ob-row-2">
        <Field label="Store Name" required error={errors.storeName}>
          <Input value={data.storeName} onChange={set("storeName")} placeholder="Your store's display name" error={errors.storeName} />
        </Field>
      </div>

      <div className="ob-row ob-row-1">
        <Field label="Store Description" required error={errors.storeDescription}>
          <Textarea value={data.storeDescription} onChange={set("storeDescription")} placeholder="Tell buyers about your store — your speciality, craftsmanship, heritage…" error={errors.storeDescription} />
        </Field>
      </div>

      <div className="ob-row ob-row-2">
        <FileUpload
          label="Store Logo"
          accept="image/png, image/jpeg, image/webp"
          preview={data.logoPreview}
          onChange={handleFile("logoFile", "logoPreview")}
          hint="PNG, JPG or WebP • Max 2MB • Recommended 400×400px"
        />
        <FileUpload
          label="Store Banner"
          accept="image/png, image/jpeg, image/webp"
          preview={data.bannerPreview}
          onChange={handleFile("bannerFile", "bannerPreview")}
          hint="PNG, JPG or WebP • Max 5MB • Recommended 1200×400px"
        />
      </div>

      <div className="ob-section-title">Addresses</div>

      <div className="ob-row ob-row-1">
        <Field label="Pickup Address" required error={errors.pickupAddress} hint="Address from where orders will be picked up">
          <Textarea value={data.pickupAddress} onChange={set("pickupAddress")} placeholder="Full pickup address" error={errors.pickupAddress} style={{ minHeight: 72 }} />
        </Field>
      </div>
      <div className="ob-row ob-row-3">
        <Field label="City" required error={errors.pickupCity}>
          <Input value={data.pickupCity} onChange={set("pickupCity")} placeholder="City" error={errors.pickupCity} />
        </Field>
        <Field label="State" required error={errors.pickupState}>
          <Select value={data.pickupState} onChange={set("pickupState")} error={errors.pickupState}>
            <option value="">Select State</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Pincode" required error={errors.pickupPincode}>
          <Input value={data.pickupPincode} onChange={set("pickupPincode")} placeholder="6-digit PIN" maxLength={6} error={errors.pickupPincode} />
        </Field>
      </div>

      <div className="ob-row ob-row-1">
        <Field label="Return Address" required error={errors.returnAddress} hint="Address where returned items should be sent">
          <Textarea value={data.returnAddress} onChange={set("returnAddress")} placeholder="Full return address" error={errors.returnAddress} style={{ minHeight: 72 }} />
        </Field>
      </div>

      <div className="ob-section-title">Social Links <span style={{ fontSize: "0.7rem", color: T.muted, fontStyle: "normal", fontFamily: "'Jost'" }}>(optional)</span></div>

      <div className="ob-row ob-row-3">
        <Field label="Instagram" error={errors.instagramUrl} hint="Your store's Instagram page">
          <Input value={data.instagramUrl} onChange={set("instagramUrl")} placeholder="https://instagram.com/yourstore" error={errors.instagramUrl} />
        </Field>
        <Field label="Facebook" error={errors.facebookUrl}>
          <Input value={data.facebookUrl} onChange={set("facebookUrl")} placeholder="https://facebook.com/yourstore" error={errors.facebookUrl} />
        </Field>
        <Field label="Twitter / X" error={errors.twitterUrl}>
          <Input value={data.twitterUrl} onChange={set("twitterUrl")} placeholder="https://x.com/yourstore" error={errors.twitterUrl} />
        </Field>
      </div>
    </div>
  );
}

function validateStore(d) {
  const e = {};
  if (!d.storeName.trim()) e.storeName = "Store name is required";
  if (!d.storeDescription.trim()) e.storeDescription = "Store description is required";
  if (!d.pickupAddress.trim()) e.pickupAddress = "Pickup address is required";
  if (!d.pickupCity?.trim()) e.pickupCity = "City is required";
  if (!d.pickupState) e.pickupState = "State is required";
  if (!/^\d{6}$/.test(d.pickupPincode?.trim())) e.pickupPincode = "Enter valid 6-digit PIN";
  if (!d.returnAddress.trim()) e.returnAddress = "Return address is required";
  [["instagramUrl","instagramUrl"],["facebookUrl","facebookUrl"],["twitterUrl","twitterUrl"]].forEach(([k,ek]) => {
    if (d[k]) { const err = V.url(d[k]); if (err) e[ek] = "Enter a valid URL"; }
  });
  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STEP 6 — Compliance                                           */
/* ═══════════════════════════════════════════════════════════════ */
function StepCompliance({ data, setData, errors }) {
  const toggle = k => () => setData(d => ({ ...d, [k]: !d[k] }));
  return (
    <div className="ob-form-body">
      <p style={{ fontSize: "0.82rem", color: T.muted, marginBottom: "1.75rem", lineHeight: 1.65 }}>
        Please read and accept the following agreements to proceed. These protect both you as a seller and the buyers on Trendy Drapes.
      </p>

      {errors.all && <Alert type="error">{errors.all}</Alert>}

      <CheckRow
        title="Terms & Conditions"
        desc="I have read and agree to the Trendy Drapes Seller Terms & Conditions, including listing rules, commission structure, and dispute resolution policies."
        checked={data.termsAccepted}
        onToggle={toggle("termsAccepted")}
      />
      <CheckRow
        title="Privacy Policy"
        desc="I understand and consent to Trendy Drapes collecting and processing my personal and business data as described in the Privacy Policy."
        checked={data.privacyAccepted}
        onToggle={toggle("privacyAccepted")}
      />
      <CheckRow
        title="Seller Code of Conduct"
        desc="I agree to maintain product quality standards, accurate listing descriptions, timely dispatch within 2 business days, and professional buyer communication at all times."
        checked={data.sellerPolicyAccepted}
        onToggle={toggle("sellerPolicyAccepted")}
      />

      <div style={{ marginTop: "1.5rem", padding: "1rem 1.1rem", background: T.goldBg, borderRadius: 8, border: `1px solid ${T.goldBorder}`, fontSize: "0.75rem", color: T.textMid, lineHeight: 1.65 }}>
        <strong>📜 Summary of Key Commitments</strong><br/>
        Commission: 5–12% per sale • Payout: D+7 after delivery • Return window: 7 days •
        Dispute escalation: 72 hrs • Minimum listing price: ₹199 • Account suspension for fraudulent listings.
      </div>
    </div>
  );
}

function validateCompliance(d) {
  const e = {};
  if (!d.termsAccepted || !d.privacyAccepted || !d.sellerPolicyAccepted)
    e.all = "Please accept all three agreements to proceed.";
  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  STEP 7 — KYC                                                  */
/* ═══════════════════════════════════════════════════════════════ */
function StepKyc({ data, setData, errors, bizType }) {
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  const setUpper = k => e => setData(d => ({ ...d, [k]: e.target.value.toUpperCase() }));
  const isIndividual = !bizType || bizType === "individual" || bizType === "sole_proprietor";

  const handleDocFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith("image/");
    const preview = isImg ? URL.createObjectURL(file) : file.name;
    setData(d => ({ ...d, documentFile: file, documentPreview: preview, documentIsImage: isImg }));
  };

  return (
    <div className="ob-form-body">
      <Alert type="info">
        KYC verification is mandatory per RBI & government guidelines. Your documents are stored securely and reviewed within 2 business days.
      </Alert>

      <div className="ob-section-title">Verification Type</div>

      <div className="ob-kyc-tabs">
        {isIndividual && (
          <>
            <button type="button" className={`ob-kyc-tab ${data.kycType === "pan_aadhaar" ? "active" : ""}`}
              onClick={() => setData(d => ({ ...d, kycType: "pan_aadhaar" }))}>
              PAN + Aadhaar
            </button>
            <button type="button" className={`ob-kyc-tab ${data.kycType === "pan_only" ? "active" : ""}`}
              onClick={() => setData(d => ({ ...d, kycType: "pan_only" }))}>
              PAN Only
            </button>
          </>
        )}
        {!isIndividual && (
          <>
            <button type="button" className={`ob-kyc-tab ${data.kycType === "pan_gstin" ? "active" : ""}`}
              onClick={() => setData(d => ({ ...d, kycType: "pan_gstin" }))}>
              PAN + GSTIN
            </button>
          </>
        )}
        <button type="button" className={`ob-kyc-tab ${data.kycType === "store_doc" ? "active" : ""}`}
          onClick={() => setData(d => ({ ...d, kycType: "store_doc" }))}>
          Store Document
        </button>
      </div>

      {(data.kycType === "pan_aadhaar" || data.kycType === "pan_only") && (
        <>
          <div className="ob-row ob-row-2">
            <Field label="PAN Card Number" required error={errors.panNumber} hint="Same as entered in Tax Details">
              <Input value={data.panNumber} onChange={setUpper("panNumber")} placeholder="ABCDE1234F" maxLength={10} error={errors.panNumber} />
            </Field>
            {data.kycType === "pan_aadhaar" && (
              <Field label="Aadhaar Number" required error={errors.aadhaarNumber} hint="12-digit Aadhaar">
                <Input value={data.aadhaarNumber} onChange={set("aadhaarNumber")} placeholder="XXXX XXXX XXXX" maxLength={12} error={errors.aadhaarNumber} />
              </Field>
            )}
          </div>
        </>
      )}

      {data.kycType === "pan_gstin" && (
        <div className="ob-row ob-row-2">
          <Field label="PAN Number" required error={errors.panNumber}>
            <Input value={data.panNumber} onChange={setUpper("panNumber")} placeholder="ABCDE1234F" maxLength={10} error={errors.panNumber} />
          </Field>
          <Field label="GSTIN" required error={errors.gstinNumber}>
            <Input value={data.gstinNumber} onChange={setUpper("gstinNumber")} placeholder="22AAAAA0000A1Z5" maxLength={15} error={errors.gstinNumber} />
          </Field>
        </div>
      )}

      {data.kycType === "store_doc" && (
        <div className="ob-row ob-row-2">
          <Field label="Document Number" required error={errors.documentNumber}>
            <Input value={data.documentNumber} onChange={set("documentNumber")} placeholder="Document ID / reference number" error={errors.documentNumber} />
          </Field>
        </div>
      )}

      <div className="ob-section-title">Document Upload</div>

      <div className="ob-row ob-row-1">
        <FileUpload
          label="Upload Supporting Document"
          accept="image/png, image/jpeg, image/webp, application/pdf"
          preview={data.documentPreview}
          previewType={data.documentIsImage ? "image" : "doc"}
          onChange={handleDocFile}
          hint="PAN card / Aadhaar (front) / GSTIN certificate / Store licence • Max 5MB"
        />
        {errors.documentFile && <span className="ob-err-msg">⚠ {errors.documentFile}</span>}
      </div>
    </div>
  );
}

function validateKyc(d) {
  const e = {};
  if (d.kycType === "pan_aadhaar") {
    const p = V.pan(d.panNumber); if (p) e.panNumber = p;
    const a = V.aadhaar(d.aadhaarNumber); if (a) e.aadhaarNumber = a;
  } else if (d.kycType === "pan_only") {
    const p = V.pan(d.panNumber); if (p) e.panNumber = p;
  } else if (d.kycType === "pan_gstin") {
    const p = V.pan(d.panNumber); if (p) e.panNumber = p;
    const g = V.gstin(d.gstinNumber); if (g) e.gstinNumber = g;
  } else if (d.kycType === "store_doc") {
    if (!d.documentNumber.trim()) e.documentNumber = "Document number is required";
  }
  if (!d.documentFile) e.documentFile = "Please upload a supporting document";
  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                */
/* ═══════════════════════════════════════════════════════════════ */
export default function SellerOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);

  // Handle step from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = parseInt(params.get("step"));
    if (s >= 1 && s <= 7) {
      setStep(s);
    }
  }, [location.search]);
  const [done, setDone] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [savedAt, setSavedAt] = useState(null);

  // Form state per section
  const [basicData, setBasicData] = useState(INIT_STATE.basic);
  const [bizData, setBizData]     = useState(INIT_STATE.business);
  const [taxData, setTaxData]     = useState(INIT_STATE.tax);
  const [bankData, setBankData]   = useState(INIT_STATE.bank);
  const [storeData, setStoreData] = useState(INIT_STATE.store);
  const [compData, setCompData]   = useState(INIT_STATE.compliance);
  const [kycData, setKycData]     = useState(INIT_STATE.kyc);

  // Load draft on mount (User-specific)
  useEffect(() => {
    if (!user?.email) return;

    try {
      const draftKey = `td_onboarding_draft_${user.email}`;
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.basic) setBasicData(b => ({ 
          ...b, 
          ...d.basic, 
          // Identity fields should always reflect the current logged-in user
          email: user.email || d.basic.email,
          fullName: user.fullName || user.name || d.basic.fullName || "",
          mobileVerified: false, otpSent: false, otpTimer: 0, devOtp: "" 
        }));
        if (d.business)   setBizData(b => ({ ...b, ...d.business }));
        if (d.tax)        setTaxData(b => ({ ...b, ...d.tax }));
        if (d.bank)       setBankData(b => ({ ...b, ...d.bank }));
        if (d.store)      setStoreData(b => ({ ...b, ...d.store, logoFile: null, logoPreview: "", bannerFile: null, bannerPreview: "" }));
        if (d.compliance) setCompData(b => ({ ...b, ...d.compliance }));
        if (d.kyc)        setKycData(b => ({ ...b, ...d.kyc, documentFile: null, documentPreview: "" }));
        if (d.step)       setStep(d.step);
        if (d.completedSteps) setCompletedSteps(new Set(d.completedSteps));
      } else {
        // If no user-specific draft, reset to initial state to ensure clean form
        setBasicData({ 
          ...INIT_STATE.basic, 
          email: user.email, 
          fullName: user.fullName || user.name || "" 
        });
        setBizData(INIT_STATE.business);
        setTaxData(INIT_STATE.tax);
        setBankData(INIT_STATE.bank);
        setStoreData(INIT_STATE.store);
        setCompData(INIT_STATE.compliance);
        setKycData(INIT_STATE.kyc);
        setStep(1);
        setCompletedSteps(new Set());
      }
    } catch {}
  }, [user?.email]);

  // Auto-save draft (User-specific)
  const saveDraft = useCallback(() => {
    if (!user?.email) return;

    try {
      const draft = {
        step,
        completedSteps: [...completedSteps],
        basic:      { ...basicData,  otp: "", devOtp: "" },
        business:   bizData,
        tax:        taxData,
        bank:       bankData,
        store:      { ...storeData,  logoFile: null, bannerFile: null },
        compliance: compData,
        kyc:        { ...kycData,    documentFile: null, documentPreview: "" },
      };
      const draftKey = `td_onboarding_draft_${user.email}`;
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {}
  }, [user?.email, step, completedSteps, basicData, bizData, taxData, bankData, storeData, compData, kycData]);

  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [saveDraft]);

  // Step validation map
  const validators = {
    1: () => validateBasic(basicData),
    2: () => validateBusiness(bizData),
    3: () => validateTax(taxData, bizData.businessType),
    4: () => validateBank(bankData),
    5: () => validateStore(storeData),
    6: () => validateCompliance(compData),
    7: () => validateKyc(kycData),
  };

  const handleNext = () => {
    const errs = validators[step]();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setCompletedSteps(prev => new Set([...prev, step]));
    if (step < 7) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!user?.email) return;

    try {
      const fd = new FormData();
      fd.append("email", user.email);

      // Basic Info
      fd.append("fullName", basicData.fullName);
      fd.append("mobile", basicData.mobile);

      // Business Details
      fd.append("businessType", bizData.businessType);
      fd.append("businessName", bizData.businessName);
      fd.append("address", bizData.address);
      fd.append("city", bizData.city);
      fd.append("state", bizData.state);
      fd.append("pincode", bizData.pincode);
      fd.append("country", bizData.country);
      fd.append("legalName", bizData.legalName);

      // Tax Info
      fd.append("panNumber", taxData.panNumber);
      fd.append("gstin", taxData.gstin);

      // Bank Details
      fd.append("bankDetails", JSON.stringify({
        accountHolderName: bankData.accountHolderName,
        bankName: bankData.bankName,
        accountNumber: bankData.accountNumber,
        ifscCode: bankData.ifscCode,
        branchName: bankData.branchName,
        accountType: bankData.accountType
      }));

      // Store Setup
      fd.append("storeName", storeData.storeName);
      fd.append("storeDescription", storeData.storeDescription);
      fd.append("pickupAddress", storeData.pickupAddress);
      fd.append("pickupCity", storeData.pickupCity);
      fd.append("pickupState", storeData.pickupState);
      fd.append("pickupPincode", storeData.pickupPincode);
      fd.append("returnAddress", storeData.returnAddress);
      fd.append("instagramUrl", storeData.instagramUrl);
      fd.append("facebookUrl", storeData.facebookUrl);
      fd.append("twitterUrl", storeData.twitterUrl);
      if (storeData.logoFile) fd.append("logoFile", storeData.logoFile);
      if (storeData.bannerFile) fd.append("bannerFile", storeData.bannerFile);

      // KYC Verification
      fd.append("kycType", kycData.kycType);
      fd.append("aadhaarNumber", kycData.aadhaarNumber || "");
      fd.append("documentNumber", kycData.documentNumber || kycData.gstinNumber || kycData.panNumber || "");
      if (kycData.documentFile) fd.append("documentFile", kycData.documentFile);

      const res = await completeOnboarding(fd);
      
      if (res.success) {
        // Clear draft only on success
        const draftKey = `td_onboarding_draft_${user.email}`;
        localStorage.removeItem(draftKey);
        localStorage.removeItem("td_onboarding_draft");
        setDone(true);
      } else {
        setErrors({ submit: res.message || "Failed to save details. Please try again." });
      }
    } catch (err) {
      console.error("[Submit] Error:", err);
      setErrors({ submit: "An error occurred while saving your details. Please check your connection." });
    }
  };

  const handleStepClick = (s) => {
    if (s < step || completedSteps.has(s - 1) || s === 1) {
      setErrors({});
      setStep(s);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progress = Math.round(((completedSteps.size) / 7) * 100);

  const STEP_META = [
    { title: "Tell us about yourself", em: "yourself", desc: "Your basic contact information and mobile verification. This helps buyers trust your store." },
    { title: "Your business details", em: "business", desc: "Provide your business type, registered name and address. This is required for onboarding compliance." },
    { title: "Tax information", em: "Tax", desc: "Your PAN and GSTIN details are required for invoice generation and TDS compliance." },
    { title: "Bank account details", em: "Bank", desc: "We'll use this account to transfer your weekly payouts after successful order deliveries." },
    { title: "Set up your store", em: "store", desc: "Create a compelling storefront — your logo, banner, description, and pickup details." },
    { title: "Legal agreements", em: "agreements", desc: "Review and accept our seller policies before you start listing your beautiful drapes." },
    { title: "KYC verification", em: "KYC", desc: "Upload identity documents to verify your account. This is a one-time process." },
  ];

  const meta = STEP_META[step - 1];

  if (done) {
    return (
      <>
        <style>{CSS}</style>
        <div className="ob-root">
          <header className="ob-header">
            <div className="ob-header-brand">
              <div className="ob-header-logo">Trendy <em>Drapes</em></div>
              <span className="ob-header-badge">Seller Center</span>
            </div>
          </header>
          <div className="ob-success">
            <div className="ob-success-icon">🎉</div>
            <div className="ob-success-eyebrow">Onboarding Complete</div>
            <h1 className="ob-success-title">Welcome to <em>Trendy Drapes</em></h1>
            <p className="ob-success-desc">
              Your seller account is now set up and under review. We'll verify your KYC within 2 business days and notify you by email. You can start exploring your dashboard right away.
            </p>
            <button className="ob-success-btn" onClick={() => navigate("/seller/dashboard", { replace: true })}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="ob-root">

        {/* ── Header ── */}
        <header className="ob-header">
          <div className="ob-header-brand">
            <div className="ob-header-logo">Trendy <em>Drapes</em></div>
            <span className="ob-header-badge">Seller Onboarding</span>
          </div>
          <div className="ob-header-right">
            {savedAt && (
              <div className="ob-header-save">
                <div className="ob-save-dot" />
                Draft saved {savedAt}
              </div>
            )}
            <div className="ob-header-step-count">
              Step <strong>{step}</strong> of 7
            </div>
          </div>
        </header>

        {/* ── Mobile step dots ── */}
        <div className="ob-mobile-steps" style={{ display: "flex", padding: "0.75rem 1.25rem", gap: "0.4rem", borderBottom: `1px solid ${T.border}`, background: T.surfaceWarm }}>
          {STEPS.map(s => (
            <div
              key={s.id}
              className={`ob-mobile-step-dot ${s.id === step ? "active" : ""} ${completedSteps.has(s.id) ? "done" : ""}`}
              onClick={() => handleStepClick(s.id)}
              style={{ cursor: "pointer" }}
            >
              {completedSteps.has(s.id) ? "✓" : s.icon}
            </div>
          ))}
        </div>

        <div className="ob-layout">

          {/* ── Sidebar ── */}
          <nav className="ob-sidebar">
            <div className="ob-sidebar-inner">
              <div className="ob-sidebar-eyebrow">Setup Progress</div>

              <div className="ob-sidebar-progress">
                <div className="ob-sidebar-progress-track">
                  <div className="ob-sidebar-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="ob-sidebar-progress-label">{completedSteps.size} of 7 steps completed</div>
              </div>

              {STEPS.map((s, i) => {
                const isActive = s.id === step;
                const isDone = completedSteps.has(s.id);
                const isLocked = s.id > step && !completedSteps.has(s.id - 1) && s.id !== 1;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`ob-step-btn ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                    onClick={() => handleStepClick(s.id)}
                    disabled={isLocked}
                    style={{ opacity: isLocked ? 0.45 : 1 }}
                  >
                    <div className="ob-step-num">
                      {isDone ? "✓" : s.icon}
                    </div>
                    <div className="ob-step-info">
                      <div className="ob-step-label-text">{s.label}</div>
                      <div className="ob-step-desc-text">{isDone ? "Completed" : s.desc}</div>
                    </div>
                    {isDone && <span className="ob-step-check">✓</span>}
                  </button>
                );
              })}

              <div className="ob-sidebar-divider" />
              <div style={{ padding: "0 1.75rem" }}>
                <div style={{ fontSize: "0.68rem", color: T.muted, lineHeight: 1.6, letterSpacing: "0.03em" }}>
                  🔒 Your data is encrypted and securely stored. Draft progress is saved automatically.
                </div>
              </div>
            </div>
          </nav>

          {/* ── Main content ── */}
          <main className="ob-main">
            <div className="ob-step-panel" key={step}>

              {/* Step header */}
              <div className="ob-panel-header">
                <div className="ob-panel-eyebrow">Step {step} of 7 — {STEPS[step - 1].label}</div>
                <h2 className="ob-panel-title">{meta.title}</h2>
                <p className="ob-panel-desc">{meta.desc}</p>
              </div>

              {/* Step body */}
              {step === 1 && <StepBasic data={basicData} setData={setBasicData} errors={errors} setErrors={setErrors} user={user} />}
              {step === 2 && <StepBusiness data={bizData} setData={setBizData} errors={errors} />}
              {step === 3 && <StepTax data={taxData} setData={setTaxData} errors={errors} bizType={bizData.businessType} />}
              {step === 4 && <StepBank data={bankData} setData={setBankData} errors={errors} />}
              {step === 5 && <StepStore data={storeData} setData={setStoreData} errors={errors} />}
              {step === 6 && <StepCompliance data={compData} setData={setCompData} errors={errors} />}
              {step === 7 && <StepKyc data={kycData} setData={setKycData} errors={errors} bizType={bizData.businessType} />}

              {errors.submit && (
                <div className="ob-alert error" style={{ marginTop: "1.5rem" }}>
                  <span>⚠</span> {errors.submit}
                </div>
              )}

              {/* Navigation */}
              <div className="ob-nav">
                <button
                  type="button"
                  className="ob-nav-back"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  ← Previous
                </button>

                <div className="ob-nav-right">
                  <button type="button" className="ob-nav-save" onClick={saveDraft}>
                    Save Draft
                  </button>
                  <button
                    type="button"
                    className={`ob-nav-next ${step === 7 ? "ob-nav-submit" : ""}`}
                    onClick={handleNext}
                  >
                    {step === 7 ? "Submit & Finish ✓" : "Continue →"}
                  </button>
                </div>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}