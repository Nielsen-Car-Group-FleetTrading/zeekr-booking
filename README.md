# Zeekr Booking Portal

Bookingportal til prøvekørsler. Bygget med Next.js 14 (App Router), Tailwind CSS, Airtable og Resend.

---

## Opsætning

### 1. Klon og installer afhængigheder

```bash
npm install
```

### 2. Airtable — opret base og felter

Opret en ny Airtable-base med navnet **"Zeekr Booking"** med to tabeller:

#### Tabel: `Biler`

| Feltnavn | Type            | Bemærkning          |
|----------|-----------------|---------------------|
| Navn     | Single line text | Primærfelt          |
| Reg.nr   | Single line text | Påkrævet            |
| Model    | Single line text | Valgfri             |
| Aktiv    | Checkbox        | Default = true      |

#### Tabel: `Bookinger`

| Feltnavn | Type                | Bemærkning                              |
|----------|---------------------|-----------------------------------------|
| Navn     | Single line text    | Primærfelt                              |
| Email    | Email               |                                         |
| Mobil    | Phone / Single line |                                         |
| Bil      | Link to Biler       | Linked record                           |
| Start    | Date (incl. time)   | Timezone: Europe/Copenhagen             |
| Slut     | Date (incl. time)   | Timezone: Europe/Copenhagen             |
| Status   | Single select       | Værdier: `Bekræftet`, `Annulleret`     |
| Oprettet | Created time        |                                         |

> **Vigtigt:** Feltet "Status" skal have præcis disse to valgmuligheder: `Bekræftet` og `Annulleret`.

Hent dit **Base ID** fra URL'en: `https://airtable.com/appXXXXXXXXXX/...`  
Hent din **API key** (Personal Access Token) fra: https://airtable.com/create/tokens

Sørg for at PAT'en har disse scopes: `data.records:read`, `data.records:write`.

---

### 3. Resend — domæneverificering

1. Opret konto på [resend.com](https://resend.com)
2. Tilføj og verificer dit afsenderdomæne under **Domains**
3. Opret en API-nøgle under **API Keys**
4. Sæt `RESEND_FROM_EMAIL` til en adresse på det verificerede domæne, fx `booking@dit-domæne.dk`

---

### 4. Miljøvariabler

Kopiér `.env.local.example` til `.env.local` og udfyld alle felter:

```bash
cp .env.local.example .env.local
```

| Variabel                   | Beskrivelse                                        |
|----------------------------|----------------------------------------------------|
| `AIRTABLE_API_KEY`         | Personal Access Token fra Airtable                 |
| `AIRTABLE_BASE_ID`         | Base ID (starter med `app`)                        |
| `AIRTABLE_BILER_TABLE`     | Tabelnavn, default: `Biler`                        |
| `AIRTABLE_BOOKINGER_TABLE` | Tabelnavn, default: `Bookinger`                    |
| `RESEND_API_KEY`           | API-nøgle fra Resend                               |
| `RESEND_FROM_EMAIL`        | Afsenderadresse (verificeret domæne)               |
| `ADMIN_PASSWORD`           | Adgangskode til admin-panel                        |
| `NEXT_PUBLIC_TIMEZONE`     | Tidszone, default: `Europe/Copenhagen`             |
| `BUSINESS_HOURS_START`     | Åbningstid, default: `09:00`                       |
| `BUSINESS_HOURS_END`       | Lukketid, default: `17:00`                         |
| `BUSINESS_DAYS`            | Ugedage (1=Man, 7=Søn), default: `1,2,3,4,5`      |
| `COMPANY_ADDRESS`          | Vises i bekræftelsesmail                           |
| `NEXT_PUBLIC_APP_URL`      | Fuld URL til deployed app (til logo i mail)        |

---

### 5. Vercel deployment

1. Push projektet til GitHub
2. Opret nyt projekt på [vercel.com](https://vercel.com) og forbind til GitHub-repo
3. Tilføj alle ovenstående miljøvariabler under **Settings → Environment Variables**
4. Deploy — Vercel bygger automatisk ved push til `master`/`main`

---

### 6. Tilføj det officielle Zeekr-logo

Erstat filen `public/zeekr-logo.svg` med den officielle Zeekr SVG-logofil.  
Logoet vises i headeren og i bekræftelsesmailen.

---

### 7. Opret biler i admin-panelet

Gå til `/admin` og log ind med `ADMIN_PASSWORD`.  
Klik **+ Tilføj bil** og opret dine biler (Navn, Reg.nr, evt. Model).

---

## Lokal udvikling

```bash
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000) for bookingportalen.  
Åbn [http://localhost:3000/admin](http://localhost:3000/admin) for admin.

---

## Airtable webhook (valgfri)

For at ændringer i Airtable slår hurtigt igennem, kan du sætte et webhook op i Airtable:

1. Gå til **Automations** i din Airtable-base
2. Opret en automation med trigger: **"When a record is created/updated"**
3. Tilføj action: **"Send a webhook"** → URL: `https://din-app.vercel.app/api/airtable-webhook`
4. Valgfrit: tilføj en `x-webhook-secret` header og sæt `WEBHOOK_SECRET` i env vars

---

## Arkitektur

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # Offentlig bookingside
│   ├── admin/        # Admin-panel (adgangskodebeskyttet)
│   └── api/          # API-routes
├── components/       # React-komponenter
├── lib/
│   ├── airtable.ts   # Airtable CRUD
│   ├── availability.ts # Slot-generering og tilgængelighed
│   ├── email.ts      # Resend e-mail
│   └── config.ts     # Konfiguration fra env vars
└── types/index.ts    # TypeScript-typer
```
