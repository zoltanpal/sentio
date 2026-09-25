import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DropdownMenu } from "radix-ui";
import {
  ChevronDownIcon,
  Grid2X2Icon,
  LogOutIcon,
  StarIcon,
  UserRoundIcon,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/auth/firebase";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  useEffect(() => {
    try {
      return onAuthStateChanged(
        getFirebaseAuth(),
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          setError("");
        },
        () => {
          setLoading(false);
          setError("Account status unavailable. Please refresh the page.");
        },
      );
    } catch {
      setLoading(false);
      setError("Account status unavailable. Please refresh the page.");
    }
  }, []);

  async function logout() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await signOut(getFirebaseAuth());
      setOpen(false);
    } catch {
      setError("Could not log out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading account"
        className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-slate-100 sm:h-9 sm:w-9"
      />
    );
  }

  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/login"
          className="whitespace-nowrap rounded-sm px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="whitespace-nowrap rounded-sm bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 sm:px-4"
        >
          Sign up
        </Link>
        {error && (
          <span role="alert" className="max-w-40 text-xs text-red-700">
            {error}
          </span>
        )}
      </div>
    );
  }

  const name =
    user.displayName?.trim() || user.email?.split("@")[0] || "Your account";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();
  const photo =
    user.photoURL && user.photoURL !== failedPhoto ? user.photoURL : null;

  const itemClass =
    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100";

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${name}`}
          className="flex shrink-0 items-center gap-1.5 rounded-2xl p-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-teal-800 sm:h-9 sm:w-9">
            {photo ? (
              <img
                src={photo}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailedPhoto(photo)}
                className="h-full w-full object-cover"
              />
            ) : (
              initials || <UserRoundIcon className="h-4 w-4" />
            )}
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className="h-4 w-4 text-slate-500"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-44 max-w-[calc(100vw-24px)] rounded-md border border-slate-200 bg-white p-1 shadow-lg outline-none"
        >
          <DropdownMenu.Item asChild className={`${itemClass} lg:hidden`}>
            <Link to="/dashboard">
              <Grid2X2Icon aria-hidden="true" className="h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild className={`${itemClass} lg:hidden`}>
            <Link to="/watchlist">
              <StarIcon aria-hidden="true" className="h-4 w-4" />
              Watchlist
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild className={itemClass}>
            <Link to="/user_profile">
              <UserRoundIcon aria-hidden="true" className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />

          <DropdownMenu.Item
            disabled={busy}
            onSelect={(event) => {
              event.preventDefault();
              void logout();
            }}
            className={`${itemClass} data-[disabled]:pointer-events-none data-[disabled]:opacity-50`}
          >
            <LogOutIcon aria-hidden="true" className="h-4 w-4" />
            {busy ? "Logging out…" : "Log out"}
          </DropdownMenu.Item>

          {error && (
            <p role="alert" className="px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}