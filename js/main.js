document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT: SET YOUR PASSWORD HERE ---
    const CORRECT_PASSWORD = '9767600358'; // <-- CHANGE THIS!
    // -----------------------------------------

    // --- App State ---
    const app = document.getElementById('app');
    const siteTitle = document.getElementById('site-title');
    const header = document.getElementById('main-header');
    const footer = document.getElementById('main-footer');
    const backButtonContainer = document.getElementById('back-button-container');
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    let allComics = [];
    let isInitialized = false;

    // --- Authentication Logic ---
    const handleLoginSuccess = () => {
        loginScreen.style.display = 'none';
        mainContent.style.display = 'flex';
        if (!isInitialized) {
            init();
        }
    };

    const checkAuth = () => {
        if (sessionStorage.getItem('isAuthenticated') === 'true') {
            handleLoginSuccess();
        } else {
            loginScreen.style.display = 'flex';
            mainContent.style.display = 'none';
        }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (passwordInput.value === CORRECT_PASSWORD) {
            sessionStorage.setItem('isAuthenticated', 'true');
            handleLoginSuccess();
        } else {
            errorMessage.textContent = 'Incorrect password. Please try again.';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    // --- Utility Functions ---
    const showLoader = () => {
        app.innerHTML = `<div class="flex justify-center items-center py-40"><div class="loader"></div></div>`;
    };

    const createBackButton = (text, onClick) => {
        backButtonContainer.innerHTML = '';
        const button = document.createElement('button');
        button.innerHTML = `&larr; ${text}`;
        button.className = 'bg-gray-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm';
        button.onclick = onClick;
        backButtonContainer.appendChild(button);
    };

    const clearBackButton = () => { backButtonContainer.innerHTML = ''; };
    
    // --- Rendering Functions ---
    const renderHomepage = () => {
        header.style.display = 'block';
        footer.style.display = 'block';
        app.className = 'container mx-auto p-4 sm:p-6 lg:p-8 flex-grow';
        clearBackButton();
        showLoader();
        if (allComics.length === 0) {
            app.innerHTML = `<div class="text-center py-40"><h2 class="text-2xl font-bold">No Comics Found</h2></div>`;
            return;
        }
        const sortedComics = [...allComics].sort((a, b) => {
            const lastA = a.chapters.length > 0 ? new Date(a.chapters[a.chapters.length - 1].publishDate) : new Date(0);
            const lastB = b.chapters.length > 0 ? new Date(b.chapters[b.chapters.length - 1].publishDate) : new Date(0);
            return lastB - lastA;
        });
        const latestUpdates = sortedComics.slice(0, 12);
        app.innerHTML = `
            <main class="space-y-16">
                <div>
                    <div class="flex justify-between items-center mb-8">
                         <h2 class="text-3xl font-bold text-white border-l-4 border-purple-500 pl-4">Latest Updates</h2>
                         <a href="#/library" class="text-purple-400 hover:text-purple-300">View all &rarr;</a>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        ${latestUpdates.map(comic => renderComicCard(comic)).join('')}
                    </div>
                </div>
            </main>
        `;
    };
    
    const renderLibraryPage = () => {
        header.style.display = 'block';
        footer.style.display = 'block';
        app.className = 'container mx-auto p-4 sm:p-6 lg:p-8 flex-grow';
        createBackButton('Back to Home', () => window.location.hash = '#/');
        showLoader();
        app.innerHTML = `
             <main class="space-y-16">
                <div>
                    <h2 class="text-4xl font-bold text-white mb-12 border-l-4 border-purple-500 pl-4">Full Library</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        ${allComics.map(comic => renderComicCard(comic)).join('')}
                    </div>
                </div>
            </main>
        `;
    };

    const renderComicCard = (comic) => {
        const latestChapters = comic.chapters.slice(-3).reverse();
        return `
            <div class="comic-card cursor-pointer group" onclick="window.location.hash='#/comic/${comic.id}'">
                <div class="flex gap-4">
                    <div class="w-1/3 flex-shrink-0">
                        <img src="${comic.coverImage}" alt="${comic.title}" class="w-full h-auto object-cover rounded-md shadow-lg group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <div class="w-2/3">
                        <h3 class="font-bold text-lg text-white group-hover:text-purple-400 transition-colors truncate mb-1">${comic.title}</h3>
                        <p class="text-sm text-gray-400 mb-2 truncate">${(comic.tags || []).join(', ')}</p>
                        <ul class="text-sm space-y-1 text-gray-300">
                            ${latestChapters.map(ch => `
                                <li class="flex justify-between text-xs border-b border-gray-700/50 pb-1">
                                    <span>Chapter ${ch.chapter}</span>
                                    <span class="text-gray-500">${new Date(ch.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    };

    const renderDetailsPage = (comicId) => {
        header.style.display = 'block';
        footer.style.display = 'block';
        app.className = 'container mx-auto p-4 sm:p-6 lg:p-8 flex-grow';
        showLoader();
        const comic = allComics.find(c => c.id === comicId);
        if (!comic) { renderHomepage(); return; }
        createBackButton('Back to Home', () => window.location.hash = '#/');
        app.innerHTML = `
            <main>
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                    <div class="md:col-span-1 lg:col-span-1">
                        <img src="${comic.coverImage}" alt="Cover" class="w-full rounded-lg shadow-2xl mb-4">
                         <button onclick="window.location.hash='/comic/${comic.id}/chapter/${comic.chapters[0].chapter}'" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">
                            Start Reading
                        </button>
                    </div>
                    <div class="md:col-span-2 lg:col-span-3">
                        <h2 class="text-4xl lg:text-5xl font-extrabold text-white mb-4">${comic.title}</h2>
                        <div class="flex flex-wrap items-center gap-2 mb-6">
                            <span class="tag ${comic.status === 'Ongoing' ? 'bg-green-500/30 text-green-300 border-green-500/50' : 'bg-blue-500/30 text-blue-300 border-blue-500/50'}">${comic.status || 'N/A'}</span>
                            ${(comic.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <h3 class="text-xl font-bold mb-2 text-gray-300">Description</h3>
                        <p class="text-gray-400 leading-relaxed mb-8">${comic.description}</p>
                        <h3 class="text-2xl font-bold mb-4 text-gray-300">Chapters</h3>
                        <ul class="bg-gray-800/50 rounded-lg border border-gray-700 max-h-[60vh] overflow-y-auto">
                           ${comic.chapters.map(ch => `
                                <li class="border-b border-gray-700/50 last:border-b-0">
                                    <a href="#/comic/${comic.id}/chapter/${ch.chapter}" class="block p-4 hover:bg-purple-500/20 transition-colors">
                                        <span class="font-semibold text-lg">Chapter ${ch.chapter}</span>
                                        <span class="text-gray-400 text-sm block">${ch.title}</span>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </main>
        `;
    };
    
    const renderReaderPage = (comicId, chapterNum) => {
        showLoader();
        const comic = allComics.find(c => c.id === comicId);
        const chapter = comic.chapters.find(ch => String(ch.chapter) === String(chapterNum));
        if (!comic || !chapter) {
            window.location.hash = '#/';
            return;
        }

        header.style.display = 'none';
        footer.style.display = 'none';
        app.className = 'w-full p-0';
        clearBackButton();

        const currentIndex = comic.chapters.findIndex(ch => String(ch.chapter) === String(chapterNum));
        const prevChapter = currentIndex > 0 ? comic.chapters[currentIndex - 1] : null;
        const nextChapter = currentIndex < comic.chapters.length - 1 ? comic.chapters[currentIndex + 1] : null;

        app.innerHTML = `
            <div id="reader-view" class="bg-gray-800 py-4">
                <!-- Reader Top Nav -->
                <div class="container mx-auto px-4 mb-4">
                    <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-2">
                        <a href="#/comic/${comicId}" class="bg-gray-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">&larr; Back</a>
                        <h2 class="text-lg font-semibold truncate hidden sm:block">${comic.title} - Ch. ${chapterNum}</h2>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm font-medium text-gray-300">Manga</span>
                                <div class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="modeToggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                                    <label for="modeToggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                                </div>
                                <span class="text-sm font-medium text-gray-300">Webtoon</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reader Content -->
                <div id="readerContent" class="container mx-auto max-w-3xl"></div>

                <!-- Reader Bottom Nav -->
                <div class="container mx-auto px-4 mt-4">
                    <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 h-20 flex items-center justify-between">
                         ${prevChapter ? `<a href="#/comic/${comicId}/chapter/${prevChapter.chapter}" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">&larr; Prev Ch.</a>` : `<div></div>`}
                         <div id="pageNavContainer" class="flex items-center gap-4">
                            <button id="prevPageBtn" class="bg-gray-700 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">&larr;</button>
                            <div id="pageIndicator" class="text-center font-semibold"></div>
                            <button id="nextPageBtn" class="bg-gray-700 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">&rarr;</button>
                         </div>
                         <div id="chapterSelectContainer" class="flex items-center gap-2">
                             <select id="chapterSelectReader" class="bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                 ${comic.chapters.map(ch => `<option value="${ch.chapter}" ${String(ch.chapter) === String(chapterNum) ? 'selected' : ''}>Chapter ${ch.chapter}</option>`).join('')}
                            </select>
                         </div>
                         ${nextChapter ? `<a href="#/comic/${comicId}/chapter/${nextChapter.chapter}" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Next Ch. &rarr;</a>` : `<div></div>`}
                    </div>
                </div>
            </div>
        `;

        const readerContent = document.getElementById('readerContent');
        const modeToggle = document.getElementById('modeToggle');
        const pageNavContainer = document.getElementById('pageNavContainer');
        const chapterSelectContainer = document.getElementById('chapterSelectContainer');
        const pageIndicator = document.getElementById('pageIndicator');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        
        let currentPage = 0;
        
        const updateMangaPage = () => {
             readerContent.innerHTML = `<div class="flex justify-center"><img src="${chapter.pages[currentPage]}" alt="Page ${currentPage + 1}" class="max-w-full h-auto block"></div>`;
             pageIndicator.textContent = `${currentPage + 1} / ${chapter.pages.length}`;
             prevPageBtn.disabled = currentPage === 0;
             nextPageBtn.disabled = currentPage === chapter.pages.length - 1;
             prevPageBtn.classList.toggle('opacity-50', currentPage === 0);
             nextPageBtn.classList.toggle('opacity-50', currentPage === chapter.pages.length - 1);
             window.scrollTo(0, 0);
        };

        const switchMode = (mode) => {
            modeToggle.checked = mode === 'webtoon';
            if (mode === 'webtoon') {
                pageNavContainer.style.display = 'none';
                chapterSelectContainer.style.display = 'flex';
                readerContent.innerHTML = `<div class="flex flex-col items-center space-y-0">${chapter.pages.map(p => `<img src="${p}" alt="Page" class="w-full block">`).join('')}</div>`;
            } else { // Manga mode
                pageNavContainer.style.display = 'flex';
                chapterSelectContainer.style.display = 'none';
                updateMangaPage();
            }
        };

        modeToggle.onchange = () => switchMode(modeToggle.checked ? 'webtoon' : 'manga');
        prevPageBtn.onclick = () => { if(currentPage > 0) { currentPage--; updateMangaPage(); } };
        nextPageBtn.onclick = () => { if(currentPage < chapter.pages.length - 1) { currentPage++; updateMangaPage(); } };
        
        document.getElementById('chapterSelectReader').onchange = (e) => {
            window.location.hash = `#/comic/${comicId}/chapter/${e.target.value}`;
        };
        
        // Add a 'readingMode' to your comic json ('manga' or 'webtoon') to set a default
        switchMode(comic.readingMode || 'webtoon');
    };
    
    // --- Router and Initialization ---
    const router = () => {
        const path = window.location.hash.substring(2);
        const parts = path.split('/');

        if (parts[0] === 'comic' && parts[1] && parts[2] === 'chapter' && parts[3]) {
            renderReaderPage(parts[1], parts[3]);
        } else if (parts[0] === 'comic' && parts[1]) {
            renderDetailsPage(parts[1]);
        } else if (parts[0] === 'library') {
            renderLibraryPage();
        } else {
            renderHomepage();
        }
    };

    const init = async () => {
        isInitialized = true;
        try {
            const res = await fetch(`comics.json?v=${new Date().getTime()}`);
            if (!res.ok) throw new Error('Could not fetch comics.json');
            const comicList = await res.json();
            const comicDetailsPromises = comicList.map(item => 
                fetch(`${item.path}?v=${new Date().getTime()}`).then(res => res.json())
            );
            allComics = await Promise.all(comicDetailsPromises);
            window.addEventListener('hashchange', router);
            siteTitle.addEventListener('click', () => window.location.hash = '#/');
            router();
        } catch (error) {
            console.error('Initialization failed:', error);
            app.innerHTML = `<div class="text-center py-40"><h2 class="text-2xl font-bold text-red-500">Error: Could not load comic library.</h2><p>Check console for details.</p></div>`;
        }
    };

    // --- Start the App ---
    checkAuth();
});

