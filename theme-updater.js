import fs from 'fs';
import path from 'path';

const mappings = [
  // Backgrounds
  { from: /#020617/g, to: '#ffffff' },
  { from: /#050b14/g, to: '#f8fafc' },
  { from: /#0f172a/g, to: '#f1f5f9' },
  { from: /#1e293b/g, to: '#e2e8f0' },
  { from: /#1a1a1a/g, to: '#f8fafc' },
  
  // Accents (Blue -> Green)
  { from: /blue-500/g, to: 'emerald-500' },
  { from: /blue-400/g, to: 'emerald-400' },
  { from: /blue-300/g, to: 'emerald-300' },
  { from: /blue-600/g, to: 'emerald-600' },
  { from: /blue-700/g, to: 'emerald-700' },
  { from: /blue-800/g, to: 'emerald-800' },
  { from: /blue-900/g, to: 'emerald-900' },
  { from: /blue-200/g, to: 'emerald-200' },
  { from: /#3b82f6/g, to: '#10b981' },
  { from: /#1d4ed8/g, to: '#047857' },
  { from: /#2563eb/g, to: '#059669' },
  { from: /#93c5fd/g, to: '#34d399' },
  { from: /#1e40af/g, to: '#064e3b' },
  { from: /#60a5fa/g, to: '#34d399' },
  { from: /#1e3a8a/g, to: '#022c22' },

  // Text Colors
  { from: /text-white/g, to: 'text-slate-900' },
  { from: /text-slate-300/g, to: 'text-slate-700' },
  { from: /text-slate-400/g, to: 'text-slate-600' },
  
  // Borders
  { from: /border-white\/10/g, to: 'border-slate-200' },
  { from: /border-white\/5/g, to: 'border-slate-200' },
  { from: /border-slate-700/g, to: 'border-slate-300' },
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    mappings.forEach(m => {
      content = content.replace(m.from, m.to);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
