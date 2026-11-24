// Each trigram's lines are listed as they appear on screen, from top to bottom.
const markers = [
  { animal: 'Hawk', number: 9, name: 'Lí', meaning: 'Fire', lines: ['yang', 'yin', 'yang'], art: [0, 0], phase: 'fire' },
  { animal: 'Unicorn', number: 2, name: 'Kūn', meaning: 'Earth', lines: ['yin', 'yin', 'yin'], art: [1, 0], phase: 'earth' },
  { animal: 'Monkey', number: 7, name: 'Duì', meaning: 'Lake', lines: ['yin', 'yang', 'yang'], art: [2, 0], phase: 'metal' },
  { animal: 'Lion', number: 6, name: 'Qián', meaning: 'Heaven', lines: ['yang', 'yang', 'yang'], art: [0, 1], phase: 'metal' },
  { animal: 'Snake', number: 1, name: 'Kǎn', meaning: 'Water', lines: ['yin', 'yang', 'yin'], art: [2, 1], phase: 'water' },
  { animal: 'Bear', number: 8, name: 'Gèn', meaning: 'Mountain', lines: ['yang', 'yin', 'yin'], art: [0, 2], phase: 'earth' },
  { animal: 'Dragon', number: 3, name: 'Zhèn', meaning: 'Thunder', lines: ['yin', 'yin', 'yang'], art: [1, 2], phase: 'wood' },
  { animal: 'Phoenix', number: 4, name: 'Xùn', meaning: 'Wind', lines: ['yang', 'yang', 'yin'], art: [2, 2], phase: 'wood' },
  { number: 5, phase: 'earth' },
];

const wheel = document.querySelector('#wheel');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const playButton = document.querySelector('#number-play');
const playLabel = document.querySelector('#play-label');
const playStatus = document.querySelector('#play-status');
const squareButton = document.querySelector('#square-play');
const equationSymbols = [...document.querySelectorAll('.equation-symbol')];
const walkingButton = document.querySelector('#walking-play');
const walkingTrail = document.querySelector('#walking-trail');
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

const circlePositions = markers.map((marker, index) => {
  const angle = index * Math.PI / 4;
  const radius = marker.animal ? 37 : 0;
  return [50 + radius * Math.sin(angle), 50 - radius * Math.cos(angle)];
});

const markerButtons = markers.map((marker, index) => {
  const button = document.createElement('button');
  const [x, y] = circlePositions[index];
  button.type = 'button';
  button.className = `marker phase-${marker.phase}`;
  button.classList.toggle('center', !marker.animal);
  button.setAttribute('aria-haspopup', 'dialog');
  button.style.setProperty('--x', `${x}%`);
  button.style.setProperty('--y', `${y}%`);
  button.addEventListener('click', () => showDetails(marker));

  return button;
});

const numberedMarkers = markers
  .map(({ number }, index) => ({ number, button: markerButtons[index], position: circlePositions[index] }))
  .sort((first, second) => first.number - second.number);

const squareRows = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];
const squareLines = [
  ...squareRows,
  ...squareRows[0].map((_, column) => squareRows.map((row) => row[column])),
  squareRows.map((row, index) => row[index]),
  squareRows.map((row, index) => row[row.length - 1 - index]),
];
const squarePositions = new Map(squareRows.flatMap((row, y) =>
  row.map((number, x) => [number, [17 + x * 27, 17 + y * 27]])
));

numberedMarkers.forEach(({ number, button }) => {
  const [x, y] = squarePositions.get(number);
  button.style.setProperty('--square-x', `${x}%`);
  button.style.setProperty('--square-y', `${y}%`);
});

const stepDuration = 800;
const squareMoveDuration = 1200;
const equationDuration = 2200;
const equationFadeDuration = 550;
let playbackTimer;
let squareTimer;
let walkingTimer;
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

function stopMagicSquare(message = '') {
  if (squareTimer === undefined) return;

  clearTimeout(squareTimer);
  squareTimer = undefined;
  wheel.classList.remove('is-square', 'is-showing-sum');
  markerButtons.forEach((button) => button.classList.remove('is-addend'));
  squareButton.textContent = '= 15';
  playButton.disabled = false;
  walkingButton.disabled = false;
  playStatus.textContent = message;
}

function showSquareLine(index) {
  const line = squareLines[index];
  if (!line) {
    stopMagicSquare('Magic square complete. The markers returned to the circle.');
    return;
  }

  const [first, second, third] = line.map((number) => squarePositions.get(number));
  const symbolPositions = [
    first.map((coordinate, axis) => (coordinate + second[axis]) / 2),
    second.map((coordinate, axis) => (coordinate + third[axis]) / 2),
    third.map((coordinate, axis) => Math.max(9, Math.min(91, coordinate + (coordinate - second[axis]) * 0.72))),
  ];
  equationSymbols.forEach((symbol, symbolIndex) => {
    const [x, y] = symbolPositions[symbolIndex];
    symbol.style.setProperty('--equation-x', `${x}%`);
    symbol.style.setProperty('--equation-y', `${y}%`);
  });
  numberedMarkers.forEach(({ number, button }) => {
    button.classList.toggle('is-addend', line.includes(number));
  });
  wheel.classList.add('is-showing-sum');
  playStatus.textContent = `${line.join(' plus ')} equals 15.`;

  squareTimer = setTimeout(() => {
    wheel.classList.remove('is-showing-sum');
    squareTimer = setTimeout(() => showSquareLine(index + 1), equationFadeDuration);
  }, equationDuration);
}

const walkingStepInterval = 135;
const walkingStepSpacing = 4.2;
const walkingResizeDuration = 1100;
const walkingFadeDuration = 1500;
const fullTurn = 2 * Math.PI;
const fullLoopNumbers = [1, 5, 9];
const walkingLoops = numberedMarkers.map(({ number, position }) => ({
  number,
  position,
  radius: number === 5 ? 9.7 : 11.7,
  direction: number % 2 === 1 ? 1 : -1,
}));

const walkingConnections = walkingLoops.slice(0, -1).map((from, index) => {
  const to = walkingLoops[index + 1];
  const dx = to.position[0] - from.position[0];
  const dy = to.position[1] - from.position[1];
  // A common tangent joins the two circles in their respective walking directions.
  const offset = from.direction * from.radius - to.direction * to.radius;
  const heading = Math.atan2(dy, dx) + Math.asin(offset / Math.hypot(dx, dy));
  return {
    exit: heading - from.direction * Math.PI / 2,
    entry: heading - to.direction * Math.PI / 2,
  };
});

function pointOnLoop(loop, angle) {
  const [x, y] = loop.position;
  return [
    x + loop.radius * Math.cos(angle),
    y + loop.radius * Math.sin(angle),
    angle + loop.direction * Math.PI / 2,
  ];
}

function loopSteps(loop, start, sweep) {
  const count = Math.ceil(loop.radius * sweep / walkingStepSpacing);
  return Array.from({ length: count + 1 }, (_, index) =>
    pointOnLoop(loop, start + loop.direction * sweep * index / count)
  );
}

function connectingSteps(from, to) {
  const [x, y] = from;
  const dx = to[0] - x;
  const dy = to[1] - y;
  const heading = Math.atan2(dy, dx);
  const count = Math.ceil(Math.hypot(dx, dy) / walkingStepSpacing);
  return Array.from({ length: count - 1 }, (_, index) => {
    const progress = (index + 1) / count;
    return [x + dx * progress, y + dy * progress, heading];
  });
}

function curvedConnectingSteps(from, to, departureLength, arrivalLength) {
  const [x, y, heading] = from;
  const [endX, endY, endHeading] = to;
  const firstControl = [x + departureLength * Math.cos(heading), y + departureLength * Math.sin(heading)];
  const secondControl = [endX - arrivalLength * Math.cos(endHeading), endY - arrivalLength * Math.sin(endHeading)];
  const chord = Math.hypot(endX - x, endY - y);
  const controlLength = departureLength + arrivalLength +
    Math.hypot(secondControl[0] - firstControl[0], secondControl[1] - firstControl[1]);
  const count = Math.ceil((chord + controlLength) / (2 * walkingStepSpacing));

  return Array.from({ length: count - 1 }, (_, index) => {
    const progress = (index + 1) / count;
    const interpolate = (first, second) => [
      first[0] + (second[0] - first[0]) * progress,
      first[1] + (second[1] - first[1]) * progress,
    ];
    const a = interpolate(from, firstControl);
    const b = interpolate(firstControl, secondControl);
    const c = interpolate(secondControl, to);
    const start = interpolate(a, b);
    const end = interpolate(b, c);
    return [...interpolate(start, end), Math.atan2(end[1] - start[1], end[0] - start[0])];
  });
}

let walkingStepIndex = 0;

function stopWalking(message = '') {
  if (walkingTimer === undefined) return;

  clearTimeout(walkingTimer);
  walkingTimer = undefined;
  walkingTrail.replaceChildren();
  wheel.classList.remove('is-walking');
  walkingButton.textContent = 'Walking';
  playButton.disabled = false;
  squareButton.disabled = false;
  playStatus.textContent = message;
}

function walkingSteps(index) {
  const loop = walkingLoops[index];
  const next = walkingLoops[index + 1];
  const connection = walkingConnections[index];
  const start = index === 0 ? Math.PI / 2 : walkingConnections[index - 1].entry;
  const sweep = fullLoopNumbers.includes(loop.number)
    ? fullTurn
    : (((connection.exit - start) * loop.direction) % fullTurn + fullTurn) % fullTurn;
  const steps = loopSteps(loop, start, sweep);
  if (next) {
    const from = steps.at(-1);
    const to = pointOnLoop(next, connection.entry);
    // Once a full circle closes, curve away without retracing the loop.
    if (loop.number === 1) {
      steps.push(...curvedConnectingSteps(from, to, 40, 15));
    } else if (loop.number === 5) {
      steps.push(...curvedConnectingSteps(from, to, 10, 20));
    } else {
      steps.push(...connectingSteps(from, to));
    }
  }
  return steps;
}

function walkAroundNumber(index) {
  const loop = walkingLoops[index];
  const next = walkingLoops[index + 1];
  const steps = walkingSteps(index);
  if (walkingTrail.children.length === 2) walkingTrail.firstElementChild.remove();
  walkingTrail.lastElementChild?.classList.add('is-fading');
  const trail = document.createElement('div');
  trail.className = 'footstep-trail';
  steps.forEach(([x, y, heading], index) => {
    const side = walkingStepIndex % 2 === 0 ? -1 : 1;
    walkingStepIndex += 1;
    const step = document.createElement('span');
    step.className = 'footstep';
    step.style.left = `${x - Math.sin(heading) * side * 0.85}%`;
    step.style.top = `${y + Math.cos(heading) * side * 0.85}%`;
    step.style.setProperty('--heading', `${heading + Math.PI / 2}rad`);
    step.style.setProperty('--side', side);
    step.style.setProperty('--step-delay', `${index * walkingStepInterval}ms`);
    trail.append(step);
  });
  walkingTrail.append(trail);
  const direction = loop.direction === 1 ? 'clockwise' : 'counterclockwise';
  playStatus.textContent = `Walking ${direction} around ${loop.number}.`;

  walkingTimer = setTimeout(() => {
    if (next) {
      walkAroundNumber(index + 1);
    } else {
      trail.classList.add('is-fading');
      walkingTimer = setTimeout(() => stopWalking('Walking sequence complete.'), walkingFadeDuration);
    }
  }, steps.length * walkingStepInterval + (next ? 0 : 400));
}

function setView(view) {
  stopWalking();
  stopMagicSquare();
  stopPlayback();
  playButton.hidden = view !== 'Numbers';
  squareButton.hidden = view !== 'Numbers';
  walkingButton.hidden = view !== 'Numbers';
  wheel.setAttribute('aria-label', view);

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
squareButton.addEventListener('click', () => {
  if (squareTimer !== undefined) {
    stopMagicSquare('Magic square stopped.');
    return;
  }

  stopPlayback();
  playButton.disabled = true;
  walkingButton.disabled = true;
  squareButton.textContent = 'Stop';
  wheel.classList.add('is-square');
  squareTimer = setTimeout(() => showSquareLine(0), squareMoveDuration);
});
walkingButton.addEventListener('click', () => {
  if (walkingTimer !== undefined) {
    stopWalking('Walking sequence stopped.');
    return;
  }

  stopPlayback();
  walkingStepIndex = 0;
  playButton.disabled = true;
  squareButton.disabled = true;
  walkingButton.textContent = 'Stop';
  wheel.classList.add('is-walking');
  walkingTimer = setTimeout(() => walkAroundNumber(0), walkingResizeDuration);
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
