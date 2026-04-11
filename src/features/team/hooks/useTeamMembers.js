import { useEffect, useState } from "react";
import { defaultMembers } from "@/features/team/utils/teamMembers";

const useTeamMembers = () => {
  const [members, setMembers] = useState(defaultMembers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      try {
        const response = await fetch("/api/team-members");
        if (!response.ok) {
          throw new Error("Failed to load team members");
        }

        const data = await response.json();
        if (isMounted && Array.isArray(data.members)) {
          setMembers(data.members);
        }
      } catch (error) {
        console.warn("Falling back to bundled team data:", error);
        // Fallback to bundled data
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  return { members, loading };
};

export default useTeamMembers;
