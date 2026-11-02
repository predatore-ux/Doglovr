import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({});
vm.runInContext(readFileSync(resolve(root, 'dist/data.js'), 'utf8') + '\n' + readFileSync(resolve(root, 'dist/guides.js'), 'utf8') + '\nthis.catalog = { lessons, breeds, lessonGuides, breedKey };', context);
const { lessons, breeds, lessonGuides, breedKey } = context.catalog;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const outputs = [];
function emit(path, text) { outputs.push([resolve(root, 'dist', path), text]); }
const shell = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
for (const lesson of lessons) {
  emit(`lessons/${lesson.id}/index.html`, shell.replace('<head>', '<head>\n  <base href="../../">').replace('<body>', `<body data-lesson="${lesson.id}">`).replace(/<title>.*?<\/title>/, `<title>${esc(lesson.heading)} · DOGLOVR</title>`));
}
for (const breed of breeds) {
  emit(`breeds/${breedKey(breed.name)}/index.html`, shell.replace('<head>', '<head>\n  <base href="../../">').replace('<body>', `<body data-breed="${breedKey(breed.name)}">`).replace(/<title>.*?<\/title>/, `<title>${esc(breed.name)} · DOGLOVR</title>`));
}

function dog(pose = 'stand', coat = '#c99654', patches = '') {
  const lower = pose === 'rest' ? '<ellipse cx="270" cy="286" rx="100" ry="35" fill="'+coat+'"/><path d="M210 307h145" stroke="'+coat+'" stroke-width="20" stroke-linecap="round"/>' : pose === 'sit' ? '<path d="M251 208q-58 27-48 88h81l12-72" fill="'+coat+'"/><path d="M280 245v65m-49-16h-35" stroke="'+coat+'" stroke-width="20" stroke-linecap="round"/>' : '<rect x="166" y="215" width="150" height="67" rx="32" fill="'+coat+'"/><path d="M188 262v51m98-51v51m-117-80q-52 4-54-37" fill="none" stroke="'+coat+'" stroke-width="19" stroke-linecap="round"/>';
  return `<g>${lower}${patches}<path d="M287 253l16-61" stroke="${coat}" stroke-width="52" stroke-linecap="round"/><ellipse cx="317" cy="187" rx="43" ry="37" fill="${coat}"/>${coat === '#46514c' ? '<path d="M285 172l5-49 31 38" fill="#35433d"/><path d="M300 231l18 28-35-5z" fill="#f5f2e7"/>' : '<path d="M290 165q-30-7-27 31t25 37" fill="#936338"/>'}<ellipse cx="352" cy="202" rx="27" ry="19" fill="#edce9d"/><ellipse cx="373" cy="197" rx="8" ry="6" fill="#253c32"/><circle cx="331" cy="180" r="4" fill="#253c32"/><path d="M339 215q12 7 22 0" fill="none" stroke="#6b4b33" stroke-width="3" stroke-linecap="round"/><path d="M289 229l28 9" stroke="#456d55" stroke-width="10" stroke-linecap="round"/></g>`;
}
function human(x = 510, seated = false) {
  return `<g fill="none" stroke="#456d55" stroke-width="15" stroke-linecap="round"><circle cx="${x}" cy="133" r="22" fill="#e7bea0" stroke="none"/><path d="M${x} 170v${seated ? '63' : '76'}m0 0l-25 ${seated ? '10' : '64'}m25-${seated ? '10' : '64'}l25 ${seated ? '10' : '64'}M${x} 188l-50 28"/></g>`;
}
const notebook = `<g transform="translate(460 150)"><rect width="128" height="156" rx="10" fill="#fffdf6" stroke="#73866b" stroke-width="3"/><path d="M22 33h85M22 65h85M22 97h85M22 129h55" stroke="#c0cbb6" stroke-width="7"/><path d="M-7 22h14m-14 35h14m-14 35h14m-14 35h14" stroke="#456d55" stroke-width="5"/></g>`;
function diagram(lesson, step, index) {
  const art = step.art;
  const outdoor = ['routine','outside','reward','enclosed','call','return','distance','sniff'].includes(art);
  const seated = ['sit','cue','stay'].includes(art);
  const pose = art === 'rest' ? 'rest' : seated ? 'sit' : 'stand';
  let scene = '';
  if (outdoor) scene += '<path d="M55 283v-94m-25 40 25-54 25 54" stroke="#9aac83" stroke-width="8" fill="#bbc8a5"/><path d="M610 284v-104m-28 45 28-60 28 60" stroke="#9aac83" stroke-width="8" fill="#bbc8a5"/>';
  if (['enclosed','distance'].includes(art)) scene += '<path d="M60 276V145m45 131V145m45 131V145m390 131V145m45 131V145m45 131V145M60 166h90m390 0h90" stroke="#b5ac91" stroke-width="7"/>';
  if (['mat','approach','stay','release','treat','rest'].includes(art)) scene += '<rect x="135" y="293" width="260" height="31" rx="15" fill="#a8bb93"/><path d="M155 306h218" stroke="#859e70" stroke-width="3" stroke-dasharray="8 6"/>';
  if (art === 'rest') scene += '<path d="M75 128h100v130H75z" fill="#e3e5d5"/><path d="M93 148h64v47H93z" fill="#fbfaf3"/><text x="490" y="206" font-size="35" fill="#73866b">Z z</text>';
  if (['observe','check','routine','clean'].includes(art)) scene += notebook;
  if (art === 'water') scene += '<path d="M420 272h90l-12 42h-66z" fill="#8eaeb5"/><ellipse cx="465" cy="272" rx="45" ry="10" fill="#b9d9dc"/><path d="M540 280h75l-9 34h-57z" fill="#cb9870"/><ellipse cx="577" cy="280" rx="37" ry="8" fill="#e5c49e"/>';
  if (art === 'clean') scene += '<rect x="75" y="232" width="37" height="74" rx="7" fill="#8eaeb5"/><path d="M83 229v-17h35" stroke="#456d55" stroke-width="9"/><path d="M120 299h38l16 14h-55z" fill="#d4bb75"/>';
  if (!['rest','water','clean','observe','check','routine'].includes(art)) scene += human(art === 'space' ? 555 : 510, art === 'choice');
  scene += dog(pose);
  if (['treat','lure','sit','cue','reward','return','mat','approach','stay'].includes(art)) scene += '<circle cx="442" cy="215" r="8" fill="#c88836" stroke="#9c6d2b" stroke-width="2"/>';
  if (art === 'lure') scene += '<path d="M377 172q30-78-37-82" stroke="#d2ab46" stroke-width="5" fill="none" marker-end="url(#arrow)"/>';
  if (['call','return','release','choice','sniff','approach'].includes(art)) scene += '<path d="M370 291q30-40 73-11" stroke="#a48533" stroke-width="4" fill="none" stroke-dasharray="7 6" marker-end="url(#arrow)"/>';
  if (['outside','distance'].includes(art)) scene += '<path d="M303 232q90 74 157-16" stroke="#547c6b" stroke-width="3" fill="none"/>';
  if (art === 'space') scene += '<path d="M403 174v113" stroke="#b49857" stroke-width="3" stroke-dasharray="7 7"/><path d="M180 159H95" stroke="#a48533" stroke-width="4" marker-end="url(#arrow)"/>';
  if (['sit','cue','call','stay','release'].includes(art)) {
    const word = {sit:'yes',cue:'sit',call:'come',stay:'mat',release:'free'}[art];
    scene += `<rect x="426" y="66" width="130" height="46" rx="22" fill="#fffdf6"/><text x="491" y="96" text-anchor="middle" font-size="21" fill="#253c32">${word}</text>`;
  }
  if (art === 'look') scene += '<path d="M335 151l29-35m-151 86-21-44" stroke="#8a9c70" stroke-width="2"/><circle cx="334" cy="180" r="17" fill="none" stroke="#d2ab46" stroke-width="3"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" role="img"><title>${esc(step.alt)}</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0l10 5-10 5z" fill="#a48533"/></marker></defs><rect width="720" height="400" rx="20" fill="${outdoor?'#edf1e3':'#f3efdf'}"/><circle cx="632" cy="64" r="26" fill="#e6dba9"/><path d="M35 322h650" stroke="#cbd2bd" stroke-width="3"/>${scene}<g font-family="Segoe UI,Arial,sans-serif"><rect x="27" y="23" width="94" height="31" rx="15" fill="#244b38"/><text x="74" y="44" text-anchor="middle" font-size="13" fill="white">STEP ${index+1}</text><text x="32" y="365" font-size="17" font-weight="600" fill="#3d5742">${esc(step.labels[0])}</text><text x="688" y="365" text-anchor="end" font-size="17" fill="#61705e">${esc(step.labels[1])}</text></g></svg>`;
}
for (const lesson of lessons) lessonGuides[lesson.id].steps.forEach((step, index) => emit(`assets/guides/${lesson.id}-${index+1}.svg`, diagram(lesson, step, index)));
for (const breed of breeds) {
  const coat = breed.name === 'Border Collie' ? '#46514c' : breed.name === 'Poodle' ? '#b6a18e' : breed.name === 'Labrador Retriever' ? '#d4b981' : '#c99654';
  const patches = breed.name === 'Beagle' ? '<ellipse cx="230" cy="236" rx="46" ry="23" fill="#68523e"/>' : breed.name === 'Border Collie' ? '<path d="M300 211l21 32-36 0z" fill="#f6f4e9"/>' : '';
  const curls = breed.name === 'Poodle' ? '<g fill="#b6a18e"><circle cx="290" cy="158" r="22"/><circle cx="315" cy="153" r="23"/><circle cx="340" cy="161" r="20"/><circle cx="188" cy="303" r="18"/><circle cx="286" cy="303" r="18"/></g>' : '';
  emit(`assets/breeds/${breedKey(breed.name)}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400"><title>Stylized ${esc(breed.name)} illustration</title><rect width="720" height="400" rx="20" fill="#e9eddf"/><circle cx="563" cy="106" r="60" fill="#e6dba9"/><path d="M80 331h560" stroke="#c6d0b5" stroke-width="4"/><g transform="translate(95 0) scale(1.05)">${dog('stand',coat,patches)}${curls}</g><text x="36" y="55" font-family="Segoe UI,Arial,sans-serif" font-size="15" fill="#54704e">EVERY DOG IS AN INDIVIDUAL</text></svg>`);
}
for (const [path, text] of outputs) {
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== text) throw new Error(`Generated file is stale: ${path}`);
  } else { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); }
}
console.log(`${outputs.length} generated pages and illustrations ${process.argv.includes('--check') ? 'verified' : 'written'}.`);
