import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Head from "next/head";

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

const EditMemberPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [memberName, setMemberName] = useState("");
  const [memberDetails, setMemberDetails] = useState({
    title: "", category: "", description: "", credentials: "", age: "",
    languages: "", about: "", areasOfFocus: "", approach: "",
    location: "", registration: "", certifications: "", experience: ""
  });
  const [currentImage, setCurrentImage] = useState("");
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
    if (authLoading) return;
    if (!session) {
      router.push("/admin");
      return;
    }

    if (!slug) return;

    const loadMember = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/team-members");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load team members");
        
        const member = data.members?.find(m => m.slug === slug);
        if (!member) {
          setStatus("Member not found.");
          return;
        }

        setMemberName(member.name || "");
        setCurrentImage(member.image || "");
        setMemberDetails({
          title: member.title || "",
          category: member.category || "",
          description: member.description || "",
          credentials: member.credentials || "",
          age: member.age || "",
          languages: member.languages || "",
          about: member.about || "",
          areasOfFocus: member.areasOfFocus ? member.areasOfFocus.join(", ") : "",
          approach: member.approach ? member.approach.join(", ") : "",
          location: member.location || "",
          registration: member.registration || "",
          certifications: member.certifications ? member.certifications.join(", ") : "",
          experience: member.experience || ""
        });
      } catch (error) {
        setStatus(error.message || "Unable to load team member.");
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [session, authLoading, slug, router]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!memberName) {
      setStatus("Please enter a name.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      let base64Data = null;
      let mimeType = null;
      if (selectedFile) {
        base64Data = await toBase64(selectedFile);
        mimeType = selectedFile.type;
      }
      
      const response = await fetch("/api/team-members/photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          slug: slug,
          newName: memberName,
          title: memberDetails.title,
          category: memberDetails.category,
          description: memberDetails.description,
          languages: memberDetails.languages,
          credentials: memberDetails.credentials,
          age: memberDetails.age,
          about: memberDetails.about,
          areasOfFocus: memberDetails.areasOfFocus,
          approach: memberDetails.approach,
          location: memberDetails.location,
          registration: memberDetails.registration,
          certifications: memberDetails.certifications,
          experience: memberDetails.experience,
          base64Data,
          mimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setStatus("Member updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus("Error updating team member");
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

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center font-urbanist text-xl text-primary-color">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Edit Member | Admin Dashboard</title>
      </Head>
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-autumn text-4xl text-primary-color md:text-5xl">Edit Team Member</h1>
              <p className="mt-2 font-urbanist text-lg text-secondary-color">Update details for {memberName}</p>
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-gray-300 bg-white px-6 py-2 font-urbanist text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          {status && (
            <div className={`mb-8 rounded-xl p-4 text-center font-urbanist text-sm ${status.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status}
            </div>
          )}

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 mb-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Photo Column */}
              <div className="col-span-1 flex flex-col items-center">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById(`photo-upload-edit`).click()}
                  className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-3 transition-colors duration-200 ${isDragging ? "border-button-main bg-cream" : "border-gray-300 bg-[#FDFBF7] hover:bg-gray-50"}`}
                >
                  {(selectedFile || currentImage) ? (
                    <div className="relative h-full w-full overflow-hidden rounded-2xl">
                      <img src={selectedFile ? URL.createObjectURL(selectedFile) : currentImage} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 hover:opacity-100">
                        <span className="font-urbanist text-sm font-bold text-white shadow-sm">Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-center font-urbanist text-sm text-gray-500">
                        Drop image here or click to browse
                      </span>
                    </>
                  )}
                  <input
                    id="photo-upload-edit"
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
                  onClick={handleUpdate}
                  disabled={submitting || !memberName}
                  className="mt-6 w-full rounded-2xl bg-secondary-color px-4 py-4 font-urbanist text-base font-bold text-white disabled:opacity-60 transition-opacity shadow-md hover:shadow-lg"
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>

              {/* Details Column */}
              <div className="col-span-1 lg:col-span-2">
                <div className="mb-4">
                  <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    value={memberName} 
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-base text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                    placeholder="E.g. Dr. Jane Doe"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Title</label>
                    <input type="text" placeholder="E.g. Clinical Psychologist" value={memberDetails.title} onChange={(e) => setMemberDetails({...memberDetails, title: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                  </div>
                  <div>
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Category</label>
                    <div className="flex gap-2">
                      {memberDetails.isNewCategory ? (
                        <input 
                          type="text" 
                          placeholder="New Category Format (e.g. child-psychologist)" 
                          value={memberDetails.category} 
                          onChange={(e) => setMemberDetails({...memberDetails, category: e.target.value})} 
                          className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                        />
                      ) : (
                        <select value={memberDetails.category} onChange={(e) => setMemberDetails({...memberDetails, category: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color">
                          <option value="">Select Category...</option>
                          <option value="clinical-and-behavioral">Clinical Psychologist & Behaviour Therapist</option>
                          <option value="developmental-therapist">Developmental Therapist</option>
                          <option value="occupational-therapist">Occupational Therapist</option>
                          <option value="speech-and-hearing-pathologist">Speech And Hearing Pathologist</option>
                        </select>
                      )}
                      <button 
                        type="button" 
                        onClick={() => setMemberDetails({...memberDetails, isNewCategory: !memberDetails.isNewCategory, category: ''})}
                        className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-3 font-bold text-secondary-color hover:bg-gray-200 shadow-sm transition-colors"
                        title={memberDetails.isNewCategory ? "Select from list" : "Add custom category slug"}
                      >
                        {memberDetails.isNewCategory ? "List" : "+"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Age Group</label>
                    <input type="text" placeholder="E.g. All ages" value={memberDetails.age} onChange={(e) => setMemberDetails({...memberDetails, age: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                  </div>
                  <div>
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Languages</label>
                    <input type="text" placeholder="E.g. English, Hindi" value={memberDetails.languages} onChange={(e) => setMemberDetails({...memberDetails, languages: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Credentials</label>
                    <input type="text" placeholder="E.g. MA, M.Phil" value={memberDetails.credentials} onChange={(e) => setMemberDetails({...memberDetails, credentials: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Short Description</label>
                    <textarea placeholder="Brief overview of their role" value={memberDetails.description} onChange={(e) => setMemberDetails({...memberDetails, description: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" rows={2}></textarea>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Full Bio</label>
                    <textarea placeholder="Detailed biography..." value={memberDetails.about} onChange={(e) => setMemberDetails({...memberDetails, about: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" rows={4}></textarea>
                  </div>
                  <div>
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Areas of Focus</label>
                    <input type="text" placeholder="Comma separated" value={memberDetails.areasOfFocus} onChange={(e) => setMemberDetails({...memberDetails, areasOfFocus: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                  </div>
                  <div>
                    <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Approach</label>
                    <input type="text" placeholder="Comma separated" value={memberDetails.approach} onChange={(e) => setMemberDetails({...memberDetails, approach: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditMemberPage;
