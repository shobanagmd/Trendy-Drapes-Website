/**
 * ─────────────────────────────────────────────────────────────────
 *  AccountRedirect.jsx
 *
 *  NEW FILE. Does not modify Navbar.jsx or Account.jsx.
 *
 *  The Navbar has:
 *    <Link to="/account">My Account</Link>
 *
 *  We can't change Navbar, but we CAN replace what renders at /account.
 *  This component simply redirects /account → /seller so that
 *  "My Account" in the navbar leads to the Seller Auth page.
 *
 *  It is registered in App.jsx in place of <Account />.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AccountRedirect() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  useEffect(() => {
    if (user && role === "seller") {
      const onboardingDone = user.onboardingCompleted === true;
      navigate(onboardingDone ? "/seller/dashboard" : "/seller/onboarding", { replace: true });
    } else {
      navigate("/seller", { replace: true });
    }
  }, [user, role, navigate]);

  // Nothing to render; redirect fires immediately
  return null;
}
