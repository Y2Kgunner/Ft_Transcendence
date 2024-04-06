import { setupAuthPage, logoutUser , isAuthenticated} from './auth.js';

class Router {
    constructor(routes) {
        this.routes = routes;
    }

    async init() {
        window.addEventListener('popstate', () => this.handleLocationChange());
        this.setupLinks();
        await this.handleLocationChange();
    }
    
    async navigate(path, { replace = false, force = false } = {}) {
        console.log(`Navigating to: ${path}`);
        if (!force && this.lastPath === path && !replace) {
            console.log(`Already navigated to: ${path}`);
            return;
        }
        this.lastPath = path;
    
        if (path === '/logout') {
            logoutUser();
            return this.loadRoute('/logout');
        } else if (path === '/login') {
            return this.loadRoute('pages/login.html', setupAuthPage);
        }
    
        const route = this.routes[path] || this.routes['/login'];
        await this.loadRoute(route.path, route.method);
        if (!replace) {
            window.history.pushState({}, '', path);
        }
    }
    
    async loadRoute(htmlPath, callback = null) {
        try {
            const response = await fetch(htmlPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${htmlPath}: ${response.status}`);
            }
            const content = await response.text();
            document.getElementById('page-content').innerHTML = content;
            if (callback && typeof callback === 'function') {
                callback();
            }
        } catch (error) {
            console.error('Failed to load the route:', error);
        }
    }
    
        setupLinks() {
        document.addEventListener('click', event => {
            const routeLink = event.target.closest('[data-route]');
            if (routeLink) {
                event.preventDefault();
                const path = routeLink.getAttribute('href');
                window.history.pushState({}, '', path);
                this.navigate(path);
            }
        });
    }
    
    async handleLocationChange() {
        const path = window.location.pathname;
        const authStatus = await isAuthenticated();
    
        if (!authStatus && path !== '/login') {
            this.navigate('/login', { replace: true });
        } else {
            this.navigate(path, { replace: true });
        }
    }
}
    
const routes = {
    '/': { path: 'pages/home.html', method: null }, 
    '/login': { path: 'pages/login.html', method: setupAuthPage },
    '/profile': { path: 'pages/profile.html', method: null }, 
    '/about': { path: 'pages/about.html', method: null },
    '/game': { path: 'pages/game.html', method: null },
    '/multiplayer': { path: 'pages/multiGame.html', method: null },
    '/tournament': { path: 'pages/tournament.html', method: null },
    '/logout': { path: '', method: null },
};

export const appRouter = new Router(routes);
