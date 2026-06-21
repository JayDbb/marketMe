const fs = require('fs');
const path = require('path');

const problems = [
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\layout.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\calendar-sidebar.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\create-post-modal.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\image-upload.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\post-card.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\month-view.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\week-view.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\create-workflow-modal.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\logout-button.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\onboarding-checklist.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx'},
  {'path':'c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx'}
];

const uniquePaths = [...new Set(problems.map(p => p.path))];

uniquePaths.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace multiple border-zinc-200 with single
  const regex = /className=[\"'\`]?([^\"'\`>]+)[\"'\`]?/g;
  content = content.replace(regex, (match, classStr) => {
    let classes = classStr.split(/\s+/);
    let newClasses = [];
    let seen = new Set();
    
    // Some specific fixes:
    classes = classes.map(c => {
      if (c === 'dark:text-white' && classes.includes('hover:text-zinc-900')) return 'dark:hover:text-white';
      if (c === 'dark:text-white/50' && classes.includes('hover:text-zinc-900')) return 'dark:hover:text-white/50';
      if (c === 'dark:text-white' && classes.includes('hover:text-black')) return 'dark:hover:text-white';
      if (c === 'dark:text-white/25' && classes.includes('placeholder:text-zinc-500')) return 'dark:placeholder:text-white/25';
      if (c.startsWith('dark:bg-white/') && classes.some(cl => cl.startsWith('hover:bg-'))) return c.replace('dark:bg-white/', 'dark:hover:bg-white/');
      if (c === 'border-purple-500/20' && classes.includes('border-zinc-200')) return c;
      if (c === 'border-purple-500/30' && classes.includes('border-zinc-200')) return c;
      if (c === 'border-black/10' && classes.includes('border-zinc-200')) return c;
      if (c === 'border-transparent' && classes.includes('border-zinc-200')) return c;
      return c;
    });

    for (let c of classes) {
      if (c === 'border-zinc-200' && classes.some(cl => cl.startsWith('border-purple') || cl.startsWith('border-transparent') || cl.startsWith('border-black'))) continue;
      
      if (!seen.has(c)) {
        seen.add(c);
        newClasses.push(c);
      }
    }
    
    let finalClasses = [];
    let hasDarkTextWhite = newClasses.includes('dark:text-white');
    let hasDarkTextWhiteAlpha = newClasses.some(c => c.startsWith('dark:text-white/'));
    
    for (let c of newClasses) {
       if (c === 'dark:text-white' && hasDarkTextWhiteAlpha && c !== newClasses.find(x => x.startsWith('dark:text-white/'))) {
         continue; 
       }
       if (c.startsWith('dark:bg-white/')) {
         let bgClasses = newClasses.filter(x => x.startsWith('dark:bg-white/'));
         if (bgClasses.length > 1 && c !== bgClasses[bgClasses.length - 1]) {
           continue;
         }
       }
       if (c.startsWith('dark:border-white/')) {
         let borderClasses = newClasses.filter(x => x.startsWith('dark:border-white/'));
         if (borderClasses.length > 1 && c !== borderClasses[borderClasses.length - 1]) {
           continue;
         }
       }
       finalClasses.push(c);
    }

    return match.replace(classStr, finalClasses.join(' '));
  });

  fs.writeFileSync(file, content, 'utf-8');
});
console.log('Fixed classes');
