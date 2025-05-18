document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.querySelector('#main-content'); // Seleksi elemen konten utama
    const skipLink = document.querySelector('.skip-to-content'); // Seleksi elemen skip to content
    
    // Pastikan elemen-elemen ditemukan di halaman
    if (!mainContent || !skipLink) return;
    
    skipLink.addEventListener('click', function (event) {
        event.preventDefault(); // Mencegah refresh halaman
        skipLink.blur(); // Menghilangkan fokus pada link

        // Fokus ke konten utama dan lakukan scroll
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' }); // Halaman scroll dengan efek smooth
    });
});
