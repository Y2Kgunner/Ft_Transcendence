import { navigateBasedOnAuth } from './init.js';
import { appRouter } from './router.js';

async function isAuthenticated() {
    try {
        const response = await fetch('https://127.0.0.1:443/api/auth_status', {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            return data.authenticated;
        }
    } catch (error) {
        console.error('Failed to check authentication status');
        return false;
    }
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('LoginUserName').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch('https://127.0.0.1:443/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
        const data = await response.json();
        const is2FAEnabled = await getUser2FAStatus();
        if (is2FAEnabled) {
            showOtpModal(data.token);
        } else {
            finalizeLogin(data.token);
        }
    } else {
        const error = await response.json();
        alert(error.error || 'Login failed');
    }
}

async function register(event) {
    event.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUserName').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    const response = await fetch('https://127.0.0.1:443/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    
    if (response.ok) {
        appRouter.navigate('/login');
    } else {
        const error = await response.json();
        alert(error.error || 'Registration failed');
    }
}

async function getUser2FAStatus() {
    try {
        const response = await fetch('https://127.0.0.1/api/check_2fa_status', { method: 'GET' });
        if (!response.ok) {
            throw new Error('Failed to fetch 2FA status');
        }
        const data = await response.json();
        return data['2fa'];
    } catch (error) {
        console.error('Error fetching 2FA status:', error);
        return false;
    }
}


async function handleOAuthCallback(code) {
    const url = `https://127.0.0.1:443/api/oauth_callback?code=${encodeURIComponent(code)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include', 
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log(data.message);
            navigateBasedOnAuth(true); 
        } else {
            console.error('Authentication failed:', data.message);
            alert('Authentication failed: ' + data.message); 
            navigateBasedOnAuth(false); 
        }
    } catch (error) {
        console.error('Error processing the OAuth callback:', error);
        alert('Error processing the OAuth callback: ' + error);
        navigateBasedOnAuth(false); 
    }
}


async function submitOtp(otp) {
    const response = await fetch('https://127.0.0.1/api/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
    });
    
    if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'OTP verified successfully' };
    } else {
        const error = await response.json();
        return { success: false, message: error.error || 'OTP verification failed' };
    }
}

function setupEventListeners() {
    document.getElementById('showRegisterForm')?.addEventListener('click', showRegisterForm);
    document.getElementById('showLoginForm')?.addEventListener('click', showLoginForm);
    document.getElementById('loginButton')?.addEventListener('click', login);
    document.getElementById('registerButton')?.addEventListener('click', register);
    document.getElementById('loginForm')?.addEventListener('submit', login);
    document.getElementById('registerForm')?.addEventListener('submit', register);
}

function setCookie(name, value, days, secure = false, sameSite = 'Lax') {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    const secureFlag = secure ? '; Secure' : '';
    const sameSitePolicy = `; SameSite=${sameSite}`;
    document.cookie = `${name}=${value || ''}${expires}; path=/${secureFlag}${sameSitePolicy}`;
}

function finalizeLogin(token) {
    setCookie('authToken', data.token, 1, true, 'None');
    appRouter.navigate('/');
}

function showOtpModal(token) {
    new bootstrap.Modal(document.getElementById('otpModal')).show();
    document.getElementById('otpForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const otp = document.getElementById('otpInput').value;
        const result = await submitOtp(otp);
        if (result.success) {
            finalizeLogin(token);
            bootstrap.Modal.getInstance(document.getElementById('otpModal')).hide();
        } else {
            alert(result.message);
        }
    }, { once: true });
}


export async function setupAuthPage() {

    window.showRegisterForm = function() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    };

    window.showLoginForm = function() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    };
    setupEventListeners();
}

async function logoutUser() {
    try {
        const response = await fetch('https://127.0.0.1/api/logout', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            credentials: 'include', 
        });
        if (!response.ok) {
            throw new Error('Logout failed');
        }
        await appRouter.navigate('/login');
    } catch (error) {
        console.error('Logout error:', error);
    }
}


window.showRegisterForm = function() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
};

window.showLoginForm = function() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
};

setupEventListeners();

export { isAuthenticated, login, register, getUser2FAStatus, submitOtp, handleOAuthCallback, logoutUser };