const API_BASE = 'https://api.themoviedb.org/3';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG = 'https://image.tmdb.org/t/p/original';

const DEMO_MOVIES = [
    { id:1, title: "Dune: Part Two", overview: "Follow the mythic journey of Paul Atreides as he unites on a warpath of revenge.", poster_path: 'https://picsum.photos/seed/dune2/500/750', backdrop_path: 'https://picsum.photos/seed/dune2/1280/720', vote_average:8.3, release_date:"2024-02-27", genre_ids:[878,12], media_type:"movie" },
    { id:2, title: "The Night Agent", overview: "A low-life FBI agent works in the basement of the White House...", poster_path: 'https://picsum.photos/seed/nightagent/500/750', backdrop_path: 'https://picsum.photos/seed/nightagent/1280/720', vote_average:7.8, release_date:"2023-03-23", genre_ids:[80,18], media_type:"tv" },
    { id:3, title: "Oppenheimer", overview: "The story of American scientist J. Robert Oppenheimer...", poster_path: 'https://picsum.photos/seed/oppenheimer/500/750', backdrop_path: 'https://picsum.photos/seed/oppenheimer/1280/720', vote_average:8.1, release_date:"2023-07-19", genre_ids:[36,18], media_type:"movie" },
    { id:4, title: "Stranger Things", overview: "When a young boy vanishes...", poster_path: 'https://picsum.photos/seed/strangerthings/500/750', backdrop_path: 'https://picsum.photos/seed/strangerthings/1280/720', vote_average:8.6, release_date:"2016-07-15", genre_ids:[18,10765,9648], media_type:"tv" },
    { id:5, title: "The Batman", overview: "When a sadistic serial killer begins murdering...", poster_path: 'https://picsum.photos/seed/batman/500/750', backdrop_path: 'https://picsum.photos/seed/batman/1280/720', vote_average:7.7, release_date:"2022-03-01", genre_ids:[80,53,28], media_type:"movie" },
    { id:6, title: "Wednesday", overview: "Smart, sarcastic and a little dead inside...", poster_path: 'https://picsum.photos/seed/wednesday/500/750', backdrop_path: 'https://picsum.photos/seed/wednesday/1280/720', vote_average:8.4, release_date:"2022-11-23", genre_ids:[10765,35,9648], media_type:"tv" },
    { id:7, title: "Inception", overview: "A thief who steals corporate secrets...", poster_path: 'https://picsum.photos/seed/inception/500/750', backdrop_path: 'https://picsum.photos/seed/inception/1280/720', vote_average:8.4, release_date:"2010-07-15", genre_ids:[28,878,12], media_type:"movie" },
    { id:8, title: "Interstellar", overview: "A team of explorers travel through a wormhole...", poster_path: 'https://picsum.photos/seed/interstellar/500/750', backdrop_path: 'https://picsum.photos/seed/interstellar/1280/720', vote_average:8.4, release_date:"2014-11-05", genre_ids:[12,18,878], media_type:"movie" },
];

const GENRES_MAP = { 28:"Action", 12:"Adventure", 16:"Animation", 35:"Comedy", 80:"Crime", 99:"Documentary", 18:"Drama", 10751:"Family", 14:"Fantasy", 36:"History", 27:"Horror", 10402:"Music", 9648:"Mystery", 10749:"Romance", 878:"Sci-Fi", 10770:"TV Movie", 53:"Thriller", 10752:"War", 37:"Western", 10759:"Action & Adventure", 10765:"Sci-Fi & Fantasy" };

const $ = (s) => document.querySelector(s);
const apiBanner = $("#apiBanner");
const apiKeyInput = $("#apiKeyInput");
const saveApiKeyBtn = $("#saveApiKeyBtn");
const dismissBanner = $("#dismissBanner");
const searchInput = $("#searchInput");
const genreChips = $("#genreChips");
const yearFilter = $("#yearFilter");
const ratingFilter = $("#ratingFilter");
const typeFilter = $("#typeFilter");
const heroBg = $("#heroBg");
const heroTitle = $("#heroTitle");
const heroOverview = $("#heroOverview");
const heroRating = $("#heroRating");
const heroYear = $("#heroYear");
const heroType = $("#heroType");
const heroPlay = $("#heroPlay");
const heroInfo = $("#heroInfo");
const trendingRow = $("#trendingRow");
const movieGrid = $("#movieGrid");
const loadMoreBtn = $("#loadMoreBtn");
const loader = $("#loader");
const emptyState = $("#emptyState");
const activeFilterInfo = $("#activeFilterInfo");
const modal = $("#modal");
const modalBackdrop = $("#modalBackdrop");
const closeModal = $("#closeModal");
const modalHero = $("#modalHero");
const modalPoster = $("#modalPoster");
const modalTitle = $("#modalTitle");
const modalRating = $("#modalRating");
const modalDate = $("#modalDate");
const modalTypeBadge = $("#modalTypeBadge");
const modalGenres = $("#modalGenres");
const modalOverview = $("#modalOverview");
const modalTrailer = $("#modalTrailer");

let apiKey = '';
let allGenres = [];
let activeGenre = null;
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let searchQuery = '';
let filters = { year:'', rating:'', type:'all' };
let currentHeroMovie = null;
let currentMovies = [];

function init() {
    buildYearOptions();
    bindEvents();
    apiKey = localStorage.getItem('tmdb_api_key') || '';
    if(apiKeyInput && apiKey) apiKeyInput.value = apiKey;
    if(!apiKey) {
        loadDemoData();
        return;
    }
    boot().catch(e=>{
        console.warn('TMDB boot failed, falling back to demo', e);
        loadDemoData();
    });
}

function buildYearOptions() {
    if(!yearFilter) return;
    for(let y=2024;y>=2000;y--){
        const o=document.createElement('option');
        o.value=String(y);
        o.textContent=String(y);
        yearFilter.appendChild(o);
    }
}

function loadDemoData(){
    const strong = document.querySelector('#apiBanner.api-text strong');
    if(strong) strong.textContent = 'Demo Mode Active - Real posters, no key needed. Add TMDB key for live data.';
    currentMovies = [...DEMO_MOVIES];
    allGenres = [{id:28,name:"Action"}, {id:12,name:"Adventure"}, {id:16,name:"Animation"}, {id:35,name:"Comedy"}, {id:80,name:"Crime"}, {id:18,name:"Drama"}, {id:878,name:"Sci-Fi"}, {id:27,name:"Horror"}, {id:10749,name:"Romance"}];
    drawChips();
    renderHero(DEMO_MOVIES[0]);
    renderRow(trendingRow, DEMO_MOVIES.slice(0,6));
    renderGrid(DEMO_MOVIES, false);
    updateFilterInfo(true);
    if(loader) loader.classList.add('hidden');
    if(loadMoreBtn) loadMoreBtn.style.display='none';
}

function bindEvents() {
    saveApiKeyBtn?.addEventListener('click', ()=> {
        const v=apiKeyInput.value.trim();
        if(!v) return alert('Paste a valid TMDB API Key');
        apiKey=v;
        localStorage.setItem('tmdb_api_key', v);
        apiBanner.classList.add('hidden');
        boot().catch(()=> loadDemoData());
    });
    dismissBanner?.addEventListener('click', ()=> apiBanner.classList.add('hidden'));
    searchInput?.addEventListener('input', debounce((e)=> {
        searchQuery=e.target.value.trim();
        currentPage=1; if(searchQuery) doSearch(); else fetchDiscover();
    }, 400));
    yearFilter?.addEventListener('change', (e)=>{ filters.year=e.target.value; currentPage=1; fetchDiscover(); });
    ratingFilter?.addEventListener('change', (e)=>{ filters.rating=e.target.value; currentPage=1; fetchDiscover(); });
    typeFilter?.addEventListener('change', (e)=>{ filters.type=e.target.value; currentPage=1; fetchDiscover(); });
    loadMoreBtn?.addEventListener('click', ()=>{ if(currentPage<totalPages){ currentPage++; if(searchQuery) doSearch(true); else fetchDiscover(true);} });
    modalBackdrop?.addEventListener('click', closeModalFn);
    closeModal?.addEventListener('click', closeModalFn);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModalFn(); });
    heroPlay?.addEventListener('click', ()=> currentHeroMovie && openModalFor(currentHeroMovie));
    heroInfo?.addEventListener('click', ()=> currentHeroMovie && openModalFor(currentHeroMovie));
}

async function boot(){
    await fetchGenres();
    await Promise.all([fetchTrending(), fetchDiscover()]);
}

async function fetchGenres() {
    try {
        const [m,t] = await Promise.all([tmdbFetch('/genre/movie/list'), tmdbFetch('/genre/tv/list')]);
        const map=new Map(); [...(m.genres||[]),...(t.genres||[])].forEach(g=>map.set(g.id,g));
        allGenres=[...map.values()];
        drawChips();
    } catch(e) { console.warn('genres fail', e); }
}

function drawChips() {
    const list=[{id:null,name:'All'},...allGenres.slice(0,14)];
    genreChips.innerHTML=list.map(g=>`<button class="chip ${activeGenre===g.id?'active':''}" data-id="${g.id?? ''}">${g.name}</button>`).join('');
    genreChips.querySelectorAll('.chip').forEach(ch=> ch.addEventListener('click', ()=> {
        const id=ch.dataset.id?Number(ch.dataset.id): null;
        activeGenre=id;
        genreChips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active', c===ch));
        currentPage=1; fetchDiscover();
    }));
}

async function tmdbFetch(path, params={}) {
    if(!apiKey) throw new Error('No API key');
    const url=new URL(API_BASE+path);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k,v])=> { if(v!=='' && v!=null) url.searchParams.set(k,String(v)); });
    const r=await fetch(url.toString());
    if(!r.ok){ const t=await r.text(); throw new Error(t); }
    return r.json();
}

async function fetchTrending() {
    try {
        setLoading(true);
        const data=await tmdbFetch('/trending/all/week');
        const movies=data.results?.filter(m=>m.poster_path)?.slice(0,12) || DEMO_MOVIES;
        if(!currentHeroMovie) renderHero(movies[0]||DEMO_MOVIES[0]);
        renderRow(trendingRow, movies);
    } catch(e) { renderRow(trendingRow, DEMO_MOVIES); if(!currentHeroMovie) renderHero(DEMO_MOVIES[0]); }
    finally{ setLoading(false); }
}

async function fetchDiscover(append=false) {
    if(!apiKey){
        let filtered=[...DEMO_MOVIES];
        if(activeGenre) filtered=filtered.filter(m=>m.genre_ids?.includes(activeGenre));
        if(filters.year) filtered=filtered.filter(m=>(m.release_date||'').startsWith(filters.year));
        if(filters.rating) filtered=filtered.filter(m=>m.vote_average>=Number(filters.rating));
        if(filters.type!=='all') filtered=filtered.filter(m=>m.media_type===filters.type);
        if(searchQuery) filtered=filtered.filter(m=>m.title.toLowerCase().includes(searchQuery.toLowerCase()));
        renderGrid(filtered, append);
        return;
    }
    try{
        setLoading(true);
        const isTV = filters.type==='tv';
        const path = isTV? '/discover/tv' : '/discover/movie';
        const p = { page: currentPage, sort_by:'popularity.desc', with_genres:activeGenre||'', 'vote_average.gte': filters.rating||''};
        if(filters.year){ if(isTV) p.first_air_date_year=filters.year; else p.primary_release_year=filters.year; }
        const data=await tmdbFetch(path, p);
        totalPages=Math.min(data.total_pages||1,20);
        let results=data.results||[];
        currentMovies = append? [...currentMovies,...results] : results;
        renderGrid(results, append);
    }catch(e){ console.error(e); if(!append) renderGrid(DEMO_MOVIES, false); }
    finally{ setLoading(false); }
}

async function doSearch(append=false){
    if(!apiKey){
        const q=searchQuery.toLowerCase();
        const filtered=DEMO_MOVIES.filter(m=>m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q));
        renderGrid(filtered,false); return;
    }
    try{
        setLoading(true);
        const data=await tmdbFetch('/search/multi', { query: searchQuery, page: currentPage, include_adult:false});
        const results=(data.results||[]).filter(r=>(r.media_type==='movie'||r.media_type==='tv') && r.poster_path);
        totalPages=Math.min(data.total_pages||1,10);
        renderGrid(results, append);
    }catch(e){ console.error(e); }
    finally{ setLoading(false); }
}

function renderHero(movie){
    if(!movie) return;
    currentHeroMovie=movie;
    const title=movie.title || movie.name || 'Untitled';
    const backdrop = movie.backdrop_path || movie.poster_path;
    heroBg.style.backgroundImage=`url('${backdrop}')`;
    heroTitle.textContent=title;
    heroOverview.textContent=movie.overview || 'No overview available.';
    heroRating.textContent = movie.vote_average? `★ ${movie.vote_average.toFixed(1)}` : '★ New';
    heroYear.textContent = (movie.release_date || movie.first_air_date || '').slice(0,4) || '2024';
    heroType.textContent = (movie.media_type==='tv'? 'TV Series' : 'Movie').toUpperCase();
}

function renderRow(container, movies){
    if(!container) return;
    container.innerHTML = movies.map(m=>cardHTML(m)).join('');
    container.querySelectorAll('.movie-card').forEach((el,i)=> el.addEventListener('click', ()=> openModalFor(movies[i])));
}

function renderGrid(movies, append){
    if(!append) movieGrid.innerHTML='';
    if(!movies.length &&!append){ emptyState.classList.remove('hidden'); loadMoreBtn.classList.add('hidden'); return; }
    emptyState.classList.add('hidden');
    const html = movies.map(m=>cardHTML(m)).join('');
    if (append) movieGrid.insertAdjacentHTML('beforeend', html);
    else movieGrid.innerHTML=html;
    movieGrid.querySelectorAll('.movie-card').forEach((card, idx)=>{
        card.onclick = ()=> {
            const movie = (append? currentMovies[idx] : movies[idx]) || movies[idx % movies.length];
            openModalFor(movie);
        };
    });
    if(!append) currentMovies=movies;
    updateFilterInfo();
}

function cardHTML(m) {
    const title=m.title||m.name||'Untitled';
    const img = m.poster_path || '';
    const year=(m.release_date||m.first_air_date||'').slice(0,4);
    const rating=m.vote_average?m.vote_average.toFixed(1):'—';
    return `<div class="movie-card" title="${title}">
    <img loading="lazy" src="${img}" alt="${title}" onerror="this.src='https://via.placeholder.com/500x750/141414/E50914?text='+encodeURIComponent('${title.replace(/'/g,"")}')">
    <div class="card-overlay">
    <div class="card-title">${title}</div>
    <div class="card-meta"><span class="badge badge-rating">★ ${rating}</span> ${year? `<span class="badge badge-year">${year}</span>`:''}</div>
    </div>
    </div>`;
}

async function openModalFor(movie){
    if(!movie) return;
    modal.classList.remove('hidden');
    document.body.style.overflow='hidden';
    const title=movie.title||movie.name||'Untitled';
    const poster = movie.poster_path || '';
    const backdrop = movie.backdrop_path || poster;
    modalHero.style.backgroundImage = backdrop? `url('${backdrop}')` : 'none';
    modalPoster.src = poster || '';
    modalTitle.textContent = title;
    modalRating.textContent = movie.vote_average? `★ ${movie.vote_average.toFixed(1)}/10` : 'New';
    modalDate.textContent = movie.release_date || movie.first_air_date || 'Unknown date';
    modalTypeBadge.textContent = (movie.media_type || (movie.first_air_date?'TV':'Movie')).toUpperCase();
    modalOverview.textContent = movie.overview || 'No overview available.';
    const genres = (movie.genre_ids||[]).map(id=>GENRES_MAP[id]||'').filter(Boolean).slice(0,4);
    modalGenres.innerHTML = genres.map(g=>`<span>${g}</span>`).join('') || `<span>General</span>`;
}

function closeModalFn(){ modal.classList.add('hidden'); document.body.style.overflow=''; }
function setLoading(v){ isLoading=v; loader?.classList.toggle('hidden',!v); }
function updateFilterInfo(isDemo){
    let parts=[];
    if(activeGenre){ const g=allGenres.find(x=>x.id===activeGenre); if(g) parts.push(g.name); }
    if(filters.year) parts.push(filters.year);
    if(filters.rating) parts.push(`≥${filters.rating}★`);
    if(filters.type!=='all') parts.push(filters.type==='movie'?'Movies':'TV Shows');
    if(searchQuery) parts.push(`Search:"${searchQuery}"`);
    if(!parts.length){ activeFilterInfo.innerHTML = isDemo? '<b>Demo Mode</b> - Add TMDB key to load real titles.' : 'Showing <b>Popular</b> titles'; return; }
    activeFilterInfo.innerHTML = `Filtered by <b>${parts.join(' • ')}</b> - ${currentMovies.length} results`;
}
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

init();