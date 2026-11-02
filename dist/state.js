/* Pure, validated state shared by the app and regression tests. */
const DoglovrState = (() => {
  const lessonIds = new Set(lessons.map(lesson => lesson.id));
  const empty = () => ({ version: 1, dog: '', saved: [], done: [], answers: {}, practice: {} });
  function normalize(input) {
    const value = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const ids = list => Array.isArray(list) ? [...new Set(list.filter(id => lessonIds.has(id)))] : [];
    const answers = {};
    const practice = {};
    for (const lesson of lessons) {
      const answer = value.answers?.[lesson.id];
      if (Number.isInteger(answer) && answer >= 0 && answer < lesson.answers.length) answers[lesson.id] = answer;
      const steps = value.practice?.[lesson.id];
      if (Array.isArray(steps)) practice[lesson.id] = [...new Set(steps.filter(index => Number.isInteger(index) && index >= 0 && index < 4))];
    }
    return { version: 1, dog: typeof value.dog === 'string' ? value.dog.trim().slice(0, 40) : '', saved: ids(value.saved), done: ids(value.done), answers, practice };
  }
  function load(storage) {
    let raw;
    try { raw = storage.getItem('doglovr'); } catch { return { state: empty(), available: false }; }
    try { return { state: normalize(JSON.parse(raw)), available: true }; }
    catch { return { state: empty(), available: true }; }
  }
  function save(storage, state) {
    try { storage.setItem('doglovr', JSON.stringify(normalize(state))); return true; } catch { return false; }
  }
  function toggle(list, id) {
    if (!lessonIds.has(id)) return list;
    return list.includes(id) ? list.filter(item => item !== id) : [...list, id];
  }
  function filterLessons(category, query) {
    const needle = query.trim().toLocaleLowerCase();
    return lessons.filter(lesson => (category === 'All lessons' || lesson.cat === category) &&
      [lesson.title, lesson.desc, lesson.cat, lesson.heading, lesson.intro, ...lesson.steps].join(' ').toLocaleLowerCase().includes(needle));
  }
  function route(hash) {
    const [path, search = ''] = hash.replace(/^#/, '').split('?');
    const from = new URLSearchParams(search).get('from');
    const parent = ['home', 'learn', 'plan'].includes(from) ? from : 'learn';
    if (path.startsWith('lesson-')) {
      const id = path.slice(7);
      return lessonIds.has(id) ? { page: parent, lesson: id } : { page: 'missing' };
    }
    if (!path || path === 'main') return { page: 'home' };
    return { page: ['home', 'learn', 'breeds', 'plan'].includes(path) ? path : 'missing' };
  }
  return Object.freeze({ empty, normalize, load, save, toggle, filterLessons, route });
})();
