# Employee Management Dashboard

Aplikasi dashboard employee management menggunakan Angular 21 dan Tailwind CSS. Data employee dan akun login menggunakan file JSON lokal sebagai API dummy.

## Persyaratan

- Node.js `20.19.x`, `22.12.x`, atau `24.x`.
- npm, yang disertakan bersama Node.js.

Rentang Node.js tersebut mengikuti [tabel kompatibilitas Angular](https://angular.dev/reference/versions) untuk Angular 21.

Periksa versi yang terpasang:

```bash
node --version
npm --version
```

## Clone dan jalankan aplikasi

```bash
git clone https://github.com/didikad/angular-staff-portal.git
cd angular-staff-portal
npm install
npm start
```

Buka [http://localhost:4200](http://localhost:4200) setelah server berjalan. Server development akan memuat ulang aplikasi saat file sumber berubah.

## Akun login untuk testing

Gunakan akun demo berikut pada halaman login:

```text
Username: admin
Password: admin123
```

Data akun berada di `public/api/auth.json`. Employee dummy berada di `public/api/employees.json`. Keduanya merupakan data statis untuk kebutuhan latihan, bukan autentikasi backend produksi.

## Perintah tambahan

Jalankan unit test:

```bash
npm test -- --watch=false
```

Buat production build:

```bash
npm run build
```

Hasil build berada di folder `dist/`.
