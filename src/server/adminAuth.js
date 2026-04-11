import { getSupabaseAuthClient } from "@/server/supabaseServer";
import { createHttpError } from "@/server/httpError";

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const getAllowedAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
};

export const verifyAdminAccessToken = async (token) => {
  if (!token) {
    throw createHttpError(401, "Missing access token.");
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    throw createHttpError(503, "Supabase auth is not configured.");
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw createHttpError(401, "Invalid or expired session.");
  }

  if (!data.user.email) {
    throw createHttpError(403, "Admin account email is missing.");
  }

  const userEmail = normalizeEmail(data.user.email);
  const allowList = getAllowedAdminEmails();
  if (allowList.length === 0) {
    throw createHttpError(503, "ADMIN_EMAILS is not configured for admin access.");
  }

  if (!allowList.includes(userEmail)) {
    throw createHttpError(
      403,
      "This account is not allowed to manage team photos. Contact an administrator to request access."
    );
  }

  return data.user;
};
