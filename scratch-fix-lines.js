const fs = require('fs');

const problems = [
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":89},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":96},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","startLine":97},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":110},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/25'.","startLine":110},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":113},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":113},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":120},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":121},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":133},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\posts-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":160},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":75},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","startLine":83},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":93},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":93},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","startLine":93},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":96},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":96},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":99},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":99},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\calendar\\\\page.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","startLine":99},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\layout.tsx","message":"'dark:text-white/30' applies the same CSS properties as 'dark:text-white'.","startLine":27},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\app\\\\dashboard\\\\layout.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":29},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\calendar-sidebar.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":58},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":58},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\calendar-sidebar.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":61},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":61},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-purple-500/20'.","startLine":102},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\calendar-sidebar.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":112},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\create-post-modal.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","startLine":262},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\create-post-modal.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":286},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":286},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":302},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":321},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\create-post-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":331},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\image-upload.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":99},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\image-upload.tsx","message":"'dark:border-white/10' applies the same CSS properties as 'dark:border-white/20'.","startLine":99},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\post-card.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":21},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\post-card.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":31},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\post-card.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":75},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\month-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":32},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\month-view.tsx","message":"'dark:text-white/40' applies the same CSS properties as 'dark:text-white'.","startLine":47},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\week-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":58},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\week-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-black/10'.","startLine":131},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\week-view.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":150},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\calendar\\\\views\\\\week-view.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/10'.","startLine":150},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":39},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":45},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":52},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\create-workflow-modal.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":62},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":88},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/30'.","startLine":96},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":114},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":123},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":157},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/6'.","startLine":208},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":208},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":212},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":222},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":235},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":236},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":256},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/20'.","startLine":256},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":266},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\dashboard-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/20'.","startLine":266},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/20'.","startLine":272},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:text-white/70' applies the same CSS properties as 'dark:text-white'.","startLine":295},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/5'.","startLine":295},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":295},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:text-white/70' applies the same CSS properties as 'dark:text-white'.","startLine":326},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:bg-white/5' applies the same CSS properties as 'dark:bg-white/5'.","startLine":326},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":326},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/20'.","startLine":358},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-purple-500/30'.","startLine":430},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":431},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/8'.","startLine":503},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":503},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:border-white/8' applies the same CSS properties as 'dark:border-white/20'.","startLine":503},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":516},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/20'.","startLine":596},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\generate-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":648},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\logout-button.tsx","message":"'dark:text-white/35' applies the same CSS properties as 'dark:text-white'.","startLine":16},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\onboarding-checklist.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":117},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\onboarding-checklist.tsx","message":"'dark:text-white/30' applies the same CSS properties as 'dark:text-white/60'.","startLine":161},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\onboarding-checklist.tsx","message":"'dark:text-white/20' applies the same CSS properties as 'dark:text-white/50'.","startLine":172},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\onboarding-checklist.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/6'.","startLine":222},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\onboarding-checklist.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":222},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\onboarding-checklist.tsx","message":"'dark:border-white/8' applies the same CSS properties as 'dark:border-white/12'.","startLine":222},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'dark:text-white/50' applies the same CSS properties as 'dark:text-white'.","startLine":114},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'dark:bg-white/4' applies the same CSS properties as 'dark:bg-white/5'.","startLine":126},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":126},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":148},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'dark:bg-white/10' applies the same CSS properties as 'dark:bg-white/20'.","startLine":161},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":161},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":169},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":181},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":190},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":198},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":262},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":270},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":280},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":296},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":301},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'dark:bg-white/10' applies the same CSS properties as 'dark:bg-white/20'.","startLine":306},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200' and 'border-zinc-200'.","startLine":306},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":329},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":333},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":348},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":376},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\settings-content.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":377},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":129},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":148},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":158},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":173},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":195},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":205},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":232},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-zinc-200' applies the same CSS properties as 'border-zinc-200'.","startLine":264},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'border-transparent' applies the same CSS properties as 'border-zinc-200'.","startLine":264},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/40'.","startLine":277},
{"path":"c:\\\\myprojects\\\\React\\\\marketMe\\\\components\\\\dashboard\\\\studio\\\\studio-editor.tsx","message":"'dark:text-white' applies the same CSS properties as 'dark:text-white/40'.","startLine":278}
];

const uniquePaths = [...new Set(problems.map(p => p.path))];

function processLine(line) {
  // Regex to match any string (inside quotes or backticks) that might contain classes
  // We'll replace duplicated 'border-zinc-200' directly and fix 'dark:text-white'.
  
  // Actually, split by words and rebuild the string?
  // Since we only want to affect strings that have classes, we can look for strings containing the problematic classes.
  
  // A simpler approach: just find 'border-zinc-200' and remove duplicates if there are multiple in the SAME line.
  // Wait, if we just replace it globally, we might ruin something.
  // But these are Tailwind classes.
  
  // For 'border-zinc-200':
  let parts = line.split(/(['"`])/); // split by quotes to process only strings
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) continue; // Not inside quotes, except template literals parts might be weird
    // Actually, splitting by quotes is safer if we know it's simple strings. Template literals might contain ${...}
  }

  // A very safe regex for the exact duplicates mentioned:
  let changed = line;
  
  // Replace multiple border-zinc-200 with single border-zinc-200 inside quotes/ticks
  changed = changed.replace(/(['"`].*?)border-zinc-200(.*?)border-zinc-200(.*?['"`])/g, (match, p1, p2, p3) => {
    return p1 + "border-zinc-200" + p2 + p3.replace(/border-zinc-200/g, '').replace(/  +/g, ' ');
  });
  // Run again in case of three
  changed = changed.replace(/(['"`].*?)border-zinc-200(.*?)border-zinc-200(.*?['"`])/g, (match, p1, p2, p3) => {
    return p1 + "border-zinc-200" + p2 + p3.replace(/border-zinc-200/g, '').replace(/  +/g, ' ');
  });

  // If there's border-transparent and border-zinc-200, remove border-zinc-200
  changed = changed.replace(/(['"`].*?)border-transparent(.*?)border-zinc-200(.*?['"`])/g, "$1border-transparent$2$3");
  changed = changed.replace(/(['"`].*?)border-zinc-200(.*?)border-transparent(.*?['"`])/g, "$1$2border-transparent$3");
  
  changed = changed.replace(/(['"`].*?)border-purple-500\/[0-9]+(.*?)border-zinc-200(.*?['"`])/g, "$1$2$3");
  changed = changed.replace(/(['"`].*?)border-zinc-200(.*?)border-purple-500\/[0-9]+(.*?['"`])/g, "$1$2$3");

  // Fix hover:text-xyz dark:text-white -> hover:text-xyz dark:hover:text-white
  changed = changed.replace(/hover:text-[a-z0-9-]+(.*?)dark:text-white(\/?[0-9]*)/g, "hover:text-$1$2dark:hover:text-white$3");
  changed = changed.replace(/dark:text-white(\/?[0-9]*)(.*?)hover:text-[a-z0-9-]+/g, "dark:hover:text-white$1$2hover:text-$3");
  
  // If there are two dark:text-white variants, remove the base one
  changed = changed.replace(/(['"`].*?)dark:text-white(.*?)dark:text-white\/[0-9]+(.*?['"`])/g, "$1$2dark:text-white/50$3"); // wait, just remove one
  changed = changed.replace(/(['"`].*?)dark:text-white\/[0-9]+(.*?)dark:text-white(\s|['"`])/g, "$1dark:text-white/50$2$3");

  return changed;
}

uniquePaths.forEach(file => {
  if (!fs.existsSync(file)) return;
  let lines = fs.readFileSync(file, 'utf-8').split('\n');
  let fileProblems = problems.filter(p => p.path === file);
  
  fileProblems.forEach(p => {
    let lineIdx = p.startLine - 1;
    if (lineIdx >= 0 && lineIdx < lines.length) {
      lines[lineIdx] = processLine(lines[lineIdx]);
    }
  });

  fs.writeFileSync(file, lines.join('\n'), 'utf-8');
});
console.log('Fixed lines directly');
