// Each trigram's lines are listed as they appear on screen, from top to bottom.
const markers = [
  { animal: 'Hawk', number: 9, name: 'Lí', meaning: 'Fire', lines: ['yang', 'yin', 'yang'], art: [0, 0], color: '' },
  { animal: 'Unicorn', number: 2, name: 'Kūn', meaning: 'Earth', lines: ['yin', 'yin', 'yin'], art: [1, 0], color: 'sage' },
  { animal: 'Monkey', number: 7, name: 'Duì', meaning: 'Lake', lines: ['yin', 'yang', 'yang'], art: [2, 0], color: '' },
  { animal: 'Lion', number: 6, name: 'Qián', meaning: 'Heaven', lines: ['yang', 'yang', 'yang'], art: [0, 1], color: 'peach' },
  { animal: 'Snake', number: 1, name: 'Kǎn', meaning: 'Water', lines: ['yin', 'yang', 'yin'], art: [2, 1], color: 'sage' },
  { animal: 'Bear', number: 8, name: 'Gèn', meaning: 'Mountain', lines: ['yang', 'yin', 'yin'], art: [0, 2], color: '' },
  { animal: 'Dragon', number: 3, name: 'Zhèn', meaning: 'Thunder', lines: ['yin', 'yin', 'yang'], art: [1, 2], color: 'sage' },
  { animal: 'Phoenix', number: 4, name: 'Xùn', meaning: 'Wind', lines: ['yang', 'yang', 'yin'], art: [2, 2], color: 'peach' },
  { number: 5, color: 'center' },
];

const wheel = document.querySelector('#wheel');
const viewName = document.querySelector('#view-name');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const playButton = document.querySelector('#number-play');
const playLabel = document.querySelector('#play-label');
const playStatus = document.querySelector('#play-status');
const details = document.querySelector('#marker-details');
const detailContent = document.querySelector('#detail-content');
const closeDetails = details.querySelector('.close-dialog');

function animalArt([column, row], extraClass = '') {
  return `<span class="animal-art ${extraClass}" aria-hidden="true"
    style="--art-x: ${column * 50}%; --art-y: ${row * 50}%"></span>`;
}

function trigram(lines) {
  const rows = lines.map((line) => {
    const segments = line === 'yang' ? '<i></i>' : '<i></i><i></i>';
    return `<span class="trigram-line">${segments}</span>`;
  }).join('');
  return `<span class="trigram" aria-hidden="true">${rows}</span>`;
}

function showDetails(marker) {
  if (marker.animal) {
    detailContent.innerHTML = `
      ${animalArt(marker.art, 'detail-art')}
      <h2 id="detail-title">${marker.animal}</h2>
      <dl class="detail-pairs">
        <div><dt>Number</dt><dd><span class="number">${marker.number}</span></dd></div>
        <div>
          <dt>Trigram</dt>
          <dd class="detail-trigram">
            ${trigram(marker.lines)}
            <strong>${marker.name} · ${marker.meaning}</strong>
          </dd>
        </div>
      </dl>
      <p class="detail-text detail-lines">From top to bottom: ${marker.lines.join(', ')}.</p>`;
  } else {
    detailContent.innerHTML = `
      <h2 id="detail-title">Center</h2>
      <p class="detail-text">Number 5 sits at the center of the eight outer markers.</p>`;
  }
  details.showModal();
}

const markerButtons = markers.map((marker, index) => {
  const button = document.createElement('button');
  const angle = index * Math.PI / 4;
  const radius = marker.animal ? 37 : 0;

  button.type = 'button';
  button.className = `marker ${marker.color}`;
  button.setAttribute('aria-haspopup', 'dialog');
  button.style.setProperty('--x', `${50 + radius * Math.sin(angle)}%`);
  button.style.setProperty('--y', `${50 - radius * Math.cos(angle)}%`);
  button.addEventListener('click', () => showDetails(marker));

  return button;
});

const numberedMarkers = markers
  .map(({ number }, index) => ({ number, button: markerButtons[index] }))
  .sort((first, second) => first.number - second.number);
const stepDuration = 800;
let playbackTimer;
let litIndex = -1;

function stopPlayback(message = '') {
  clearInterval(playbackTimer);
  playbackTimer = undefined;
  numberedMarkers[litIndex]?.button.classList.remove('is-lit');
  litIndex = -1;
  playLabel.textContent = 'Play';
  playButton.classList.remove('is-playing');
  playStatus.textContent = message;
}

function lightNextNumber() {
  const nextMarker = numberedMarkers[litIndex + 1];
  if (!nextMarker) {
    stopPlayback('Number sequence complete.');
    return;
  }

  numberedMarkers[litIndex]?.button.classList.remove('is-lit');
  litIndex += 1;
  nextMarker.button.classList.add('is-lit');
  playStatus.textContent = `Number ${nextMarker.number}`;
}

function setView(view) {
  stopPlayback();
  playButton.hidden = view !== 'Numbers';
  viewName.textContent = view;

  viewButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.view === view));
  });

  markers.forEach((marker, index) => {
    const button = markerButtons[index];
    let content;
    let label;

    if (!marker.animal) {
      content = `<span class="number">${marker.number}</span><span class="marker-label">Center</span>`;
      label = `Center, number ${marker.number}`;
    } else if (view === 'Animals') {
      content = `${animalArt(marker.art)}<span class="marker-label">${marker.animal}</span>`;
      label = marker.animal;
    } else if (view === 'Numbers') {
      content = `<span class="number">${marker.number}</span>`;
      label = `Number ${marker.number}`;
    } else {
      content = `
        ${trigram(marker.lines)}
        <span class="marker-label trigram-name">${marker.name}</span>
        <span class="trigram-meaning">${marker.meaning}</span>`;
      label = `${marker.name}, ${marker.meaning}. From top to bottom: ${marker.lines.join(', ')}`;
    }

    button.innerHTML = content;
    button.setAttribute('aria-label', label);
  });
}

wheel.append(...markerButtons);
viewButtons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
playButton.addEventListener('click', () => {
  if (playbackTimer !== undefined) {
    stopPlayback('Number sequence stopped.');
    return;
  }

  playLabel.textContent = 'Stop';
  playButton.classList.add('is-playing');
  lightNextNumber();
  playbackTimer = setInterval(lightNextNumber, stepDuration);
});
closeDetails.addEventListener('click', () => details.close());
details.addEventListener('click', (event) => {
  if (event.target !== details) return;

  const rect = details.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) {
    details.close();
  }
});
setView('Animals');
