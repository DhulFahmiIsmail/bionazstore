let kuotaData = {};
let pulsaData = {};

// Variabel untuk penambahan harga dan nomor WhatsApp
const additionalPrice = 500; // Penambahan harga
const whatsappNumber = '6285172016322'; // Nomor WhatsApp

fetch('data-kuota.json')
    .then(response => response.json())
    .then(data => kuotaData = data)
    .catch(error => console.error('Error fetching kuota data:', error));

fetch('data-pulsa.json')
    .then(response => response.json())
    .then(data => pulsaData = data)
    .catch(error => console.error('Error fetching pulsa data:', error));

function formatPrice(harga) {
    return harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Menambahkan titik sebagai pemisah ribuan
}

function roundPrice(harga) {
    // Menghilangkan prefix "Rp " dan mengonversi ke angka
    const numericHarga = parseInt(harga.replace(/[Rp. ]/g, ''), 10);
    const lastTwoDigits = numericHarga % 100; // Mengambil dua angka terakhir dari harga

    // Logika pembulatan
    let rounded;
    if (lastTwoDigits <= 50) {
        rounded = numericHarga - lastTwoDigits; // Pembulatan ke bawah
    } else {
        rounded = numericHarga + (100 - lastTwoDigits); // Pembulatan ke atas
    }

    return `Rp ${formatPrice(rounded + additionalPrice)}`; // Menambahkan harga tambahan dan memformat harga
}

function selectOperator(operator) {
    const categories = kuotaData[operator];
    let kuotaOptions = '';

    // Tambahkan form untuk kategori "Only4You" di bagian atas
    if (categories.Only4You && categories.Only4You[0].tersedia) {
        kuotaOptions += `
            <div class="purchase-category">
                <h3>Only4You</h3>
                <div class="purchase-grid">
                    <div>
                        <form id="cek-nomor-form" onsubmit="cekNomorOnly4You(event)">
                            <p>Cek Nomer Kamu</p>
                            <input type="text" id="nomor-only4you" placeholder="Masukkan nomor">
                            <button type="submit">Cek</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    for (const category in categories) {
        if (category === "Only4You") continue;
        kuotaOptions += `<div class="purchase-category"><h3>${category}</h3><div class="purchase-grid">`;
        categories[category].forEach(item => {
            kuotaOptions += `
                <div>
                    <p>Kuota: ${item.kuota}</p>
                    <p>Expired: ${item.expired}</p>
                    <p>Deskripsi</p>
                    <p>${item.deskripsi}</p>
                    <p>Harga: ${roundPrice(item.harga)}</p> <!-- Menggunakan fungsi pembulatan di sini -->
                    <a href="https://wa.me/${whatsappNumber}?text=Operator:%20${operator}%0AKuota:%20${item.kuota}%0AExpired:%20${item.expired}%0AHarga:%20${roundPrice(item.harga)}%0ADeskripsi:%20${item.deskripsi}" target="_blank">
                        <button ${item.tersedia ? '' : 'disabled'}>${item.tersedia ? 'Beli Sekarang' : 'Tidak Tersedia'}</button>
                    </a>
                </div>
            `;
        });
        kuotaOptions += `</div></div>`;
    }

    document.getElementById('purchase-section').innerHTML = `<h2>Kuota Internet ${operator}</h2>${kuotaOptions}`;
    document.getElementById('purchase-section').style.display = 'block';
    document.getElementById('purchase-section').scrollIntoView({ behavior: 'smooth' });
}

function cekNomorOnly4You(event) {
    event.preventDefault();
    const nomor = document.getElementById('nomor-only4you').value;

    // Logika validasi nomor
    if (!nomor.startsWith("0857") && !nomor.startsWith("0856")) {
        alert("Ini bukan nomor Indosat");
        return;
    }

    window.open(`https://wa.me/${whatsappNumber}?text=Cek%20Kuota%20Only4You%0ANomer:%20${nomor}`, '_blank');
}

function selectPulsa(operator) {
    const pulsaList = pulsaData[operator];
    const pulsaOptions = pulsaList.map(item => `
        <div>
            <p>Pulsa: ${item.pulsa}</p>
            <p>Harga: ${roundPrice(item.harga)}</p> <!-- Menggunakan fungsi pembulatan di sini -->
            <a href="https://wa.me/${whatsappNumber}?text=Operator:%20${operator}%0APulsa:%20${item.pulsa}%0AHarga:%20${roundPrice(item.harga)}" target="_blank">
                <button ${item.tersedia ? '' : 'disabled'}>${item.tersedia ? 'Beli Sekarang' : 'Tidak Tersedia'}</button>
            </a>
        </div>
    `).join('');

    document.getElementById('purchase-section').innerHTML = `<h2>Pulsa Pascabayar ${operator}</h2><div class="purchase-grid">${pulsaOptions}</div>`;
    document.getElementById('purchase-section').style.display = 'block';
    document.getElementById('purchase-section').scrollIntoView({ behavior: 'smooth' });
}
