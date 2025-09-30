// --- DOM ELEMENTS ---
const content = document.getElementById('content');
const searchInput = document.getElementById('searchInput');
const readerModal = document.getElementById('readerModal');
const closeReader = document.getElementById('closeReader');
const readerContent = document.getElementById('readerContent');
const chapterTitle = document.getElementById('chapterTitle');
const pageIndicator = document.getElementById('pageIndicator');
const chapterSelect = document.getElementById('chapterSelect');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const webtoonToggle = document.getElementById('webtoonToggle');
const pageNavButtons = document.getElementById('page-nav-buttons');
const readerContainer = document.getElementById('readerContainer');

// --- APP STATE ---
let comicsData = [];
let currentComic = null;
let currentChapterIndex = 0;
let currentPageIndex = 0;
let isWebtoonMode = false;

// --- DATA FETCHING ---

// Fetches a JSON file and returns its content
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error(`Failed to fetch ${url}:`, e);
        return null;
    }
}

// Load all comic data from the manifest and individual comic files
async function loadAllComics() {
    showLoader();
    const manifest = await fetchJSON('comics.json');
    if (!manifest) {
        content.innerHTML = `<p class="text-center text-red-400 mt-8">Error: Could not load comics.json manifest.</p>`;
        return;
    }

    const comicPromises = manifest.map(item => fetchJSON(item.path));
    const loadedComics = await Promise.all(comicPromises);
    
    // Filter out any comics that failed to load
    comicsData = loadedComics.filter(comic => comic !== null);
    
    if (comicsData.length > 0) {
        loadHomepage();
    } else {
        content.innerHTML = `<p class="text-center text-gray-400 mt-8">No comics found. Check your comics.json and individual comic files.</p>`;
    }
}


// --- DISPLAY/RENDER FUNCTIONS ---
function showLoader() {
    content.innerHTML = `<div class="flex justify-center mt-16"><div class="loader"></div></div>`;
}

function renderHomepage(comicsList = comicsData) {
    if (!comicsList || comicsList.length === 0) {
        content.innerHTML = `<p class="text-center text-gray-400 mt-8">No comics in the library.</p>`;
        return;
    }

    const heroComic = comicsList[0];
    const otherComics = comicsList.slice(1);

    const heroHTML = `
        <div class="relative rounded-lg overflow-hidden mb-8 h-80">
            <img src="${heroComic.coverImage}" class="absolute inset-0 w-full h-full object-cover object-center brightness-75" alt="${heroComic.title}" onerror="this.src='https://placehold.co/1280x320/111827/ffffff?text=Image+Missing'">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-8 text-white">
                <h2 class="text-4xl font-bold mb-2">${heroComic.title}</h2>
                <p class="max-w-2xl text-gray-300 hidden md:block">${(heroComic.description || '').substring(0, 150)}...</p>
                <button onclick="showComicDetails('${heroComic.id}')" class="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors">Read Now</button>
            </div>
        </div>
    `;
    
    content.innerHTML = heroHTML + renderComicGrid(otherComics, 'My Collection');
}

function renderComicGrid(comicsList, title) {
    if (!comicsList || comicsList.length === 0) {
        if (searchInput.value) {
             return `<p class="text-center text-gray-400 mt-8">No comics found for your search.</p>`;
        }
        return '';
    }
    
    return `
        <h2 class="text-3xl font-bold mb-4 mt-8">${title}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            ${comicsList.map(comic => `
                <div class="relative rounded-md overflow-hidden group cursor-pointer card-aspect bg-gray-800" onclick="showComicDetails('${comic.id}')">
                    <img src="${comic.coverImage}" alt="Cover for ${comic.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://placehold.co/512x768/1a202c/ffffff?text=No+Image';">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-3 w-full">
                        <h3 class="font-semibold text-white truncate text-md">${comic.title}</h3>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showComicDetails(comicId) {
    const comic = comicsData.find(c => c.id === comicId);
    if (!comic) return;
    
    currentComic = comic;
    const sortedChapters = [...comic.chapters].sort((a, b) => parseFloat(b.chapter) - parseFloat(a.chapter));

    content.innerHTML = `
        <div class="relative h-64 md:h-80 -mt-4 -mx-4 rounded-b-lg overflow-hidden">
            <img src="${comic.coverImage}" class="absolute inset-0 w-full h-full object-cover object-center brightness-50" alt="${comic.title}" onerror="this.style.display='none'">
        </div>
        <div class="relative -mt-32 p-4 md:px-8">
            <div class="flex flex-col md:flex-row md:items-end md:space-x-8">
                <img src="${comic.coverImage}" alt="Cover for ${comic.title}" class="w-48 rounded-lg shadow-lg mx-auto md:mx-0 flex-shrink-0" onerror="this.src='https://placehold.co/512x768/1a202c/ffffff?text=No+Image';">
                <div class="mt-4 md:mt-0 text-center md:text-left">
                    <h2 class="text-4xl font-extrabold mb-2 text-white">${comic.title}</h2>
                    <button onclick="loadHomepage()" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">&larr; Back to Collection</button>
                </div>
            </div>
        </div>
        <div class="p-4 md:px-8 mt-8">
            <h3 class="text-2xl font-bold mb-3 border-b border-gray-700 pb-2">Description</h3>
            <p class="text-gray-300 mb-8">${comic.description}</p>
            <h3 class="text-2xl font-bold mb-3 border-b border-gray-700 pb-2">Chapters</h3>
            <div id="chapterList" class="max-h-96 overflow-y-auto bg-gray-800 rounded-lg p-2">
                ${sortedChapters.length > 0 ? sortedChapters.map((chapter) => {
                   const originalIndex = comic.chapters.indexOf(chapter);
                   return `
                    <div class="p-3 hover:bg-gray-700 rounded-md cursor-pointer flex justify-between items-center" onclick="openReader(${originalIndex})">
                        <span>Chapter ${chapter.chapter}: ${chapter.title || ''}</span>
                        <span class="text-xs text-gray-400">${chapter.publishDate}</span>
                    </div>
                `}).join('') : '<p class="p-3 text-gray-400">No chapters available for this comic.</p>'}
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
}

function openReader(chapterIndex) {
    if (!currentComic) return;
    currentChapterIndex = chapterIndex;
    currentPageIndex = 0;
    
    readerModal.style.display = 'flex';
    
    // Populate chapter select dropdown, sorted by chapter number
    const sortedChapters = [...currentComic.chapters].sort((a, b) => parseFloat(a.chapter) - parseFloat(b.chapter));
    chapterSelect.innerHTML = sortedChapters.map((chap) => {
        const originalIndex = currentComic.chapters.indexOf(chap);
        return `<option value="${originalIndex}" ${originalIndex === chapterIndex ? 'selected' : ''}>Chapter ${chap.chapter}</option>`
    }).join('');
    
    renderReaderContent();
}

function renderReaderContent() {
    const chapter = currentComic.chapters[currentChapterIndex];
    const pages = chapter.pages;
    chapterTitle.textContent = `Ch. ${chapter.chapter}: ${chapter.title}`;
    
    if (isWebtoonMode) {
        pageIndicator.style.display = 'none';
        pageNavButtons.style.display = 'none';
        readerContent.innerHTML = pages.map(pageUrl => 
            `<img src="${pageUrl}" class="max-w-full md:max-w-3xl h-auto" loading="lazy" onerror="this.src='https://placehold.co/800x1200/111827/ffffff?text=Image+not+found'">`
        ).join('');
    } else {
        pageIndicator.style.display = 'block';
        pageNavButtons.style.display = 'flex';
        pageIndicator.textContent = `Page ${currentPageIndex + 1} / ${pages.length}`;
        readerContent.innerHTML = `<img src="${pages[currentPageIndex]}" class="max-w-full md:max-w-4xl h-auto" onerror="this.src='https://placehold.co/800x1200/111827/ffffff?text=Image+not+found'">`;
        updatePageButtons();
    }
    readerContainer.scrollTop = 0;
}

function updatePageButtons() {
    const pages = currentComic.chapters[currentChapterIndex].pages;
    prevPage.disabled = currentPageIndex === 0;
    nextPage.disabled = currentPageIndex >= pages.length - 1;
    prevPage.classList.toggle('opacity-50', prevPage.disabled);
    nextPage.classList.toggle('opacity-50', nextPage.disabled);
}

// --- EVENT LISTENERS & LOGIC ---

// Initial load
document.addEventListener('DOMContentLoaded', loadAllComics);

// Search functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query) {
        const filteredComics = comicsData.filter(comic => comic.title.toLowerCase().includes(query));
        content.innerHTML = renderComicGrid(filteredComics, `Search Results`);
    } else {
        renderHomepage();
    }
});

// Reader controls
closeReader.addEventListener('click', () => {
    readerModal.style.display = 'none';
    readerContent.innerHTML = '';
    currentComic = null;
});

chapterSelect.addEventListener('change', (e) => {
    currentChapterIndex = parseInt(e.target.value);
    currentPageIndex = 0;
    renderReaderContent();
});

webtoonToggle.addEventListener('change', (e) => {
    isWebtoonMode = e.target.checked;
    renderReaderContent();
});

prevPage.addEventListener('click', () => {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        renderReaderContent();
    }
});

nextPage.addEventListener('click', () => {
    const pages = currentComic.chapters[currentChapterIndex].pages;
    if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        renderReaderContent();
    }
});

document.addEventListener('keydown', (e) => {
    if (readerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeReader.click();
        if (!isWebtoonMode) {
             if (e.key === 'ArrowLeft') prevPage.click();
             else if (e.key === 'ArrowRight') nextPage.click();
        }
    }
});

function loadHomepage() {
    searchInput.value = '';
    renderHomepage(comicsData);
    window.scrollTo(0, 0);
}
