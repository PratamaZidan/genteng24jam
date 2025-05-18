import { login } from "../../../data/genteng24jam-api";

export default class LoginPresenter {
    constructor(view) {
        this._view = view;
    }

    async handleLogin({email, password}) {
        this._view.showLoading();

        if (password.length < 8) {
             this._view.hideLoading();
            this._view.showError('Password Minimal 8 Karakter');
            return;
        }

        try {
            const result = await login({ email, password });
            
            this._view.showLoading();

            if (result.error) {
                this._view.showError(result.message || 'Email atau Password Salah');
                return;
            }
        
            localStorage.setItem('token', result.loginResult.token);
            window.dispatchEvent(
                new CustomEvent('auth-change', {
                    detail: { isLoggedIn: true },
                }),
            );
            window.location.hash = '#/';

            this._view.hideLoading();

        } catch (error) {
            this._view.hideLoading();
            this._view.showError(error.message);
    }
    }
}
