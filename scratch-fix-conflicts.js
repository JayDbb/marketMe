const fs = require('fs');

const problems = [{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":75,"endLine":75},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":83,"endLine":83},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","severity":"warning","startLine":93,"endLine":93},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":93,"endLine":93},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":93,"endLine":93},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","severity":"warning","startLine":96,"endLine":96},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":96,"endLine":96},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","severity":"warning","startLine":99,"endLine":99},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":99,"endLine":99},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\calendar\\page.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":99,"endLine":99},{"path":"c:\\myprojects\\React\\marketMe\\app\\dashboard\\layout.tsx","message":"'dark:hover:text-white/30' applies the same CSS properties as 'dark:hover:text-white'.","severity":"warning","startLine":27,"endLine":27},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\calendar-sidebar.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","severity":"warning","startLine":58,"endLine":58},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":58,"endLine":58},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\calendar-sidebar.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","severity":"warning","startLine":61,"endLine":61},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":61,"endLine":61},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-purple-500/20'.","severity":"warning","startLine":102,"endLine":102},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":112,"endLine":112},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\create-post-modal.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":262,"endLine":262},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\create-post-modal.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","severity":"warning","startLine":286,"endLine":286},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":286,"endLine":286},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":302,"endLine":302},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":321,"endLine":321},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":331,"endLine":331},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\image-upload.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":99,"endLine":99},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\image-upload.tsx","message":"'dark:border-white/10' applies the same CSS properties as 'dark:border-white/20'.","severity":"warning","startLine":99,"endLine":99},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\post-card.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":21,"endLine":21},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\post-card.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":31,"endLine":31},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\post-card.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":75,"endLine":75},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\views\\month-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":32,"endLine":32},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\views\\month-view.tsx","message":"'dark:text-white/40' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":47,"endLine":47},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\views\\week-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":58,"endLine":58},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\views\\week-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-black/10'.","severity":"warning","startLine":131,"endLine":131},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\views\\week-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":150,"endLine":150},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\calendar\\views\\week-view.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","severity":"warning","startLine":150,"endLine":150},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":39,"endLine":39},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":45,"endLine":45},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":52,"endLine":52},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":62,"endLine":62},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":88,"endLine":88},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/30'.","severity":"warning","startLine":96,"endLine":96},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":114,"endLine":114},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":123,"endLine":123},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":157,"endLine":157},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/6'.","severity":"warning","startLine":208,"endLine":208},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":208,"endLine":208},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":212,"endLine":212},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":222,"endLine":222},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":235,"endLine":235},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":236,"endLine":236},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":256,"endLine":256},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/20'.","severity":"warning","startLine":256,"endLine":256},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":266,"endLine":266},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\dashboard-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/20'.","severity":"warning","startLine":266,"endLine":266},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'dark:text-white/70' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":295,"endLine":295},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/5'.","severity":"warning","startLine":295,"endLine":295},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":295,"endLine":295},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'dark:text-white/70' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":326,"endLine":326},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/5'.","severity":"warning","startLine":326,"endLine":326},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":326,"endLine":326},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-purple-500/30'.","severity":"warning","startLine":430,"endLine":430},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":431,"endLine":431},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/8'.","severity":"warning","startLine":503,"endLine":503},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":503,"endLine":503},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'dark:border-white/8' applies the same CSS properties as 'dark:border-white/20'.","severity":"warning","startLine":503,"endLine":503},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":516,"endLine":516},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\logout-button.tsx","message":"'dark:text-white/35' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":16,"endLine":16},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\onboarding-checklist.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":117,"endLine":117},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\onboarding-checklist.tsx","message":"'dark:text-white/30' applies the same CSS properties as 'dark:text-white/60'.","severity":"warning","startLine":161,"endLine":161},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\onboarding-checklist.tsx","message":"'dark:text-white/20' applies the same CSS properties as 'dark:text-white/50'.","severity":"warning","startLine":172,"endLine":172},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\onboarding-checklist.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/6'.","severity":"warning","startLine":222,"endLine":222},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\onboarding-checklist.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":222,"endLine":222},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\onboarding-checklist.tsx","message":"'dark:border-white/8' applies the same CSS properties as 'dark:border-white/12'.","severity":"warning","startLine":222,"endLine":222},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\posts-content.tsx","message":"'dark:hover:text-white/50' applies the same CSS properties as 'dark:hover:text-white'.","severity":"warning","startLine":97,"endLine":97},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\posts-content.tsx","message":"'dark:hover:bg-white/5' applies the same CSS properties as 'dark:hover:bg-white/10'.","severity":"warning","startLine":113,"endLine":113},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","severity":"warning","startLine":114,"endLine":114},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/5'.","severity":"warning","startLine":126,"endLine":126},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":126,"endLine":126},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":148,"endLine":148},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'dark:bg-white/10' applies the same CSS properties as 'dark:bg-white/20'.","severity":"warning","startLine":161,"endLine":161},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":161,"endLine":161},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":169,"endLine":169},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":181,"endLine":181},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":190,"endLine":190},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":198,"endLine":198},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":262,"endLine":262},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":270,"endLine":270},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":280,"endLine":280},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":296,"endLine":296},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":301,"endLine":301},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'dark:bg-white/10' applies the same CSS properties as 'dark:bg-white/20'.","severity":"warning","startLine":306,"endLine":306},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","severity":"warning","startLine":306,"endLine":306},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":329,"endLine":329},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":333,"endLine":333},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":348,"endLine":348},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":376,"endLine":376},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":377,"endLine":377},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":129,"endLine":129},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":148,"endLine":148},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":158,"endLine":158},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":173,"endLine":173},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":195,"endLine":195},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":205,"endLine":205},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":232,"endLine":232},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":264,"endLine":264},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'border-transparent' applies the same CSS properties as 'border-zinc-200'.","severity":"warning","startLine":264,"endLine":264},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/40'.","severity":"warning","startLine":277,"endLine":277},{"path":"c:\\myprojects\\React\\marketMe\\components\\dashboard\\studio\\studio-editor.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/40'.","severity":"warning","startLine":278,"endLine":278}];

// Map to store changes per file
const fileUpdates = {};

problems.forEach(p => {
  if (!fileUpdates[p.path]) fileUpdates[p.path] = {};
  fileUpdates[p.path][p.startLine] = p;
});

// For each file, process lines and fix the conflicts based on regex.
Object.keys(fileUpdates).forEach(filepath => {
  if (!fs.existsSync(filepath)) return;
  
  let lines = fs.readFileSync(filepath, 'utf8').split('\n');
  let modified = false;

  const fixClasses = (lineText) => {
    let result = lineText;
    
    // Duplicate cleanups: simple regex to remove exactly duplicated classes if they appear in same line
    // e.g. "border-zinc-200 ... border-zinc-200"
    // Using a more robust string replace approach for known duplicates:
    
    // Split line by quotes/backticks to only process contents inside them
    const parts = result.split(/(["'`])/);
    for (let i = 0; i < parts.length; i++) {
       // Strings are at even indices? No, split by group includes the separator.
       // It's safer to just run tailwind-merge equivalent logic or targeted regex.
    }
    
    // Just remove " border-zinc-200" if "border-transparent" is present
    if (result.includes('border-transparent') && result.includes('border-zinc-200')) {
      result = result.replace(/\s?border-zinc-200/g, '');
    }
    
    // Remove "dark:text-white" if "dark:text-white/" is present
    if (result.match(/dark:text-white\/\d+/) && result.match(/\bdark:text-white\b/)) {
      result = result.replace(/\s?\bdark:text-white\b/g, '');
    }
    
    // Remove duplicate dark:bg-white/* conflicts (keep the lowest opacity)
    if (result.includes('dark:bg-white/5') && result.includes('dark:bg-white/10')) {
      result = result.replace(/\s?dark:bg-white\/10/g, '');
    }
    if (result.includes('dark:bg-white/10') && result.includes('dark:bg-white/20')) {
      result = result.replace(/\s?dark:bg-white\/20/g, '');
    }
    if (result.includes('dark:bg-white/4') && result.includes('dark:bg-white/5')) {
      result = result.replace(/\s?dark:bg-white\/5/g, '');
    }
    if (result.includes('dark:bg-white/4') && result.includes('dark:bg-white/6')) {
      result = result.replace(/\s?dark:bg-white\/6/g, '');
    }
    if (result.includes('dark:bg-white/4') && result.includes('dark:bg-white/8')) {
      result = result.replace(/\s?dark:bg-white\/8/g, '');
    }
    if (result.includes('dark:hover:text-white/50') && result.includes('dark:hover:text-white')) {
      result = result.replace(/\s?dark:hover:text-white\b/g, '');
    }
    if (result.includes('dark:hover:bg-white/5') && result.includes('dark:hover:bg-white/10')) {
      result = result.replace(/\s?dark:hover:bg-white\/10/g, '');
    }
    if (result.includes('border-zinc-200') && result.includes('border-purple-500/')) {
       result = result.replace(/\s?border-zinc-200/g, '');
    }
    if (result.includes('border-zinc-200') && result.includes('border-black/10')) {
       result = result.replace(/\s?border-zinc-200/g, '');
    }
    if (result.includes('dark:text-white/30') && result.includes('dark:text-white/60')) {
       result = result.replace(/\s?dark:text-white\/60/g, '');
    }
    if (result.includes('dark:text-white/20') && result.includes('dark:text-white/50')) {
       result = result.replace(/\s?dark:text-white\/50/g, '');
    }
    if (result.includes('dark:border-white/8') && result.includes('dark:border-white/12')) {
       result = result.replace(/\s?dark:border-white\/12/g, '');
    }
    if (result.includes('dark:border-white/10') && result.includes('dark:border-white/20')) {
       result = result.replace(/\s?dark:border-white\/20/g, '');
    }
    
    // Fix pure duplicates (border-zinc-200 twice)
    // We can just regex replace multiple instances of the same word.
    const words = result.match(/[\w-\/:]+/g);
    if (words) {
      let unique = new Set();
      words.forEach(w => {
         if (w.startsWith('border-') || w.startsWith('dark:') || w.startsWith('bg-') || w.startsWith('text-')) {
             if (unique.has(w)) {
                 // Replace all but first instance.
                 // Actually just string replace the second one.
                 // A simple way is to deduplicate inside strings.
             } else {
                 unique.add(w);
             }
         }
      });
    }

    // Since duplicates are exact words, let's write a targeted regex for the known exact duplicates.
    const exactDuplicates = ['border-zinc-200', 'border-transparent', 'dark:bg-white/5', 'dark:text-white/50'];
    exactDuplicates.forEach(dup => {
       const regex = new RegExp(`(\\s${dup})(?=\\s.*\\1)`, 'g');
       // wait, regex for duplicate words in a string:
       // / \bword\b(?=.*\bword\b)/g
       const rx = new RegExp(`\\b${dup}\\b(?=.*\\b${dup}\\b)`, 'g');
       result = result.replace(rx, '');
    });

    return result;
  };

  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    const fixed = fixClasses(original);
    
    // Second pass for duplicates
    let cleaned = fixed;
    const tokens = cleaned.split(/(['"`])/);
    for (let j = 0; j < tokens.length; j++) {
       if (j % 2 === 1) continue; // It's a quote
       // wait, tokens inside quotes are at odd indices if split like this:
       // "hello 'world' test".split(/(')/) => ["hello ", "'", "world", "'", " test"]
    }
    
    // We can just use the tailwind-merge library to clean up every line that has className=...
    // But since tailwind-merge isn't perfectly configured for custom arbitrary values sometimes, simple regex is safer.
    
    if (original !== cleaned) {
      lines[i] = cleaned;
      modified = true;
    }
  }

  // Fallback to removing duplicate words globally per line
  for (let i=0; i<lines.length; i++) {
     let line = lines[i];
     if (line.includes('className=')) {
         let rx = /\bborder-zinc-200\b(?=.*\bborder-zinc-200\b)/g;
         line = line.replace(rx, '');
         rx = /\bborder-transparent\b(?=.*\bborder-transparent\b)/g;
         line = line.replace(rx, '');
         if (line !== lines[i]) {
            lines[i] = line;
            modified = true;
         }
     }
  }

  if (modified) {
    fs.writeFileSync(filepath, lines.join('\n'));
    console.log("Fixed conflicts in", filepath);
  }
});
