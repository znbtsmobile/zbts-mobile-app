const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace clay-active
  content = content.replace(/\bclay-active\b/g, '');
  // Replace clay-sm
  content = content.replace(/\bclay-sm\b/g, 'shadow-sm');
  // Replace clay
  content = content.replace(/\bclay\b/g, 'shadow-sm border border-slate-200');

  // Fix up multiple spaces that might have been introduced
  content = content.replace(/ +(?= )/g, '');
  // Fix cases where we might have introduced duplicate borders
  content = content.replace(/border border-slate-200(.*?)border border-[a-zA-Z0-9/-]+/g, 'border border-slate-200$1');
  content = content.replace(/border border-[a-zA-Z0-9/-]+(.*?)border border-slate-200/g, 'border border-slate-200$1');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Modified ${modifiedFiles} files.`);
