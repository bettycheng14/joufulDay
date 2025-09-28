# joufulDay  

A web application for local tours, built with full-stack technologies.  

## Table of Contents

- [About](#about)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Setup & Installation](#setupinstallation)
- [Project Structure](#project-structure)

---

## About  
**joufulDay** is a dynamic website that lets users browse and interact with local tours. It combines frontend design, user interaction, and backend services (server, database, APIs) to deliver a full-featured experience.

---

## Features  
- Responsive UI using Bootstrap & custom CSS  
- Tour listing, filtering, and details pages  
- User registration, login, session management  
- Form handling and validation (client-side + server-side)  
- Persistent data storage with MongoDB  
- Email verification (OTP), password hashing (bcrypt), and password reset  
- Integration with external APIs (e.g. Google Maps for map display)  
- Payment processing with Stripe (success/failure flows)  
- Email notifications via Nodemailer  
- Secure request handling & data validation  

---

## Tech Stack  

| Layer | Technologies |
|---|---|
| Frontend | HTML, CSS, Bootstrap, JavaScript, EJS templates |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication & Security | bcrypt, express-session (with sessions stored in MongoDB), token-based reset flows |
| APIs / External Services | Stripe, Google Maps API, Nodemailer |

---

## Setup&Installation  

1. Clone this repository:  
```bash
git clone https://github.com/bettycheng14/joufulDay.git
```

2. Install Dependency
```bash
npm install
```

3. Initialize Database with static data tourDtat.JSON
```
node initDb.js
```
4. Create `.env` file with the parameters in `.env.example`
5. Start the server
  ```bash
  npm run start
  ```
  Or use nodemon during developemnt
  ```bash
  npm run dev
  ```

## Project Structure
```
joufulDay/
├── data/
│   └── … (seed data or sample JSON)  
├── models/
│   └── … (Mongoose schemas)  
├── public_html/
│   └── … (static assets: CSS, JS, images, ejs templates)  
├── routes/
│   └── … (Express route handlers)  
├── utils/
│   └── … (email helper)  
├── .env.example  
├── .gitignore  
├── initDb.js  
├── index.js
├── package.json  
└── package-lock.json  

```

