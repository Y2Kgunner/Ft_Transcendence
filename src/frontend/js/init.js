
import { appRouter } from './router.js';
import { isAuthenticated, handleOAuthCallback } from './auth.js';

async function initApp() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const token = urlParams.get('token');
        if (code) {
            await handleOAuthCallback(code);
        }
        if (token) {
            window.history.pushState({}, '', `/forgot-password?token=${token}`);
            await appRouter.navigate('/forgot-password', { replace: true });
            return;
        }
        await checkAndNavigateBasedOnAuth();
        appRouter.init();
    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
}


async function checkAndNavigateBasedOnAuth() {
    const authStatus = await isAuthenticated();
    navigateBasedOnAuth(authStatus);
}

function navigateBasedOnAuth(isAuthenticated) {
    if (isAuthenticated) {
        let path = normalizePath(window.location.pathname);
        appRouter.navigate(path, { replace: true });
    } else {
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
