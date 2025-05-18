import routes from '../routes/routes';
import { getActiveRoute, getActivePathname } from '../routes/url-parser';
import { 
  generateAuthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../template';
import {
  subscribe,
  unsubscribe,
  checkSubscriptionStatus, 
} from '../utils/notification-helper'; 

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._thisAuthState();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _thisAuthState() {
    this.#setupNavigationList();

    window.addEventListener('auth-change', () => {
      this.#setupNavigationList();
    });
  }

  async #setupNavigationList() {
    const isLoggedIn = !!localStorage.getItem("token");
    const navListMain = document.getElementById("navlist-main");
    const navList = document.getElementById("navlist");

    navListMain.innerHTML = "";
    navList.innerHTML = isLoggedIn
      ? generateAuthenticatedNavigationListTemplate()
      : generateUnauthenticatedNavigationListTemplate();

    if (isLoggedIn) {
      const logoutButton = document.getElementById("logout-button");
      logoutButton?.addEventListener("click", (e) => {
        e.preventDefault();
        this._handleLogout();
      });

      const token = localStorage.getItem("token");
      const isSubscribed = await checkSubscriptionStatus();

      document.getElementById("push-notification-tools").innerHTML =
        generateSubscribeButtonTemplate(isSubscribed);

      document
        .getElementById(
          isSubscribed ? "unsubscribe-button" : "subscribe-button",
        )
        ?.addEventListener("click", async () => {
          const success = isSubscribed
            ? await unsubscribe(token)
            : await subscribe(token);

          if (success) {
            this.#setupNavigationList(); 
          }
        });
    }
  }

  _handleLogout() {
    if (confirm('Yakin Mau Logout?')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-change'));
      window.location.hash = '#/login';
    }
  }

  async renderPage() {
    try {
      const url = getActiveRoute();
      const path = getActivePathname();
      const route = routes[url] || routes["*"];

      if (!routes[url] && path !== "/404") {
        window.location.hash = "#/404";
        return;
      }

      const token = localStorage.getItem('token');
      if (route.requiresAuth && !token) {
        window.location.hash = '#/login';
        return;
      }

      const renderAndAfter = async () => {
        this.#content.innerHTML = await route.page.render();
        await route.page.afterRender();

        this.#setupNavigationList();
      };

      if (document.startViewTransition) {
        await document.startViewTransition(renderAndAfter);
      } else {
        await renderAndAfter();
      }

    } catch (error) {
      console.error('Render error:', error);
      window.location.hash = '#';
    }
  }
}
