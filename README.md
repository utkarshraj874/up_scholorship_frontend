# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Local development and deployment

Install dependencies and start the frontend:

```sh
npm ci
npm run dev
```

The development environment uses `http://localhost:8000` for the API. Set
`VITE_API_URL` in `.env.development` to override it. For Vercel, set the same
variable in the project's environment settings to the deployed Render API URL
(for example, `https://your-api.onrender.com`); the production build also uses
the configured `.env.production` value.

The backend must allow the frontend origin through CORS. The API currently
allows local Vite origins and Vercel deployments.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
