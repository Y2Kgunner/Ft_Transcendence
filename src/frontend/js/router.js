import { setupAuthPage, logoutUser } from './auth.js';

class Router {
    constructor(routes) {
        this.routes = routes;
    }

    async init() {
        window.addEventListener('popstate', () => this.handleLocationChange());
        this.setupLinks();
        await this.handleLocationChange(); 
    }

    async navigate(path) {
        console.log(`Navigating to: ${path}`);
        if (path === '/logout') 
        {
            logoutUser();
            return;
        }
        const route = this.routes[path] || this.routes['/login'];
        await this.loadRoute(route.path, route.method);
    }

    async loadRoute(htmlPath, callback = null) {
        console.log(`Loading route: ${htmlPath}`);
        try {
            const response = await fetch(htmlPath);
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
        document.body.addEventListener('click', event => {
            if (event.target.matches('[data-route]')) {
                event.preventDefault();
                if(event.target.href) {
                    const path = new URL(event.target.href).pathname;
                    window.history.pushState({}, '', path);
                    this.navigate(path);
                }else {
                    console.log('No href found', event.target);
                }
            }
        }
        );
    }

    handleLocationChange() {
        const path = window.location.pathname;
        this.navigate(path).catch(console.error);
    }
}

const routes = {
    '/': { path: 'pages/home.html', method: null }, 
    '/login': { path: 'pages/login.html', method: setupAuthPage },
    '/profile': { path: 'pages/profile.html', method: null }, 
    '/about': { path: 'pages/about.html', method: null },
    '/pong': { path: 'pages/pong.html', method: null },
    '/tournament': { path: 'pages/tournament.html', method: null },
    '/logout': { path: '', method: null },
};


export const appRouter = new Router(routes);
