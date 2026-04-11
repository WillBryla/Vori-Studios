# Contact Agent — Vercel Setup

## Project Structure

```
contact-agent/
├── api/
│   └── send-message.js   ← Serverless function (API key lives here, server-side only)
├── public/
│   └── index.html        ← Your contact form
├── vercel.json
├── package.json
└── README.md
```

## Deploy Steps

### 1. Push to GitHub
Create a new GitHub repo and push this folder to it.

### 2. Import to Vercel
- Go to https://vercel.com/new
- Click "Import Git Repository"
- Select your repo
- Click Deploy (no build settings needed)

### 3. Add your API key as an Environment Variable
- In your Vercel project → Settings → Environment Variables
- Add:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** your key from https://console.anthropic.com
  - **Environment:** Production, Preview, Development (check all three)
- Click Save, then **Redeploy** the project

### 4. Connect Gmail MCP
The serverless function calls the Gmail MCP at `https://gmail.mcp.claude.com/mcp`.
Make sure your Anthropic account has Gmail connected at https://claude.ai/settings/integrations

## How It Works

1. User fills out the form and hits Send
2. Browser POSTs to `/api/send-message` (your Vercel function)
3. The function reads `ANTHROPIC_API_KEY` from env (never exposed to browser)
4. It calls the Anthropic API with Gmail MCP attached
5. Claude sends a formatted email to williambryla07@gmail.com
6. Function returns success/error → form shows the result

## Embedding on an Existing Site

If your main site is already on Vercel, drop `api/send-message.js` into your existing
`/api` folder and copy the form HTML wherever you need it. No separate deploy needed.

If using a different host, you can deploy just the API to Vercel and call it from
anywhere by updating the fetch URL in index.html to your full Vercel function URL.
