import RegisterPresenter from "./register-presenter";

export default class RegisterPage {
    constructor() {
        this._showError = this.showError.bind(this);
        this.presenter = new RegisterPresenter({
          showError: this._showError,
        });
    }

    async render() {
        return `
          <section class='form-page'>
            <div id='registerError' class='error-message' style='display:none'></div>
            <form id='registerForm' class='form-card'>
              <h1>Register</h1>
              <label for='name'>Nama</label>
              <input id='name' name='name' type='text' placeholder='John Doe' required />
    
              <label for='email'>Email</label>
              <input id='email' name='email' type='email' placeholder='you@example.com' required />
              
              <label for='password'>Password</label>
              <input id='password' name='password' type='password' placeholder='********' required />
              
              <button type='submit'>Register</button>
              <p>Sudah punya akun? <a href='#/login'>Login</a></p>
            </form>
          </section>
        `;
    }

    async afterRender() {
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: e.target.name.value, 
                email: e.target.email.value,
                password: e.target.password.value,
            };

            this.presenter.handleRegister(data);
        });
    }

    showError(message) {
        const errorElement = document.getElementById('registerError');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}