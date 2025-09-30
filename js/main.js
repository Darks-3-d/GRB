document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const app = document.getElementById('app');
    const siteTitle = document.getElementById('site-title');
    const header = document.getElementById('main-header');
    const headerControls = document.getElementById('header-controls');
    
    // Modal Elements
    const readerModal = document.getElementById('readerModal');
    const closeReaderBtn = document.getElementById('closeReader');
    const chapterTitleEl = document.getElementById('chapterTitle');
    const pageIndicatorEl = document.getElementById('pageIndicator');
    const chapterSelectEl = document.getElementById('chapterSelect');
    const webtoonToggle = document.getElementById('webtoonToggle');
    const readerContent = document.getElementById('readerContent');
    const readerContainer = document.getElementById('readerContainer');
    const pageNavButtons = document.getElementById('page-nav-buttons');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // --- App State ---
    let comicsLibrary = [];
    let currentComicDetails = null;
    let currentPage = 0;

    // --- Utility Functions ---
    const showLoader = (container) => {
        container.innerHTML = `<div class="flex justify-center items-center min-h-[60vh]"><div class="loader"></div></div>`;
    };

    const createHeaderControls = (type) => {
        headerControls.innerHTML = '';
        if (type === 'home') {
             // Future search bar can go here
        } else if (type === 'details') {
            const backButton = document.createElement('button');
            backButton.innerHTML = `&larr; Back to Library`;
            backButton.className = 'bg-gray-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors';
            backButton.onclick = renderHomepage;
            headerControls.appendChild(backButton);
        }
    };
    
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

    // --- Page Rendering ---
    const renderHomepage = () => {
        createHeaderControls('home');
        if (comicsLibrary.length === 0) {
            app.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl font-bold">No Comics Found</h2></div>`;
            return;
        }

        const featuredComic = comicsLibrary[0];
        const otherComics = comicsLibrary.slice(1);

        app.innerHTML = `
            <section id="hero" class="h-screen min-h-[700px] flex items-center justify-center text-center text-white relative" style="background-image: url('${featuredComic.coverImage}');">
                <div class="relative z-10 p-4 max-w-3xl">
                    <h2 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.8);">${featuredComic.title}</h2>
                    <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8" style="text-shadow: 1px 1px 4px rgba(0,0,0,0.9);">${featuredComic.description.substring(0, 150)}...</p>
                    <button class="read-now-btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105" data-comic-id="${featuredComic.id}">Read Now</button>
                </div>
            </section>
            
            ${otherComics.length > 0 ? `
            <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <h2 class="text-3xl font-bold text-white mb-8 border-l-4 border-purple-500 pl-4">Full Library</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    ${otherComics.map(comic => `
                        <div class="comic-card cursor-pointer group" data-comic-id="${comic.id}">
                            <div class="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                                <img src="${comic.coverImage}" alt="${comic.title}" class="w-full h-full object-cover">
                            </div>
                            <h3 class="mt-3 font-semibold text-white truncate">${comic.title}</h3>
                        </div>
                    `).join('')}
                </div>
            </section>` : ''}
        `;
        observeElements();
    };

    const renderDetailsPage = async (comicId) => {
        showLoader(app);
        createHeaderControls('details');

        try {
            const response = await fetch(`comics/${comicId}.json?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Comic details not found');
            const details = await response.json();
            currentComicDetails = details; // Store for the reader
            
            app.innerHTML = `
                <section id="details-banner" class="h-[60vh] min-h-[400px] relative flex items-end p-4 sm:p-8 lg:p-12" style="background-image: url('${details.coverImage}');">
                     <div class="relative z-10 flex flex-col md:flex-row items-start gap-8">
                        <div class="w-40 sm:w-48 flex-shrink-0 -mb-16">
                            <img src="${details.coverImage}" alt="Cover" class="aspect-[2/3] w-full object-cover rounded-lg shadow-2xl">
                        </div>
                        <div>
                            <h2 class="text-3xl sm:text-5xl font-extrabold text-white" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.8);">${details.title}</h2>
                            <button class="start-reading-btn mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-transform hover:scale-105" data-chapter="${details.chapters[0].chapter}">
                                Start Reading
                            </button>
                        </div>
                    </div>
                </section>
                
                <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pt-24">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div class="lg:col-span-2">
                            <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Description</h3>
                            <p class="text-gray-300 leading-relaxed">${details.description}</p>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Chapters</h3>
                            <ul class="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                                ${details.chapters.map(ch => `
                                    <li class="border-b border-gray-800 last:border-b-0">
                                        <a href="#" class="chapter-link block p-4 hover:bg-gray-800 transition-colors" data-chapter="${ch.chapter}">
                                            <span class="font-semibold">Chapter ${ch.chapter}</span>
                                            <span class="text-gray-400 text-sm block">${ch.title}</span>
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </section>
            `;
        } catch (error) {
            console.error('Failed to load comic details:', error);
            app.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl font-bold">Error loading comic.</h2></div>`;
        }
    };

    // --- Reader Modal Logic ---
    const openReader = (chapterNum) => {
        const chapter = currentComicDetails.chapters.find(c => c.chapter == chapterNum);
        if (!chapter) return;

        currentPage = 0;
        readerModal.classList.remove('hidden');
        readerModal.classList.add('flex');
        document.body.style.overflow = 'hidden';

        // Populate controls
        chapterTitleEl.textContent = `${currentComicDetails.title} - Ch. ${chapter.chapter}`;
        chapterSelectEl.innerHTML = currentComicDetails.chapters.map(c => `<option value="${c.chapter}" ${c.chapter == chapterNum ? 'selected' : ''}>Chapter ${c.chapter}</option>`).join('');
        
        loadChapter(chapter);
    };

    const closeReader = () => {
        readerModal.classList.add('hidden');
        readerModal.classList.remove('flex');
        document.body.style.overflow = '';
    };

    const loadChapter = (chapter) => {
        currentPage = 0;
        readerContainer.scrollTop = 0; // Reset scroll for new chapter
        updateReaderView(chapter);
    };

    const updateReaderView = (chapter) => {
        const isWebtoon = webtoonToggle.checked;
        pageNavButtons.style.display = isWebtoon ? 'none' : 'flex';

        if (isWebtoon) {
            readerContent.innerHTML = chapter.pages.map(src => `<img src="${src}" class="max-w-full mx-auto d-block">`).join('');
            pageIndicatorEl.textContent = 'Webtoon Mode';
        } else {
            readerContent.innerHTML = `<img src="${chapter.pages[currentPage]}" class="max-w-full max-h-[85vh] object-contain">`;
            pageIndicatorEl.textContent = `Page ${currentPage + 1} of ${chapter.pages.length}`;
        }
        
        prevPageBtn.disabled = !isWebtoon && currentPage === 0;
        nextPageBtn.disabled = !isWebtoon && currentPage === chapter.pages.length - 1;
    };

    // --- Event Listeners ---
    app.addEventListener('click', (e) => {
        const comicCard = e.target.closest('.comic-card, .read-now-btn');
        const chapterLink = e.target.closest('.chapter-link, .start-reading-btn');

        if (comicCard) {
            const comicId = comicCard.dataset.comicId;
            renderDetailsPage(comicId);
        } else if (chapterLink) {
            e.preventDefault();
            const chapterNum = chapterLink.dataset.chapter;
            openReader(chapterNum);
        }
    });

    closeReaderBtn.addEventListener('click', closeReader);
    webtoonToggle.addEventListener('change', () => {
        const chapter = currentComicDetails.chapters.find(c => c.chapter == chapterSelectEl.value);
        updateReaderView(chapter);
    });
    chapterSelectEl.addEventListener('change', (e) => {
        const chapter = currentComicDetails.chapters.find(c => c.chapter == e.target.value);
        loadChapter(chapter);
    });
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            const chapter = currentComicDetails.chapters.find(c => c.chapter == chapterSelectEl.value);
            updateReaderView(chapter);
        }
    });
    nextPageBtn.addEventListener('click', () => {
        const chapter = currentComicDetails.chapters.find(c => c.chapter == chapterSelectEl.value);
        if (currentPage < chapter.pages.length - 1) {
            currentPage++;
            updateReaderView(chapter);
        }
    });

    // --- Initialization ---
    const init = async () => {
        showLoader(app);
        try {
            const response = await fetch(`comics.json?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Could not fetch comics list.');
            const comicList = await response.json();
            
            const detailsPromises = comicList.map(async (item) => {
                 const id = item.path.split('/')[1].replace('.json', '');
                 const res = await fetch(`comics/${id}.json?v=${new Date().getTime()}`);
                 return res.json();
            });
            comicsLibrary = await Promise.all(detailsPromises);

            siteTitle.addEventListener('click', renderHomepage);
            renderHomepage();

        } catch (error) {
            console.error('Initialization failed:', error);
            app.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl font-bold text-red-500">Error: Could not load comic library.</h2><p class="text-gray-400">Please ensure 'comics.json' is present and correctly formatted.</p></div>`;
        }
    };

    init();
});

