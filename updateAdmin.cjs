const fs = require('fs');
let c = fs.readFileSync('pages/admin.jsx', 'utf8');

c = c.replace(/<div>\s*<label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Category<\/label>\s*<select value=\{newMemberDetails\.category\} onChange=\{\(e\) => setNewMemberDetails\(\{\.\.\.newMemberDetails, category: e\.target\.value\}\)\} className="w-full rounded-xl border border-gray-200 bg-\[\#FDFBF7\] px-4 py-3 font-urbanist text-sm text-primary-color shadow-sm focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color\">\s*<option value="">Select Category\.\.\.<\/option>\s*<option value="psychologists">Psychologists<\/option>\s*<option value="special-educators">Special Educators<\/option>\s*<option value="therapists">Therapists<\/option>\s*<option value="leadership">Leadership<\/option>\s*<\/select>\s*<\/div>/, 
\<div className="relative">
                        <label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Category</label>
                        <div className="flex gap-2">
                          {newMemberDetails.isNewCategory ? (
                            <input 
                              type="text" 
                              placeholder="New Category Name" 
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
                            className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-secondary-color hover:bg-gray-200 shadow-sm"
                            title={newMemberDetails.isNewCategory ? "Select from existing" : "Add custom category"}
                          >
                            {newMemberDetails.isNewCategory ? "Back" : "+"}
                          </button>
                        </div>
                      </div>\);

fs.writeFileSync('pages/admin.jsx', c);
