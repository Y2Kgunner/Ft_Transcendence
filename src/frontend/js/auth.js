import { inputElement, checkInput, displayBootstrapAlert } from './inputValidation.js'
import { navigateBasedOnAuth, updateMainContentVisibility } from './init.js';
import { appRouter } from './router.js';

let loginButtonTimeout = null;

function showGdprConsentModal() {
  const _elementBlock = [
    new inputElement('registerEmail', 'email', true, 5, 30, ""),
    new inputElement('registerUserName', 'userName', true, 4, 10, ""),
    new inputElement('registerPassword', 'password', true, 8, 15, ""),
    new inputElement('confirmPassword', 'password', true, 8, 15, "")
  ];
  console.log("reg auth");
  if (!checkInput(_elementBlock))
    return;
  const gdprModalElement = document.getElementById('gdprModal');
  const gdprModal = new bootstrap.Modal(gdprModalElement);
  gdprModal.show();

  document.getElementById('agreeButton').onclick = function () {
    gdprModal.hide();
    register();
  };
}

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
  const _elementBlock = [
    new inputElement('LoginUserName', 'userName', true, 4, 8, ""),
    new inputElement('loginPassword', 'password', true, 8, 15, "")
  ];
  if (!checkInput(_elementBlock))
    return;
  event.preventDefault();
  const username = document.getElementById('LoginUserName').value;
  const password = document.getElementById('loginPassword').value;
  const hashedPassword = await hashPassword(password);
  try {
    const response = await fetch('https://127.0.0.1:443/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password: hashedPassword }),
      credentials: 'include'
    });

    const data = await response.json();
    if (response.ok) {
      if (data.requires_otp) {
        showOtpModal();
      } else {
        if (loginButtonTimeout) {
          clearTimeout(loginButtonTimeout);
          loginButtonTimeout = null;
        }
        finalizeLogin(data);
      }
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login failed:', error);
    displayBootstrapAlert('loginAlert', error.message || 'Login failed', 'danger');

  }
}

function showOtpModal() {
  const otpModalElement = document.getElementById('otpModal');
  // console.log(otpModalElement);
  const otpModal = new bootstrap.Modal(otpModalElement, {
    keyboard: false,
    backdrop: 'static'
  });
  otpModal.show();
}

function debounce(func, delay) {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  }
}

function initializeModals() {
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => {
    if (!bootstrap.Modal.getInstance(modal)) {
      new bootstrap.Modal(modal);
    }
  });
}

function disableButtonTemporarily(button, duration) {
  button.disabled = true;
  setTimeout(() => button.disabled = false, duration);
}

function finalizeLogin(data) {
  setCookie('authToken', data.token, 1, true, 'None');
  updateMainContentVisibility(true);
  appRouter.navigate('/');
}

async function register() {
  // Assume all validation passed and the user agreed to GDPR terms
  const email = document.getElementById('registerEmail').value;
  const username = document.getElementById('registerUserName').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  const hashedPassword = await hashPassword(password);
  const response = await fetch('https://127.0.0.1:443/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password: hashedPassword }),
  });

  if (response.ok) {
    const data = await response.json();
    alert('Registration successful');
    showLoginForm();
  } else {
    const error = await response.json();
    console.error('Registration failed:', error);
    alert(error.error || 'Registration failed');
  }
  document.getElementById('registerEmail').value = "";
  document.getElementById('registerUserName').value = "";
  document.getElementById('registerPassword').value = "";
  document.getElementById('confirmPassword').value = "";
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyOtp(event) {
  event.preventDefault();
  const otp = document.getElementById('otpInput').value;
  const otpModal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));

  try {
    const response = await fetch('https://127.0.0.1:443/api/verify_otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
      credentials: 'include',
    });

    const data = await response.json();
    if (response.ok) {
      otpModal.hide();
      finalizeLogin(data);
    } else {
      throw new Error(data.error || 'Invalid or expired OTP. Please try again.');
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
    alert(error.message);
  }
}

function setupEventListeners() {
  document.getElementById('showRegisterForm')?.addEventListener('click', function (event) {
    event.preventDefault();
    showRegisterForm();
  });

  document.getElementById('showLoginForm')?.addEventListener('click', function (event) {
    event.preventDefault();
    showLoginForm();
  });
  document.getElementById('loginButton').addEventListener('click', async function (event) {
    event.preventDefault();
    document.getElementById('loginButton').disabled = true;
    loginButtonTimeout = setTimeout(() => {
      document.getElementById('loginButton').disabled = false;
    }, 1000);
    await login(event);
  });

  const debouncedVerifyOtp = debounce(verifyOtp, 3000);
  document.getElementById('otpButton')?.addEventListener('click', function (event) {
    event.preventDefault();
    debouncedVerifyOtp(event);
  });

  const fortyTwoButtonLog = document.getElementById("fortytwoLoginButton");
  if (fortyTwoButtonLog) {
    fortyTwoButtonLog.addEventListener('click', function (event) {
      window.location.href = "https://127.0.0.1/api/fortytwo";
    });
  }

  document.getElementById('registerButton')?.addEventListener('click', function (event) {
    event.preventDefault();
    const form = document.getElementById('registerForm');
    if (form) {
      showGdprConsentModal();
    } else {
      form.classList.add('was-validated');
    }
  });
  document.getElementById('registerForm')?.addEventListener('submit', function (event) {
    event.preventDefault();
    const form = document.getElementById('registerForm');
    if (form) {
      showGdprConsentModal();
    } else {
      form.classList.add('was-validated');
    }
  });

  document.getElementById('forgotPasswordLink')?.addEventListener('click', forgetPassword);
  initializeModals();
}

export async function setupAuthPage() {

  window.showRegisterForm = function () {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  };

  window.showLoginForm = function () {
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
      return;
    }

    const data = await response.json();
    console.log('OAuth callback data:', data);
    if (data.success) {
      setCookie('authToken', data.token, 1, true, 'None');
      updateMainContentVisibility(true);
      await appRouter.navigate('/');
    } else {
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
    displayBootstrapAlert('loginAlert', 'Please enter your username to reset your password.', 'danger');
    // alert('Please enter your username to reset your password.');
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
  const otpForm = document.getElementById('otp-form');
  otpForm.style.display = show ? 'block' : 'none';
}

async function submitOtp(event) {
  event.preventDefault();
  const otp = document.getElementById('otpInput').value;

  const response = await fetch('https://127.0.0.1:443/api/verify_otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ otp }),
  });

  if (response.ok) {
    const data = await response.json();
    if (data.message === 'Login successful') {
      updateMainContentVisibility(true);
      appRouter.navigate('/');
    } else {
      alert('Invalid or expired OTP. Please try again.');
      showOtpForm(true);
    }
  } else {
    const error = await response.json();
    console.error('OTP verification failed:', error);
    alert(error.error || 'OTP verification failed');
  }
}

function setUserId(userId) {
  localStorage.setItem('userId', userId);
}

function getUserId() {
  return localStorage.getItem('userId');
}

export { isAuthenticated, getAuthToken, login, register, handleOAuthCallback, logoutUser, hashPassword, debounce };

