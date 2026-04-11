import { randomUUID } from "node:crypto";
import { teamData } from "@/data/teamData";
import { getSupabaseAdminClient } from "@/server/supabaseServer";
import { createHttpError } from "@/server/httpError";

const ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "team-photos";

const mapRowToMember = (row) => ({
  id: row.member_id,
  name: row.name,
  slug: row.slug,
  title: row.title,
  category: row.category,
  description: row.description,
  image: row.image_url,
  credentials: row.credentials,
  age: row.age,
  languages: row.languages,
  about: row.about,
  areasOfFocus: row.areas_of_focus || [],
  approach: row.approach || [],
  location: row.location || undefined,
  registration: row.registration || undefined,
  certifications: row.certifications || undefined,
  experience: row.experience || undefined,
});

const mapMemberToRow = (member) => ({
  member_id: member.id,
  name: member.name,
  slug: member.slug,
  title: member.title,
  category: member.category,
  description: member.description,
  image_url: member.image,
  credentials: member.credentials,
  age: member.age,
  languages: member.languages,
  about: member.about,
  areas_of_focus: member.areasOfFocus || [],
  approach: member.approach || [],
  location: member.location || null,
  registration: member.registration || null,
  certifications: member.certifications || null,
  experience: member.experience || null,
});

const getStoragePathFromPublicUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
};

export const isSupabaseConfigured = () => Boolean(getSupabaseAdminClient());

const ensureSeedData = async (supabase) => {
  const { count, error: countError } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count || 0) > 0) {
    return;
  }

  const seedRows = teamData.allMembers.map(mapMemberToRow);
  const { error: seedError } = await supabase.from("team_members").insert(seedRows);
  if (seedError) {
    throw new Error(seedError.message);
  }
};

export const getTeamMembers = async () => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return teamData.allMembers;
  }

  await ensureSeedData(supabase);

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("member_id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapRowToMember);
};

export const createTeamMember = async ({ name, mimeType, base64Data }) => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw createHttpError(503, "Supabase is not configured on this deployment.");
  }

  if (!name || typeof name !== "string") {
    throw createHttpError(400, "Team member name is required.");
  }

  const extension = ALLOWED_MIME_TYPES[mimeType];
  if (!extension) {
    throw createHttpError(400, "Only JPG, PNG, and WEBP images are allowed.");
  }

  if (!base64Data || typeof base64Data !== "string") {
    throw createHttpError(400, "Image data is required.");
  }

  const imageBuffer = Buffer.from(base64Data, "base64");
  if (imageBuffer.byteLength === 0 || imageBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw createHttpError(400, "Image must be greater than 0 bytes and up to 5MB.");
  }

  // Get max member_id
  const { data: maxIdData, error: maxIdError } = await supabase
    .from("team_members")
    .select("member_id")
    .order("member_id", { ascending: false })
    .limit(1);

  if (maxIdError) {
    throw createHttpError(500, maxIdError.message);
  }

  const nextMemberId = (maxIdData?.[0]?.member_id || 0) + 1;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + nextMemberId;

  // Upload image
  const filePath = `${nextMemberId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, imageBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) {
    throw createHttpError(400, uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  // Insert into DB
  const newRow = {
    member_id: nextMemberId,
    name: name,
    slug: slug,
    title: "New Team Member",
    category: "uncategorized",
    description: "Bio description to be added.",
    image_url: publicUrlData.publicUrl,
    credentials: "TBD",
    age: "All ages",
    languages: "English",
    about: "More about this member soon.",
    areas_of_focus: [],
    approach: [],
  };

  const { data: inserted, error: insertError } = await supabase
    .from("team_members")
    .insert([newRow])
    .select("*")
    .single();

  if (insertError || !inserted) {
    throw createHttpError(500, insertError?.message || "Failed to create new team member.");
  }

  return mapRowToMember(inserted);
};

export const updateTeamMemberPhoto = async ({ slug, newName, mimeType, base64Data }) => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw createHttpError(503, "Supabase is not configured on this deployment.");
  }

  if (!slug || typeof slug !== "string") {
    throw createHttpError(400, "Team member slug is required.");
  }

  // Update name if conditionally requested, without changing photo
  if (!base64Data && newName) {
    const { data: updated, error: updateError } = await supabase
      .from("team_members")
      .update({ name: newName })
      .eq("slug", slug)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw createHttpError(500, updateError?.message || "Failed to update team member name.");
    }
    return mapRowToMember(updated);
  }

  const extension = ALLOWED_MIME_TYPES[mimeType];
  if (!extension) {
    throw createHttpError(400, "Only JPG, PNG, and WEBP images are allowed.");
  }

  if (!base64Data || typeof base64Data !== "string") {
    throw createHttpError(400, "Image data is required.");
  }

  const imageBuffer = Buffer.from(base64Data, "base64");
  if (imageBuffer.byteLength === 0) {
    throw createHttpError(400, "Image file is empty.");
  }

  if (imageBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw createHttpError(400, "Image must be 5MB or smaller.");
  }

  const { data: row, error: rowError } = await supabase
    .from("team_members")
    .select("*")
    .eq("slug", slug)
    .single();

  if (rowError || !row) {
    throw createHttpError(404, "Team member not found.");
  }

  const memberId = Number(row.member_id);
  if (!Number.isInteger(memberId) || memberId <= 0) {
    throw createHttpError(500, "Invalid team member identifier.");
  }

  const filePath = `${memberId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, imageBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) {
    throw createHttpError(400, uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  const updatePayload = { image_url: publicUrlData.publicUrl };
  if (newName) {
    updatePayload.name = newName;
  }

  const { data: updated, error: updateError } = await supabase
    .from("team_members")
    .update(updatePayload)
    .eq("slug", slug)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw createHttpError(
      500,
      updateError?.message || "Failed to update team member photo."
    );
  }

  const previousPath = getStoragePathFromPublicUrl(row.image_url);
  if (previousPath && previousPath !== filePath) {
    const { error: removeError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove([previousPath]);
    if (removeError) {
      console.warn(`Failed to remove old team photo "${previousPath}": ${removeError.message}`);
    }
  }

  return mapRowToMember(updated);
};

export const deleteTeamMemberPhoto = async ({ slug }) => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw createHttpError(503, "Supabase is not configured on this deployment.");
  }

  const { data: row, error: rowError } = await supabase
    .from("team_members")
    .select("*")
    .eq("slug", slug)
    .single();

  if (rowError || !row) {
    throw createHttpError(404, "Team member not found.");
  }

  const previousPath = getStoragePathFromPublicUrl(row.image_url);
  if (previousPath) {
    const { error: removeError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove([previousPath]);
    if (removeError) {
      console.warn(`Failed to remove team photo "${previousPath}": ${removeError.message}`);
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("team_members")
    .update({ image_url: null })
    .eq("slug", slug)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw createHttpError(500, updateError?.message || "Failed to delete team member photo.");
  }

  return mapRowToMember(updated);
};
