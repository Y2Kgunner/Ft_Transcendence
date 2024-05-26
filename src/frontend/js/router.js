import { setupAuthPage, logoutUser, isAuthenticated } from './auth.js';
import { fetchUserProfile, setupAnonymizeButton, setupDeleteProfileButton, setupCloseButton, setUpVerifyDeleteOtpButton, setupUploadProfilePictureButton } from './profile.js';
import { setupTournamentPage } from './tournament.js';
import { setupGamePage } from './game.js';
import { setupMultiGamePage } from './multiGame.js';
import { setupTTT } from './ttt.js';

async function removeOpenModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modal) => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        modalInstance._element.addEventListener('hidden.bs.modal', function () {
        }, { once: true });
    });
}
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

        //console.log(`Navigating to: ${path}`);
        if (!force && this.lastPath === path && !replace) {
            //console.log(`Already navigated to: ${path}`);
            return;
        }

        const modal = document.getElementById('myModal');
        if (modal && !modal.hasAttribute('data-loaded')) {
            // The modal is present but not fully loaded
            return new Promise((resolve) => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.show();
                modalInstance._element.addEventListener('loaded', function () {
                    modal.setAttribute('data-loaded', 'true');
                    resolve();
                }, { once: true });
            });
        }
        removeOpenModals();

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
    '/home': { path: 'pages/home.html', method: null },
    '/login': { path: 'pages/login.html', method: setupAuthPage },
    '/profile': { path: 'pages/profile.html', method: setupProfilePage },
    '/about': { path: 'pages/about.html', method: null },
    '/ttt': { path: 'pages/ttt.html', method: setupTTT },
    '/pong2': { path: 'pages/pong2.html', method: setupGamePage },
    '/pong3': { path: 'pages/multiGame.html', method: setupMultiGamePage },
    '/tournament': { path: 'pages/tournament.html', method: setupTournamentPage },
    '/logout': { path: '', method: null }
};

async function setupProfilePage() {
    const authStatus = await isAuthenticated();
    if (authStatus) {
        fetchUserProfile();
        setupAnonymizeButton();
        setupDeleteProfileButton();
        setupCloseButton();
        setUpVerifyDeleteOtpButton();
        setupUploadProfilePictureButton();
    } else {
        //console.log('User is not authenticated, redirecting to login');
        appRouter.navigate('/login', { replace: true });
    }
}

export const appRouter = new Router(routes);


