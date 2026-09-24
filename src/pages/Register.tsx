import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendEmailVerification, 
  GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, updateProfile, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/auth/firebase";



function errorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use": return "Unable to create an account with this email. If you already registered, use your existing account.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/weak-password":
      case "auth/password-does-not-meet-requirements": return "Your password does not meet the password requirements. Please choose a stronger password.";
      case "auth/too-many-requests": return "Too many attempts. Please wait before trying again.";
      case "auth/network-request-failed": return "Could not connect. Check your internet connection and try again.";
      case "auth/operation-not-allowed": return "This sign-in method is currently unavailable.";
      case "auth/popup-blocked": return "Please allow popups for this site and try again.";
      case "auth/unauthorized-domain": return "Google sign-in is not configured for this website yet.";
      case "auth/account-exists-with-different-credential": return "An account already exists with another sign-in method. Sign in using that method first; linking Google requires a separate step.";
      default: return "Registration could not be completed. Please try again.";
    }
  }
  return "Registration is currently unavailable. Please try again later.";
}



export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [googleResult, setGoogleResult] = useState<"new" | "returning" | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const lock = useRef(false);

  async function continueWithGoogle() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setGoogleBusy(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      // Start the popup directly from the click handler (no preceding awaits).
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      setGoogleResult(getAdditionalUserInfo(result)?.isNewUser ? "new" : "returning");
      setCreatedUser(result.user);
      setPassword("");
      
    } catch (reason) {
      // Closing the account picker is a cancellation, not a registration failure.
      if (!(reason instanceof FirebaseError &&
        ["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(reason.code))) {
        setError(errorMessage(reason));
      }
    } finally {
      lock.current = false;
      setBusy(false);
      setGoogleBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    if (!nickname.trim()) {
      setError("Please enter your nickname.");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        setError("A Firebase account is already signed in in this browser. Sign out before creating another account.");
        return;
      }
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Account creation and email delivery are separate outcomes. Never offer
      // to create the account again if only email delivery failed.
      setCreatedUser(user);
      try {
        await updateProfile(user, { displayName: nickname.trim() });
      } catch {
        setError("Your account was created, but your name could not be saved.");
      }
      setPassword("");
      
      try {
        await sendEmailVerification(user);
        setEmailSent(true);
      } catch {
        setError("Your account was created, but the verification email could not be sent. Please try sending it again.");
      }
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function retryEmail() {
    if (!createdUser || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await sendEmailVerification(createdUser);
      setEmailSent(true);
    } catch {
      setError("Could not send the email. Please wait a little and try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const inputClass = "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60";
  const buttonClass = "h-12 w-full rounded-full bg-blue-700 px-4 font-medium text-white shadow-lg shadow-blue-700/10 transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60";

  return (
    <main className="flex min-h-screen justify-center bg-white px-6 py-12 text-slate-900 sm:py-20">
      <section className="w-full max-w-[480px]" aria-labelledby="register-title">
        <h1 id="register-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {createdUser ? (googleResult === "returning" ? "Welcome back" : "Account created") : "Create your account"}
        </h1>
        {!createdUser && <p className="mt-3 text-base text-slate-500">Get started with Sentio.</p>}
        {createdUser ? (
          <div className="mt-6 space-y-5">
            <p role="status" className="text-base leading-7 text-slate-500">
              {googleResult ? `You are signed in with Google as ${createdUser.email || createdUser.displayName || "your Google account"}.` : emailSent ? `We sent a verification link to ${createdUser.email}. Check your inbox and spam folder, then open the link to verify your email.` : "Your account has been created. Email verification is still pending."}
            </p>
            {!googleResult && !emailSent && <button type="button" onClick={retryEmail} disabled={busy} className={buttonClass}>{busy ? "Sending…" : "Send verification email"}</button>}
            <Link to="/" className="inline-block font-medium text-teal-700 hover:underline">Back to Sentio</Link>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="mt-8 space-y-4" aria-busy={busy}>
              <div>
                <label htmlFor="nickname" className="text-base font-medium">Nickname/Username</label>
                <input id="nickname" name="nickname" type="text" autoComplete="nickname" placeholder="Your nickname" maxLength={100} required disabled={busy} value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className="text-base font-medium">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required disabled={busy} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="password" className="text-base font-medium">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Enter your password" minLength={6} required disabled={busy} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              </div>
              <div className="pt-1">
                <button type="submit" disabled={busy} className={buttonClass}>{busy && !googleBusy ? "Creating account…" : "Create account"}</button>
              </div>
            </form>
            <div className="my-7 flex items-center gap-4" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" /><span className="text-sm text-slate-400">or</span><span className="h-px flex-1 bg-slate-200" />
            </div>
            <button type="button" onClick={continueWithGoogle} disabled={busy}
              className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60">
              {googleBusy ? "Connecting to Google…" : "Continue with Google"}
            </button>
            <p className="mt-5 text-center"><Link to="/dashboard" className="text-2m text-blue-500 hover:text-teal-700">Back to Dashboard</Link></p>
          </>
        )}
        {error && <p role="alert" className="mt-5 text-sm leading-6 text-red-700">{error}</p>}
      </section>
    </main>
  );
}
