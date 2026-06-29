# 🔐 Blockchain sistem za upravljanje korisnicima

Sistem koji svaku akciju nad korisnicima (registracija, izmena, brisanje) kriptografski zaključava u sopstveni **SHA-256 blockchain lanac**. Ako neko naknadno promeni podatke zaobilazeći aplikaciju, sistem to odmah detektuje i prijavljuje alarm — kao nepromenljiv revizorski dnevnik.

---

## 📋 Sadržaj

- [Tehnologije](#-tehnologije)
- [Pokretanje lokalno](#-pokretanje-lokalno)
- [Korišćenje](#-korišćenje)
- [Struktura projekta](#-struktura-projekta)
- [API Endpointi](#-api-endpointi)

---

## 🛠 Tehnologije

| Tehnologija | Uloga |
|-------------|-------|
| **Node.js** | Server runtime |
| **Express.js** | REST API framework |
| **crypto** (built-in) | SHA-256 hashing |
| **HTML5 / CSS3 / JS** | Frontend interfejs |

---

## 🚀 Pokretanje lokalno

### Preduslovi

- [Node.js](https://nodejs.org/) v18 ili noviji
- `npm` (dolazi uz Node.js)

### Koraci

**1. Kloniraj repozitorijum**

```bash
git clone https://github.com/tvoj-username/blockchain-users.git
cd blockchain-users
```

**2. Instaliraj zavisnosti**

```bash
npm install
```

**3. Pokreni server**

```bash
node server.js
```

**4. Otvori aplikaciju u browseru**

```
http://localhost:3000
```

---

## 🖥 Korišćenje

### Registracija korisnika
Popuni formu (korisničko ime, email, uloga) i klikni **Registruj korisnika**.  
Svaka registracija kreira novi blok u lancu sa akcijom `REGISTER`.

### Izmena korisnika
Klikni **Izmeni** pored korisnika, promeni podatke i sačuvaj.  
Sistem loguje i staro i novo stanje u blok sa akcijom `UPDATE`.

### Brisanje korisnika
Klikni **Obriši** — korisnik se briše iz liste, ali blok sa akcijom `DELETE` ostaje trajno u lancu.

### Simulacija napada
Klikni **⚠ Simuliraj napad** — sistem direktno kvari hash u blockchain lancu i odmah prikazuje crveni alarm:

```
ALARM! Detektovana neovlašćena izmena u blockchain lancu!
```

Restartuj server (`Ctrl+C` → `node server.js`) da resetuješ sistem.

---

## 📁 Struktura projekta

```
blockchain-users/
│
├── blockchain.js       # Klase Block i Blockchain (SHA-256 logika)
├── server.js           # Express server + REST API endpointi
├── package.json        # Konfiguracija projekta
│
└── public/
    └── index.html      # Frontend (UI, forma, blockchain log)
```

---

## 📡 API Endpointi

| Metoda | Ruta | Opis |
|--------|------|------|
| `GET` | `/api/users` | Lista svih korisnika + status lanca |
| `POST` | `/api/users` | Registracija novog korisnika |
| `PUT` | `/api/users/:id` | Izmena podataka korisnika |
| `DELETE` | `/api/users/:id` | Brisanje korisnika |
| `POST` | `/api/tamper` | Simulacija napada (demo) |

---

## 👨‍💻 Autor

**Stevan Stojanović** · IT475 · Univerzitet Metropolitan Beograd  
Profesor: Nemanja Zdravković · Asistent: Miloš Nikolić
