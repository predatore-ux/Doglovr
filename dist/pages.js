/* Full-page learning experiences and their small interactive controls. */
let activeBreed = '';
let returnPage = 'learn';
let timerHandle;
let timerRemaining = 120;
let timerDeadline = 0;

function detailRoute() {
  const parent = new URLSearchParams(location.search).get('from');
  const safeParent = ['home', 'learn', 'plan'].includes(parent) ? parent : 'learn';
  if (document.body.dataset.lesson) {
    const id = document.body.dataset.lesson;
    return lessons.some(l => l.id === id) ? { page: 'lesson', lesson: id, parent: safeParent } : { page: 'missing' };
  }
  if (document.body.dataset.breed) {
    const breed = breeds.find(b => breedKey(b.name) === document.body.dataset.breed);
    return breed ? { page: 'breed', breed: breed.name } : { page: 'missing' };
  }
  const legacy = DoglovrState.route(location.hash);
  if (legacy.lesson) return { page: 'lesson', lesson: legacy.lesson, parent: legacy.page };
  return legacy;
}

function lessonPage(id) {
  const lesson = lessons.find(item => item.id === id);
  const guide = lessonGuides[id];
  if (!lesson || !guide) return intro('This trail ends here.', 'That lesson is not available.');
  const completed = state.done.includes(id);
  const chosen = state.answers[id];
  const next = lessons[(lessons.findIndex(item => item.id === id) + 1) % lessons.length];
  return `<article class="detail-page lesson-page">
    <div class="breadcrumbs"><a href="#${returnPage}">← Back to ${returnPage === 'plan' ? 'your learning plan' : returnPage === 'home' ? 'overview' : 'the learning library'}</a><span>${lesson.cat}</span></div>
    <section class="detail-hero"><div><span class="eyebrow">A little understanding. A lifelong bond.</span><h1 tabindex="-1">${lesson.heading}</h1><p>${guide.goal}</p><div class="detail-tags"><span>${lesson.time} min · Read + practise</span><span>4 illustrated steps</span><span>Beginner friendly</span></div><div class="actions"><button class="btn" data-action="jump-first">Start the first step ↓</button><button class="btn secondary" id="savebtn" data-action="save" aria-pressed="${state.saved.includes(id)}">${state.saved.includes(id) ? 'Remove from plan' : '♡ Save to my plan'}</button></div></div><img src="assets/guides/${id}-1.svg" alt="${esc(guide.steps[0].alt)}" width="720" height="400" fetchpriority="high"></section>
    <div class="lesson-layout"><aside class="lesson-rail" aria-label="Lesson contents"><span class="eyebrow">Your path through this lesson</span><ol>${guide.steps.map((step, index) => `<li><button data-jump="${index}"><span>${String(index + 1).padStart(2, '0')}</span>${step.title}</button></li>`).join('')}</ol><div class="rail-progress"><strong id="practice-count"></strong><progress id="practice-progress" max="${guide.steps.length}" value="0" aria-label="Steps practised"></progress><small>Practice ticks are saved on this device.</small></div><button class="text-button" data-action="jump-quiz">Try the check-in ↓</button></aside>
    <div class="lesson-content"><section class="preparation" aria-labelledby="prepare-title"><span class="eyebrow">Before you begin</span><h2 id="prepare-title">Set yourselves up for a little win.</h2><p>${lesson.intro}</p><ul class="kit-list">${guide.kit.map(item => `<li><span aria-hidden="true">✓</span>${item}</li>`).join('')}</ul><p class="care-note">${guide.note}</p></section>
    <div class="step-stack">${guide.steps.map((step, index) => `<section class="lesson-step" id="practice-step-${index}" aria-labelledby="step-title-${index}"><div class="step-heading"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><h2 id="step-title-${index}">${step.title}</h2></div><figure><img src="assets/guides/${id}-${index + 1}.svg" alt="${esc(step.alt)}" width="720" height="400" loading="lazy"><figcaption>${step.labels.join(' · ')}. Simplified instructional illustration.</figcaption></figure><p class="step-instructions">${step.instructions}</p><div class="step-explainer"><h3>Why it helps</h3><p>${step.why}</p></div><div class="practice-prompt"><span class="eyebrow">Try it together</span><p>${step.practice}</p><label class="practice-checkbox"><input type="checkbox" data-practice-step="${index}" ${state.practice[id]?.includes(index) ? 'checked' : ''}><span>I practised this step</span></label></div><details><summary>Need to make it easier?</summary><p>${step.fix}</p></details></section>`).join('')}</div>
    <section class="practice-timer" aria-labelledby="timer-title"><div><span class="eyebrow">Small sessions. Happy endings.</span><h2 id="timer-title">Make time for a little practice.</h2><p>Use a short timer as a reminder to pause. Stop sooner if your dog needs a break.</p><label for="practice-duration">Practice session</label><select id="practice-duration"><option value="60">1 minute</option><option value="120" selected>2 minutes</option><option value="180">3 minutes</option></select></div><div class="timer-controls"><output id="practice-clock" role="timer" aria-live="off">02:00</output><div><button class="btn" id="timer-toggle" data-action="timer-toggle">Start timer</button><button class="btn secondary" data-action="timer-reset">Reset</button></div><p id="timer-status" role="status">Ready when you are.</p></div></section>
    <section class="page-quiz quiz" id="lesson-quiz" aria-labelledby="quiz-title"><span class="eyebrow">Bring it all together</span><h2 id="quiz-title">A quick check-in</h2><p>${lesson.question}</p><div role="group" aria-label="Quiz answers">${lesson.answers.map((answer, index) => `<button data-answer="${index}" aria-pressed="${chosen === index}" class="${chosen === index ? (chosen === lesson.correct ? 'correct' : 'incorrect') : ''}">${answer}</button>`).join('')}</div><p class="quiz-result" id="quizresult" role="status">${quizFeedback(lesson, chosen)}</p></section>
    <section class="lesson-finish"><div><span class="eyebrow">One kind moment at a time</span><h2>A little more confident, together.</h2><p>Mark this lesson complete when you are ready. Revisit the steps any time; practice does not have to be perfect.</p></div><button class="btn" id="completebtn" data-action="complete" aria-pressed="${completed}">${completed ? '✓ Completed · Undo' : 'Mark as complete ✓'}</button></section>
    <p class="source">Continue learning: <a href="${guide.source}" target="_blank" rel="noopener noreferrer">${guide.sourceName} <span class="sr-only">(opens in a new tab)</span> ↗</a></p><div class="next-lesson"><span class="eyebrow">Your next little win</span><a href="lessons/${next.id}/?from=learn">${next.heading} <span aria-hidden="true">→</span></a><a class="text-button" href="#learn">Explore all lessons</a></div></div></div>
  </article>`;
}

function updatePractice() {
  const count = state.practice[lessonId]?.length || 0;
  if ($('practice-count')) $('practice-count').textContent = `${count} of ${lessonGuides[lessonId].steps.length} steps practised`;
  if ($('practice-progress')) $('practice-progress').value = count;
}
function setPractice(index, checked) {
  const guide = lessonGuides[lessonId];
  if (!guide || !Number.isInteger(index) || index < 0 || index >= guide.steps.length) return;
  const current = state.practice[lessonId] || [];
  state.practice[lessonId] = checked ? [...new Set([...current, index])] : current.filter(item => item !== index);
  persist(); updatePractice();
}
function jumpTo(id) { $(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }
function stopTimer() { clearInterval(timerHandle); timerHandle = undefined; }
function paintTimer() {
  if (!$('practice-clock')) { stopTimer(); return; }
  $('practice-clock').textContent = `${String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:${String(timerRemaining % 60).padStart(2, '0')}`;
}
function resetTimer() {
  stopTimer(); timerRemaining = Number($('practice-duration')?.value || 120); paintTimer();
  $('timer-toggle').textContent = 'Start timer'; $('timer-status').textContent = 'Ready when you are.';
}
function toggleTimer() {
  if (timerHandle) {
    timerRemaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000)); stopTimer(); paintTimer();
    $('timer-toggle').textContent = 'Resume timer'; $('timer-status').textContent = 'Paused. Take your time.'; return;
  }
  if (timerRemaining <= 0) timerRemaining = Number($('practice-duration').value);
  timerDeadline = Date.now() + timerRemaining * 1000;
  $('timer-toggle').textContent = 'Pause timer'; $('timer-status').textContent = 'Practise gently. You can stop whenever you need.';
  timerHandle = setInterval(() => {
    timerRemaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000)); paintTimer();
    if (!timerRemaining) { stopTimer(); $('timer-toggle').textContent = 'Start again'; $('timer-status').textContent = 'Time for a break. A small session is a win.'; }
  }, 250);
}

function breedPage(name) {
  const breed = breeds.find(item => item.name === name);
  const detail = breedDetails[name];
  if (!breed || !detail) return intro('This trail ends here.', 'That breed guide is not available.');
  return `<article class="detail-page breed-detail"><div class="breadcrumbs"><a href="#breeds">← Back to breed explorer</a><span>Know their roots. Love the individual.</span></div><section class="detail-hero"><div><span class="eyebrow">${breed.group} · Breed guide</span><h1 tabindex="-1">${breed.name}</h1><p>${breed.text}</p><div class="detail-tags"><span>${breed.size}</span><span>${breed.energy === 'Varies' ? 'Energy varies' : `${breed.energy} energy`}</span><span>Every dog is an individual</span></div></div><img src="assets/breeds/${breedKey(name)}.svg" alt="Stylized illustration of a ${esc(name)}; individual dogs vary in appearance" width="720" height="400"></section>
    <nav class="detail-tabs" aria-label="Breed guide sections"><button data-breed-jump="breed-background">Their story</button><button data-breed-jump="breed-care">Daily care</button><button data-breed-jump="breed-training">Learning together</button><button data-breed-jump="breed-fit">Life with this dog</button></nav>
    <div class="breed-detail-grid"><div><section class="article-panel" id="breed-background"><span class="eyebrow">Where they come from</span><h2>A little background goes a long way.</h2><p>${detail.history}</p><p>Breed history can offer useful clues, but age, health, experience and personality shape the dog you live with.</p></section>
    <section class="article-panel" id="breed-care"><span class="eyebrow">Care that fits the individual</span><h2>Build a day around their needs.</h2><h3>Coat and comfort</h3><p>${detail.coat}</p><h3>Enrichment ideas to try</h3><ul class="breed-activities">${detail.enrichment.map(activity => `<li>${activity}</li>`).join('')}</ul><div class="life-stage"><label for="life-stage">Tailor the starting point</label><select id="life-stage"><option value="adult">Adult dog</option><option value="puppy">Puppy</option><option value="senior">Older dog</option></select><p id="stage-advice" role="status">Balance suitable movement, sniffing, learning and undisturbed rest. Adjust to your individual dog.</p></div></section>
    <section class="article-panel" id="breed-training"><span class="eyebrow">Kind training, clear communication</span><h2>Make learning part of your bond.</h2><p>${detail.training}</p><p>${breed.focus}</p><div class="breed-lesson-links"><a href="lessons/body/?from=learn">Read their body language ↗</a><a href="lessons/task/?from=learn">Build a mat station ↗</a><a href="lessons/care/?from=learn">Explore daily essentials ↗</a></div></section>
    <section class="article-panel" id="breed-fit"><span class="eyebrow">Life together</span><h2>Think about your everyday fit.</h2><p>${detail.fit}</p><h3>Questions for your household</h3><details><summary>Do we have time for their daily needs?</summary><p>Consider companionship, activity, rest, grooming and short training sessions. Plan for busy days as well as ideal days.</p></details><details><summary>What support might this dog need?</summary><p>Ask the breeder or rehoming organization about the dog’s history and needs. Discuss relevant health screening and preventive care with your veterinary team.</p></details><details><summary>What should we learn first?</summary><p>Begin with body language and a predictable routine, then practise one useful skill at a time. Keep rewards and expectations suitable for the individual dog.</p></details></section>
    ${breed.slug ? `<p class="source">Further reading: <a target="_blank" rel="noopener noreferrer" href="https://www.akc.org/dog-breeds/${breed.slug}/">AKC ${breed.name} guide <span class="sr-only">(opens in a new tab)</span> ↗</a></p>` : ''}</div>
    <aside class="breed-facts" aria-label="Breed at a glance"><span class="eyebrow">At a glance</span><h2>${breed.name}</h2><dl><dt>Group</dt><dd>${breed.group}</dd><dt>Size</dt><dd>${breed.size}</dd><dt>Activity tendency</dt><dd>${breed.energy}</dd></dl><p>These are broad tendencies, not promises about a particular dog.</p><a class="btn" href="#learn">Find a lesson ↗</a></aside></div></article>`;
}

document.addEventListener('change', event => {
  if (event.target.matches('[data-practice-step]')) setPractice(Number(event.target.dataset.practiceStep), event.target.checked);
  if (event.target.id === 'practice-duration') resetTimer();
  if (event.target.id === 'life-stage') {
    const advice = { adult: 'Balance suitable movement, sniffing, learning and undisturbed rest. Adjust to your individual dog.', puppy: 'Keep experiences gentle and brief, provide frequent rest and toilet opportunities, and ask your vet about safe socialization and activity.', senior: 'Adapt activities for comfort and mobility. Offer easy access to rest and water, and ask your vet about changes in behaviour or stamina.' };
    $('stage-advice').textContent = advice[event.target.value];
  }
});
