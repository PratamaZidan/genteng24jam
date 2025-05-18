  export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li>
          <a href="#/" id="home-button">
            <i class="fas fa-home"></i> Lihat Berita
          </a>
    <li>
        <a href="#/save-story" id="home-button">
          <i class="fas fa-bookmark"></i> Berita Tersimpan
        </a>
    </li>
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li>
      <a href='#/add' id='add-button'>
        <i class='fas fa-plus-circle'></i> Tambah Berita
      </a>
    </li>
    <li>
      <button id='logout-button'>
        <i class='fas fa-sign-out-alt'></i>Logout
      </button>
    </li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a href='#/login' id='login-button'>Login</a></li>
    <li><a href='#/register' id='register-button'>Register</a></li>
  `;
}

  
  export function generateSubscribeButtonTemplate(isSubscribed = false) {
  return isSubscribed
    ? `
      <button id="unsubscribe-button" class="unsubscribe-button">
        <i class="fas fa-bell-slash"></i> Unsubscribe
      </button>
    `
    : `
      <button id="subscribe-button" class="subscribe-button">
        <i class="fas fa-bell"></i> Subscribe
      </button>
    `;
}
