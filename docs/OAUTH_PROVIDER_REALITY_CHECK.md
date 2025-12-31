# OAuth Provider Setup: The Real-World Guide

This document provides honest, practical information about setting up OAuth integrations for self-hosted deployments. No sugar-coating - just what you actually need to know.

## Your Setup

Based on what you mentioned:
- **ngrok alternative**: `fwd.by-a.ninja` (your own)
- **Google Workspace**: Legacy free account on `levidehaan.com`
- **Infrastructure**: Home network with reverse SSH tunnel capability
- **Domains**: Multiple available

**Key insight**: For home network use, you'll need HTTPS for most OAuth providers. Your options:
1. Reverse SSH tunnel to a server with valid SSL
2. Use `fwd.by-a.ninja` to expose your local server
3. Self-signed certs work for some providers in development mode

---

## Quick Reference: Provider Difficulty Ratings

| Provider | Difficulty | Cost | Approval Time | Notes |
|----------|------------|------|---------------|-------|
| **Google** | Easy | Free | Instant (dev) | Your legacy Workspace account is perfect |
| **Microsoft** | Easy | Free | Instant | Azure free tier works fine |
| **GitHub** | Very Easy | Free | Instant | Simplest OAuth setup |
| **Slack** | Easy | Free | Instant | No marketplace approval needed |
| **Notion** | Easy | Free | Instant | Public integration needs review |
| **Linear** | Very Easy | Free | Instant | No special requirements |
| **Airtable** | Easy | Free | Instant | Needs privacy policy URL |
| **Dropbox** | Easy | Free | Instant (500 users max in dev) | Production needs 50 users + review |
| **Asana** | Easy | Free | Instant | Free developer sandbox available |
| **Atlassian (Jira/Confluence)** | Medium | Free | Instant | Scope limits, rotating tokens |
| **HubSpot** | Easy | Free | Instant | 100 req/10sec free tier |
| **Salesforce** | Medium | Free | Instant | Developer Edition required |
| **Pipedrive** | Medium | Free | Review needed | Must use OAuth for marketplace |
| **Shopify** | Medium | Free | Instant | Partner account needed |
| **Zoom** | Medium | Free | Review for public | OAuth only works for your account until published |
| **Reddit** | Medium | Free | Instant | 100 QPM limit, User-Agent required |
| **LinkedIn** | Hard | Free | Approval needed | Requires company page verification |
| **X (Twitter)** | Hard | $200+/mo | Instant | Free tier extremely limited |
| **Spotify** | Medium | Free (limited) | Instant for dev | Organizations only for extended quota (as of May 2025) |
| **Webflow** | Medium | Free | Review for marketplace | Workspace admin needed |
| **WordPress** | Easy | Free | Instant | No refresh tokens - users re-auth every ~2 weeks |
| **Wealthbox** | Hard | Unknown | Partnership required | Contact required |

---

## Tier 1: Set Up in 10 Minutes (No Hassle)

### GitHub
**The easiest OAuth provider to set up.**

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in: Name, Homepage URL, Callback URL
4. Done. Copy Client ID and Secret.

**No verification, no approval, no waiting.**

```bash
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Google (Gmail, Drive, Docs, Sheets, Calendar, etc.)
**You have a legacy Workspace account - this is ideal.**

**Important distinctions:**
- **Under 100 users**: No verification needed, just click through "unverified app" warning
- **Internal use only** (within your Workspace org): No unverified app screen at all
- **Production with external users**: Requires verification (2-3 days)

**Your setup (internal/personal use):**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project
3. Enable APIs (Gmail, Drive, Calendar, etc.)
4. Configure OAuth consent screen → Choose "Internal" (for your Workspace) or "External" with test users
5. Create OAuth 2.0 credentials
6. Add redirect URI: `https://your-domain.com/api/auth/oauth2/callback/google`

**Scopes that trigger extra verification:**
- Most Gmail scopes are "sensitive" or "restricted"
- Drive `drive` scope is sensitive
- Calendar is generally fine

**For personal use with <100 users, you can skip verification entirely.** Users just click through a warning screen.

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
```

Sources: [Google verification requirements](https://support.google.com/cloud/answer/13464321?hl=en), [When verification not needed](https://support.google.com/cloud/answer/13464323?hl=en)

---

### Microsoft (Outlook, OneDrive, SharePoint, Teams, Excel)
**Free Azure account, no approval needed.**

1. Go to [portal.azure.com](https://portal.azure.com)
2. Azure Active Directory → App registrations → New registration
3. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
4. Add redirect URI
5. API permissions → Add Microsoft Graph permissions
6. Certificates & secrets → New client secret

**Key limitations:**
- Client secrets expire max 24 months
- Must use MSAL library (ADAL deprecated)

```bash
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sources: [Microsoft app registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

---

### Slack
**Easy, no marketplace approval needed for private use.**

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. OAuth & Permissions → Add redirect URL
4. Add Bot Token Scopes
5. Install to your workspace

**Important**: You don't need to publish to the Slack marketplace. For your own workspace, just install the app directly.

```bash
SLACK_CLIENT_ID=xxxxxxxxxxxx.xxxxxxxxxxxxx
SLACK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sources: [Slack OAuth guide](https://api.slack.com/docs/slack-apps-checklist)

---

### Notion
**Free, straightforward setup.**

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create new integration
3. For OAuth: Distribution tab → Enable "Public integration"
4. Fill in required fields (privacy policy, terms, support email)

**Note**: Public integrations require a Notion security review before publishing, but for personal use, internal integrations work immediately.

**Tokens don't expire** - users authorize once and it works indefinitely.

```bash
NOTION_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_CLIENT_SECRET=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sources: [Notion authorization docs](https://developers.notion.com/docs/authorization)

---

### Linear
**Very simple, no special requirements.**

1. Go to Linear Settings → API → OAuth Applications
2. Click "New Application"
3. Add name and redirect URI
4. Get credentials

**2025 change**: Apps created after October 1, 2025 have refresh tokens enabled by default (24-hour access token expiry).

```bash
LINEAR_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINEAR_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sources: [Linear OAuth docs](https://linear.app/developers/oauth-2-0-authentication)

---

### Airtable
**Free, needs privacy policy URL.**

1. Go to [airtable.com/create/oauth](https://airtable.com/create/oauth)
2. Register new integration
3. Set redirect URL
4. Add scopes: `data.records:read`, `data.records:write`, `webhook:manage`

**Required fields**: Support email, privacy policy URL, terms of service URL

```bash
AIRTABLE_CLIENT_ID=xxxxxxxxxxxxxxxx
AIRTABLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sources: [Airtable OAuth overview](https://support.airtable.com/docs/third-party-integrations-via-oauth-overview)

---

### Asana
**Free, developer sandbox available.**

1. Go to [app.asana.com/0/developer-console](https://app.asana.com/0/developer-console)
2. Create new app
3. Add OAuth redirect URL (must be HTTPS for non-native apps)

**Nice feature**: Free developer sandbox for testing premium features.

```bash
ASANA_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
ASANA_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sources: [Asana OAuth docs](https://developers.asana.com/docs/oauth)

---

## Tier 2: Moderate Setup (Some Requirements)

### Atlassian (Jira & Confluence)
**Same OAuth app works for both.**

1. Go to [developer.atlassian.com/console/myapps](https://developer.atlassian.com/console/myapps)
2. Create → OAuth 2.0 integration
3. Add permissions for Jira and/or Confluence
4. Configure callback URLs

**Key considerations:**
- Rotating refresh tokens (new token issued each refresh)
- Recommend using <50 scopes per app
- OAuth 1.0 is deprecated - use OAuth 2.0 (3LO)

```bash
JIRA_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
JIRA_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
CONFLUENCE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
CONFLUENCE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Sources: [Atlassian OAuth docs](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/)

---

### Salesforce
**Free Developer Edition required.**

1. Sign up for [Salesforce Developer Edition](https://developer.salesforce.com/signup) (free)
2. Setup → App Manager → New Connected App
3. Enable OAuth Settings
4. Add callback URL and scopes

**September 2025 changes:**
- Uninstalled connected apps blocked for most users
- OAuth Device Flow eliminated
- New permission: "Approve Uninstalled Connected Apps"

**Recommendation**: Install your connected app in your org to avoid disruption.

```bash
SALESFORCE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SALESFORCE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sources: [Salesforce Connected Apps](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_oauth_and_connected_apps.htm), [2025 changes](https://admin.salesforce.com/blog/2025/get-ready-for-changes-to-connected-app-usage-restrictions)

---

### HubSpot
**Free developer account, generous API limits.**

1. Go to [developers.hubspot.com](https://developers.hubspot.com/)
2. Create developer account
3. Create app → Auth tab → Get credentials
4. Add redirect URL and scopes

**Free tier limits**:
- 100 requests per 10 seconds
- 250,000 daily requests

**Token management**: Tokens expire every 6 months. Implement proactive refresh.

```bash
HUBSPOT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Sources: [HubSpot OAuth docs](https://developers.hubspot.com/docs/apps/legacy-apps/authentication/working-with-oauth)

---

### Dropbox
**Easy to start, production needs review.**

1. Go to [dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
2. Create app → Choose "Scoped access" and "Full Dropbox"
3. Add redirect URI
4. Set permissions in Permissions tab

**Development mode limitations:**
- Only your account connected initially
- Can enable up to 500 additional users
- Need 50 users linked before applying for production

**For personal use**: 500 user limit in dev mode is plenty.

```bash
DROPBOX_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
DROPBOX_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Sources: [Dropbox OAuth guide](https://developers.dropbox.com/oauth-guide)

---

### Shopify
**Free Partner account required.**

1. Sign up at [partners.shopify.com](https://partners.shopify.com)
2. Create custom app
3. Configure OAuth and scopes

**Important 2025 changes:**
- GraphQL Admin API required for all new public apps (as of April 1, 2025)
- REST Admin API is now "legacy"

**Revenue share**: 2.9% processing fee if you sell on the App Store, but for private/custom apps, no fees.

```bash
SHOPIFY_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
SHOPIFY_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

**Note**: Shopify access tokens don't expire and don't support refresh tokens.

Sources: [Shopify Partner Program](https://help.shopify.com/en/partners/partner-program/about)

---

### Reddit
**Free but rate-limited.**

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Create app → Choose "web app"
3. Add redirect URI

**Critical requirements:**
- **User-Agent required**: `<platform>:<app_id>:<version> (by /u/<username>)`
- Without proper User-Agent, you're heavily rate-limited

**Rate limits:**
- With OAuth: 100 requests per minute
- Without OAuth: 10 requests per minute
- Per OAuth client ID (shared across all users)

```bash
REDDIT_CLIENT_ID=xxxxxxxxxxxx
REDDIT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Sources: [Reddit Data API Wiki](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)

---

### Zoom
**OAuth only works for your account until marketplace approved.**

1. Go to [marketplace.zoom.us](https://marketplace.zoom.us)
2. Develop → Build App → OAuth
3. Configure scopes and redirect URL

**Key limitation**: "OAuth integration only works for the user account (the developer account) with which you created an app in Zoom marketplace unless the app is published."

**For personal use**: This is fine - just use your own account.

```bash
ZOOM_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
ZOOM_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Sources: [Zoom OAuth docs](https://developers.zoom.us/docs/integrations/oauth/)

---

### Pipedrive
**OAuth mandatory for marketplace apps.**

1. Register at Pipedrive Developer Hub
2. Create app with OAuth 2.0
3. Set up redirect page (required for public apps)

**Requirements for approval:**
- OAuth 2.0 for authentication (no API tokens)
- Refresh tokens before 60-minute expiry
- Polished installation/uninstallation flows
- Terms of Service webpage

```bash
PIPEDRIVE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
PIPEDRIVE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Sources: [Pipedrive OAuth authorization](https://pipedrive.readme.io/docs/marketplace-oauth-authorization)

---

### Webflow
**Workspace admin access needed for client secret.**

1. Create app in Webflow Dashboard
2. Add "Data Client" building block
3. Configure scopes

**Note**: "Only workspace administrators are authorized to view a client secret."

```bash
WEBFLOW_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
WEBFLOW_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Sources: [Webflow OAuth docs](https://developers.webflow.com/data/reference/oauth-app)

---

## Tier 3: Challenging (Costs, Verification, or Restrictions)

### X (Twitter)
**The expensive one.**

**Pricing (2025):**
| Tier | Monthly Cost | Posts/Month |
|------|-------------|-------------|
| Free | $0 | 500 (extremely limited) |
| Basic | $200/mo | 10,000 |
| Pro | $5,000/mo | 1,000,000 |
| Enterprise | $42,000/mo | 50M+ |

**Free tier reality:**
- 500 posts per month
- 1 request per 24 hours on most endpoints
- Only suitable for development/testing

**OAuth notes:**
- OAuth 2.0 for most modern features
- OAuth 1.0a still required for posting media

```bash
X_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
X_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

**Recommendation**: Unless you really need Twitter integration, skip it or use a third-party data service.

Sources: [X API Pricing](https://twitterapi.io/blog/twitter-api-pricing-2025)

---

### LinkedIn
**Requires company page verification.**

1. Go to [developer.linkedin.com](https://developer.linkedin.com/)
2. Create app
3. **Must verify with a LinkedIn Company Page**

**For individual developers:**
- Select "Default Company Page for Individual Developer" if no company

**Required**:
- Privacy policy URL (mandatory)
- Company page to associate with

**Token limitation**: Access tokens last only 60 days, then users must re-authorize.

```bash
LINKEDIN_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Sources: [LinkedIn API access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)

---

### Spotify
**Organizations only for extended quota (as of May 2025).**

**Development mode** (individual developers):
- Up to 25 Spotify users
- Good for personal use

**Extended quota mode** (since May 15, 2025):
- Organizations only
- Must apply through company email
- Unlimited users

**November 2025 security changes:**
- No more implicit grant flow
- No HTTP redirect URIs
- No localhost aliases (but `127.0.0.1` still works)

```bash
SPOTIFY_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
SPOTIFY_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

**For personal use**: Development mode with 25 users is sufficient.

Sources: [Spotify OAuth migration](https://developer.spotify.com/blog/2025-10-14-reminder-oauth-migration-27-nov-2025)

---

### WordPress (WordPress.com)
**Easy setup, but tokens expire frequently.**

1. Go to [developer.wordpress.com/apps](https://developer.wordpress.com/apps/)
2. Create new application
3. Add redirect URL

**Major limitation**: WordPress.com does NOT support refresh tokens. Users must re-authorize every ~2 weeks when tokens expire.

```bash
WORDPRESS_CLIENT_ID=xxxxx
WORDPRESS_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
```

---

### Wealthbox
**Requires partnership.**

You need to contact Wealthbox directly at [partners@wealthbox.com](mailto:partners@wealthbox.com) to request API access. This is not a self-service setup.

---

## Local Development Tips

### Using Your ngrok Clone (fwd.by-a.ninja)

Most OAuth providers require HTTPS. With your own tunnel service:

1. Set up tunnel to expose your local dev server
2. Use the tunnel URL as your redirect URI
3. Set environment variables:
   ```bash
   BETTER_AUTH_URL=https://your-tunnel.fwd.by-a.ninja
   NEXT_PUBLIC_APP_URL=https://your-tunnel.fwd.by-a.ninja
   ```

### Providers That Allow HTTP/Localhost

- **Dropbox**: Allows `http://localhost`
- **Spotify**: Allows `http://127.0.0.1` (not `localhost`)
- **Asana**: Native apps can use `urn:ietf:wg:oauth:2.0:oob`
- **Most providers**: Allow localhost in development mode

### Providers That Strictly Require HTTPS

- Google (production)
- Microsoft
- LinkedIn
- Salesforce
- Most enterprise providers

---

## Minimum Viable Setup

If you want to get started quickly with the most useful integrations:

### Phase 1: Easy Wins (30 minutes total)
1. **GitHub** - 5 min
2. **Google** (using your Workspace account) - 10 min
3. **Slack** - 5 min
4. **Notion** - 5 min
5. **Linear** - 5 min

### Phase 2: Useful Additions (1 hour)
1. **Microsoft** - 15 min
2. **Airtable** - 10 min
3. **Dropbox** - 10 min
4. **Asana** - 10 min
5. **HubSpot** - 15 min

### Phase 3: As Needed
- Atlassian (Jira/Confluence) if you use them
- Salesforce if you use it
- Zoom for meeting integrations
- Skip X/Twitter unless you really need it ($200+/mo)

---

## Environment Variables Template

```bash
# ============================================
# OAUTH CREDENTIALS - Self-Hosted Setup
# ============================================

# Tier 1: Easy Setup (do these first)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
AIRTABLE_CLIENT_ID=
AIRTABLE_CLIENT_SECRET=
ASANA_CLIENT_ID=
ASANA_CLIENT_SECRET=

# Tier 2: Moderate Setup
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
JIRA_CLIENT_ID=
JIRA_CLIENT_SECRET=
CONFLUENCE_CLIENT_ID=
CONFLUENCE_CLIENT_SECRET=
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
DROPBOX_CLIENT_ID=
DROPBOX_CLIENT_SECRET=
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
PIPEDRIVE_CLIENT_ID=
PIPEDRIVE_CLIENT_SECRET=
WEBFLOW_CLIENT_ID=
WEBFLOW_CLIENT_SECRET=

# Tier 3: Challenging
X_CLIENT_ID=
X_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
WORDPRESS_CLIENT_ID=
WORDPRESS_CLIENT_SECRET=
WEALTHBOX_CLIENT_ID=
WEALTHBOX_CLIENT_SECRET=
```

---

## Summary

**The good news**: Most providers are free and can be set up in 10-15 minutes each. Your legacy Google Workspace account is a significant advantage.

**The realistic news**:
- X/Twitter is expensive ($200+/mo for anything useful)
- LinkedIn requires company page verification
- Spotify limits individuals to 25 users
- Some providers (Wealthbox) require partnership discussions

**For home network use**: Your setup with `fwd.by-a.ninja` and reverse SSH tunnels will work perfectly. Most providers support development/personal use with minimal requirements.

**Estimated total time**: 4-6 hours to set up all providers, with most of that time spent on the more complex ones (Salesforce, Atlassian, etc.).
