## 1. The reasoning of your interpretation and choices you made in section 2?

### Master Data and Role Access

Saya membagi pengguna menjadi tiga role, yaitu Owner, Manager, dan Staff, dengan hak akses sesuai tanggung jawabnya. Owner dapat mengelola data master dan inventory seluruh toko, Manager hanya dapat mengelola data dan inventory toko yang dipimpinnya serta user dengan role Staff. Staff hanya dapat melihat data product dan store serta melakukan penghitungan Stock Opname.

### Inventory Management

Saya memisahkan product dan inventory karena satu produk dapat memiliki jumlah stok berbeda di setiap toko. Dengan begitu, stok dapat dikelola secara independen berdasarkan toko.

### Stock Opname Process

Saya menggunakan sesi Stock Opname agar proses penghitungan memiliki toko tujuan dan status yang jelas. Owner dapat membuat sesi untuk semua toko, sedangkan Manager hanya untuk toko yang dipimpinnya. Staff bertugas mengirimkan hasil penghitungan tanpa dapat membuat sesi.

Saya menerapkan status `initiated`, `in_progress`, `submitted`, `approved`, `rejected`, dan `needs_revision` untuk menggambarkan tahapan proses. Inventory hanya diperbarui setelah Manager menyetujui hasil penghitungan agar stok tidak berubah sebelum hasilnya ditinjau.

### Bulk Upload Stock Opname Items
Saya menambahkan fitur bulk upload menggunakan file CSV agar Staff dapat mengirimkan hasil penghitungan banyak produk sekaligus tanpa harus menginputnya satu per satu. Sistem memvalidasi format file dan data produk sebelum menyimpan hasil penghitungan. Fitur ini membantu mempercepat proses Stock Opname, mengurangi pekerjaan manual, dan meminimalkan kesalahan input.

### Frontend and Access Control

Saya membedakan fitur berdasarkan role agar setiap pengguna hanya mengakses fungsi yang relevan. Validasi juga perlu dilakukan di backend untuk mencegah pengguna mengakses atau mengubah data di luar kewenangannya.



## 2. Walk through what happens from the moment a manager clicks approve to the moment stock levels are updated. What could go wrong at each step, and what did you consider and do about it?
Ketika Manager menekan tombol Approve, sistem mengambil data sesi Stock Opname dan memvalidasi hak akses pengguna. Manager hanya dapat meninjau sesi dari toko yang dipimpinnya, dan hanya sesi dengan status `submitted` yang dapat diproses.

Sebelum menyetujui sesi, sistem memastikan seluruh produk sudah dihitung dan setiap produk memiliki data inventory pada toko tersebut. Jika masih ada produk yang belum dihitung atau data inventory tidak ditemukan, proses approval akan ditolak.

Jika semua validasi berhasil, sistem mengubah status sesi menjadi `approved`, memperbarui jumlah stok inventory berdasarkan hasil penghitungan Staff, dan mencatat perubahan status ke dalam history. Seluruh proses ini dijalankan dalam satu transaksi database agar jika terjadi kegagalan, perubahan dapat dibatalkan dan data tetap konsisten.

Saya juga menerapkan validasi perubahan status untuk mencegah sesi yang sama disetujui lebih dari satu kali. Jika status sesi sudah berubah sebelum proses approval selesai, permintaan akan ditolak.

Beberapa risiko yang dipertimbangkan adalah approval oleh pengguna yang tidak berwenang, hasil penghitungan yang belum lengkap, data inventory yang tidak ditemukan, permintaan approval berulang, dan kegagalan database. Risiko tersebut ditangani melalui validasi hak akses, pemeriksaan data, perubahan status bersyarat, dan transaksi database.

Dengan pendekatan ini, inventory hanya diperbarui berdasarkan hasil penghitungan yang telah disetujui, sekaligus menjaga konsistensi antara status sesi, jumlah stok, dan riwayat proses.


## 3. What happens to items that are left uncounted by the staff during a stock opname session? For example, if they forget or if the items don’t exist in their store. Do you allow submission with empty value for items? Do you treat them as zero stock, ignore them (keep previous stock), or handle them another way? And what is your reasoning?

Produk yang belum dihitung memiliki nilai `countedQty = null`, sedangkan nilai `0` menunjukkan bahwa produk sudah dihitung tetapi stok fisiknya kosong.

Saya mengizinkan nilai kosong saat penghitungan berlangsung, tetapi Manager tidak dapat menyetujui sesi jika masih ada produk yang belum dihitung. Saya memilih pendekatan ini agar produk yang belum diperiksa tidak dianggap memiliki stok nol atau menyebabkan stok inventory berubah secara tidak akurat.


## 4. What are some edge cases you thought of and how did you handle them?

Saya mempertimbangkan beberapa kondisi seperti approval berulang, produk yang belum dihitung, data inventory yang tidak ditemukan, dan Manager yang mencoba mengakses sesi dari toko lain. Saya menangani kondisi tersebut melalui validasi status sesi, kelengkapan penghitungan, keberadaan data inventory, dan hak akses berdasarkan role serta toko. Selain itu, transaksi database digunakan untuk menjaga konsistensi data jika terjadi kegagalan saat proses approval.


## 5. What is one thing you added to this project that you think is important? Why?

Saya menambahkan fitur history untuk mencatat setiap perubahan status Stock Opname, termasuk status sebelumnya, status baru, pengguna yang melakukan perubahan, dan catatan terkait. Menurut saya, fitur ini penting agar setiap proses dapat ditelusuri, memudahkan pemeriksaan jika terjadi masalah, dan meningkatkan transparansi serta akuntabilitas dalam pengelolaan stok.