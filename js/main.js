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
        app.innerHTML = `<div class="flex justify-center items-center h-screen"><div class="loader"></div></div>`;
    };

    const createBackButton = (text, onClick) => {
        backButtonContainer.innerHTML = '';
        const button = document.createElement('button');
        button.innerHTML = `&larr; ${text}`;
        button.className = 'bg-gray-800 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm';
        button.onclick = onClick;
        backButtonContainer.appendChild(button);
    };

    const clearBackButton = () => { backButtonContainer.innerHTML = ''; };

    // --- Animation Logic ---
    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('is-visible'), index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.comic-card').forEach(card => observer.observe(card));
    };
    
    // --- Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Rendering Functions ---

    const renderHomepage = () => {
        clearBackButton();
        showLoader();

        if (allComics.length === 0) {
            app.innerHTML = `<div class="text-center py-40"><h2 class="text-2xl font-bold">No Comics Found</h2></div>`;
            return;
        }

        // Sort comics by the most recent chapter's publish date
        const sortedComics = [...allComics].sort((a, b) => {
            const lastChapterA = new Date(a.chapters[a.chapters.length - 1].publishDate);
            const lastChapterB = new Date(b.chapters[b.chapters.length - 1].publishDate);
            return lastChapterB - lastChapterA;
        });
        
        const latestUpdates = sortedComics.slice(0, 6); // Get top 6 for "Latest Updates"
        const featuredComic = latestUpdates.length > 0 ? latestUpdates[0] : allComics[0];

        app.innerHTML = `
            <main>
                <!-- Hero Section -->
                <section id="hero" class="h-screen min-h-[700px] flex items-center justify-center text-center text-white" style="background-image: url('${featuredComic.coverImage}');">
                    <div class="relative z-10 p-4 max-w-3xl">
                        <h2 class="text-4xl md:text-6xl font-extrabold" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.8);">${featuredComic.title}</h2>
                        <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto my-6" style="text-shadow: 1px 1px 4px rgba(0,0,0,0.9);">${featuredComic.description.substring(0, 150)}...</p>
                        <button onclick="window.location.hash='#/comic/${featuredComic.id}'" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105" style="box-shadow: var(--purple-glow);">Read Now</button>
                    </div>
                </section>
                
                <!-- Library Section -->
                <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                    <div class="flex justify-between items-center mb-8">
                         <h2 class="text-3xl font-bold text-white border-l-4 border-purple-500 pl-4">Latest Updates</h2>
                         <a href="#/library" class="text-purple-400 hover:text-purple-300">View all &rarr;</a>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${latestUpdates.map(comic => renderComicCard(comic)).join('')}
                    </div>
                </div>
            </main>
        `;
        observeElements();
    };
    
    const renderLibraryPage = () => {
        createBackButton('Back to Home', () => window.location.hash = '#/');
        showLoader();
        app.innerHTML = `
            <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <h2 class="text-4xl font-bold text-white mb-12 border-l-4 border-purple-500 pl-4">Full Library</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${allComics.map(comic => renderComicCard(comic)).join('')}
                </div>
            </div>
        `;
        observeElements();
    };

    const renderComicCard = (comic) => {
        const latestChapters = comic.chapters.slice(-3).reverse(); // Get last 3 chapters
        return `
            <div class="comic-card cursor-pointer group" onclick="window.location.hash='#/comic/${comic.id}'">
                <div class="flex gap-4">
                    <div class="w-1/3 flex-shrink-0">
                        <img src="${comic.coverImage}" alt="${comic.title}" class="w-full h-auto object-cover rounded-md shadow-lg group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <div class="w-2/3">
                        <h3 class="font-bold text-lg text-white truncate mb-1">${comic.title}</h3>
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

    const renderDetailsPage = async (comicId) => {
        showLoader();
        const comic = allComics.find(c => c.id === comicId);
        if (!comic) { renderHomepage(); return; }
        
        createBackButton('Back to Home', () => window.location.hash = '#/');

        app.innerHTML = `
            <main>
                <section id="details-banner" class="min-h-screen py-24 flex items-center" style="background-image: url('${comic.coverImage}');">
                     <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <div class="md:col-span-1 flex justify-center">
                                <img src="${comic.coverImage}" alt="Cover" class="w-64 rounded-lg shadow-2xl">
                            </div>
                            <div class="md:col-span-2 relative z-10">
                                <div class="frosted-glass-pane p-8 rounded-lg">
                                    <h2 class="text-4xl lg:text-5xl font-extrabold text-white mb-4">${comic.title}</h2>
                                    <div class="flex flex-wrap items-center gap-2 mb-4">
                                        <span class="tag ${comic.status === 'Ongoing' ? 'bg-green-500/50' : 'bg-blue-500/50'}">${comic.status || 'N/A'}</span>
                                        ${(comic.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                    <p class="text-gray-300 leading-relaxed mb-6">${comic.description}</p>
                                    <button onclick="openReader('${comic.id}', '${comic.chapters[0].chapter}')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105" style="box-shadow: var(--purple-glow);">
                                        Start Reading
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="mt-12">
                             <h3 class="text-2xl font-bold mb-4 text-white border-b-2 border-purple-500/50 pb-2">Chapters</h3>
                             <ul class="bg-gray-900/70 rounded-lg overflow-hidden border border-gray-800/50">
                                ${comic.chapters.map(ch => `
                                    <li class="border-b border-gray-800/50 last:border-b-0">
                                        <a href="#" onclick="event.preventDefault(); openReader('${comic.id}', '${ch.chapter}')" class="block p-4 hover:bg-gray-800/80 transition-colors">
                                            <span class="font-semibold">Chapter ${ch.chapter}</span>
                                            <span class="text-gray-400 text-sm block">${ch.title}</span>
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                     </div>
                </section>
            </main>
        `;
    };

    // --- Reader Modal Logic (Global Scope) ---
    window.openReader = (comicId, chapterNum) => {
        const comic = allComics.find(c => c.id === comicId);
        if (!comic) return;
        
        const chapter = comic.chapters.find(ch => ch.chapter == chapterNum);
        if(!chapter) return;

        let currentPage = 0;
        let readerMode = 'paged'; // Default to paged
        
        const chapterTitleEl = document.getElementById('chapterTitle');
        const pageIndicatorEl = document.getElementById('pageIndicator');
        const readerContentEl = document.getElementById('readerContent');
        const chapterSelectEl = document.getElementById('chapterSelect');
        const webtoonToggle = document.getElementById('webtoonToggle');
        
        // Populate chapter select dropdown
        chapterSelectEl.innerHTML = comic.chapters.map(ch => `<option value="${ch.chapter}" ${ch.chapter == chapterNum ? 'selected' : ''}>Chapter ${ch.chapter}</option>`).join('');
        chapterSelectEl.onchange = (e) => openReader(comicId, e.target.value);

        const displayPage = () => {
            if (readerMode === 'paged') {
                pageIndicatorEl.textContent = `Page ${currentPage + 1} of ${chapter.pages.length}`;
                pageIndicatorEl.style.display = 'block';
                document.getElementById('page-nav-buttons').style.display = 'flex';
                readerContentEl.innerHTML = `<img src="${chapter.pages[currentPage]}" alt="Page ${currentPage + 1}" class="max-w-full max-h-[85vh] object-contain">`;
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

        webtoonToggle.onchange = () => switchMode(webtoonToggle.checked ? 'webtoon' : 'paged');
        document.getElementById('closeReader').onclick = () => readerModal.classList.add('hidden');
        document.getElementById('prevPage').onclick = () => { if (currentPage > 0) { currentPage--; displayPage(); }};
        document.getElementById('nextPage').onclick = () => { if (currentPage < chapter.pages.length - 1) { currentPage++; displayPage(); }};

        chapterTitleEl.textContent = `${comic.title} - Ch. ${chapter.chapter}`;
        switchMode('paged'); // Start in paged mode
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

