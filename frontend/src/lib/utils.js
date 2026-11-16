import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CATEGORY_IMAGES } from "@/lib/images";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PLACEHOLDER_EVENT = "/default-event.svg";
const PLACEHOLDER_AVATAR = "/default-avatar.svg";

export const getEventImage = (event) =>
  event?.images?.find((img) => img.isMain)?.url ||
  event?.images?.[0]?.url ||
  CATEGORY_IMAGES[event?.category] ||
  PLACEHOLDER_EVENT;

// Use as onError on <img> so a broken/blocked image falls back to the local placeholder
export const imgFallback = (e) => {
  if (!e.currentTarget.dataset.fallback) {
    e.currentTarget.dataset.fallback = "1";
    e.currentTarget.src = PLACEHOLDER_EVENT;
  }
};

export const getAvatar = (user) => user?.profilePhoto || PLACEHOLDER_AVATAR;

export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export const formatINR = (amount = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";
