import { navigateBasedOnAuth , updateMainContentVisibility} from './init.js';
import { appRouter } from './router.js';

async function isAuthenticated() {
    try {
        const response = await fetch('https://127.0.0.1:443/api/auth_status', {
            method: 'GET',
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            return data.authenticated;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
        return false;
    }
}

function getAuthToken() {
    const token = localStorage.getItem('authToken');
   //console.log("this from auth.js", token);
   //console.log('Token:', token);
    return token ? token : null;
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('LoginUserName').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch('https://127.0.0.1:443/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
        const data = await response.json();
       //console.log('Login successful:', data);
        setCookie('authToken', data.token, 1, true, 'None');
        setUserId(data.userId);
        updateMainContentVisibility(true);
        appRouter.navigate('/');
    }
    else 
    {
        const error = await response.json();
        console.error('Login failed:', error);
        alert(error.error || 'Login failed');
    }
}

async function loginOtpUser(event) {
    event.preventDefault();
    const username = document.getElementById('LoginUserName').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch('https://127.0.0.1:443/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
        const data = await response.json();
       //console.log('Login successful:', data);
        setCookie('authToken', data.token, 1, true, 'None');
        appRouter.navigate('/');
    }
    else 
    {
        const error = await response.json();
        console.error('Login failed:', error);
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
    });

    if (response.ok) {
        const data = await response.json();
       //console.log('Registration successful:', data);
        await appRouter.navigate('/login', { force: true });
    } else {
        const error = await response.json();
        console.error('Registration failed:', error);
        alert(error.error || 'Registration failed');
    }
}

async function verifyOtp(otp) {
    const response = await fetch('https://127.0.0.1:443/api/verify_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
        credentials: 'include',
    });
    if (response.ok) {
        return true;
    } else {
        return false;
    }
}

function setupEventListeners() {
    document.getElementById('showRegisterForm')?.addEventListener('click', function(event) {
        event.preventDefault();
       //console.log('Switching to register form...'); 
        showRegisterForm();
        // appRouter.navigate('/register')
    });

    document.getElementById('showLoginForm')?.addEventListener('click', function(event) {
        event.preventDefault();
       //console.log('Switching to login form...'); 
        showLoginForm();
    });

    const fortyTwoButtonLog = document.getElementById("fortytwoLoginButton");
    if (fortyTwoButtonLog) {
        fortyTwoButtonLog.addEventListener('click', function(event) {
            window.location.href = "https://127.0.0.1/api/fortytwo";
        });
    }

    document.getElementById('loginButton')?.addEventListener('click', login);
    document.getElementById('registerButton')?.addEventListener('click', register);
    document.getElementById('loginForm')?.addEventListener('submit', login);
    document.getElementById('registerForm')?.addEventListener('submit', register);
    document.getElementById('forgotPasswordLink')?.addEventListener('click', forgetPassword);
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

function setCookie(name, value, days, secure = false, sameSite = 'Lax') {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    const secureFlag = secure ? '; Secure' : '';
    const sameSitePolicy = `; SameSite=${sameSite}`;
    document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/${secureFlag}${sameSitePolicy}`;
}

async function handleOAuthCallback(code) {
    const url = `https://127.0.0.1/api/oauth_callback?code=${encodeURIComponent(code)}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`OAuth callback failed: ${response.status} ${response.statusText}`);
            return ;
        }

        const data = await response.json();
        console.log('OAuth callback data:', data);
        if (data.success) {
            ////console.log('OAuth callback handled successfully:', data.message);
            setCookie('authToken', data.token, 1, true, 'None');
            updateMainContentVisibility(true);
            await appRouter.navigate('/'); 
        } else {
            // console.error('Authentication failed after OAuth callback:', data.message);
            alert('Authentication failed: ' + data.message);
            updateMainContentVisibility(false);
            await navigateBasedOnAuth(false);
        }
    } catch (error) {
        console.error('Error processing the OAuth callback:', error);
        alert('Error processing the OAuth callback: ' + error.message);
        updateMainContentVisibility(false);
        await navigateBasedOnAuth(false);
    }
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
        updateMainContentVisibility(false);
        await appRouter.navigate('/login');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function forgetPassword() {
    event.preventDefault();
    const username = document.getElementById('LoginUserName').value;
    if (!username) {
        alert('Please enter your username to reset your password.');
        return;
    }

    fetch('/api/forgot_password_send_email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to reset password. Please try again later.');
    });
}

function showOtpForm(show) {
    if (show === true) {
        document.getElementById('otp-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
    }else{
        document.getElementById('otp-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    }
}

function setUserId(userId) {
    localStorage.setItem('userId', userId);
}

function getUserId() {
    return localStorage.getItem('userId');
}

export { isAuthenticated, getAuthToken, login, register , handleOAuthCallback, logoutUser  };

