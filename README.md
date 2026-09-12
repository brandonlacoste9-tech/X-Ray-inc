# Pacific Northwest X-Ray Inc. (PNWX)

Modern B2B radiology-supply catalog rebuilt from [www2.pnwx.com](https://www2.pnwx.com/).

**Repo:** [brandonlacoste9-tech/X-Ray-inc](https://github.com/brandonlacoste9-tech/X-Ray-inc)

Quote / phone / fax / PDF order form workflow — not consumer checkout.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives
- Static catalog JSON + scraped images from www2.pnwx.com
- Netlify Forms for quote intake

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Catalog refresh

```bash
npm run crawl:pnwx
npm run reparse:pnwx
npm run clean:catalog
```

## Quote flow

- Multi-SKU **Quote list** in the header
- Netlify Forms (`public/__forms.html`) — set notifications to `SalesD@pnwx.com` after deploy
- Phone `800-827-9729` · Fax `503-666-8855` · `/order-form.pdf`
