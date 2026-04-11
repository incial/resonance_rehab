const fs = require('fs');
let c = fs.readFileSync('pages/admin/edit/[slug].jsx', 'utf8');

c = c.replace(/location:\s*e\.target\.value[^>]*>Location<\/label>[\s\S]*?<label[^>]*>Experience<\/label>[\s\S]*?<\/div>\s*<\/div>/g, '')

function removeFields(content) {
  const startRegex = /(<div>\s*<label[^>]*>Location<\/label>)/i;
  const endRegex = /<label[^>]*>Experience<\/label>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/i;
  // better approach, let's just replace everything inside the big form layout up to the button
  
  const repl = content.replace(/<div>\s*<label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Location<\/label>[\s\S]*?<label className="mb-2 block font-urbanist text-sm font-bold text-gray-700">Experience<\/label>[\s\S]*?<\/div>\s*<\/div>/g, '');
  return repl;
}

c = removeFields(c);
fs.writeFileSync('pages/admin/edit/[slug].jsx', c);
