const HIGH_SCORE_KEY = 'quizApp_highScore';
const TIME_PER_QUESTION = 15; 

const questions = [
  {
    question: 'Apa fungsi dari document.querySelector()?',
    options: [
      'Mengubah warna background halaman',
      'Memilih satu elemen pertama yang cocok dengan selector CSS',
      'Membuat elemen HTML baru',
      'Menghapus semua event listener',
    ],
    correctIndex: 1,
  },
  {
    question: 'Method mana yang digunakan untuk membuat elemen HTML baru secara dinamis?',
    options: ['document.createElement()', 'document.newElement()', 'document.addElement()', 'element.make()'],
    correctIndex: 0,
  },
  {
    question: 'Apa keuntungan utama dari "event delegation"?',
    options: [
      'Membuat animasi lebih cepat',
      'Mengurangi penggunaan CSS',
      'Satu listener bisa menangani banyak elemen anak, termasuk yang ditambahkan nanti',
      'Menghapus kebutuhan akan JavaScript',
    ],
    correctIndex: 2,
  },
  {
    question: 'Di mana data yang disimpan dengan localStorage akan tetap ada?',
    options: [
      'Hanya sampai tab browser ditutup',
      'Hanya selama 24 jam',
      'Tetap ada walau browser ditutup dan dibuka lagi',
      'Hanya bisa diakses oleh server',
    ],
    correctIndex: 2,
  },
  {
    question: 'Properti apa yang dipakai untuk mengubah teks di dalam sebuah elemen tanpa merender ulang HTML?',
    options: ['innerHTML', 'textContent', 'outerHTML', 'style.content'],
    correctIndex: 1,
  },
  {
    question: 'Apa yang dilakukan event.target di dalam sebuah event listener?',
    options: [
      'Menunjuk ke elemen yang memicu event tersebut',
      'Menghentikan event dari menyebar (bubbling)',
      'Menunjuk ke document secara keseluruhan',
      'Mengubah tipe event menjadi click',
    ],
    correctIndex: 0,
  },
  {
    question: 'Method mana yang digunakan untuk menambahkan elemen anak ke dalam elemen induk di DOM?',
    options: ['appendChild()', 'addChild()', 'insertElement()', 'pushChild()'],
    correctIndex: 0,
  },
  {
    question: 'Apa perbedaan utama antara getElementById() dan querySelector()?',
    options: [
      'getElementById() hanya bisa dipakai di dalam function',
      'querySelector() mendukung semua jenis CSS selector, getElementById() hanya bisa cari berdasarkan id',
      'getElementById() lebih lambat di semua kondisi',
      'Tidak ada perbedaan sama sekali',
    ],
    correctIndex: 1,
  },
  {
    question: 'Bagaimana cara menghapus sebuah elemen dari DOM?',
    options: [
      'element.delete()',
      'element.remove()',
      'element.destroy()',
      'document.removeElement(element)',
    ],
    correctIndex: 1,
  },
  {
    question: 'Apa fungsi dari preventDefault() pada sebuah event?',
    options: [
      'Menghentikan event dari menyebar ke elemen induk',
      'Mencegah perilaku default browser untuk event tersebut, misalnya submit form yang reload halaman',
      'Menghapus event listener secara permanen',
      'Mengubah target event menjadi document',
    ],
    correctIndex: 1,
  },
];

let currentIndex = 0;
let score = 0;
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;
let isAnswered = false;

const stage = document.querySelector('#quizStage');
const progressWrap = document.querySelector('#progressWrap');
const progressFill = document.querySelector('#progressFill');
const questionCountEl = document.querySelector('#questionCount');
const timerLabelEl = document.querySelector('#timerLabel');
const highScoreLabelEl = document.querySelector('#highScoreLabel');

const getHighScore = () => Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;

const saveHighScoreIfBetter = (finalScore) => {
  const current = getHighScore();
  if (finalScore > current) {
    localStorage.setItem(HIGH_SCORE_KEY, finalScore);
    return true;
  }
  return false;
};

const renderHighScoreLabel = () => {
  highScoreLabelEl.textContent = getHighScore();
};

const renderToStage = (element) => {
  stage.innerHTML = '';
  stage.appendChild(element);
};

function renderStartScreen() {
  progressWrap.classList.add('hidden');

  const card = document.createElement('div');
  card.className = 'quiz-card';

  const emoji = document.createElement('div');
  emoji.className = 'start-emoji';
  emoji.textContent = '?';

  const title = document.createElement('h2');
  title.textContent = 'Siap uji pemahamanmu?';

  const desc = document.createElement('p');
  desc.className = 'muted';
  desc.textContent = `${questions.length} soal pilihan ganda seputar DOM & Event Handling. Setiap soal punya waktu ${TIME_PER_QUESTION} detik.`;

  const startBtn = document.createElement('button');
  startBtn.className = 'primary-btn';
  startBtn.textContent = 'Mulai Kuis';
  startBtn.addEventListener('click', startQuiz);

  card.append(emoji, title, desc, startBtn);
  renderToStage(card);
}

function renderQuestionScreen() {
  progressWrap.classList.remove('hidden');
  isAnswered = false;

  const data = questions[currentIndex];

  updateProgress();
  startTimer();

  const card = document.createElement('div');
  card.className = 'quiz-card';

  const questionText = document.createElement('p');
  questionText.className = 'question-text';
  questionText.textContent = data.question; 

  const optionsContainer = document.createElement('div');
  optionsContainer.id = 'optionsContainer';

  data.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = optionText;
    btn.dataset.index = index; 
    optionsContainer.appendChild(btn);
  });

  optionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn || isAnswered) return;
    handleAnswer(Number(btn.dataset.index), optionsContainer, data.correctIndex);
  });

  card.append(questionText, optionsContainer);
  renderToStage(card);
}

function handleAnswer(selectedIndex, container, correctIndex) {
  isAnswered = true;
  clearInterval(timerInterval);

  const buttons = container.querySelectorAll('.option-btn');

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === correctIndex) {
      btn.classList.add('correct'); 
    } else if (idx === selectedIndex) {
      btn.classList.add('incorrect'); 
    }
  });

  if (selectedIndex === correctIndex) score += 1;

  showNextButton(container);
}

function handleTimeout(container, correctIndex) {
  isAnswered = true;
  const buttons = container.querySelectorAll('.option-btn');
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === correctIndex) btn.classList.add('correct');
  });
  showNextButton(container);
}

function showNextButton(container) {
  const wrap = document.createElement('div');
  wrap.className = 'next-btn-wrap';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'primary-btn';
  nextBtn.textContent = currentIndex === questions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya';
  nextBtn.addEventListener('click', goToNextQuestion);

  wrap.appendChild(nextBtn);
  container.parentElement.appendChild(wrap);
}

function goToNextQuestion() {
  currentIndex += 1;
  if (currentIndex < questions.length) {
    renderQuestionScreen();
  } else {
    renderResultScreen();
  }
}

function updateProgress() {
  const percent = (currentIndex / questions.length) * 100;
  progressFill.style.width = `${percent}%`;
  questionCountEl.textContent = `Soal ${currentIndex + 1}/${questions.length}`;
}

function startTimer() {
  timeLeft = TIME_PER_QUESTION;
  timerLabelEl.textContent = `${timeLeft}s`;
  timerLabelEl.classList.remove('warn');

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timerLabelEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 5) timerLabelEl.classList.add('warn');

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const container = document.querySelector('#optionsContainer');
      if (container && !isAnswered) {
        handleTimeout(container, questions[currentIndex].correctIndex);
      }
    }
  }, 1000);
}

function spawnConfetti() {
  const colors = ['#FFC93C', '#19B394', '#FF7BA5', '#FF8A3D', '#FFF3DC'];

  for (let i = 0; i < 28; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;

    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

function renderResultScreen() {
  progressWrap.classList.add('hidden');
  clearInterval(timerInterval);

  const isNewHighScore = saveHighScoreIfBetter(score);
  renderHighScoreLabel();

  const card = document.createElement('div');
  card.className = 'quiz-card';

  const emoji = document.createElement('div');
  emoji.className = 'result-emoji';
  emoji.textContent = isNewHighScore ? '★' : '✓';

  const scoreEl = document.createElement('p');
  scoreEl.className = 'result-score';
  scoreEl.textContent = `${score} / ${questions.length}`;

  const label = document.createElement('p');
  label.className = 'result-label';
  label.textContent = 'Jawaban benar';

  card.append(emoji, scoreEl, label);

  if (isNewHighScore) {
    const badge = document.createElement('p');
    badge.className = 'new-high-badge';
    badge.textContent = 'Skor tertinggi baru!';
    card.appendChild(badge);
    spawnConfetti();
  }

  const restartBtn = document.createElement('button');
  restartBtn.className = 'primary-btn';
  restartBtn.textContent = 'Ulangi Kuis';
  restartBtn.addEventListener('click', startQuiz);

  card.appendChild(restartBtn);
  renderToStage(card);
}

function startQuiz() {
  currentIndex = 0;
  score = 0;
  renderQuestionScreen();
}

renderHighScoreLabel();
renderStartScreen();