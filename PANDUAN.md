# Instabox keepalive (free plan)

Tujuan: mesin tetap hidup walaupun tidak ada yang memakai, tanpa cooldown.

## Kenapa perlu pihak ketiga

Mesin yang di-pause tidak bisa membangunkan dirinya sendiri. Jadi penjaga
harus jalan di luar mesin, misalnya Cloudflare Worker dengan cron.

## Batas free plan

- Idle 30 menit: mesin pause kalau tidak ada aktivitas.
- Satu run mulai dari 120 menit, bisa tumbuh sampai 480 menit kalau dipakai.
- Kalau kena batas run: cooldown 5-20 menit, lalu 60-75, lalu 120-135.
- Lease mencegah idle pause, tapi tidak memperpanjang batas run.
- Suspend lalu resume sebelum batas run me-reset timer tanpa cooldown.
  Proses dan memory tetap hidup, downtime sekitar 2 detik.

Worker ini melakukan dua hal tiap 5 menit:

1. Renew activity lease, supaya tidak kena idle pause.
2. Kalau sisa run tinggal 10 menit, suspend lalu resume. Timer run kembali
   ke 120 menit, tanpa cooldown.

## Langkah deploy (dashboard Cloudflare, tanpa CLI)

1. Buat akun Cloudflare gratis, buka Workers & Pages, Create, Worker.
2. Deploy worker kosong, lalu Edit code. Hapus isinya, paste seluruh
   `worker.js`, Deploy.
3. Settings, Variables and Secrets. Tambahkan:
   - `INSTABOX_API_KEY` sebagai Secret, isi key `ibk_...`
   - `TOKEN` sebagai Secret, isi string acak pilihanmu
   - `INSTABOX_LEASE_TTL` sebagai Text, isi `900`
   - opsional `INSTABOX_MACHINE` sebagai Text, isi
     `m_agq7etxze7oppgzgraooeir5tm` kalau hanya mau menjaga mesin ini
4. Settings, Triggers, Cron Triggers, tambahkan `*/5 * * * *`.
5. Buka `https://<nama-worker>.workers.dev/status?token=<TOKEN>`.
   Harusnya tampil state `running`, `run left ...m`, dan lease aktif.

## Bikin API key

Dashboard instabox, Profile, API keys, Create key. Scope `machines:write`
sudah cukup (termasuk read). Key hanya ditampilkan sekali.

Jangan simpan key di chat atau repo. Untuk Worker, key masuk ke Secret
Cloudflare. Untuk versi daemon, installer meminta input tersembunyi.

## Kalau mau daemon di perangkat lain

Ada versi shell dari proyek yang sama:

```sh
curl -fsSL https://raw.githubusercontent.com/samperez10/instashit-keepalive/main/instabox-keepalive.sh -o keepalive.sh
sh keepalive.sh install
```

Bisa di VPS, NAS, router, atau Termux. Di Android butuh Termux:Boot, wake
lock, dan battery optimization dimatikan. HP harus tetap online.

## Catatan

- Cron Cloudflare gratis, minimal tiap 5 menit. Batas 3 cron trigger per
  Worker di free plan.
- Worker ini MIT, sumber:
  https://github.com/samperez10/instashit-keepalive
- Alternatif: GitHub Actions tiap 10 menit di repo publik. Cron GitHub
  sering telat dan workflow bisa dimatikan setelah 60 hari tanpa aktivitas.
- Kalau mau benar-benar tanpa interrupt sama sekali, Pro $20/bulan + usage.
  Untuk mesin 4 vCPU / 8 GiB yang hidup 24/7, pemakaian sekitar $25/bulan
  dan kredit $20 menutup sebagian besar.
