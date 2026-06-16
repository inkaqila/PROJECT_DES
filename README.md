# Web Simulasi Data Encryption Standard (DES)

Project ini merupakan aplikasi web simulasi algoritma **Data Encryption Standard (DES)** untuk mata kuliah Kriptografi. Aplikasi ini dibuat untuk membantu pengguna memahami proses kerja DES secara lengkap, mulai dari proses input plaintext/ciphertext, pembangkitan 16 subkunci, proses 16 round Feistel, hingga menghasilkan output akhir dalam bentuk heksadesimal dan biner.

Aplikasi ini menggunakan **Flask Python** sebagai backend dan **HTML, CSS, JavaScript** sebagai frontend. Seluruh logika algoritma DES diimplementasikan sendiri tanpa menggunakan library kriptografi siap pakai seperti CryptoJS atau library DES lainnya.

## Fitur Aplikasi

* Input plaintext atau ciphertext 64-bit.
* Mendukung input dalam dua format:

  * Heksadesimal 16 karakter.
  * Biner 64-bit.
* Input key 64-bit dalam format heksadesimal atau biner.
* Mode operasi:

  * Enkripsi.
  * Dekripsi.
* Validasi panjang input secara otomatis.
* Counter input, misalnya `14/16` untuk format heksadesimal.
* Indikator validasi:

  * Merah jika input belum valid.
  * Hijau jika input sudah valid.
* Menampilkan output akhir dalam format:

  * Heksadesimal.
  * Biner.
* Menampilkan proses DES secara lengkap:

  * Initial Permutation (IP).
  * Key Schedule.
  * PC-1.
  * C0 dan D0.
  * Left Shift setiap round.
  * PC-2.
  * 16 subkunci K1 sampai K16.
  * 16 round Feistel.
  * Expansion E.
  * XOR dengan subkey.
  * S-Box S1 sampai S8.
  * Permutation P.
  * Final swap.
  * Inverse Initial Permutation (IP⁻¹).
* Menampilkan ringkasan 16 round.
* Detail setiap round dapat dibuka dan ditutup agar tampilan lebih rapi.

## Data Uji Standar

Aplikasi ini menggunakan contoh pengujian DES standar berikut:

```text
Plaintext = 0123456789ABCDEF
Key       = 133457799BBCDFF1
```

Hasil enkripsi:

```text
Ciphertext = 85E813540F0AB405
```

Hasil dekripsi:

```text
Ciphertext = 85E813540F0AB405
Key        = 133457799BBCDFF1
Plaintext  = 0123456789ABCDEF
```

## Teknologi yang Digunakan

| Komponen        | Teknologi                               |
| --------------- | --------------------------------------- |
| Backend         | Python Flask                            |
| Frontend        | HTML5, CSS3, JavaScript                 |
| Template Engine | Jinja2                                  |
| Styling         | CSS Custom                              |
| Version Control | Git dan GitHub                          |
| Deployment      | Vercel / Hosting dengan domain `.my.id` |

## Struktur Folder

```text
DES-FLASK-APP/
│
├── app.py
├── requirements.txt
├── vercel.json
├── README.md
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── app.js
```

## Penjelasan File

### `app.py`

File utama backend Flask. File ini berisi routing aplikasi, validasi input, konversi format hex dan biner, serta seluruh fungsi utama algoritma DES.

Fungsi utama yang terdapat pada file ini antara lain:

* Fungsi permutasi.
* Fungsi XOR.
* Fungsi konversi hex ke biner.
* Fungsi konversi biner ke hex.
* Fungsi key schedule.
* Fungsi S-Box lookup.
* Fungsi Feistel.
* Fungsi enkripsi DES.
* Fungsi dekripsi DES.

### `templates/index.html`

File template utama untuk tampilan aplikasi. File ini berisi struktur halaman, form input, mode operasi, tombol proses, tampilan hasil, serta container untuk menampilkan proses perhitungan DES.

### `static/style.css`

File CSS untuk mengatur tampilan aplikasi. Styling dibuat agar tampilan lebih rapi, responsif, dan mudah dibaca. Bagian ini mengatur layout, card, tombol, tabel, warna validasi input, serta tampilan step-by-step.

### `static/app.js`

File JavaScript frontend. File ini digunakan untuk mengatur interaksi pada halaman, seperti pilihan format input, counter jumlah karakter, validasi visual, toggle detail round, dan pengaturan tampilan hasil.

### `requirements.txt`

File yang berisi daftar dependency Python yang diperlukan untuk menjalankan aplikasi.

### `vercel.json`

File konfigurasi untuk deployment aplikasi Flask ke Vercel.

## Cara Menjalankan Aplikasi Secara Lokal

Pastikan Python sudah terinstall di perangkat.

### 1. Clone Repository

```bash
git clone https://github.com/inkaqila/PROJECT_DES.git
```

Masuk ke folder project:

```bash
cd nama-repository
```

### 2. Install Dependency

```bash
pip install -r requirements.txt
```

### 3. Jalankan Aplikasi

```bash
python app.py
```

Jika berhasil, aplikasi dapat dibuka melalui browser pada alamat:

```text
http://127.0.0.1:5000
```

## Cara Menggunakan Aplikasi

1. Pilih format input yang ingin digunakan, yaitu Hex atau Biner.
2. Masukkan plaintext atau ciphertext sesuai mode operasi.
3. Masukkan key 64-bit sesuai format yang dipilih.
4. Pilih mode operasi:

   * Enkripsi untuk mengubah plaintext menjadi ciphertext.
   * Dekripsi untuk mengubah ciphertext menjadi plaintext.
5. Klik tombol proses.
6. Lihat hasil akhir dalam bentuk heksadesimal dan biner.
7. Buka bagian solusi penyelesaian untuk melihat proses DES secara lengkap.

## Alur Algoritma DES

Secara umum, proses DES pada aplikasi ini berjalan sebagai berikut:

```text
Input 64-bit
↓
Initial Permutation (IP)
↓
Split menjadi L0 dan R0
↓
16 Round Feistel
↓
Final Swap
↓
Inverse Initial Permutation (IP⁻¹)
↓
Output 64-bit
```

Proses key schedule berjalan sebagai berikut:

```text
Key 64-bit
↓
PC-1
↓
C0 dan D0
↓
Left Shift sesuai jadwal round
↓
PC-2
↓
K1 sampai K16
```

Pada setiap round, fungsi Feistel menjalankan proses:

```text
R 32-bit
↓
Expansion E menjadi 48-bit
↓
XOR dengan subkey 48-bit
↓
S-Box S1 sampai S8
↓
Permutation P
↓
XOR dengan L
```

## Catatan Implementasi

Algoritma DES pada project ini dibuat manual menggunakan fungsi-fungsi dasar Python. Aplikasi tidak menggunakan library kriptografi siap pakai. Hal ini dilakukan agar proses pembelajaran algoritma DES dapat terlihat secara jelas, mulai dari manipulasi bit, permutasi, substitusi S-Box, hingga proses round Feistel.

Output aplikasi ditampilkan dalam dua format, yaitu heksadesimal dan biner. Format heksadesimal digunakan agar hasil lebih ringkas dan mudah dicocokkan dengan perhitungan manual, sedangkan format biner digunakan untuk memperlihatkan bentuk internal 64-bit yang diproses oleh algoritma DES.

## Author

Nama: Inka Aqila
NIM: 301230043
Kelas: IF 6A
Mata Kuliah: Kriptografi
