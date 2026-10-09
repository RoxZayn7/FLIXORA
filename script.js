const API_BASE = 'https://api.themoviedb.org/3';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG = 'https://image.tmdb.org/t/p/original';

const DEMO_MOVIES = [
    { id:1, title: "Dune: Part Two", overview: "Follow the mythic journey of Paul Atreides as he unites on a warpath of revenge.", poster_path: SVGPoster("DUNE2", "#1a1a1a"), backdrop_path: svgBackdrop("#0f0f0f"), vote_average:8.3, release_date:"2024-02-27", genre_ids:[878,12], media_type:"movie" },
    { id:2, title: "The Night Agent", overview: "A low-life FBI agent works in the basement of the White House, manning a phone that never rings - until the night it does.", poster_path: SVGPoster("NIGHT AGENT", "#1e1e1e"), backdrop_path: svgBackdrop("#12121a"), vote_average:7.8, release_date:"2023-03-23", genre_ids:[80,18], media_type:"tv" },
    { id:3, title: "Oppenheimer", overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.", poster_path: SVGPoster("OPPENHEIMER", "#2a1a0a"), backdrop_path: svgBackdrop("#1a1200"), vote_average:8.1, release_date:"2023-07-19", genre_ids:[36,18], media_type:"movie" },
    { id:4, title: "Stranger Things", overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.", poster_path: SVGPoster("STRANGER", "#0a1a2a"), backdrop_path: svgBackdrop("#0a121a"), vote_average:8.6, release_date:"2016-07-15", genre_ids:[18,10765, 9648], media_type:"tv" },
    { id:5, title: "The Batman", overview: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.", poster_path: SVGPoster("THE BATMAN", "#101010"), backdrop_path: svgBackdrop("#0a0a0a"), vote_average:7.7, release_date:"2022-03-01", genre_ids:[80,53,28], media_type:"movie" },
    { id:6, title: "Wednesday", overview: "Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends - and foes - at Nevermore Academy.", poster_path: SVGPoster("WEDNESDAY", "#1a0a1a"), backdrop_path: svgBackdrop("#120a12"), vote_average:8.4, release_date:"2022-11-23", genre_ids:[10765,35,9648], media_type:"tv" },
    { id:7, title: "Inception", overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.", poster_path: SVGPoster("INCEPTION", "#0a1a1a"), backdrop_path: svgBackdrop("#0a1212"), vote_average:8.4, release_date:"2010-07-15", genre_ids:[28,878,12], media_type:"movie" },
    { id:8, title: "Interstellar", overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", poster_path: SVGPoster("INTERSTELLAR", "#0a0a1e"), backdrop_path: svgBackdrop("#0a0a14"), vote_average:8.4, release_date:"2014-11-05", genre_ids:[12,18,878], media_type:"movie" },
];

const GENRES_MAP = { 28:"Action", 12:"Adventure", 16:"Animation", 35:"Comedy", 80:"Crime", 99:"Documentary", 18:"Drama", 10751:"Family", 14:"Fantasy", 36:"History", 27:"Horror", 10402:"Music", 9648:"Mystery", 10749:"Romance", 878:"Sci-Fi", 10770:"TV Movie", 53:"Thriller", 10752:"War", 37:"Western", 10759:"Action & Adventure", 10765:"Sci-Fi & Fantasy", 10762:"Kids", 10763:"News", 10764:"Reality", 10767:"Talk" };

// DOM refs
const $ = (s) => document.querySelector(s);
const apiBanner = $("#apiBanner");
const apiKeyInput = $("#apiKeyInput");
const saveApiKeyBtn = $("#saveApiKeyBtn");
const dismissBanner = $("#dismissBanner");
const header = $("#header");
const searchInput = $("#searchInput");
const genreChips = $("#genreChips");
const yearFilter = $("#yearFilter");
const ratingFilter = $("#ratingFilter");
const typeFilter = $("#typeFilter");
const hero = $("#hero");
const heroBg = $("#heroBg");
const heroTitle = $("#heroTitle");
const heroOverview = $("#heroOverview");
const heroRating = $("#heroRating");
const heroYear = $("#heroYear");
const heroType = $("#heroType");
const heroPlay = $("#heroPlay");
const heroInfo = $("#heroInfo");
const trendingBtn = $("#trendingBtn");
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

// State
let apiKey = localStorage.getItem('tmdb_api_key') || '';
let allGenres = [];
let activeGenre = null;
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let searchQuery = '';
let filters = { year:'', rating:'', type:'all' };
let currentHeroMovie = null;
let currentMovies = [];

// Init
function init() {
    buildYearOptions();
    if(!apiKey) {
        apiBanner.classList.remove('hidden');
        renderDemo();
    }
    else {
        apiBanner.classList.add('hidden');
        apiKeyInput.value = apiKey;
        boot();
    }
    bindEvents();
    window.addEventListener('scroll', ()=> header.classList.toggle('scrolled', window.scrollY>20));
}

function buildYearOptions() {
    for (let y=2025; y>=2000; y--) {
        const o=document.createElement('option');
        o.value=String(y);
        o.textContent=String(y);
        yearFilter.appendChild(o);
    }
}

function bindEvents() {
    saveApiKeyBtn?.addEventListener('click', ()=> {
        const v=apiKeyInput.value.trim();
        if(!v) return alert('Paste a valid TMDB API Key');
        apiKey=v;
        localStorage.setItem('tmdb_api_key', v);
        apiBanner.classList.add('hidden');
        boot();
    });

    dismissBanner?.addEventListener('click', ()=> apiBanner.classList.add('hidden'));
    searchInput?.addEventListener('input', debounce((e)=> {
        searchQuery=e.target.value.trim();
        currentPage=1; if(searchQuery) doSearch(); else fetchDiscover();
    }, 400));
    yearFilter.addEventListener('change', (e)=>{
        filters.year=e.target.value;
        currentPage=1; fetchDiscover();
        updateFilterInfo();
    });

    ratingFilter.addEventListener('change', (e)=>{
        filters.rating=e.target.value;
        currentPage=1; fetchDiscover();
        updateFilterInfo();
    });
    typeFilter.addEventListener('change', (e)=>{
        filters.rating=e.target.value;
        currentPage=1; fetchDiscover();
        updateFilterInfo();
    });
    loadMoreBtn.addEventListener('click', ()=>{
        if(currentPage<totalPages){
            currentPages++; if(searchQuery) doSearch(true); else 
            fetchDiscover(true);
        }
    });

    modalBackdrop.addEventListener('click', closeModalFn);
    closeModal.addEventListener('click', closeModalFn);
    document.addEventListener('keydown', (e)=>{
        if(e.key==='Escape')
            closeModalFn();
    });
    heroPlay.addEventListener('click', ()=> currentHeroMovie && openModalFor(currentHeroMovie));
    heroInfo.addEventListener('click', ()=> currentHeroMovie && openModalFor(currentHeroMovie));
}

async function boot(){
    await fetchGenres();
    await Promise.all([fetchTrending(), fetchDiscover()]);
}

function renderDemo() {
    currentMovies = DEMO_MOVIES;
    renderGenresDemo();
    renderHero(DEMO_MOVIES[0]);
    renderRow(trendingRow, DEMO_MOVIES.slice(0,6));
    renderGrid(DEMO_MOVIES, false);
    updateFilterInfo(true);
}

function renderGenresDemo() {
    const base = [{id:28,name:'Action'}, {id:35,name:'Comedy'}, {id:18,name:'Drama'}, {id:878,name:'Horror'}, {id:10749,name:'Romance'}];
    allGenres=base; drawChips();
}

async function fetchGenres() {
    try {
        const [m,t] = await
Promise.all([tmdbFetch('genre/movie/list'), tmdbFetch('genre/tv/list')]);
        const map=new Map(); [...$(m.genres||[]), ...$(t.genres||[])].forEach(g=>map.set(g.id,g));
        allGenres=[...map.values()];
        drawChips();
    } catch(e) { console.warn('genres fail', e); renderGenresDemo(); }
}

function drawChips() {
    const list=[{id:null,name:'All'}, ...allGenres.slice(0,14)];

genreChips.innerHTML=list.map(g=>`<button class="chip ${activeGenre===g.id?'active':''}" data-id="${g.id ?? ''}">${g.name} </button>`).join('');

genreChips.querySelectorAll('.chip').forEach(ch=> ch.addEventListener('click', ()=> {
    const id=ch.dataset.id?Number(ch.dataset.id): null;
    activeGenre=id;

genreChips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active', c===ch));
currentPage=1; fetchDiscover();
updateFilterInfo();
    }));
}

async function tmdbFetch(path, params={}) {
    if(!apiKey) throw new Error('No API key');
    const url=new URL(API_BASE+path);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('language', 'en-US');

Object.entries(params).forEach(([k,v])=> {
    if(v!=='' && v!=null)
    url.searchParams.set(k,String(v));
    });
    const r=await fetch(url.toString());
    if(!r.ok){ const t=await r.text();
throw new Error(t); }
    return r.json();
}

async function fetchTrending() {
    try {
        setLoading(true);
        const data=await tmdbFetch('/trending/all/week');
        const movies=data.results?.filter(m=>m.poster_path)?.slice(0,12) || DEMO_MOVIES;
        if(!currentHeroMovie) renderHero(movies[0]||DEMO_MOVIES[0]);
        renderRow(trendingRow, movies);
    } catch(e) {
        console.warn('trending fail',e);
        renderRow(trendingRow, DEMO_MOVIES);
        if(!currentHeroMovie) renderHero(DEMO_MOVIES[0]);
    } finally{ setLoading(false); }
}