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

export default function AccountRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to seller auth (or straight to dashboard if already logged in)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    navigate(isLoggedIn ? "/seller/dashboard" : "/seller", { replace: true });
  }, [navigate]);

  // Nothing to render; redirect fires immediately
  return null;
}
