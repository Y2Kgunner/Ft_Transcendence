
import { appRouter } from './router.js';
import { isAuthenticated, handleOAuthCallback } from './auth.js';

async function initApp() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log('Code:', code);
        if (code) {
            await handleOAuthCallback(code);
        }
        await checkAndNavigateBasedOnAuth();
        appRouter.init();
    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
}


async function checkAndNavigateBasedOnAuth() {
    const authStatus = await isAuthenticated();
    console.log('User Authenticated:', authStatus);
    navigateBasedOnAuth(authStatus);
}

function navigateBasedOnAuth(isAuthenticated) {
    if (isAuthenticated) {
        console.log('performing authenticated user tasks');
        let path = normalizePath(window.location.pathname);
        console.log('normalized path:', path);
        appRouter.navigate(path, { replace: true });
    } else {
        console.log('user is not authenticated, redirecting to login');
        appRouter.navigate('/login', { replace: true });
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
        console.error("error occurred during initialization", error);
    });
});

export { navigateBasedOnAuth, updateMainContentVisibility };