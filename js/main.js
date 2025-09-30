document.addEventListener('DOMContentLoaded', () => {
    // --- App State ---
    const app = document.getElementById('app');
    const siteTitle = document.getElementById('site-title');
    const header = document.getElementById('main-header');
    const backButtonContainer = document.getElementById('back-button-container');
    const readerModal = document.getElementById('readerModal');
    let allComics = [];

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
        showLoader();
        const comic = allComics.find(c => c.id === comicId);
        if (!comic) { renderHomepage(); return; }
        
        createBackButton('Back to Home', () => window.location.hash = '#/');

        app.innerHTML = `
            <main>
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                    <div class="md:col-span-1 lg:col-span-1">
                        <img src="${comic.coverImage}" alt="Cover" class="w-full rounded-lg shadow-2xl mb-4">
                         <button onclick="openReader('${comic.id}', '${comic.chapters[0].chapter}')" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">
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
                                    <a href="#" onclick="event.preventDefault(); openReader('${comic.id}', '${ch.chapter}')" class="block p-4 hover:bg-purple-500/20 transition-colors">
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

    // --- Reader Modal Logic (Global Scope) ---
    window.openReader = (comicId, chapterNum) => {
        // --- THIS IS THE SCROLLING FIX ---
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');

        const comic = allComics.find(c => c.id === comicId);
        if (!comic) return;
        
        const chapter = comic.chapters.find(ch => String(ch.chapter) === String(chapterNum));
        if(!chapter) return;

        let currentPage = 0;
        let readerMode = 'paged';
        
        const chapterTitleEl = document.getElementById('chapterTitle');
        const pageIndicatorEl = document.getElementById('pageIndicator');
        const readerContentEl = document.getElementById('readerContent');
        const chapterSelectEl = document.getElementById('chapterSelect');
        const webtoonToggle = document.getElementById('webtoonToggle');
        
        chapterSelectEl.innerHTML = comic.chapters.map(ch => `<option value="${ch.chapter}" ${String(ch.chapter) === String(chapterNum) ? 'selected' : ''}>Chapter ${ch.chapter}</option>`).join('');
        chapterSelectEl.onchange = (e) => openReader(comicId, e.target.value);

        const displayPage = () => {
            if (readerMode === 'paged') {
                pageIndicatorEl.textContent = `Page ${currentPage + 1} of ${chapter.pages.length}`;
                pageIndicatorEl.style.display = 'block';
                document.getElementById('page-nav-buttons').style.display = 'flex';
                readerContentEl.innerHTML = `<img src="${chapter.pages[currentPage]}" alt="Page ${currentPage + 1}" class="max-w-full h-auto object-contain">`;
            }
        };

        const displayWebtoon = () => {
            pageIndicatorEl.style.display = 'none';
            document.getElementById('page-nav-buttons').style.display = 'none';
            readerContentEl.innerHTML = `<div class="flex flex-col items-center space-y-0">${chapter.pages.map(p => `<img src="${p}" alt="Page" class="w-full max-w-3xl">`).join('')}</div>`;
        };
        
        const switchMode = (mode) => {
            readerMode = mode;
            webtoonToggle.checked = (mode === 'webtoon');
            if(mode === 'paged') displayPage(); else displayWebtoon();
        };

        const closeReader = () => {
            readerModal.classList.add('hidden');
             // --- THIS IS THE SCROLLING FIX ---
            document.documentElement.classList.remove('modal-open');
            document.body.classList.remove('modal-open');
        };

        webtoonToggle.onchange = () => switchMode(webtoonToggle.checked ? 'webtoon' : 'paged');
        document.getElementById('closeReader').onclick = closeReader;
        document.getElementById('prevPage').onclick = () => { if (currentPage > 0) { currentPage--; displayPage(); }};
        document.getElementById('nextPage').onclick = () => { if (currentPage < chapter.pages.length - 1) { currentPage++; displayPage(); }};

        chapterTitleEl.textContent = `${comic.title} - Ch. ${chapter.chapter}`;
        switchMode('paged');
        readerModal.classList.remove('hidden');
    };
    
    // --- Router and Initialization ---
    const router = () => {
        const path = window.location.hash.substring(2);
        if (path === 'library') {
            renderLibraryPage();
        } else if (path.startsWith('comic/')) {
            renderDetailsPage(path.split('/')[1]);
        } else {
            renderHomepage();
        }
    };

    const init = async () => {
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

    init();
});

