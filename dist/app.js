/* DOGLOVR UI. No framework, build service or runtime dependency required. */
const $ = id => document.getElementById(id);
const view = $('view');
const modal = $('modal');
let loaded;
try { loaded = DoglovrState.load(window.localStorage); }
catch { loaded = { state: DoglovrState.empty(), available: false }; }
let state = loaded.state;
let storageAvailable = loaded.available;
let category = 'All lessons';
let query = '';
let breedQuery = '';
let currentPage = '';
let modalKind = '';
let lessonId = '';
let toastTimer;
let lastTrigger;
let routeClosing = false;
let lastScroll = 0;

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function persist() {
  state = DoglovrState.normalize(state);
  try { storageAvailable = DoglovrState.save(window.localStorage, state); } catch { storageAvailable = false; }
  updateProfile();
}
function updateProfile() {
  document.querySelectorAll('[data-dog-name]').forEach(el => { el.textContent = state.dog || 'Your dog'; });
  $('storage-note').hidden = storageAvailable;
}
function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('show');
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4000);
}
function savedMessage(message) {
  toast(storageAvailable ? message : `${message} Saved for this session only; browser storage is unavailable.`);
}
function lessonLink(lesson) {
  const parent = ['home', 'learn', 'plan'].includes(currentPage) ? currentPage : 'learn';
  return `#lesson-${lesson.id}?from=${parent}`;
}
function card(lesson) {
  return `<article class="card"><a href="${lessonLink(lesson)}" aria-label="Open ${esc(lesson.title)}"><div class="card-art"><img src="${pic(lesson.img)}" alt="" loading="lazy" width="800" height="520"><span class="badge">${esc(lesson.cat)}</span></div><div class="card-body"><span class="eyebrow">${state.done.includes(lesson.id) ? '✓ Completed' : 'A little know-how'}</span><h3>${lesson.title}</h3><p>${lesson.desc}</p><div class="card-bottom"><span>◷ ${lesson.time} min · Beginner friendly</span><span class="arrow" aria-hidden="true">↗</span></div></div></a></article>`;
}
function intro(title, description) {
  return `<div class="intro"><div><h1 tabindex="-1">${title}</h1><p>${description}</p></div><span class="date">A LITTLE BETTER, TOGETHER ☀</span></div>`;
}
function home() {
  const greeting = state.dog ? `You &amp; ${esc(state.dog)}. <span class="sun">✦</span>` : 'Hey, dog person. <span class="sun">✦</span>';
  return intro(greeting, 'A little understanding goes a long way. Let’s grow together.') + `
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><span class="eyebrow">Happier dogs start with understanding</span><h2 id="hero-title">More tail wags.<br>Fewer question marks.</h2><p>Get to know the dog you love. Simple lessons for a stronger bond, from the first sit to every little signal.</p><a href="#learn" class="btn">Let’s learn something <span aria-hidden="true">↗</span></a></div><div class="hero-image"><img src="${pic('hero')}" alt="A golden retriever outdoors" width="800" height="700" fetchpriority="high"><div class="image-label">A better bond, one day at a time. ♡</div></div></section>
    <div class="stats"><div class="stat"><span class="icon" aria-hidden="true">▤</span><div><strong>${lessons.length} bite-size lessons</strong><small>Big learning. Little time.</small></div></div><div class="stat"><span class="icon" aria-hidden="true">♧</span><div><strong>${breeds.length} breed guides</strong><small>Find what makes them, them.</small></div></div><div class="stat"><span class="icon" aria-hidden="true">✧</span><div><strong>${state.done.length} lessons complete</strong><small>Every little step counts.</small></div></div></div>
    <section aria-labelledby="start-title"><div class="section-head"><h2 id="start-title">A good place to start</h2><a href="#learn">Explore all lessons ↗</a></div><div class="cards">${lessons.slice(0, 3).map(card).join('')}</div></section>
    <div class="bottom-grid"><section class="tip"><span class="eyebrow">☀ A little wisdom</span><h3>A wag isn’t the whole story.</h3><p>Look at the whole body and the situation. A wagging tail alone doesn’t always mean a dog feels friendly.</p><a href="${lessonLink(lessons[0])}">Learn to read the signals ↗</a></section><section class="breed-promo"><div><span class="eyebrow">Every dog has a story</span><h3>Get to know their roots.</h3><p>Explore traits, needs, and the quirks that make each breed special.</p><a href="#breeds">Meet the breeds ↗</a></div><img src="${pic('potty')}" alt="A curious French bulldog" width="105" height="125" loading="lazy"></section></div>`;
}
function library() {
  const categories = ['All lessons', ...new Set(lessons.map(lesson => lesson.cat))];
  return intro('A little learning. A lot of love.', 'Practical, kind guidance for every stage of dog parenthood.') + `<label class="search-label" for="lesson-search">Find your next lesson</label><div class="search-wrap"><input id="lesson-search" class="search" type="search" placeholder="Try “recall”, “pee”, or “body language”…" value="${esc(query)}" aria-controls="lessonlist"><button class="clear-search" data-action="clear-lessons" aria-label="Clear lesson search" ${query ? '' : 'hidden'}>×</button></div><div class="filters" role="group" aria-label="Lesson topics">${categories.map(cat => `<button class="filter ${cat === category ? 'selected' : ''}" data-category="${esc(cat)}" aria-pressed="${cat === category}">${esc(cat)}</button>`).join('')}</div><p id="lesson-count" class="result-count" role="status" aria-live="polite"></p><div class="cards" id="lessonlist"></div>`;
}
function learningPlan() {
  const saved = lessons.filter(lesson => state.saved.includes(lesson.id));
  const complete = lessons.filter(lesson => state.done.includes(lesson.id));
  return intro(state.dog ? `${esc(state.dog)}’s next little wins.` : 'Your next little wins.', 'Save lessons, practise together, and go at your own pace.') + `<section class="tip" aria-labelledby="progress-title"><span class="eyebrow">Your progress</span><h2 id="progress-title">${state.done.length} of ${lessons.length} lessons completed</h2><progress value="${state.done.length}" max="${lessons.length}" aria-label="Lessons completed">${state.done.length} of ${lessons.length}</progress><p>Progress is built together, one kind moment at a time.</p></section><section aria-labelledby="saved-title"><div class="section-head"><h2 id="saved-title">Saved for your dog</h2><a href="#learn">Add a lesson ↗</a></div>${saved.length ? `<div class="cards">${saved.map(card).join('')}</div>` : `<div class="empty"><h3>Your next chapter starts here.</h3><p>Open a lesson and save it to build your plan.</p><a class="btn" href="#learn">Find your first lesson ↗</a></div>`}</section>${complete.length ? `<section aria-labelledby="done-title"><div class="section-head"><h2 id="done-title">Look what you’ve learned</h2></div><div class="cards">${complete.map(card).join('')}</div></section>` : ''}<p class="local-note">Your profile and progress stay in this browser on this device. They don’t sync across devices.</p>`;
}
function breedLibrary() {
  return intro('A world of good dogs.', 'Explore their roots. Get to know the individual in front of you.') + `<label class="search-label" for="breed-search">Find a breed or group</label><div class="search-wrap"><input id="breed-search" class="search" type="search" placeholder="Try “Golden Retriever” or “Herding”…" value="${esc(breedQuery)}" aria-controls="breedcards"><button class="clear-search" data-action="clear-breeds" aria-label="Clear breed search" ${breedQuery ? '' : 'hidden'}>×</button></div><div class="section-head breed-heading"><h2>Meet the breeds</h2><p>Traits are tendencies, not promises.</p></div><p id="breed-count" class="result-count" role="status" aria-live="polite"></p><div id="breedcards" class="cards"></div>`;
}
function renderPage(page, focus = false) {
  currentPage = page;
  document.querySelectorAll('nav a').forEach(link => {
    const active = link.hash === `#${page}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  const title = { home: 'Overview', learn: 'Learning library', breeds: 'Breed explorer', plan: 'My learning plan', missing: 'Page not found' }[page];
  document.title = `${title} · DOGLOVR`;
  const pages = { home, learn: library, breeds: breedLibrary, plan: learningPlan };
  view.innerHTML = pages[page] ? pages[page]() : intro('This trail ends here.', 'We couldn’t find that page or lesson.') + '<div class="empty"><a href="#learn" class="btn">Explore the learning library ↗</a></div>';
  if (page === 'learn') renderLessons();
  if (page === 'breeds') renderBreeds();
  updateProfile();
  if (focus) view.querySelector('h1')?.focus({ preventScroll: true });
}
function renderLessons() {
  const found = DoglovrState.filterLessons(category, query);
  $('lessonlist').innerHTML = found.length ? found.map(card).join('') : `<div class="empty empty-results"><h3>No lessons on this trail.</h3><p>Try a different phrase or clear your search and topic.</p><button class="btn" data-action="reset-lessons">Show all lessons ↗</button></div>`;
  $('lesson-count').textContent = `${found.length} ${found.length === 1 ? 'lesson' : 'lessons'}${category === 'All lessons' ? '' : ` in ${category}`}`;
  document.querySelector('[data-action="clear-lessons"]').hidden = !query;
}
function renderBreeds() {
  const needle = breedQuery.trim().toLocaleLowerCase();
  const found = breeds.filter(breed => [breed.name, breed.group, breed.size].join(' ').toLocaleLowerCase().includes(needle));
  $('breed-count').textContent = `${found.length} ${found.length === 1 ? 'guide' : 'guides'}`;
  $('breedcards').innerHTML = found.length ? found.map(breed => `<article class="card breed-card"><button data-breed="${esc(breed.name)}" aria-label="Explore ${esc(breed.name)}"><div class="breed-art" aria-hidden="true"><span>${breed.name === 'Poodle' ? '🐩' : breed.name === 'Mixed breed' ? '🐾' : '🐕'}</span><span class="badge">${breed.group}</span></div><div class="card-body"><h3>${breed.name}</h3><p>${breed.size} · ${breed.energy === 'Varies' ? 'Energy varies' : `${breed.energy} energy`}</p><div class="card-bottom"><span>Get to know the breed</span><span class="arrow" aria-hidden="true">↗</span></div></div></button></article>`).join('') : `<div class="empty empty-results"><h3>No matching breeds yet.</h3><p>Our starter library has ${breeds.length} guides. Try a breed name or group.</p><button class="btn" data-action="clear-breeds">Show all guides ↗</button></div>`;
  document.querySelector('[data-action="clear-breeds"]').hidden = !breedQuery;
}
function showDialog(kind, content) {
  if (!modal.open) { lastTrigger = document.activeElement; lastScroll = window.scrollY; }
  modalKind = kind;
  $('modalbody').innerHTML = content;
  const heading = $('modalbody').querySelector('h2');
  heading.id = 'dialog-title'; heading.tabIndex = -1;
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
  document.body.classList.add('modal-open');
  heading.focus({ preventScroll: true });
}
function quizFeedback(lesson, chosen) {
  if (chosen === undefined) return '';
  return chosen === lesson.correct ? 'That’s right. Kind, clear and consistent.' : 'Not quite. Try another answer — learning takes practice.';
}
function openLesson(id) {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) return;
  lessonId = id;
  const chosen = state.answers[id];
  const source = sources[id === 'body' ? 'body' : id === 'potty' ? 'potty' : 'train'];
  showDialog('lesson', `<span class="eyebrow">${lesson.cat} · ${lesson.time} min lesson</span><h2>${lesson.heading}</h2><p>${lesson.intro}</p><h3>Try it together</h3><ol>${lesson.steps.map(step => `<li>${step}</li>`).join('')}</ol>${id === 'potty' ? '<p class="care-note">If toilet habits change suddenly, or your dog strains or seems unwell, contact your vet.</p>' : ''}<section class="quiz" aria-labelledby="quiz-title"><h3 id="quiz-title">A quick check-in</h3><p>${lesson.question}</p><div role="group" aria-label="Quiz answers">${lesson.answers.map((answer, index) => `<button data-answer="${index}" aria-pressed="${chosen === index}" class="${chosen === index ? (chosen === lesson.correct ? 'correct' : 'incorrect') : ''}">${answer}</button>`).join('')}</div><p class="quiz-result" id="quizresult" role="status">${quizFeedback(lesson, chosen)}</p></section><div class="actions"><button class="btn" id="completebtn" data-action="complete" aria-pressed="${state.done.includes(id)}">${state.done.includes(id) ? '✓ Completed · Undo' : 'Mark as complete ✓'}</button><button class="btn secondary" id="savebtn" data-action="save" aria-pressed="${state.saved.includes(id)}">${state.saved.includes(id) ? 'Remove from plan' : '♡ Save to my plan'}</button></div><p class="source">Further reading: <a href="${source}" target="_blank" rel="noopener noreferrer">RSPCA ${id === 'body' ? 'body language' : id === 'potty' ? 'toilet training' : 'reward-based training'} <span class="sr-only">(opens in a new tab)</span> ↗</a></p>`);
  document.title = `${lesson.heading} · DOGLOVR`;
}
function openBreed(name) {
  const breed = breeds.find(item => item.name === name);
  if (!breed) return;
  showDialog('breed', `<span class="eyebrow">${breed.group} · ${breed.size}</span><h2>${breed.name}</h2><p>${breed.text}</p><h3>Learning together</h3><p>${breed.focus}</p><h3>Remember the individual</h3><p>Breed can offer clues, but age, health, experience and personality shape every dog. Meet their individual needs and ask your vet about breed-specific health screening.</p><a class="btn" href="#learn">Explore training lessons ↗</a>${breed.slug ? `<p class="source">Explore the <a target="_blank" rel="noopener noreferrer" href="https://www.akc.org/dog-breeds/${breed.slug}/">AKC breed guide <span class="sr-only">(opens in a new tab)</span> ↗</a></p>` : ''}`);
}
function editProfile() {
  showDialog('profile', `<span class="eyebrow">Your best friend</span><h2>Make it their journey.</h2><form id="profile-form"><label class="form-field" for="doginput">What’s your dog’s name?<input id="doginput" name="dog" maxlength="40" value="${esc(state.dog)}" placeholder="e.g. Milo" autocomplete="off" aria-describedby="profile-help"></label><p id="profile-help">Your dog’s name is optional. Your profile and progress are stored only in this browser on this device.</p><button class="btn" type="submit">Save profile ♡</button></form>`);
}
function closeDialog(restoreFocus = true) {
  const wasLesson = modalKind === 'lesson';
  routeClosing = true;
  modal.close();
  document.body.classList.remove('modal-open');
  modalKind = '';
  if (wasLesson) history.replaceState(null, '', `#${DoglovrState.route(location.hash).page}`);
  renderPage(currentPage);
  const fallback = (wasLesson && view.querySelector(`a[href^="#lesson-${lessonId}"]`)) || view.querySelector('h1');
  if (restoreFocus) (lastTrigger?.isConnected ? lastTrigger : fallback)?.focus({ preventScroll: true });
  window.scrollTo({ top: lastScroll, behavior: 'instant' });
}
function navigate(initial = false) {
  const route = DoglovrState.route(location.hash);
  if (modal.open) { routeClosing = true; modal.close(); document.body.classList.remove('modal-open'); modalKind = ''; }
  const changed = currentPage !== route.page;
  if (changed || !route.lesson) renderPage(route.page, !initial && !route.lesson);
  if (changed) window.scrollTo({ top: 0, behavior: 'instant' });
  if (route.lesson) openLesson(route.lesson);
}
function selectAnswer(index) {
  const lesson = lessons.find(item => item.id === lessonId);
  if (!lesson || !Number.isInteger(index) || index < 0 || index >= lesson.answers.length) return;
  state.answers[lessonId] = index; persist();
  $('quizresult').textContent = quizFeedback(lesson, index);
  modal.querySelectorAll('[data-answer]').forEach(button => {
    const selected = Number(button.dataset.answer) === index;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('correct', selected && index === lesson.correct);
    button.classList.toggle('incorrect', selected && index !== lesson.correct);
  });
}
function completeLesson() {
  state.done = DoglovrState.toggle(state.done, lessonId); persist();
  const complete = state.done.includes(lessonId);
  $('completebtn').textContent = complete ? '✓ Completed · Undo' : 'Mark as complete ✓';
  $('completebtn').setAttribute('aria-pressed', String(complete));
  savedMessage(complete ? 'One little lesson. One big step together.' : 'Lesson marked as incomplete.');
}
function saveLesson() {
  state.saved = DoglovrState.toggle(state.saved, lessonId); persist();
  const saved = state.saved.includes(lessonId);
  $('savebtn').textContent = saved ? 'Remove from plan' : '♡ Save to my plan';
  $('savebtn').setAttribute('aria-pressed', String(saved));
  savedMessage(saved ? 'Added to your learning plan.' : 'Removed from your plan.');
}
const actions = {
  profile: editProfile, close: () => closeDialog(), complete: completeLesson, save: saveLesson,
  'clear-lessons': () => { query = ''; $('lesson-search').value = ''; renderLessons(); $('lesson-search').focus(); },
  'clear-breeds': () => { breedQuery = ''; $('breed-search').value = ''; renderBreeds(); $('breed-search').focus(); },
  'reset-lessons': () => { query = ''; category = 'All lessons'; renderPage('learn'); $('lesson-search').focus(); }
};
document.addEventListener('click', event => {
  const target = event.target.closest('button, a');
  if (!target) return;
  if (target.classList.contains('skip-link')) { event.preventDefault(); $('main').focus(); return; }
  if (target.dataset.action) actions[target.dataset.action]?.();
  if (target.dataset.category) {
    category = target.dataset.category;
    document.querySelectorAll('[data-category]').forEach(button => { const selected = button.dataset.category === category; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); });
    renderLessons();
  }
  if (target.dataset.breed) openBreed(target.dataset.breed);
  if (target.dataset.answer !== undefined) selectAnswer(Number(target.dataset.answer));
  if (target.tagName === 'A' && modal.open && modalKind !== 'lesson' && target.hash === location.hash) closeDialog();
});
document.addEventListener('input', event => {
  if (event.target.id === 'lesson-search') { query = event.target.value; renderLessons(); }
  if (event.target.id === 'breed-search') { breedQuery = event.target.value; renderBreeds(); }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'profile-form') return;
  event.preventDefault(); state.dog = $('doginput').value.trim(); persist(); closeDialog(); savedMessage('Dog profile updated.');
});
modal.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
modal.addEventListener('close', () => { if (routeClosing) { routeClosing = false; return; } document.body.classList.remove('modal-open'); });
window.addEventListener('hashchange', () => navigate());
window.addEventListener('storage', event => {
  if (event.key !== 'doglovr' && event.key !== null) return;
  try { loaded = DoglovrState.load(window.localStorage); state = loaded.state; storageAvailable = loaded.available; } catch { return; }
  if (modalKind === 'lesson') openLesson(lessonId); else renderPage(currentPage);
  updateProfile();
});
navigate(true);
