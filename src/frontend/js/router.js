import { setupAuthPage, logoutUser, isAuthenticated, hashPassword } from './auth.js';
import { setUpProfile, addFriendBtnTimeout } from './profile.js';
import { setupTournamentPage, gameInProgressTour, tournamentIntervalId, getTournamentId } from './tournament.js';
import { init2PlyrPong, gameInProgress, pongIntervalId, countdownIntervalPong2 } from './pong2.js';
import { init3PlyrPong, gameInProgress3, pong3IntervalId, countdownIntervalIdPong3 } from './pong3.js';
import { setupTTT } from './ttt.js';

async function removeOpenModals() {
  const modals = document.querySelectorAll('.modal.show');
  modals.forEach((modal) => {
    console.log("found modal", modal);
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
    if (!force && this.lastPath === path && !replace) {
      //console.log(`Already navigated to: ${path}`);
      return;
    }

    console.log("gameInProgress =>", gameInProgress);
    console.log("gameInProgressTour =>", gameInProgressTour);
    console.log("gameInProgress3 =>", gameInProgress3);
    if ((gameInProgress && (this.lastPath == '/pong2')) || (gameInProgressTour && (this.lastPath == '/tournament')) || (gameInProgress3 && (this.lastPath == '/pong3'))) {
      if (!confirm('You have an ongoing game. Are you sure you want to leave and lose your progress?'))
        return;
      clearInterval(pongIntervalId);
      clearInterval(tournamentIntervalId);
      clearInterval(pong3IntervalId);
      if (countdownIntervalPong2) {
        document.getElementById('countdown').style.display = "none";
        clearInterval(countdownIntervalPong2);
      } if (countdownIntervalIdPong3) {
        document.getElementById('countdown').style.display = "none";
        clearInterval(countdownIntervalIdPong3);
      }
    }

    if (addFriendBtnTimeout) {
      clearTimeout(addFriendBtnTimeout);
    }

    const modal = document.getElementById('myModal');
    if (modal && !modal.hasAttribute('data-loaded')) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.show();
      modalInstance._element.addEventListener('loaded', function () {
        modal.setAttribute('data-loaded', 'true');
        resolve();
      }, { once: true });
    }
    // document.addEventListener('keydown', function (event) {
    //   if (event.keyCode === 32) {
    //     console.log('bruhhh');
    //     event.stopPropagation();
    //     event.preventDefault();
    //   }
    // });

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

    if (!authStatus && path !== '/login' && path !== '/forgot-password') {
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
  '/pong2': { path: 'pages/pong2.html', method: init2PlyrPong },
  '/pong3': { path: 'pages/pong3.html', method: init3PlyrPong },
  '/tournament': { path: 'pages/tournament.html', method: setupTournamentPage },
  '/logout': { path: '', method: null },
  '/forgot-password': { path: 'pages/forgot-password.html', method: setupPasswordResetPage },
  '/NeverGonnaGiveYouUp': { path: 'pages/never-gonna-give-you-up.html', method: null }
};

async function setupProfilePage() {
  const authStatus = await isAuthenticated();
  if (authStatus)
    setUpProfile();
  else
    appRouter.navigate('/login', { replace: true });
}

async function setupPasswordResetPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (!token) {
    alert('Invalid or missing token.');
    appRouter.navigate('/login', { replace: true });
    return;
  }

  document.getElementById('passwordResetForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const newPassword = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    const password = hashPassword(newPassword)
    const url = `https://127.0.0.1/api/reset_password/${token}/`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ new_password: password })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        appRouter.navigate('/login', { replace: true });
      })
      .catch(error => console.error('Error:', error));
  })
}
export const appRouter = new Router(routes);