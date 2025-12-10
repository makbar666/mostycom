document.addEventListener('DOMContentLoaded', () => {
  if (!window.MostycomAuth) {
    console.error('Auth module tidak ditemukan');
    return;
  }

  MostycomAuth.redirectIfAuth();

  const loginForm = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const successBox = document.getElementById('login-success');
  const submitBtn = document.getElementById('login-submit');

  if (!loginForm) return;

  const showMessage = (element, message) => {
    element.textContent = message;
    element.classList.remove('hidden');
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    const formData = new FormData(loginForm);
    const email = formData.get('email').trim().toLowerCase();
    const password = formData.get('password').trim();

    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70');
    submitBtn.textContent = 'Memproses...';

    const result = await MostycomAuth.login({ email, password });
    if (result.success) {
      showMessage(successBox, 'Login berhasil. Mengarahkan ke dashboard...');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } else {
      showMessage(errorBox, result.message || 'Login gagal, coba lagi.');
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
      submitBtn.textContent = 'Masuk ke Dashboard';
    }
  });
});
