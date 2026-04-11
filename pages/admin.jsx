import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const BTOA_CHUNK_SIZE = 0x8000;

const toBase64 = async (file) => {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += BTOA_CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BTOA_CHUNK_SIZE));
  }
  return btoa(binary);
};

const AdminPage = () => {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedMember = useMemo(
    () => members.find((member) => member.slug === selectedSlug),
    [members, selectedSlug]
  );

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session || null);
        setAuthLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      setMembers([]);
      return;
    }

    const loadMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/team-members");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load team members");
        }
        setMembers(data.members || []);
        setSelectedSlug(data.members?.[0]?.slug || "");
      } catch (error) {
        setStatus(error.message || "Unable to load team members");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [session]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setStatus("Supabase credentials are not configured.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message);
      }
      setPassword("");
      setStatus("Signed in successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMembers([]);
    setSelectedFile(null);
    setStatus("Signed out.");
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedSlug || !selectedFile) {
      setStatus("Please choose a team member and an image file.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const base64Data = await toBase64(selectedFile);

      const response = await fetch("/api/team-members/photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          slug: selectedSlug,
          mimeType: selectedFile.type,
          base64Data,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMembers((current) =>
        current.map((member) =>
          member.slug === selectedSlug ? data.member : member
        )
      );
      setSelectedFile(null);
      setStatus("Photo updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to upload photo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="font-autumn text-3xl text-primary-color">Team Photo Admin</h1>
        <p className="mt-2 font-urbanist text-sm text-secondary-color">
          Sign in, then upload and replace photo assets for each team member.
        </p>

        {!supabase ? (
          <p className="mt-6 rounded-xl bg-cream p-3 font-urbanist text-sm text-primary-color">
            Configure Supabase environment variables to enable admin auth.
          </p>
        ) : authLoading ? (
          <p className="mt-6 font-urbanist text-primary-color">Checking admin session...</p>
        ) : !session ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block font-urbanist text-sm text-primary-color">
              Admin email
              <input
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block font-urbanist text-sm text-primary-color">
              Password
              <input
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-button-main px-6 py-3 font-urbanist font-bold text-primary-color disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : loading ? (
          <p className="mt-6 font-urbanist text-primary-color">Loading team members...</p>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex flex-col gap-3 rounded-2xl bg-cream p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-urbanist text-sm text-primary-color">
                Signed in as <span className="font-semibold">{session.user.email}</span>
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-secondary-color px-5 py-2 font-urbanist text-sm font-semibold text-white"
              >
                Sign Out
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <label className="block font-urbanist text-sm text-primary-color">
                Team member
                <select
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                  value={selectedSlug}
                  onChange={(event) => setSelectedSlug(event.target.value)}
                >
                  {members.map((member) => (
                    <option key={member.slug} value={member.slug}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedMember ? (
                <div className="rounded-2xl bg-cream p-4">
                  <p className="font-urbanist text-xs text-primary-color">
                    Current image:
                  </p>
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="mt-2 h-40 w-40 rounded-2xl object-cover"
                  />
                </div>
              ) : null}

              <label className="block font-urbanist text-sm text-primary-color">
                New photo (JPG, PNG, WEBP, max 5MB)
                <input
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-button-main px-6 py-3 font-urbanist font-bold text-primary-color disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Upload Photo"}
              </button>
            </form>
          </div>
        )}

        {status ? (
          <p className="mt-5 rounded-xl bg-cream p-3 font-urbanist text-sm text-primary-color">
            {status}
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default AdminPage;
