const fs = require('fs');
let code = fs.readFileSync('pages/admin.jsx', 'utf-8');
console.log('Start index:', code.indexOf('<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">'));
console.log('End index:', code.indexOf('          </div>
        )}

        {status ? ('));
