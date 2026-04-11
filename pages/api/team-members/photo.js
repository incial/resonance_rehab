import { verifyAdminAccessToken } from "@/server/adminAuth";
import { updateTeamMemberPhoto } from "@/server/teamMembersRepository";

export const config = {
  api: {
    bodyParser: {
      // 5MB file payload arrives as base64, so request body must allow expansion overhead.
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    await verifyAdminAccessToken(token);

    const { slug, mimeType, base64Data } = req.body || {};
    const updatedMember = await updateTeamMemberPhoto({
      slug,
      mimeType,
      base64Data,
    });

    return res.status(200).json({
      message: "Photo uploaded successfully",
      member: updatedMember,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Unable to upload team photo",
    });
  }
}
