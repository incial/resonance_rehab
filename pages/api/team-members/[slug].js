import { deleteTeamMember } from "@/server/teamMembersRepository";
import { verifyAdminAccessToken } from "@/server/adminAuth";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/, "");
    await verifyAdminAccessToken(token);

    const { slug } = req.query;

    await deleteTeamMember({ slug });

    return res.status(200).json({ success: true });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || "An unexpected error occurred",
    });
  }
}
