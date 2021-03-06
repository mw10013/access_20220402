# Welcome to Access!

## Setup

- node >= 14
- git clone https://github.com/mw10013/access.git
- .env file in root with
  -- DATABASE_URL="file:./dev.db"
  -- SESSION_SECRET="top-secret"
- npm install
- Build Database From Scratch
- npm run dev
- localhost:3000

## Browse Database

- npx prisma studio

## Build Database From Scratch

- npx prisma db push --force-reset
- npx prisma db seed

## Development Setup Notes

- npm add -D concurrently tailwindcss
- npx tailwindcss init
- npm install @tailwindcss/forms
- npm add -D prisma
- npm add @prisma/client
- npx prisma init --datasource-provider sqlite
- npx prisma db push
- npx prisma generate
- npm add -D esbuild-register
- node --require esbuild-register prisma/seed.ts
- npm add react-query
- npm add lodash
- npm add -D @types/lodash
- npm add zod
- npm add bcrypt
- npm add -D @types/bcrypt
- npm add @headlessui/react
- npm add @heroicons/react
- npm add -D @tailwindcss/typography
- npm install prettier -D --save-exact
- npm add -D prettier prettier-plugin-tailwindcss

# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
