import { appRouter } from './router.js';
import { isAuthenticated, handleOAuthCallback } from './auth.js';

async function initApp() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            const authenticated = await handleOAuthCallback(code);
            if (authenticated) {
                console.log('OAuth callback handled successfully, user is authenticated');
            } else {
                console.log('Failed to handle OAuth callback, redirecting to login');
                appRouter.navigate('/login');
            }
        } else {
            const authStatus = await isAuthenticated();
            console.log('User Authenticated:', authStatus);
            navigateBasedOnAuth(authStatus);
        }
    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
}

async function navigateBasedOnAuth(isAuthenticated) {
    if (isAuthenticated) {
        console.log('Performing authenticated user tasks');
        let path = window.location.pathname;
        path = appRouter.routes[path] ? path : '/';
        await appRouter.navigate(path);
    } else {
        console.log('User is not authenticated, redirecting to login');
        await appRouter.navigate('/login');
    }
    updateMainContentVisibility(isAuthenticated);
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