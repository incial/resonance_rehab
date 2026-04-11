import { verifyAdminAccessToken } from "@/server/adminAuth";
import { updateTeamMemberPhoto, deleteTeamMemberPhoto } from "@/server/teamMembersRepository";

export const config = {
  api: {
    bodyParser: {
      // 5MB file payload arrives as base64, so request body must allow expansion overhead.
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/, "");
    await verifyAdminAccessToken(token);

    if (req.method === "DELETE") {
      const { slug } = req.body;
      const updatedMember = await deleteTeamMemberPhoto({ slug });
      return res.status(200).json({ success: true, member: updatedMember });
    }

    // POST
    const { slug, newName, mimeType, base64Data, title, category, description, languages, credentials, age, about, areasOfFocus, approach, location, registration, certifications, experience } = req.body;
    const updatedMember = await updateTeamMemberPhoto({ slug, newName, mimeType, base64Data, title, category, description, languages, credentials, age, about, areasOfFocus, approach, location, registration, certifications, experience });

    return res.status(200).json({ success: true, member: updatedMember });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || "An unexpected error occurred",
    });
  }
}

