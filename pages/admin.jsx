import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Head from "next/head";
import Link from "next/link";

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
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

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

  const handleDeleteMember = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this team member completely?")) return;
    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch(`/api/team-members/${slug}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setMembers((current) => current.filter((m) => m.slug !== slug));
      setStatus("Team member deleted completely.");
    } catch (error) {
      setStatus(error.message || "Unable to delete team member");
    } finally {
      setSubmitting(false);
    }
  };

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberDetails, setNewMemberDetails] = useState({ title: "", category: "", description: "", credentials: "", age: "", languages: "", about: "", areasOfFocus: "", approach: "",  });

  const handleCreateMember = async (event) => {
    event.preventDefault();
    if (!newMemberName || !selectedFile) {
      setStatus("Please enter a name and select an image for the new member.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const base64Data = await toBase64(selectedFile);
      
      const formatArray = (str) => str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];

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
          title: newMemberDetails.title,
          category: newMemberDetails.category,
          description: newMemberDetails.description,
          credentials: newMemberDetails.credentials,
          age: newMemberDetails.age,
          languages: newMemberDetails.languages,
          about: newMemberDetails.about,
          areasOfFocus: formatArray(newMemberDetails.areasOfFocus),
          approach: formatArray(newMemberDetails.approach),
          
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create member");
      }

      setMembers((current) => [...current, data.member]);
      setSelectedFile(null);
      setNewMemberName("");
      setNewMemberDetails({
        title: "",
        category: "",
        description: "",
        credentials: "",
        age: "",
        languages: "",
        about: "",
        areasOfFocus: "",
        approach: "",
        
      });
      setStatus("New team member added successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to create team member.");
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    setSelectedFile(file);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-urbanist text-xl text-primary-color">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Resonance</title>
      </Head>
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
        {!session ? (
          <div className="mx-auto max-w-md pt-20">
            <h1 className="mb-8 text-center font-autumn text-5xl text-primary-color">Admin Portal</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              {status && <div className="rounded-xl bg-gray-50 p-4 text-center font-urbanist text-sm text-gray-800">{status}</div>}
              <div>
                <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-base text-primary-color focus:border-secondary-color focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-base text-primary-color focus:border-secondary-color focus:outline-none" />
              </div>
              <button type="submit" disabled={submitting} className="mt-4 w-full rounded-2xl bg-secondary-color px-4 py-4 font-urbanist text-base font-bold text-white disabled:opacity-60">
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-autumn text-4xl text-primary-color md:text-5xl">Team Dashboard</h1>
                <p className="mt-2 font-urbanist text-lg text-secondary-color">Manage your team members and details</p>
              </div>
              <button onClick={handleLogout} className="rounded-xl border border-gray-300 bg-white px-6 py-2 font-urbanist text-sm font-bold text-gray-700 hover:bg-gray-50">
                Sign Out
              </button>
            </div>

            {status && (
              <div className={`mb-8 rounded-xl p-4 text-center font-urbanist text-sm ${status.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {status}
              </div>
            )}

            {/* Container for Adding New Member */}
            <div className="mb-12 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
              <h2 className="mb-6 font-autumn text-3xl text-primary-color">Add New Team Member</h2>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Photo Column */}
                <div className="col-span-1 flex flex-col">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById(`photo-upload-new`).click()}
                    className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-3 transition-colors duration-200 ${isDragging ? "border-button-main bg-cream" : "border-gray-300 bg-[#FDFBF7] hover:bg-gray-50"}`}
                  >
                    {selectedFile ? (
                      <div className="relative h-full w-full overflow-hidden rounded-2xl">
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 hover:opacity-100">
                          <span className="font-urbanist text-sm font-bold text-white shadow-sm">Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-center font-urbanist text-sm text-gray-500">Drop image here or click to browse</span>
                      </>
                    )}
                    <input
                      id="photo-upload-new"
                      className="hidden"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setSelectedFile(file);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateMember}
                    disabled={submitting || !newMemberName || !selectedFile}
                    className="mt-6 w-full rounded-2xl bg-secondary-color px-4 py-4 font-urbanist text-base font-bold text-white disabled:opacity-60 transition-opacity shadow-md hover:shadow-lg"
                  >
                    {submitting ? "Creating..." : "Create Team Member"}
                  </button>
                </div>

                {/* Details Column */}
                <div className="col-span-1 lg:col-span-2">
                  <div className="mb-4">
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      value={newMemberName} 
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-base text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                      placeholder="E.g. Dr. Jane Doe"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Title</label>
                      <input type="text" placeholder="E.g. Clinical Psychologist" value={newMemberDetails.title} onChange={(e) => setNewMemberDetails({...newMemberDetails, title: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                    </div>
                    <div>
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Category</label>
                      <div className="flex gap-2">
                        {newMemberDetails.isNewCategory ? (
                          <input 
                            type="text" 
                            placeholder="New Category Format (e.g. child-psychologist)" 
                            value={newMemberDetails.category} 
                            onChange={(e) => setNewMemberDetails({...newMemberDetails, category: e.target.value})} 
                            className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                          />
                        ) : (
                          <select value={newMemberDetails.category} onChange={(e) => setNewMemberDetails({...newMemberDetails, category: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color">
                            <option value="">Select Category...</option>
                            <option value="clinical-and-behavioral">Clinical Psychologist & Behaviour Therapist</option>
                            <option value="developmental-therapist">Developmental Therapist</option>
                            <option value="occupational-therapist">Occupational Therapist</option>
                            <option value="speech-and-hearing-pathologist">Speech And Hearing Pathologist</option>
                          </select>
                        )}
                        <button 
                          type="button" 
                          onClick={() => setNewMemberDetails({...newMemberDetails, isNewCategory: !newMemberDetails.isNewCategory, category: ''})}
                          className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-3 font-bold text-secondary-color hover:bg-gray-200 shadow-sm transition-colors"
                          title={newMemberDetails.isNewCategory ? "Select from list" : "Add custom category slug"}
                        >
                          {newMemberDetails.isNewCategory ? "List" : "+"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Age Group</label>
                      <input type="text" placeholder="E.g. All ages" value={newMemberDetails.age} onChange={(e) => setNewMemberDetails({...newMemberDetails, age: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                    </div>
                    <div>
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Languages</label>
                      <input type="text" placeholder="E.g. English, Hindi" value={newMemberDetails.languages} onChange={(e) => setNewMemberDetails({...newMemberDetails, languages: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Credentials</label>
                      <input type="text" placeholder="E.g. MA, M.Phil" value={newMemberDetails.credentials} onChange={(e) => setNewMemberDetails({...newMemberDetails, credentials: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Short Description</label>
                      <textarea placeholder="Brief overview of their role" value={newMemberDetails.description} onChange={(e) => setNewMemberDetails({...newMemberDetails, description: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" rows={2}></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Full Bio</label>
                      <textarea placeholder="Detailed biography..." value={newMemberDetails.about} onChange={(e) => setNewMemberDetails({...newMemberDetails, about: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" rows={4}></textarea>
                    </div>
                    <div>
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Areas of Focus</label>
                      <input type="text" placeholder="Comma separated" value={newMemberDetails.areasOfFocus} onChange={(e) => setNewMemberDetails({...newMemberDetails, areasOfFocus: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                    </div>
                    <div>
                      <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Approach</label>
                      <input type="text" placeholder="Comma separated" value={newMemberDetails.approach} onChange={(e) => setNewMemberDetails({...newMemberDetails, approach: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Container for Existing Members List displaying elegant cards */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
              <h2 className="mb-6 font-autumn text-3xl text-primary-color">Existing Members</h2>
              {loading ? (
                <div className="py-12 text-center text-gray-500">Loading members...</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {members.map((member) => (
                    <div key={member.slug} className="group relative rounded-3xl border border-gray-200 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col bg-white overflow-hidden">
                      <div className="relative mb-4 h-56 w-full overflow-hidden rounded-2xl bg-[#FDFBF7]">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center font-urbanist text-xs text-secondary-color/50">No photo</span>
                        )}

                        {/* Hover Overlay with Edit/Delete options */}
                        <div className="absolute inset-0 bg-primary-color/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 backdrop-blur-sm">
                          <Link href={`/admin/edit/${member.slug}`} className="rounded-full bg-white p-3 text-secondary-color shadow-lg hover:scale-110 transition-transform" title="Edit member">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L5.314 19l.28-3.149a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </Link>
                          <button 
                            type="button"
                            onClick={() => handleDeleteMember(member.slug)}
                            className="rounded-full bg-red-500 p-3 text-white shadow-lg hover:scale-110 transition-transform"
                            title="Delete member"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex-[0] flex flex-col justify-start px-2 pb-2">
                        <h3 className="truncate text-center font-autumn text-xl text-primary-color">{member.name}</h3>
                        <p className="truncate text-center font-urbanist text-xs font-semibold text-secondary-color">{member.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;

