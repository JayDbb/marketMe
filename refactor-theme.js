const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip replacing if it already has dark: modifiers for these to prevent double-applying
  if (content.includes('dark:text-white') && content.includes('dark:bg-')) {
    console.log(`Skipping ${filePath} - already processed`);
    return;
  }

  content = content
    // Text colors
    .replace(/\btext-white\b(?!(\/[0-9]+|\s*\}|\s*\]))/g, 'text-zinc-900 dark:text-white')
    .replace(/\btext-white\/([0-9]+)\b/g, 'text-zinc-500 dark:text-white/$1')
    
    // Backgrounds
    .replace(/\bbg-\[\#0c0c18\]\/([0-9]+)\b/g, 'bg-zinc-50/$1 dark:bg-[#0c0c18]/$1')
    .replace(/\bbg-\[\#0c0c18\]\b/g, 'bg-zinc-50 dark:bg-[#0c0c18]')
    .replace(/\bbg-\[\#111118\]\b/g, 'bg-zinc-50 dark:bg-[#111118]')
    .replace(/\bbg-\[\#15151e\]\b/g, 'bg-zinc-50 dark:bg-[#15151e]')
    
    // Borders
    .replace(/\bborder-white\/([0-9]+)\b/g, 'border-zinc-200 dark:border-white/$1')
    
    // Transparent White Backgrounds (Cards/Overlays)
    .replace(/\bbg-white\/([0-9]+)\b(?!.*dark:bg-white)/g, (match, p1) => {
       if (parseInt(p1) > 20) return match; // Leave high opacity white alone
       return `bg-white dark:bg-white/${p1} border-zinc-200`; // Light mode cards are white with border
    })
    
    // Hover states
    .replace(/\bhover:bg-white\/([0-9]+)\b/g, 'hover:bg-zinc-100 dark:hover:bg-white/$1')
    .replace(/\bfocus:bg-white\/([0-9]+)\b/g, 'focus:bg-zinc-100 dark:focus:bg-white/$1');

  fs.writeFileSync(filePath, content);
  console.log(`Processed ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

// Directories to process
const dirs = [
  path.join(__dirname, 'components/dashboard'),
  path.join(__dirname, 'app/dashboard')
];

dirs.forEach(dir => {
  if (fs.existsSync(dir)) walkDir(dir);
});
