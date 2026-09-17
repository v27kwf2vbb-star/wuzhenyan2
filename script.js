/* ==========================================================================
   五珍燕数字食养服务平台 · 交互脚本
   ========================================================================== */

/* ---------- 公共元素 ---------- */
const homeView = document.querySelector('#home-view');
const pendingCards = document.querySelectorAll('.is-pending');
const knowledgeEntry = document.querySelector('#knowledge-entry');
const knowledgeDetail = document.querySelector('#knowledge-detail');
const detailClose = document.querySelector('#detail-close');
const quizEntry = document.querySelector('#quiz-entry');
const quizView = document.querySelector('#quiz-view');
const quizClose = document.querySelector('#quiz-close');
const pageTitle = document.querySelector('#page-title');
const toast = document.querySelector('#toast');

let toastTimer;

function showToast() {
  window.clearTimeout(toastTimer);
  toast.classList.add('is-visible');
  toast.setAttribute('aria-hidden', 'false');

  toastTimer = window.setTimeout(hideToast, 2400);
}

function hideToast() {
  window.clearTimeout(toastTimer);
  toast.classList.remove('is-visible');
  toast.setAttribute('aria-hidden', 'true');
}

/* ---------- 视图切换 ---------- */
function openView(view, entry, focusTarget) {
  hideToast();

  homeView.hidden = true;
  view.hidden = false;
  if (entry) entry.setAttribute('aria-expanded', 'true');
  document.body.classList.add('is-detail-open');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
}

function closeView(view, entry) {
  view.hidden = true;
  homeView.hidden = false;
  if (entry) entry.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('is-detail-open');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  window.requestAnimationFrame(() => pageTitle.focus({ preventScroll: true }));
}

pendingCards.forEach((card) => {
  card.addEventListener('click', showToast);
});

knowledgeEntry.addEventListener('click', () => openView(knowledgeDetail, knowledgeEntry, detailClose));
detailClose.addEventListener('click', () => closeView(knowledgeDetail, knowledgeEntry));

/* ==========================================================================
   AI 体质自测
   依据 GB/T 46939-2025《中医体质分类与判定》
   ========================================================================== */

/* ---------- 题库（共 26 题） ---------- */
const QUESTIONS = [
  '您精力充沛吗？',
  '您容易疲乏吗？',
  '您感到闷闷不乐、情绪低沉吗？',
  '您比一般人耐受不了寒冷吗？',
  '您容易气短（呼吸短促，接不上气）吗？',
  '您容易心慌吗？',
  '您胃脘部、背部或腰膝部怕冷吗？',
  '您感到怕冷、衣服比别人穿得多吗？',
  '您感觉身体、脸上发热吗？',
  '您皮肤或口唇干吗？',
  '您面部两颧潮红或偏红吗？',
  '您感到身体沉重不轻松或不爽快吗？',
  '您腹部肥满松软吗？',
  '您嘴里有黏黏的感觉吗？',
  '您面部或鼻部有油腻感或者油亮发光吗？',
  '您小便时尿道有发热感、尿色浓（深）吗？',
  '您下身是否有分泌物发黄、黏腻，或阴囊潮湿的情况？',
  '您身体上有哪里疼痛吗？',
  '您面色晦暗或容易出现褐斑吗？',
  '您口唇颜色偏暗吗？',
  '您容易精神紧张、焦虑不安吗？',
  '您多愁善感、感情脆弱吗？',
  '您没有感冒时也会打喷嚏吗？',
  '您容易过敏（药物、食物、气味、花粉或换季时）吗？',
  '您的皮肤容易起荨麻疹（风团）吗？',
  '您的皮肤一抓就红，并出现抓痕吗？'
];

/* 个别题目的补充说明（键为题号） */
const QUESTION_NOTES = {
  17: '男女均作答，本题按 1 题计分'
};

/* ---------- 五级评分 ---------- */
const SCALE = [
  { value: 1, label: '没有', hint: '根本不' },
  { value: 2, label: '很少', hint: '有一点' },
  { value: 3, label: '有时', hint: '有些' },
  { value: 4, label: '经常', hint: '相当' },
  { value: 5, label: '总是', hint: '非常' }
];

/* ---------- 九种体质：条目、反向计分与调养建议 ---------- */
const TYPES = [
  {
    key: 'pinghe',
    name: '平和质',
    en: 'BALANCED',
    seal: '和',
    items: [1, 2, 3, 4],
    reverse: [2, 3, 4],
    brief: '阴阳气血调和，体态适中、精力充沛',
    signs: '面色红润、精力充沛、睡眠与食欲良好，对外界环境适应能力较强。',
    care: [
      '保持规律作息与均衡饮食，不过饥过饱',
      '维持适度运动习惯，四季随气候调整强度',
      '心态平和，避免情绪大起大落'
    ],
    diet: '饮食宜清淡有节、五味调和，不宜长期偏食或过食生冷油腻。'
  },
  {
    key: 'qixu',
    name: '气虚质',
    en: 'QI DEFICIENCY',
    seal: '气',
    items: [2, 5, 6],
    brief: '元气不足，易疲乏、气短、自汗',
    signs: '平素语音低弱、容易疲乏、精神不振，活动后出汗较多，易反复感冒。',
    care: [
      '起居有常，避免熬夜与过度劳累',
      '运动宜缓不宜猛，可选散步、八段锦、太极等',
      '饮食定时定量，细嚼慢咽，忌过度节食'
    ],
    diet: '日常可留意山药、莲子、芡实等性味平和的药食同源食材。'
  },
  {
    key: 'yangxu',
    name: '阳虚质',
    en: 'YANG DEFICIENCY',
    seal: '阳',
    items: [4, 7, 8],
    brief: '阳气不足，畏寒怕冷、手足不温',
    signs: '比常人怕冷，胃脘、腰膝或背部易觉凉，喜热饮食，精神偏于不振。',
    care: [
      '注意腰腹、背部与足部保暖，少吹冷风空调',
      '适度晒太阳，可在日间进行温和运动',
      '避免长时间处于潮湿阴冷环境'
    ],
    diet: '饮食宜温热，少食生冷寒凉与冰镇饮品。'
  },
  {
    key: 'yinxu',
    name: '阴虚质',
    en: 'YIN DEFICIENCY',
    seal: '阴',
    items: [9, 10, 11],
    brief: '阴液偏少，易口干、手足心热',
    signs: '常感身体或面部发热、皮肤口唇偏干、两颧潮红，偏喜冷饮。',
    care: [
      '保证睡眠、尽量不熬夜，避免过劳',
      '运动以中小强度为主，避免大汗淋漓',
      '保持室内湿度，注意及时补充水分'
    ],
    diet: '少食辛辣燥热与煎炸之品，可留意黄精、玉竹等清润类药食同源食材。'
  },
  {
    key: 'tanshi',
    name: '痰湿质',
    en: 'PHLEGM DAMPNESS',
    seal: '痰',
    items: [12, 13, 14],
    brief: '痰湿偏盛，身重黏腻、腹部松软',
    signs: '身体常觉沉重不爽、腹部肥满松软、口中黏腻，多汗且汗液偏黏。',
    care: [
      '增加日常活动量，避免久坐久卧',
      '居所宜干燥通风，衣被常晒',
      '控制进食总量，晚餐不宜过饱'
    ],
    diet: '饮食宜清淡少油少糖，减少甜食、肥腻与酒类。'
  },
  {
    key: 'shire',
    name: '湿热质',
    en: 'DAMP HEAT',
    seal: '湿',
    items: [15, 16, 17],
    brief: '湿热内蕴，面垢油光、口苦黏腻',
    signs: '面部或鼻部油腻发亮，小便偏黄，身体易觉困重黏腻。',
    care: [
      '作息规律，避免熬夜加重内热',
      '保持环境干爽通风，勤换洗衣物',
      '可安排规律的有氧运动，促进代谢'
    ],
    diet: '少食辛辣油炸、烧烤及酒类，饮食宜清淡。'
  },
  {
    key: 'xueyu',
    name: '血瘀质',
    en: 'BLOOD STASIS',
    seal: '瘀',
    items: [18, 19, 20],
    brief: '血行不畅，面色晦暗、口唇偏暗',
    signs: '面色偏暗或易生褐斑，口唇颜色偏暗，身体易有固定部位的不适感。',
    care: [
      '规律进行促进血行的适度运动，避免久坐久站',
      '注意保暖，寒冷易使气血运行不畅',
      '保持心情舒畅，避免长期郁结'
    ],
    diet: '饮食宜清淡易消化，避免长期高油高盐。'
  },
  {
    key: 'qiyu',
    name: '气郁质',
    en: 'QI STAGNATION',
    seal: '郁',
    items: [3, 21, 22],
    brief: '气机郁滞，情绪敏感、易紧张焦虑',
    signs: '常感闷闷不乐、精神紧张、多愁善感，对精神刺激适应能力较弱。',
    care: [
      '多参与户外活动与社交，转移注意力',
      '规律作息，保证睡眠质量',
      '学习放松方法，避免长期压力累积'
    ],
    diet: '饮食宜规律，可留意陈皮等有助于调和风味、口感清爽的食材。'
  },
  {
    key: 'tebing',
    name: '特禀质',
    en: 'SPECIAL DIATHESIS',
    seal: '禀',
    items: [23, 24, 25, 26],
    brief: '先天禀赋特异，易过敏、皮肤敏感',
    signs: '未感冒也会打喷嚏，易对药物、食物、气味或花粉过敏，皮肤易起风团或抓痕。',
    care: [
      '明确并主动规避已知过敏原',
      '换季与花粉季节注意防护',
      '居室常通风除螨，减少刺激'
    ],
    diet: '饮食宜清淡，避免已知致敏食物与生冷发物；如有明确过敏史请遵医嘱。'
  }
];

const BIASED_TYPES = TYPES.slice(1);

/* ---------- 计分引擎 ---------- */

/* 反向计分：1↔5、2↔4、3→3 */
function reverseScore(value) {
  return 6 - value;
}

/* 转化分 = [(原始分 − 条目数) ÷ (条目数 × 4)] × 100 */
function convertScore(answers, type) {
  const count = type.items.length;
  let raw = 0;

  type.items.forEach((no) => {
    const value = answers[no - 1];
    raw += type.reverse && type.reverse.indexOf(no) > -1 ? reverseScore(value) : value;
  });

  return {
    raw,
    count,
    score: ((raw - count) / (count * 4)) * 100
  };
}

/* 依据判定标准得出结论 */
function judge(answers) {
  const all = TYPES.map((type) => {
    const result = convertScore(answers, type);
    return { type, raw: result.raw, count: result.count, score: result.score };
  });

  const pinghe = all[0];
  const biased = all.slice(1);

  biased.forEach((item) => {
    item.level = item.score >= 40 ? 'yes' : item.score >= 30 ? 'tend' : 'no';
    item.levelText = item.level === 'yes' ? '是' : item.level === 'tend' ? '倾向是' : '否';
  });

  if (pinghe.score >= 60 && biased.every((item) => item.score < 30)) {
    pinghe.level = 'yes';
    pinghe.levelText = '是平和质';
  } else if (pinghe.score >= 60 && biased.every((item) => item.score < 40)) {
    pinghe.level = 'basic';
    pinghe.levelText = '基本是平和质';
  } else {
    pinghe.level = 'no';
    pinghe.levelText = '非平和质';
  }

  const ranked = biased.slice().sort((a, b) => b.score - a.score);
  const confirmed = ranked.filter((item) => item.level === 'yes');
  const tending = ranked.filter((item) => item.level === 'tend');

  let primary = null;
  let headline = '';
  let verdict = '';
  let concurrent = [];

  if (pinghe.level === 'yes' || pinghe.level === 'basic') {
    primary = pinghe;
    headline = '平和质';
    verdict = pinghe.levelText;
  } else if (confirmed.length) {
    primary = confirmed[0];
    concurrent = confirmed.slice(1);
    headline = concurrent.length
      ? primary.type.name + '兼' + concurrent.map((item) => item.type.name.replace('质', '')).join('、')
      : primary.type.name;
    verdict = '是' + primary.type.name;
  } else if (tending.length) {
    primary = tending[0];
    headline = primary.type.name;
    verdict = '倾向是' + primary.type.name;
  } else {
    headline = '未见明显偏颇';
    verdict = '非平和质';
  }

  return { all, pinghe, biased, ranked, confirmed, tending, primary, concurrent, headline, verdict };
}

/* 生成综合分析文字 */
function buildAnalysis(result) {
  const lines = [];
  const pinghe = result.pinghe;

  if (pinghe.level === 'yes') {
    lines.push(
      '本次 26 题作答的平和质转化分为 ' + Math.round(pinghe.score) +
      ' 分（≥60），其余 8 种偏颇体质转化分均低于 30 分，符合标准中「是平和质」的判定条件。'
    );
    lines.push('整体状态较为均衡，重点在于把现有的作息、饮食与运动节奏保持下去。');
  } else if (pinghe.level === 'basic') {
    const near = result.tending.length
      ? '其中 ' + result.tending.map((item) => item.type.name).join('、') + ' 已进入 30–39 分的倾向区间，可作为日常留意的方向。'
      : '其余各项转化分均低于 40 分。';
    lines.push(
      '平和质转化分为 ' + Math.round(pinghe.score) + ' 分（≥60），' + near +
      '按标准判定为「基本是平和质」。'
    );
  } else if (result.primary && result.confirmed.length) {
    lines.push(
      '在 8 种偏颇体质中，' + result.primary.type.name + '转化分最高，为 ' +
      Math.round(result.primary.score) + ' 分（≥40），判定为主要体质倾向。'
    );
    if (result.concurrent.length) {
      lines.push(
        '同时 ' + result.concurrent.map((item) => item.type.name + '（' + Math.round(item.score) + ' 分）').join('、') +
        ' 也达到 40 分以上，属于兼夹体质，调养时需要一并兼顾。'
      );
    }
    if (result.tending.length) {
      lines.push(
        '此外 ' + result.tending.map((item) => item.type.name).join('、') +
        ' 处于 30–39 分的「倾向是」区间，建议同步留意。'
      );
    }
  } else if (result.primary) {
    lines.push(
      '各项偏颇体质转化分均未达到 40 分，其中 ' + result.primary.type.name + '为 ' +
      Math.round(result.primary.score) + ' 分，处于 30–39 分的「倾向是」区间，是目前相对明显的方向。'
    );
    lines.push('平和质转化分为 ' + Math.round(pinghe.score) + ' 分，尚未达到 60 分，故判定为非平和质。');
  } else {
    lines.push(
      '本次 8 种偏颇体质转化分均低于 30 分，未见明显体质偏颇；平和质转化分为 ' +
      Math.round(pinghe.score) + ' 分，尚未达到 60 分，按标准判定为非平和质。'
    );
    lines.push('可在保持规律作息的基础上，间隔一段时间后重新自测观察变化。');
  }

  return lines;
}

/* ---------- 本地暂存 ---------- */
const STORE_KEY = 'wzy-tizhi-v1';

function saveProgress() {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ answers: answers, index: current }));
  } catch (error) {
    /* 隐私模式或存储不可用时静默跳过 */
  }
}

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.answers) || data.answers.length !== QUESTIONS.length) return null;

    /* 清洗：只接受 0（未答）与 1–5 */
    data.answers = data.answers.map((value) => (value >= 1 && value <= 5 ? Math.round(value) : 0));
    data.index = Number(data.index) >= 0 ? Math.round(data.index) : 0;
    return data;
  } catch (error) {
    return null;
  }
}

function clearProgress() {
  try {
    window.localStorage.removeItem(STORE_KEY);
  } catch (error) {
    /* 同上 */
  }
}

/* ---------- 自测界面 ---------- */
const quizStages = {
  intro: document.querySelector('#quiz-intro'),
  run: document.querySelector('#quiz-run'),
  result: document.querySelector('#quiz-result')
};

const quizStart = document.querySelector('#quiz-start');
const quizResume = document.querySelector('#quiz-resume');
const quizPrev = document.querySelector('#quiz-prev');
const quizRetry = document.querySelector('#quiz-retry');
const quizHome = document.querySelector('#quiz-home');
const qCurrent = document.querySelector('#quiz-current');
const qTotal = document.querySelector('#quiz-total');
const qPercent = document.querySelector('#quiz-percent');
const qBar = document.querySelector('#quiz-bar');
const qNo = document.querySelector('#quiz-no');
const qText = document.querySelector('#quiz-question');
const qNote = document.querySelector('#quiz-note');
const qOptions = document.querySelector('#quiz-options');
const resultBody = document.querySelector('#quiz-result-body');

let answers = new Array(QUESTIONS.length).fill(0);
let current = 0;
let advanceTimer;

function setStage(name) {
  Object.keys(quizStages).forEach((key) => {
    quizStages[key].hidden = key !== name;
  });
}

function pad(number) {
  return number < 10 ? '0' + number : String(number);
}

function renderQuestion() {
  const no = current + 1;
  const note = QUESTION_NOTES[no];
  const percent = Math.round((current / QUESTIONS.length) * 100);

  qCurrent.textContent = String(no);
  qNo.textContent = pad(no);
  qText.textContent = QUESTIONS[current];
  qPercent.textContent = percent + '%';
  qBar.style.width = percent + '%';

  qNote.hidden = !note;
  if (note) qNote.textContent = note;

  qPrevSync();
  qOptions.innerHTML = '';

  SCALE.forEach((option) => {
    const button = document.createElement('button');
    const chosen = answers[current] === option.value;

    button.type = 'button';
    button.className = 'option' + (chosen ? ' is-chosen' : '');
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', chosen ? 'true' : 'false');
    button.innerHTML =
      '<span class="option__dot" aria-hidden="true"></span>' +
      '<span class="option__label">' + option.label +
      '<small>（' + option.hint + '）</small></span>' +
      '<span class="option__score" aria-hidden="true">' + option.value + '</span>';

    button.addEventListener('click', () => selectOption(option.value));
    qOptions.appendChild(button);
  });
}

function qPrevSync() {
  quizPrev.disabled = current === 0;
}

function selectOption(value) {
  window.clearTimeout(advanceTimer);

  answers[current] = value;
  saveProgress();

  Array.prototype.forEach.call(qOptions.children, (node, index) => {
    const chosen = SCALE[index].value === value;
    node.classList.toggle('is-chosen', chosen);
    node.setAttribute('aria-checked', chosen ? 'true' : 'false');
  });

  advanceTimer = window.setTimeout(() => {
    if (current < QUESTIONS.length - 1) {
      current += 1;
      saveProgress();
      renderQuestion();
      scrollQuizTop();
    } else {
      finishQuiz();
    }
  }, 260);
}

function scrollQuizTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function startQuiz(resume) {
  window.clearTimeout(advanceTimer);

  const saved = resume ? loadProgress() : null;

  if (saved) {
    answers = saved.answers.slice();
    current = Math.min(saved.index, QUESTIONS.length - 1);
  } else {
    answers = new Array(QUESTIONS.length).fill(0);
    current = 0;
    clearProgress();
  }

  setStage('run');
  renderQuestion();
  scrollQuizTop();
  window.requestAnimationFrame(() => qOptions.firstChild.focus({ preventScroll: true }));
}

function finishQuiz() {
  const result = judge(answers);

  clearProgress();
  renderResult(result);
  setStage('result');
  scrollQuizTop();
}

/* ---------- 结果渲染 ---------- */
function renderResult(result) {
  const parts = [];
  const primaryType = result.primary ? result.primary.type : null;

  /* 主判定卡片 */
  parts.push(
    '<article class="verdict">' +
      '<span class="verdict__seal" aria-hidden="true">' + (primaryType ? primaryType.seal : '平') + '</span>' +
      '<p class="verdict__eyebrow">' + (primaryType ? primaryType.en : 'NO CLEAR TENDENCY') + '</p>' +
      '<h3 class="verdict__name">' + result.headline + '</h3>' +
      '<p class="verdict__tag">' + result.verdict + '</p>' +
      '<p class="verdict__brief">' + (primaryType ? primaryType.brief : '本次各项转化分均处于较低区间，未见明显体质偏颇') + '</p>' +
    '</article>'
  );

  /* 兼夹提示 */
  if (result.concurrent.length) {
    parts.push(
      '<div class="concurrent">' +
        '<strong>兼夹体质</strong>' +
        '<div class="concurrent__chips">' +
          result.concurrent.map((item) =>
            '<span>' + item.type.name + ' · ' + Math.round(item.score) + '</span>'
          ).join('') +
        '</div>' +
      '</div>'
    );
  }

  /* 综合分析 */
  parts.push(
    '<article class="analysis">' +
      '<h4><span>智能分析</span></h4>' +
      buildAnalysis(result).map((line) => '<p>' + line + '</p>').join('') +
      '<p class="analysis__note">分析由本页内置的判定规则依据 GB/T 46939-2025 计算生成，不含个人信息上传。</p>' +
    '</article>'
  );

  /* 九种体质转化分 */
  parts.push(
    '<div class="ingredients-heading score-heading">' +
      '<div><span>◆</span><h3>九种体质转化分</h3></div>' +
      '<p>0–100 分制</p>' +
    '</div>' +
    '<div class="score-list">' +
      result.all.map((item) => {
        const score = Math.round(item.score);
        return '<div class="score-row score-row--' + item.level + '">' +
          '<div class="score-row__head">' +
            '<strong>' + item.type.name + '</strong>' +
            '<span class="score-row__tag">' + item.levelText + '</span>' +
            '<b class="score-row__value">' + score + '</b>' +
          '</div>' +
          '<div class="score-row__bar"><i style="width:' + Math.max(score, 1.5) + '%"></i></div>' +
          '<small>原始分 ' + item.raw + ' / ' + item.count * 5 + ' · ' + item.count + ' 个条目</small>' +
        '</div>';
      }).join('') +
    '</div>'
  );

  /* 调养建议 */
  if (primaryType) {
    const targets = [result.primary].concat(result.concurrent);

    parts.push(
      '<div class="ingredients-heading score-heading">' +
        '<div><span>◆</span><h3>日常调养方向</h3></div>' +
        '<p>科普参考 · 非诊疗建议</p>' +
      '</div>' +
      targets.map((item) =>
        '<article class="advice-card">' +
          '<h4><span>' + item.type.name + '</span></h4>' +
          '<p class="advice-card__signs">' + item.type.signs + '</p>' +
          '<ul class="advice-list">' +
            item.type.care.map((line) => '<li>' + line + '</li>').join('') +
          '</ul>' +
          '<p class="advice-card__diet">' + item.type.diet + '</p>' +
        '</article>'
      ).join('')
    );
  }

  /* 依据与免责 */
  parts.push(
    '<aside class="source-note">' +
      '<strong>判定依据</strong>' +
      '<p>《中医体质分类与判定》GB/T 46939-2025，题目与计分规则取自标准第 5 章及附录 A（表 A.1–A.9）。第 17 题将标准中分性别的两道题合并为一道中性表述，合并后按 1 题计分，湿热质按 3 条计分（标准为 4 条），转化分与标准算法存在差异，结果仅供参考。</p>' +
    '</aside>' +
    '<aside class="notice">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>' +
      '<p>本测试结果仅供健康科普参考，不构成医学诊断或治疗建议；如有不适，请及时就医。</p>' +
    '</aside>'
  );

  resultBody.innerHTML = parts.join('');
}

/* ---------- 入口与按钮 ---------- */
function syncIntro() {
  const saved = loadProgress();
  const answered = saved ? saved.answers.filter((value) => value > 0).length : 0;

  if (answered > 0 && answered < QUESTIONS.length) {
    quizResume.hidden = false;
    quizResume.textContent = '继续上次作答（已完成 ' + answered + ' 题）';
  } else {
    quizResume.hidden = true;
    if (saved) clearProgress();
  }
}

function openQuiz() {
  setStage('intro');
  syncIntro();
  openView(quizView, quizEntry, quizClose);
}

function closeQuiz() {
  window.clearTimeout(advanceTimer);
  closeView(quizView, quizEntry);
}

qTotal.textContent = String(QUESTIONS.length);

quizEntry.addEventListener('click', openQuiz);
quizClose.addEventListener('click', closeQuiz);
quizStart.addEventListener('click', () => startQuiz(false));
quizResume.addEventListener('click', () => startQuiz(true));
quizHome.addEventListener('click', closeQuiz);
quizRetry.addEventListener('click', () => {
  setStage('intro');
  syncIntro();
  scrollQuizTop();
});

quizPrev.addEventListener('click', () => {
  if (current === 0) return;
  window.clearTimeout(advanceTimer);
  current -= 1;
  saveProgress();
  renderQuestion();
  scrollQuizTop();
});
