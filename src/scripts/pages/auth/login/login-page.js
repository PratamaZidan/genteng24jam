import LoginPresenter from "./login-presenter";

export default class LoginPage {
    constructor() {
        this._showError = this.showError.bind(this);
        this.presenter = new LoginPresenter(this);
    }

    async render() {
        return `
          <div id="loading" class="loading" style="display:none;">
            <div class="spinner"></div>
            <p>Tunggu Sebentar...</p>
          </div>

          <section class='form-page'>
          <div id='loginError' class='error-message' style='display:none'></div>
            <form id='login-form' class='form-card'>
              <h1>Login</h1>
              <label for='email'>Email</label>
              <input id='email' name='email' type='text' placeholder='you@example.com' required />
    
              <label for='password'>Password</label>
              <input id='password' name='password' type='password' placeholder='********' required />
    
              <button type='submit'>Login</button>
              <p>Belum punya akun? <a href='#/register'>Buat akun</a></p>
            </form>
          </section>
        `;
    }

    async afterRender() {
        const from = document.getElementById('login-form');
        from.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;

            await this.presenter.handleLogin({email, password});
        });
    }

    showError(message) {
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    showLoading() {
        document.getElementById("loading").style.display = "flex";
    }

    hideLoading() {
        document.getElementById("loading").style.display = "none";
    }
}