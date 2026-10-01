import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import type { User } from "firebase/auth";
import { buildSentioApiUrl } from "@/config/api";

import { getFirebaseAuth } from "@/auth/firebase";
import { clearUserCache, getUserData } from "@/auth/userSession";

function messageFor(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "The email or password is incorrect.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";

      case "auth/network-request-failed":
        return "Could not connect. Check your internet connection.";

      case "auth/popup-blocked":
        return "Please allow popups for this site and try again.";

      case "auth/unauthorized-domain":
        return "Google sign-in is not configured for this website yet.";

      case "auth/account-exists-with-different-credential":
        return "Please sign in using the method you originally used for this account.";

      case "auth/user-disabled":
        return "This account is disabled.";

      case "auth/operation-not-allowed":
        return "This sign-in method is currently unavailable.";

      default:
        return "Unable to sign in. Please try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete the request. Please try again.";
}


export async function ensureDatabaseUser(user: User): Promise<boolean> {
  // Refresh the verification status after the email link was clicked.
  await user.reload();

  if (!user.emailVerified) {
    return false;
  }

  // Refresh the token so it contains email_verified: true
  // and the latest profile information.
  const token = await user.getIdToken(true);

  const response = await fetch(buildSentioApiUrl("/user"), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not finish setting up your Sentio account.");
  }

  return true;
}




export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [pending, setPending] = useState<
    "email" | "google" | "reset" | null
  >(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const lock = useRef(false);
  const busy = pending !== null;

  

  function start(kind: "email" | "google" | "reset"): boolean {
    if (lock.current) return false;

    lock.current = true;
    setPending(kind);
    setError("");
    setNotice("");

    return true;
  }

  function finish() {
    lock.current = false;
    setPending(null);
  }

  async function completeLogin(user: User) {
    setPassword("");
    clearUserCache();

    const verified = await ensureDatabaseUser(user);

    if (!verified) {
      setError(
        "Please verify your email using the link in your inbox, then log in again.",
      );
      return;
    }

    // The database user now exists, so fetch and cache their data.
    await getUserData(true);

    navigate("/dashboard", { replace: true });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!start(resetMode ? "reset" : "email")) return;

    try {
      const auth = getFirebaseAuth();

      if (resetMode) {
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (reason) {
          // Do not reveal whether an email is registered.
          if (
            !(
              reason instanceof FirebaseError &&
              reason.code === "auth/user-not-found"
            )
          ) {
            throw reason;
          }
        }

        setNotice(
          "If this email has an eligible account, a password reset link has been sent. Check your inbox and spam folder.",
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        const { user } = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        await completeLogin(user);
      }
    } catch (reason) {
      setError(messageFor(reason));
    } finally {
      finish();
    }
  }

  async function googleLogin() {
    if (!start("google")) return;

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      await signInWithPopup(getFirebaseAuth(), provider);

      const { user } = await signInWithPopup(
        getFirebaseAuth(),
        provider,
      );

      await completeLogin(user);
    } catch (reason) {
      const cancelled =
        reason instanceof FirebaseError &&
        [
          "auth/popup-closed-by-user",
          "auth/cancelled-popup-request",
        ].includes(reason.code);

      if (!cancelled) {
        setError(messageFor(reason));
      }
    } finally {
      finish();
    }
  }

  function toggleReset() {
    setResetMode((current) => !current);
    setPassword("");
    setError("");
    setNotice("");
  }

  const inputClass =
    "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60";

  const buttonClass =
    "h-11 w-full rounded-full bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60";

  return (
    <main className="flex min-h-screen justify-center bg-white px-6 py-12 text-slate-900 sm:py-20">
      <section
        className="w-full max-w-[420px]"
        aria-labelledby="login-title"
      >
        <h1
          id="login-title"
          className="text-3xl font-bold tracking-tight"
        >
          {resetMode ? "Reset your password" : "Welcome back"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {resetMode
            ? "Enter your email to request a reset link."
            : "Log in to your Sentio account."}
        </p>

        <form
          onSubmit={submit}
          className="mt-7 space-y-4"
          aria-busy={busy}
        >
          <div>
            <label
              htmlFor="login-email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={busy}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          {!resetMode && (
            <div>
              <label
                htmlFor="login-password"
                className="text-sm font-medium"
              >
                Password
              </label>

              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={busy}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />

              <div className="mt-2 text-right">
                <button
                  type="button"
                  disabled={busy}
                  onClick={toggleReset}
                  className="text-xs font-medium text-teal-700 hover:underline disabled:opacity-60"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={buttonClass}
          >
            {pending === "reset"
              ? "Sending…"
              : pending === "email"
                ? "Logging in…"
                : resetMode
                  ? "Send reset link"
                  : "Log in"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-4 text-sm leading-6 text-teal-800"
          >
            {notice}
          </p>
        )}

        {resetMode ? (
          <button
            type="button"
            disabled={busy}
            onClick={toggleReset}
            className="mt-5 text-sm font-medium text-teal-700 hover:underline"
          >
            Back to login
          </button>
        ) : (
          <>
            <div
              className="my-6 flex items-center gap-4"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={googleLogin}
              className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60"
            >
              {pending === "google"
                ? "Connecting to Google…"
                : "Continue with Google"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-teal-700 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </>
        )}

        <p className="mt-5 text-center">
          <Link
            to="/dashboard"
            className="text-sm text-blue-500 hover:text-teal-700"
          >
            Back to Dashboard
          </Link>
        </p>
      </section>
    </main>
  );
}