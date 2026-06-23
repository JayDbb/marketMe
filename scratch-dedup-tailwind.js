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
      
      // We look for any string literal or template literal that contains className
      // To be safe, we just match `className="..."` or `className={'...'}` or `className={`...`}`
      const classNameRegex = /className=(?:["']([^"']+)["']|\{?`([^`]+)`\}?)/g;
      
      let modified = false;
      const newContent = content.replace(classNameRegex, (match, p1, p2) => {
        let classStr = p1 || p2;
        if (!classStr) return match;

        // Split by whitespace
        let parts = classStr.split(/(\s+)/); // keep whitespace to preserve formatting
        let seen = new Set();
        let newParts = [];

        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 1) {
            newParts.push(parts[i]); // whitespace
            continue;
          }
          
          let c = parts[i].trim();
          if (!c || c.includes('${')) {
            // keep dynamic variables as is
            newParts.push(parts[i]);
            continue; 
          }
          
          if (!seen.has(c)) {
            seen.add(c);
            newParts.push(parts[i]);
          } else {
            // Duplicate! Remove it (and the preceding whitespace if possible)
            if (newParts.length > 0 && newParts[newParts.length - 1].trim() === '') {
              newParts.pop(); // remove trailing space of the previous token
            }
          }
        }
        
        // Also manually fix conflicting dark:text-white and dark:text-white/50 etc if both exist
        // Note: we just removed duplicates above.
        
        let finalStr = newParts.join('');
        
        if (finalStr !== classStr) {
          modified = true;
          if (p1) return `className="${finalStr}"`;
          if (p2) return `className={\`${finalStr}\`}`;
        }
        return match;
      });

      // Special check for classNames concatenated like `...` + ' class'
      
      if (modified) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log("Cleaned:", fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
console.log('Global deduplication complete');
