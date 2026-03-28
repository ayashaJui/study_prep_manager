# OAuth Setup Guide

This guide walks you through setting up Google and GitHub OAuth authentication in the Interview & Study Prep Manager application.

## Prerequisites

- Next.js 16 with NextAuth.js installed
- MongoDB database configured
- Node.js and npm installed

## 1. Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name (e.g., "Interview Prep Manager") and click "CREATE"
5. Wait for the project to be created and selected

### Step 2: Enable OAuth 2.0

1. In the Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** as the user type
3. Click "CREATE"
4. Fill in the OAuth consent screen form:
   - **App name**: Interview & Study Prep Manager
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "SAVE AND CONTINUE"
6. On the "Scopes" page, click "SAVE AND CONTINUE"
7. On the "Test users" page, click "SAVE AND CONTINUE"

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Choose **Web application**
4. Under "Authorized JavaScript origins", click "ADD URI" and add:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Under "Authorized redirect URIs", click "ADD URI" and add:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Click "CREATE"
7. Copy your **Client ID** and **Client Secret**

### Step 4: Add to .env.local

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## 2. GitHub OAuth Setup

### Step 1: Register OAuth Application

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Interview & Study Prep Manager
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (or your domain)
4. Click "Register application"

### Step 2: Configure OAuth App

1. On the application page, you'll see:
   - **Client ID**
   - **Client Secret** - Click "Generate a new client secret"
2. Copy both values (Note: GitHub only shows the client secret once)

### Step 3: Add to .env.local

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

---

## 3. NextAuth Configuration

### Update .env.local

Add the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production
```

**Generating NEXTAUTH_SECRET:**

```bash
# In your terminal, run:
openssl rand -base64 32
```

Copy the output and add it to `.env.local`

### Production Setup

For production, update:

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret-key
```

---

## 4. Features Enabled

Once OAuth is configured, users can:

✅ **Sign in with Google** - Using their Google account
✅ **Sign in with GitHub** - Using their GitHub account
✅ **Link OAuth accounts** - Connect OAuth to existing email/password accounts
✅ **Switch authentication methods** - Sign in with different providers

---

## 5. User Flow

### New User via OAuth

1. User clicks "Google" or "GitHub" button on login page
2. Redirected to OAuth provider
3. User authorizes the application
4. User profile created in database with provider info
5. User logged in and redirected to dashboard

### Existing Email User Linking OAuth

1. User signs in with email/password
2. OAuth provider returns same email
3. System automatically links the OAuth provider to existing account
4. User can now sign in with either method

---

## 6. Testing OAuth Locally

### Using Ngrok for Callback Testing

If you need to test OAuth callbacks locally:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel on port 3000
ngrok http 3000

# Update your OAuth callback URLs with the ngrok URL
# Example: https://abc123.ngrok.io/api/auth/callback/google
```

---

## 7. Troubleshooting

### "Redirect URI mismatch" Error

- **Cause**: The callback URL in your OAuth app settings doesn't match what the app is requesting
- **Solution**:
  - Verify `NEXTAUTH_URL` is set correctly
  - Check GitHub/Google OAuth app settings match your domain
  - Ensure callback URLs include `/api/auth/callback/{provider}`

### OAuth Provider Returns Error

- **Cause**: Invalid Client ID or Client Secret
- **Solution**:
  - Verify credentials are copied correctly (no extra spaces)
  - Regenerate and update credentials
  - Check that provider is authorized in OAuth consent screen

### Session Not Persisting

- **Cause**: `NEXTAUTH_SECRET` not set or database issue
- **Solution**:
  - Verify `NEXTAUTH_SECRET` is unique and set
  - Check MongoDB connection
  - Clear browser cookies and retry

---

## 8. Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
# Click login and try OAuth buttons
```

---

## 9. Environment Variables Summary

| Variable               | Description                | Required              |
| ---------------------- | -------------------------- | --------------------- |
| `MONGODB_URI`          | MongoDB connection string  | ✅ Yes                |
| `NEXTAUTH_URL`         | Application URL            | ✅ Yes                |
| `NEXTAUTH_SECRET`      | NextAuth secret key        | ✅ Yes                |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID     | ⏳ For Google OAuth   |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ⏳ For Google OAuth   |
| `GITHUB_CLIENT_ID`     | GitHub OAuth Client ID     | ⏳ For GitHub OAuth   |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | ⏳ For GitHub OAuth   |
| `JWT_SECRET`           | JWT signing secret         | ✅ Yes\*              |
| `EMAIL_USER`           | Email for password reset   | ⏳ For email features |
| `EMAIL_PASSWORD`       | Email app password         | ⏳ For email features |

---

## 10. Security Best Practices

✅ **DO:**

- Keep all secrets in `.env.local` (never commit to git)
- Use different secrets for development and production
- Rotate secrets regularly
- Use HTTPS in production
- Enable HTTPS redirect in OAuth apps

❌ **DON'T:**

- Hardcode secrets in code
- Share `.env.local` files
- Use simple/weak secrets
- Enable OAuth without HTTPS in production
- Commit environment variables to version control

---

## Useful Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
