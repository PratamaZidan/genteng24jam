import { register } from "../../../data/genteng24jam-api";

export default class RegisterPresenter {
    constructor({showError}) {
        this._showError = showError;
    }

    async handleRegister({name, email, password}) {
        try {
            if (password.length <8) {
                throw new Error('Password Minimal 8 Karakter');
            }

            const response = await register({name, email, password});

            if (!response.ok) {
                throw new Error(response.message || 'Registrasi Gagal');
            }

            window.location.hash = '/login';
        } catch (error) {
            this._showError(error.message);
        }
    }
}