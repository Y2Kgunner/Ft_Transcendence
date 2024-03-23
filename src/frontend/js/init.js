import { appRouter } from './router.js';
import { isAuthenticated, handleOAuthCallback } from './auth.js';

async function initApp() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log('Code:', code);
        if (code) {
            await handleOAuthCallback(code);
            checkAndNavigateBasedOnAuth();
        } else {
            checkAndNavigateBasedOnAuth();
        }
    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
}

async function checkAndNavigateBasedOnAuth() {
    const authStatus = await isAuthenticated();
    console.log('User Authenticated:', authStatus);
    navigateBasedOnAuth(authStatus);
}

async function navigateBasedOnAuth(isAuthenticated) {
    if (isAuthenticated) {
        console.log('Performing authenticated user tasks');
        let path = normalizePath(window.location.pathname);
        console.log('Normalized path:', path);
        await appRouter.navigate(path);
    } else {
        console.log('User is not authenticated, redirecting to login');
        await appRouter.navigate('/login');
    }
    updateMainContentVisibility(isAuthenticated);
}

function normalizePath(path) {
    return appRouter.routes[path] ? path : '/';
}

function updateMainContentVisibility(isAuthenticated) {
    document.getElementById('navbar').style.display = isAuthenticated ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    initApp().catch(error => {
        console.error("An error occurred during app initialization", error);
    });
});

export { navigateBasedOnAuth, updateMainContentVisibility };
