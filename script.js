(() => {
let currentCard = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let deleteMode = false;
let editMode = false;
let cardToEdit = null;
const undoStack = [];
const redoStack = [];

function saveState() {
const cards = [];
document.querySelectorAll('[data-card], #note').forEach(card => {
if (card.style.display !== 'none') {
cards.push({
id: card.id,
html: card.innerHTML,
left: card.style.left,
top: card.style.top,
bg: card.style.backgroundColor,
width: card.style.width,
height: card.style.height,
});
}
});
return cards;
}

function saveAllCards(isUndoRedo = false) {
const currentState = saveState();
if (!isUndoRedo) {
undoStack.push(currentState);
redoStack.length = 0; // Clear redo stack on new action
}
localStorage.setItem('saved-cards', JSON.stringify(currentState));
}

function loadCardsState(cards) {
document.querySelectorAll('[data-card]').forEach(card => card.remove());
const body = document.body;
cards.forEach(data => {
const card = document.createElement('div');
card.setAttribute('data-card', '');
card.id = data.id;
card.className = 'w-max p-4 m-2 hover:cursor-grab rounded-lg';
card.style.position = 'absolute';
body.appendChild(card);
card.innerHTML = data.html;
card.style.left = data.left;
card.style.top = data.top;
card.style.backgroundColor = data.bg;
card.style.width = data.width;
card.style.height = data.height;
card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
card.style.display = '';
card.style.zIndex = '10';
observeCardResize(card);
});
}

function observeCardResize(card) {
const observer = new ResizeObserver(() => {
saveAllCards();
});
observer.observe(card);
}

function loadAllCards() {
try {
const raw = localStorage.getItem('saved-cards');
if (!raw) return;
const cards = JSON.parse(raw);
loadCardsState(cards);
undoStack.push(cards);
} catch (err) {
console.error('Error loading cards:', err);
}
}

function onPointerDown(e) {
if (e.button && e.button !== 0) return;
const card = e.target.closest('[data-card], #note');
if (!card) return;

const rect = card.getBoundingClientRect();
const resizeHandleSize = 20;
const isResizeHandle = e.clientX > rect.right - resizeHandleSize && e.clientY > rect.bottom - resizeHandleSize;
if (isResizeHandle) return;

if (deleteMode) {
e.preventDefault();
card.style.display = 'none';
saveAllCards();
return;
}

if (editMode) {
e.preventDefault();
cardToEdit = card;
const title = card.querySelector('h2') ? card.querySelector('h2').textContent : '';
const content = card.querySelector('p') ? card.querySelector('p').textContent : '';
noteTitle.value = title;
noteContent.value = content;
createModal.classList.remove('hidden');
if (sidebar) sidebar.style.opacity = '0.3';
createNoteBtn.textContent = 'Save Changes';
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

const undoBtn = document.querySelector('button[aria-label="undo"]');
undoBtn.addEventListener('click', () => {
if (undoStack.length > 1) {
redoStack.push(undoStack.pop());
const prevState = undoStack[undoStack.length - 1];
loadCardsState(prevState);
saveAllCards(true);
}
});

const redoBtn = document.querySelector('button[aria-label="redo"]');
redoBtn.addEventListener('click', () => {
if (redoStack.length > 0) {
const nextState = redoStack.pop();
undoStack.push(nextState);
loadCardsState(nextState);
saveAllCards(true);
}
});

const editBtn = document.querySelector('button[aria-label="edit"]');
editBtn.addEventListener('click', () => {
editMode = !editMode;
if (editMode) {
editBtn.style.backgroundColor = '#60a5fa';
editBtn.style.color = 'white';
deleteMode = false;
deleteBtn.style.backgroundColor = 'white';
deleteBtn.style.color = '#dc2626';
} else {
editBtn.style.backgroundColor = 'white';
editBtn.style.color = '#60a5fa';
}
});

const deleteBtn = document.querySelector('button[aria-label="delete"]');
if (deleteBtn) {
deleteBtn.addEventListener('click', () => {
deleteMode = !deleteMode;
if (deleteMode) {
deleteBtn.style.backgroundColor = '#dc2626';
deleteBtn.style.color = 'white';
editMode = false;
editBtn.style.backgroundColor = 'white';
editBtn.style.color = '#60a5fa';
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
const noteTitle = document.getElementById('noteTitle');
const fontSizeBtns = document.querySelectorAll('.font-size-btn');
const fontStyleBtns = document.querySelectorAll('.font-style-btn');
const noteSizeBtns = document.querySelectorAll('.note-size-btn');
let selectedNoteColor = '#fef08a';
let selectedFontSize = '16px';
let selectedFontStyles = [];
let selectedNoteSize = 'medium';

if (createBtn) {
createBtn.addEventListener('click', () => {
createModal.classList.remove('hidden');
if (sidebar) sidebar.style.opacity = '0.3';
noteContent.value = '';
noteTitle.value = '';
previewText.textContent = 'Your note here...';
selectedNoteColor = '#fef08a';
colorOptions.forEach(o => o.classList.remove('active'));
colorOptions[0].classList.add('active');
notePreview.style.backgroundColor = '#fef08a';
createNoteBtn.textContent = 'Create Note';
cardToEdit = null;
});
}

function closeModal() {
createModal.classList.add('hidden');
if (sidebar) sidebar.style.opacity = '1';
}

if (noteContent) {
noteContent.addEventListener('input', updatePreview);
noteTitle.addEventListener('input', updatePreview);
}

function updatePreview() {
let content = noteContent.value || 'Your note here...';
let title = noteTitle.value ? `<b>${noteTitle.value}</b><br>` : '';
previewText.innerHTML = title + content;
previewText.style.fontSize = selectedFontSize;
previewText.style.fontWeight = selectedFontStyles.includes('bold') ? 'bold' : 'normal';
previewText.style.fontStyle = selectedFontStyles.includes('italic') ? 'italic' : 'normal';
previewText.style.textDecoration = selectedFontStyles.includes('underline') ? 'underline' : 'none';
}

fontSizeBtns.forEach(btn => {
btn.addEventListener('click', () => {
fontSizeBtns.forEach(b => b.classList.remove('active'));
btn.classList.add('active');
selectedFontSize = btn.dataset.size;
updatePreview();
});
});

fontStyleBtns.forEach(btn => {
btn.addEventListener('click', () => {
btn.classList.toggle('active');
const style = btn.dataset.style;
if (selectedFontStyles.includes(style)) {
selectedFontStyles = selectedFontStyles.filter(s => s !== style);
} else {
selectedFontStyles.push(style);
}
updatePreview();
});
});

noteSizeBtns.forEach(btn => {
btn.addEventListener('click', () => {
noteSizeBtns.forEach(b => b.classList.remove('active'));
btn.classList.add('active');
selectedNoteSize = btn.dataset.size;
});
});

colorOptions.forEach(option => {
option.addEventListener('click', () => {
colorOptions.forEach(o => o.classList.remove('active'));
option.classList.add('active');
selectedNoteColor = option.dataset.color;
notePreview.style.backgroundColor = selectedNoteColor;
});
});

function createOrUpdateCard(card) {
const titleHtml = noteTitle.value ? `<h2 class="font-bold text-lg mb-2" style="font-size: ${selectedFontSize}; font-weight: ${selectedFontStyles.includes('bold') ? 'bold' : 'normal'}; font-style: ${selectedFontStyles.includes('italic') ? 'italic' : 'normal'}; text-decoration: ${selectedFontStyles.includes('underline') ? 'underline' : 'none'};">${noteTitle.value}</h2>` : '';
const contentHtml = `<p class="text-gray-800" style="font-size: ${selectedFontSize}; font-weight: ${selectedFontStyles.includes('bold') ? 'bold' : 'normal'}; font-style: ${selectedFontStyles.includes('italic') ? 'italic' : 'normal'}; text-decoration: ${selectedFontStyles.includes('underline') ? 'underline' : 'none'};">${noteContent.value}</p>`;
card.innerHTML = titleHtml + contentHtml;
card.style.backgroundColor = selectedNoteColor;
let width, height;
switch (selectedNoteSize) {
case 'small': width = '150px'; height = '150px'; break;
case 'large': width = '300px'; height = '300px'; break;
default: width = '224px'; height = '224px'; break;
}
card.style.width = width;
card.style.height = height;
}

if (createNoteBtn) {
createNoteBtn.addEventListener('click', () => {
if (!noteContent.value.trim()) {
alert('Please enter some text for your note');
return;
}

if (cardToEdit) {
createOrUpdateCard(cardToEdit);
cardToEdit = null;
} else {
const newCard = document.createElement('div');
newCard.setAttribute('data-card', '');
newCard.id = `card-${Date.now()}`;
newCard.className = 'p-4 m-2 hover:cursor-grab rounded-lg';
newCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
newCard.style.position = 'absolute';
newCard.style.left = '100px';
newCard.style.top = '100px';
newCard.style.zIndex = '10';
createOrUpdateCard(newCard);
document.body.appendChild(newCard);
observeCardResize(newCard);
}
saveAllCards();
closeModal();
});
}

if (cancelNoteBtn) {
cancelNoteBtn.addEventListener('click', () => {
closeModal();
createNoteBtn.textContent = 'Create Note';
cardToEdit = null;
});
}

createModal.addEventListener('click', (e) => {
if (e.target === createModal) closeModal();
});

loadAllCards();
document.body.setAttribute('data-app-ready', 'true');
})();
