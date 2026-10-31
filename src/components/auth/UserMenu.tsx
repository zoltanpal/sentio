import { useState } from "react";
import { Link } from "react-router-dom";
import { DropdownMenu } from "radix-ui";
import {
  ChevronDownIcon,
  Grid2X2Icon,
  LogInIcon,
  LogOutIcon,
  StarIcon,
  UserPlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { signOut } from "firebase/auth";

import { getFirebaseAuth } from "@/auth/firebase";
import { useUserSession } from "@/auth/UserSessionContext";

export default function UserMenu() {
  const { user, authLoading, authError } = useUserSession();

  const [busy, setBusy] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [open, setOpen] = useState(false);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  const error = logoutError || authError;

  const itemClass =
    "flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 py-2 " +
    "text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100";

  const contentClass =
    "z-50 w-48 max-w-[calc(100vw-24px)] rounded-xl " +
    "border border-slate-200 bg-white p-1 shadow-lg outline-none";

  async function logout() {
    if (busy) return;

    setBusy(true);
    setLogoutError("");

    try {
      await signOut(getFirebaseAuth());
      setOpen(false);
    } catch {
      setLogoutError("Could not log out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return (
      <div
        role="status"
        aria-label="Loading account"
        className="flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {/* Compact account menu on mobile and tablet */}
        <div className="shrink-0 lg:hidden">
          <DropdownMenu.Root open={open} onOpenChange={setOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 outline-none hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
              >
                <UserRoundIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                collisionPadding={12}
                className={`${contentClass} lg:hidden`}
              >
                <DropdownMenu.Item asChild className={itemClass}>
                  <Link to="/login">
                    <LogInIcon aria-hidden="true" className="h-4 w-4" />
                    Log in
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild className={itemClass}>
                  <Link to="/register">
                    <UserPlusIcon aria-hidden="true" className="h-4 w-4" />
                    Create account
                  </Link>
                </DropdownMenu.Item>

                {error && (
                  <p role="alert" className="px-3 py-2 text-xs text-red-700">
                    {error}
                  </p>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Text buttons on desktop */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            to="/login"
            className="whitespace-nowrap rounded-sm px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="whitespace-nowrap rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Sign up
          </Link>

          {error && (
            <span role="alert" className="max-w-40 text-xs text-red-700">
              {error}
            </span>
          )}
        </div>
      </>
    );
  }

  const name =
    user.displayName?.trim() || user.email?.split("@")[0] || "Your account";

  const photo =
    user.photoURL && user.photoURL !== failedPhoto ? user.photoURL : null;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 lg:w-auto lg:gap-1.5 lg:rounded-2xl lg:px-1"
        >
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-slate-600 lg:h-9 lg:w-9">
            {photo ? (
              <img
                src={photo}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailedPhoto(photo)}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRoundIcon aria-hidden="true" className="h-5 w-5" />
            )}
          </span>

          <ChevronDownIcon
            aria-hidden="true"
            className="hidden h-4 w-4 text-slate-500 lg:block"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className={contentClass}
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