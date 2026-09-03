# 🤖 Roadmap Integrasi AI - FinAgenda Pro Platform

Dokumen perencanaan dan ide pengembangan fitur kecerdasan buatan (Artificial Intelligence) untuk platform **FinAgenda**.

---

## 📌 Visi AI FinAgenda
Mengubah FinAgenda dari aplikasi pencatatan keuangan & agenda manual menjadi **Smart Personal CFO & Productivity Assistant** yang proaktif, otomatis, dan membantu penggunanya mencapai kebebasan finansial.

---

## 🚀 Fitur Unggulan AI (Roadmap Masa Depan)

### 1. 📸 Smart Receipt OCR (Pencatatan Otomatis via Foto Struk)
* **Deskripsi:** Pengguna memfoto struk belanja (Alfamart/Indomaret/Resto) atau mengunggah screenshot transaksi e-wallet/m-banking.
* **Fungsi AI (Gemini Vision API):** 
  * Membaca nama merchant/toko, tanggal transaksi, dan total nominal.
  * Mengelompokkan transaksi ke kategori yang sesuai secara otomatis.
* **Target Manfaat:** Menghilangkan kelelahan menginput data manual.

---

### 2. 🎙️ Natural Language / Voice Entry ("Catat Cepat Teks & Suara")
* **Deskripsi:** Input transaksi menggunakan kalimat bebas Bahasa Indonesia atau perintah suara.
* **Contoh Input:** *"Tadi makan siang bakso bakar 35 ribu di warung mas bimo"*
* **Fungsi AI (LLM Parsing):** Mengekstrak kalimat menjadi data JSON terstruktur:
  ```json
  {
    "amount": 35000,
    "type": "expense",
    "category": "Makanan & Minuman",
    "notes": "Makan siang bakso bakar di warung mas bimo"
  }
  ```

---

### 3. 🤖 Personal CFO Chatbot & AI Financial Health Audit
* **Deskripsi:** Asisten AI cerdas yang mengaudit kondisi keuangan secara proaktif.
* **Fitur Utama:**
  * **Proactive Warning:** *"Budget makanan kamu sudah 80% terpakai padahal tanggal gajian masih 10 hari lagi."*
  * **Tanya Jawab Alami (Q&A):** Pengguna bisa bertanya: *"Berapa pengeluaran bensin saya bulan ini dibanding bulan lalu?"* atau *"Apakah saldo saya aman jika membeli barang seharga 1 juta?"*

---

### 4. 🔮 Predictive Cash Flow Forecasting (Proyeksi Saldo Akhir Siklus)
* **Deskripsi:** AI mengalisis tren histori transaksi 3–6 bulan terakhir.
* **Fungsi AI:** 
  * Memprediksi estimasi sisa kas hingga akhir siklus gajian (cut-off) mendatang.
  * Memberikan alokasi peringatan dini sebelum timbul defisit keuangan.

---

### 5. 📅 FinAgenda Synergy (AI Estimator Biaya Agenda)
* **Deskripsi:** Integrasi cerdas antara modul Agenda/Acara dan Modul Keuangan.
* **Contoh:** Pengguna membuat agenda *"Liburan ke Bali 3 Hari"*.
* **Fungsi AI:** AI menggenerasi rincian estimasi biaya (Tiket, Penginapan, Transport, Makan) dan menghubungkannya langsung ke rencana **Tabungan Bersama / Budget Acara**.

---

## 🛠️ Rekomendasi Stack Teknologi AI
* **AI Provider:** Google Gemini API (`@google/genai` - Gemini 2.0 Flash / Gemini 1.5 Flash)
* **Fitur Utama:** Vision OCR, Structured JSON Output (Schema Enforcement), & Fast Latency Response.
* **Model Integration:** API Route Next.js 16 (`/app/api/ai/...`) ➔ Service Layer Go backend (`keuangan-api`).

---

*Dokumen ini dibuat pada: 3 September 2026 sebagai catatan eksplorasi pengembangan FinAgenda.*
