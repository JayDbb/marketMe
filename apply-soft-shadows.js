const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Replace border-zinc-200 with border-transparent for all cards and major structural elements
      // Wait, we don't want to remove all border-zinc-200, only on cards? 
      // Actually, the reference design has almost no hard borders anywhere, even on small metric boxes.
      // Let's replace 'border-zinc-200' with 'border-transparent' safely
      
      const newContent = content
        .replace(/border-zinc-200/g, 'border-transparent')
        .replace(/shadow-2xl/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl')
        .replace(/shadow-xl/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-xl');

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log("Updated shadows and borders in:", fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'components/dashboard'));
processDir(path.join(__dirname, 'app/dashboard'));
