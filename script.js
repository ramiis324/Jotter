(() => {
let currentCard = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let deleteMode = false;

function saveAllCards() {
const cards = [];
document.querySelectorAll('[data-card], #note').forEach(card => {
if (card.style.display !== 'none') {
cards.push({
html: card.innerHTML,
left: card.style.left,
top: card.style.top,
bg: card.style.backgroundColor
});
}
});
console.log('Saving', cards.length, 'cards');
localStorage.setItem('saved-cards', JSON.stringify(cards));
}

function loadAllCards() {
try {
const raw = localStorage.getItem('saved-cards');
if (!raw) return;
const cards = JSON.parse(raw);
console.log('Loading', cards.length, 'cards');
const body = document.body;
cards.forEach((data, i) => {
let card = Array.from(document.querySelectorAll('[data-card], #note'))[i];
if (!card) {
card = document.createElement('div');
card.setAttribute('data-card', '');
card.className = 'w-max p-4 m-2 hover:cursor-grab rounded-lg';
card.style.position = 'absolute';
body.appendChild(card);
}
card.innerHTML = data.html;
card.style.left = data.left;
card.style.top = data.top;
card.style.backgroundColor = data.bg;
card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
card.style.display = '';
card.style.zIndex = '10';
});
} catch (err) {
console.error('Error loading cards:', err);
}
}

function onPointerDown(e) {
if (e.button && e.button !== 0) return;
const card = e.target.closest('[data-card], #note');
if (!card) return;

if (deleteMode) {
e.preventDefault();
card.style.display = 'none';
saveAllCards();
return;
}

e.preventDefault();
currentCard = card;
const rect = card.getBoundingClientRect();
card.style.position = 'absolute';
card.style.left = rect.left + 'px';
card.style.top = rect.top + 'px';
card.style.zIndex = '10';
offsetX = e.clientX - rect.left;
offsetY = e.clientY - rect.top;
try { card.setPointerCapture(e.pointerId); } catch (err) {}
isDragging = true;
}

function onPointerMove(e) {
if (!isDragging || !currentCard) return;
e.preventDefault();
const x = e.clientX - offsetX;
const y = e.clientY - offsetY;
const maxX = window.innerWidth - currentCard.offsetWidth;
const maxY = window.innerHeight - currentCard.offsetHeight;
currentCard.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
currentCard.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
}

function onPointerUp(e) {
if (!isDragging || !currentCard) return;
isDragging = false;
try { currentCard.releasePointerCapture(e.pointerId); } catch (err) {}
saveAllCards();
currentCard = null;
}

document.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('pointercancel', onPointerUp);

const deleteBtn = document.querySelector('button[aria-label="delete"]');
if (deleteBtn) {
deleteBtn.addEventListener('click', () => {
deleteMode = !deleteMode;
if (deleteMode) {
deleteBtn.style.backgroundColor = '#dc2626';
deleteBtn.style.color = 'white';
} else {
deleteBtn.style.backgroundColor = 'white';
deleteBtn.style.color = '#dc2626';
}
});
}

const createBtn = document.getElementById('createBtn');
const createModal = document.getElementById('createModal');
const sidebar = document.querySelector('.fixed.w-16');
const noteContent = document.getElementById('noteContent');
const notePreview = document.getElementById('notePreview');
const previewText = document.getElementById('previewText');
const colorOptions = document.querySelectorAll('.colorOption');
const createNoteBtn = document.getElementById('createNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
let selectedNoteColor = '#fef08a';

if (createBtn) {
createBtn.addEventListener('click', () => {
createModal.classList.remove('hidden');
if (sidebar) sidebar.style.opacity = '0.3';
noteContent.value = '';
previewText.textContent = 'Your note here...';
selectedNoteColor = '#fef08a';
colorOptions.forEach(o => o.classList.remove('active'));
colorOptions[0].classList.add('active');
notePreview.style.backgroundColor = '#fef08a';
});
}

function closeModal() {
createModal.classList.add('hidden');
if (sidebar) sidebar.style.opacity = '1';
}

if (noteContent) {
noteContent.addEventListener('input', () => {
previewText.textContent = noteContent.value || 'Your note here...';
});
}

colorOptions.forEach(option => {
option.addEventListener('click', () => {
colorOptions.forEach(o => o.classList.remove('active'));
option.classList.add('active');
selectedNoteColor = option.dataset.color;
notePreview.style.backgroundColor = selectedNoteColor;
});
});

if (createNoteBtn) {
createNoteBtn.addEventListener('click', () => {
if (!noteContent.value.trim()) {
alert('Please enter some text for your note');
return;
}
const newCard = document.createElement('div');
newCard.setAttribute('data-card', '');
newCard.className = 'w-max max-w-xl flex wrap p-4 m-2 hover:cursor-grab rounded-lg';
newCard.style.backgroundColor = selectedNoteColor;
newCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
newCard.style.position = 'absolute';
newCard.style.left = '100px';
newCard.style.top = '100px';
newCard.style.zIndex = '10';
newCard.innerHTML = `<h1 class="text-gray-700">${noteContent.value}</h1>`;
document.body.appendChild(newCard);
saveAllCards();
closeModal();
});
}

if (cancelNoteBtn) {
cancelNoteBtn.addEventListener('click', closeModal);
}

createModal.addEventListener('click', (e) => {
if (e.target === createModal) closeModal();
});

loadAllCards();
})();
