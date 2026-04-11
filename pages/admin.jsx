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

  const [isDragging, setIsDragging] = useState(false);

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
      
      // Determine new name from selected member's editable state
      // (This requires us to track changes made by the user in the list)
      const thisMember = members.find((member) => member.slug === selectedSlug);
      const newName = thisMember?.newName || thisMember?.name;

      const response = await fetch("/api/team-members/photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          slug: selectedSlug,
          newName: newName,
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
          member.slug === selectedSlug ? { ...data.member, newName: undefined } : member
        )
      );
      setSelectedFile(null);
      setStatus("Photo and name updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to upload photo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNameOnly = async (slug, newName) => {
    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/team-members/photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          slug,
          newName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Name update failed");
      }

      setMembers((current) =>
        current.map((member) =>
          member.slug === slug ? { ...data.member, newName: undefined } : member
        )
      );
      setStatus("Name updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to update name.");
    } finally {
      setSubmitting(false);
    }
  };

  const [newMemberName, setNewMemberName] = useState("");

  const handleCreateMember = async (event) => {
    event.preventDefault();
    if (!newMemberName || !selectedFile || selectedSlug !== "NEW_MEMBER") {
      setStatus("Please enter a name and select an image for the new member.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const base64Data = await toBase64(selectedFile);

      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          name: newMemberName,
          mimeType: selectedFile.type,
          base64Data,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create member");
      }

      setMembers((current) => [...current, data.member]);
      setSelectedFile(null);
      setNewMemberName("");
      setStatus("New team member added successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to create team member.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (slug) => {
    if (!confirm("Are you sure you want to remove this photo?")) return;
    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/team-members/photo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setMembers((current) =>
        current.map((member) => (member.slug === slug ? data.member : member))
      );
      if (slug === selectedSlug) setSelectedFile(null);
      setStatus("Photo removed successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to remove photo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const autoSelectMemberByFileName = (file) => {
    if (!file) return;
    const fileName = file.name.toLowerCase().replace(/\.[a-z0-9]+$/i, '');
    
    // Look for best match in members
    const matchedMember = members.find(m => 
      m.slug.toLowerCase() === fileName || 
      m.name.toLowerCase().replace(/\s+/g, '-') === fileName ||
      fileName.includes(m.slug.toLowerCase()) ||
      fileName.includes(m.name.toLowerCase().split(' ')[0])
    );

    if (matchedMember) {
      setSelectedSlug(matchedMember.slug);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        autoSelectMemberByFileName(file);
      } else {
        setStatus("Invalid file type. Please upload a JPG, PNG, or WEBP.");
      }
    }
  };

  const handleNameChange = (slug, newNameValue) => {
    setMembers(current => 
      current.map(member => 
        member.slug === slug ? { ...member, newName: newNameValue } : member
      )
    );
  };
  
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="font-autumn text-3xl text-primary-color">Team Photo Admin</h1>
        <p className="mt-2 font-urbanist text-sm text-secondary-color">
          Sign in, then upload, replace, or delete photo assets and update names for each team member.
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* New Member Card */}
              <div className={`rounded-3xl border ${selectedSlug === "NEW_MEMBER" ? 'border-secondary-color bg-secondary-color/5' : 'border-dashed border-gray-300'} p-4 shadow-sm transition-all flex flex-col`}>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-secondary-color">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Add New Team Member
                  </div>
                  <input 
                    type="text" 
                    value={newMemberName} 
                    onChange={(e) => {
                      setNewMemberName(e.target.value);
                      setSelectedSlug("NEW_MEMBER");
                    }}
                    className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 font-urbanist text-sm font-semibold text-primary-color"
                    placeholder="Enter new member name..."
                  />
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      handleDrop(e);
                      setSelectedSlug("NEW_MEMBER");
                    }}
                    onClick={() => {
                      setSelectedSlug("NEW_MEMBER");
                      document.getElementById(`photo-upload-new`).click();
                    }}
                    className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 transition-colors duration-200 ${
                      isDragging && selectedSlug === "NEW_MEMBER" ? "border-secondary-color bg-cream" : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {selectedFile && selectedSlug === "NEW_MEMBER" ? (
                      <p className="text-center text-xs font-semibold text-secondary-color break-all px-2">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-center text-sm text-gray-500 font-semibold mb-1">Upload Photo</p>
                        <p className="text-center text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
                      </>
                    )}
                    <input
                      id="photo-upload-new"
                      className="hidden"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setSelectedSlug("NEW_MEMBER");
                        setSelectedFile(file);
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleCreateMember}
                    disabled={submitting || !newMemberName || !selectedFile || selectedSlug !== "NEW_MEMBER"}
                    className="w-full rounded-xl bg-secondary-color px-4 py-2 font-urbanist text-sm font-bold text-white disabled:opacity-60"
                  >
                    {submitting && selectedSlug === "NEW_MEMBER" ? "Creating..." : "Create Team Member"}
                  </button>
                </div>
              </div>

              {/* Existing Members */}
              {members.map((member) => (
                <div key={member.slug} className={`rounded-3xl border ${selectedSlug === member.slug ? 'border-button-main bg-button-main/5' : 'border-gray-200'} p-4 shadow-sm transition-all flex flex-col`}>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={member.newName ?? member.name} 
                      onChange={(e) => handleNameChange(member.slug, e.target.value)}
                      className="mb-2 w-full rounded-xl border border-gray-300 px-3 py-2 font-urbanist text-sm font-semibold text-primary-color"
                      placeholder="Member Name"
                    />
                    <div className="relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-cream">
                      {member.image ? (
                        <div className="group relative h-full w-full">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(member.slug)}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                            title="Delete photo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="font-urbanist text-xs text-secondary-color/50">No photo</span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-2">Upload new photo:</div>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => {
                        handleDrop(e);
                        setSelectedSlug(member.slug);
                      }}
                      onClick={() => {
                        setSelectedSlug(member.slug);
                        document.getElementById(`photo-upload-${member.slug}`).click();
                      }}
                      className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 transition-colors duration-200 ${
                        isDragging && selectedSlug === member.slug ? "border-button-main bg-cream" : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mb-1 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {selectedFile && selectedSlug === member.slug ? (
                        <p className="text-center text-xs font-semibold text-secondary-color break-all px-2">{selectedFile.name}</p>
                      ) : (
                        <p className="text-center text-xs text-gray-500">Drop here or click</p>
                      )}
                      <input
                        id={`photo-upload-${member.slug}`}
                        className="hidden"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setSelectedSlug(member.slug);
                          setSelectedFile(file);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    {selectedSlug === member.slug && selectedFile ? (
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={submitting}
                        className="w-full rounded-xl bg-button-main px-4 py-2 font-urbanist text-sm font-bold text-primary-color disabled:opacity-60"
                      >
                        {submitting ? "Uploading..." : "Save Image & Name"}
                      </button>
                    ) : member.newName !== undefined && member.newName !== member.name ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateNameOnly(member.slug, member.newName)}
                        disabled={submitting}
                        className="w-full rounded-xl bg-secondary-color px-4 py-2 font-urbanist text-sm font-bold text-white disabled:opacity-60"
                      >
                        {submitting ? "Saving..." : "Save New Name"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
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
