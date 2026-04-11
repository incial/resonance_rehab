const fs = require('fs');

let content = fs.readFileSync('pages/admin.jsx', 'utf8');

const startIndex = content.indexOf('<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">');
const endIndex = content.indexOf('{/* Existing Members */}');

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find the indices");
  process.exit(1);
}

const replacement = `            <div className="mb-8 rounded-3xl bg-cream/50 p-6 sm:p-8 border border-secondary-color/20 shadow-sm">
              <div className="mb-6 flex items-center gap-2 text-2xl font-autumn text-primary-color border-b border-secondary-color/10 pb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-color" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Add New Team Member
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Photo Upload Column */}
                <div className="col-span-1 flex flex-col">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      handleDrop(e);
                      setSelectedSlug("NEW_MEMBER");
                    }}
                    onClick={() => {
                      setSelectedSlug("NEW_MEMBER");
                      document.getElementById(\`photo-upload-new\`).click();
                    }}
                    className={\`flex h-full min-h-[250px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors duration-200 \${
                      isDragging && selectedSlug === "NEW_MEMBER" ? "border-secondary-color bg-white" : "border-gray-300 bg-white hover:bg-gray-50"
                    }\`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {selectedFile && selectedSlug === "NEW_MEMBER" ? (
                      <p className="text-center font-semibold text-secondary-color break-all px-2">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-center text-gray-600 font-semibold mb-1">Click or Drop Photo</p>
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
                  <button
                    type="button"
                    onClick={handleCreateMember}
                    disabled={submitting || !newMemberName || !selectedFile || selectedSlug !== "NEW_MEMBER"}
                    className="mt-6 w-full rounded-2xl bg-secondary-color px-4 py-4 font-urbanist text-base font-bold text-white disabled:opacity-60 transition-opacity"
                  >
                    {submitting && selectedSlug === "NEW_MEMBER" ? "Creating..." : "Create Team Member"}
                  </button>
                </div>

                {/* Details Column (Bento Grid) */}
                <div className="col-span-1 lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      value={newMemberName} 
                      onChange={(e) => {
                        setNewMemberName(e.target.value);
                        setSelectedSlug("NEW_MEMBER");
                      }}
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm font-semibold text-primary-color shadow-sm focus:border-secondary-color focus:outline-none"
                      placeholder="Full Name (e.g. Dr. Jane Doe)"
                    />
                    <input type="text" placeholder="Title (e.g. Clinical Psychologist)" value={newMemberDetails.title} onChange={(e) => {setNewMemberDetails({...newMemberDetails, title: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" />
                    
                    <select value={newMemberDetails.category} onChange={(e) => {setNewMemberDetails({...newMemberDetails, category: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none">
                      <option value="">Select Category...</option>
                      <option value="psychologists">Psychologists</option>
                      <option value="special-educators">Special Educators</option>
                      <option value="therapists">Therapists</option>
                      <option value="leadership">Leadership</option>
                    </select>
                    
                    <input type="text" placeholder="Age group (e.g. All ages)" value={newMemberDetails.age} onChange={(e) => {setNewMemberDetails({...newMemberDetails, age: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" />
                    
                    <input type="text" placeholder="Languages (e.g. English, Hindi)" value={newMemberDetails.languages} onChange={(e) => {setNewMemberDetails({...newMemberDetails, languages: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" />
                    
                    <input type="text" placeholder="Credentials (e.g. MA, M.Phil)" value={newMemberDetails.credentials} onChange={(e) => {setNewMemberDetails({...newMemberDetails, credentials: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" />
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Areas of Focus (comma separated)" value={newMemberDetails.areasOfFocus} onChange={(e) => {setNewMemberDetails({...newMemberDetails, areasOfFocus: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" />
                    <input type="text" placeholder="Approach (comma separated)" value={newMemberDetails.approach} onChange={(e) => {setNewMemberDetails({...newMemberDetails, approach: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <textarea placeholder="Short description" value={newMemberDetails.description} onChange={(e) => {setNewMemberDetails({...newMemberDetails, description: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" rows="2"></textarea>
                    
                    <textarea placeholder="Full Bio" value={newMemberDetails.about} onChange={(e) => {setNewMemberDetails({...newMemberDetails, about: e.target.value}); setSelectedSlug("NEW_MEMBER");}} className="w-full rounded-xl border border-transparent bg-white px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none" rows="4"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-autumn text-2xl text-primary-color">Existing Members</h2>
              <div className="h-px flex-1 bg-gray-200 ml-6"></div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {/* Existing Members */}`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex + 26); // Skip the comment length

fs.writeFileSync('pages/admin.jsx', content, 'utf8');
console.log("Refactored successfully.");
