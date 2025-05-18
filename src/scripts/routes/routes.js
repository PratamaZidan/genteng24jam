import HomePage from '../pages/home/home-page';
import AddPage from '../pages/add/add-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import BookmarkPage from "../pages/bookmark/bookmark-page";

const routes = {
  '/': {
    page: new HomePage(),
    // requireAuth: true,
  },

  '/add': {
    page: new AddPage(),
    requireAuth: true,
  },

  '/login': {
    page: new LoginPage(),
    requireAuth: false,
  },

  '/register': {
    page: new RegisterPage(),
    requireAuth: false,
  },

  "/save-story": {
    page: new BookmarkPage(),
    requiresAuth: true,
  },
};

export default routes;
