import { getTeamMembers, isSupabaseConfigured, createTeamMember } from "@/server/teamMembersRepository";
import { verifyAdminAccessToken } from "@/server/adminAuth";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (req.method === "POST") {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace(/^Bearer\s+/, "");
      await verifyAdminAccessToken(token);

      const { name, mimeType, base64Data, title, category, description, credentials, age, languages, about, areasOfFocus, approach, location, registration, certifications, experience } = req.body;
      const newMember = await createTeamMember({ name, mimeType, base64Data, title, category, description, credentials, age, languages, about, areasOfFocus, approach, location, registration, certifications, experience });
      
      return res.status(201).json({ success: true, member: newMember });
    }

    const members = await getTeamMembers();
    return res.status(200).json({
      members,
      source: isSupabaseConfigured() ? "supabase" : "local-fallback",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || "An unexpected error occurred",
    });
  }
}
