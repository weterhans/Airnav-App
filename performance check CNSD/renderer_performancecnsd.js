// Menunggu hingga seluruh konten halaman HTML dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    // Menemukan tombol kembali berdasarkan ID yang baru
    const backButton = document.getElementById('backButton');
    
    // Menemukan semua elemen kartu menu
    const menuCards = document.querySelectorAll('.card');

    // Menambahkan event listener untuk tombol kembali
    if (backButton) {
        backButton.addEventListener('click', (event) => {
            // Mencegah perilaku default dari tautan (pindah halaman secara langsung)
            event.preventDefault(); 
            
            // Menggunakan history API untuk kembali ke halaman sebelumnya
            window.history.back();
        });
    }

    // Menambahkan event listener untuk setiap kartu menu
    menuCards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Mencegah perilaku default dari tautan
            event.preventDefault(); 

            // Mengambil alamat tujuan dari atribut 'href' pada kartu yang diklik
            const destination = event.currentTarget.href;

            // Mengarahkan pengguna ke halaman yang sesuai
            window.location.href = destination;
        });
    });

});
