# Self-Hosted OAuth Provider Setup Guide

This guide explains how to set up OAuth integrations for a self-hosted Sim deployment. Each service requires you to create a developer application and configure the OAuth credentials.

## Table of Contents

1. [Overview](#overview)
2. [Redirect URI Configuration](#redirect-uri-configuration)
3. [Google Services](#google-services)
4. [Microsoft Services](#microsoft-services)
5. [GitHub](#github)
6. [Slack](#slack)
7. [Atlassian (Jira & Confluence)](#atlassian-jira--confluence)
8. [Notion](#notion)
9. [Linear](#linear)
10. [Airtable](#airtable)
11. [Dropbox](#dropbox)
12. [HubSpot](#hubspot)
13. [Salesforce](#salesforce)
14. [Pipedrive](#pipedrive)
15. [Asana](#asana)
16. [Trello](#trello)
17. [Shopify](#shopify)
18. [Zoom](#zoom)
19. [LinkedIn](#linkedin)
20. [Reddit](#reddit)
21. [X (Twitter)](#x-twitter)
22. [Webflow](#webflow)
23. [WordPress](#wordpress)
24. [Spotify](#spotify)
25. [Wealthbox](#wealthbox)
26. [Environment Variables Summary](#environment-variables-summary)

---

## Overview

For self-hosted deployments, you need to create your own OAuth applications with each service provider. This involves:

1. Creating a developer account/app with the service
2. Configuring the OAuth redirect URIs
3. Obtaining Client ID and Client Secret
4. Setting environment variables in your deployment

**Important:** All OAuth redirect URIs follow this pattern:
```
https://your-domain.com/api/auth/oauth2/callback/[provider]
```

---

## Redirect URI Configuration

For each provider, you'll need to set up redirect URIs. Replace `https://your-domain.com` with your actual deployment URL.

| Provider | Redirect URI |
|----------|-------------|
| Google | `https://your-domain.com/api/auth/oauth2/callback/google` |
| Microsoft | `https://your-domain.com/api/auth/oauth2/callback/microsoft` |
| GitHub | `https://your-domain.com/api/auth/oauth2/callback/github` |
| Slack | `https://your-domain.com/api/auth/oauth2/callback/slack` |
| Jira | `https://your-domain.com/api/auth/oauth2/callback/jira` |
| Confluence | `https://your-domain.com/api/auth/oauth2/callback/confluence` |
| Notion | `https://your-domain.com/api/auth/oauth2/callback/notion` |
| Linear | `https://your-domain.com/api/auth/oauth2/callback/linear` |
| Airtable | `https://your-domain.com/api/auth/oauth2/callback/airtable` |
| Dropbox | `https://your-domain.com/api/auth/oauth2/callback/dropbox` |
| HubSpot | `https://your-domain.com/api/auth/oauth2/callback/hubspot` |
| Salesforce | `https://your-domain.com/api/auth/oauth2/callback/salesforce` |
| Pipedrive | `https://your-domain.com/api/auth/oauth2/callback/pipedrive` |
| Asana | `https://your-domain.com/api/auth/oauth2/callback/asana` |
| Shopify | `https://your-domain.com/api/auth/oauth2/callback/shopify` |
| Zoom | `https://your-domain.com/api/auth/oauth2/callback/zoom` |
| LinkedIn | `https://your-domain.com/api/auth/oauth2/callback/linkedin` |
| Reddit | `https://your-domain.com/api/auth/oauth2/callback/reddit` |
| X | `https://your-domain.com/api/auth/oauth2/callback/x` |
| Webflow | `https://your-domain.com/api/auth/oauth2/callback/webflow` |
| WordPress | `https://your-domain.com/api/auth/oauth2/callback/wordpress` |
| Spotify | `https://your-domain.com/api/auth/oauth2/callback/spotify` |
| Wealthbox | `https://your-domain.com/api/auth/oauth2/callback/wealthbox` |

---

## Google Services

Google OAuth covers: **Gmail, Google Drive, Google Docs, Google Sheets, Google Forms, Google Calendar, Google Vault, Google Groups, Vertex AI**

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name your project (e.g., "Sim Studio")
4. Click **Create**

### Step 2: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable the following APIs:
   - Gmail API
   - Google Drive API
   - Google Sheets API
   - Google Docs API
   - Google Calendar API
   - Google Forms API
   - Admin SDK API (for Google Groups)
   - Google Vault API
   - Vertex AI API (if using Vertex AI)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (or Internal if using Google Workspace)
3. Fill in the required fields:
   - App name: "Sim Studio" (or your custom name)
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. Add the following scopes:
   ```
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/gmail.labels
   https://www.googleapis.com/auth/drive.file
   https://www.googleapis.com/auth/drive
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/forms.responses.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   https://www.googleapis.com/auth/ediscovery
   https://www.googleapis.com/auth/admin.directory.group
   https://www.googleapis.com/auth/admin.directory.group.member
   https://www.googleapis.com/auth/cloud-platform
   ```
6. Add test users (required during development/testing)
7. Click **Save and Continue**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "Sim Studio"
5. Authorized redirect URIs:
   ```
   https://your-domain.com/api/auth/oauth2/callback/google
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 5: Environment Variables

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Publishing for Production

For production use with external users:
1. Go to **OAuth consent screen**
2. Click **Publish App**
3. Complete Google's verification process (may require privacy policy, terms of service, and domain verification)

---

## Microsoft Services

Microsoft OAuth covers: **Outlook, OneDrive, SharePoint, Microsoft Excel, Microsoft Planner, Microsoft Teams**

### Step 1: Create Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: "Sim Studio"
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: Web - `https://your-domain.com/api/auth/oauth2/callback/microsoft`
5. Click **Register**

### Step 2: Configure API Permissions

1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph**
3. Choose **Delegated permissions**
4. Add the following permissions:
   ```
   openid
   profile
   email
   offline_access
   User.Read
   Mail.ReadWrite
   Mail.ReadBasic
   Mail.Read
   Mail.Send
   Files.Read
   Files.ReadWrite
   Sites.Read.All
   Sites.ReadWrite.All
   Sites.Manage.All
   Group.Read.All
   Group.ReadWrite.All
   Tasks.ReadWrite
   Chat.Read
   Chat.ReadWrite
   Chat.ReadBasic
   ChatMessage.Send
   Channel.ReadBasic.All
   ChannelMessage.Send
   ChannelMessage.Read.All
   ChannelMessage.ReadWrite
   ChannelMember.Read.All
   Team.ReadBasic.All
   TeamMember.Read.All
   ```
5. Click **Grant admin consent** (if you have admin access)

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: "Sim Studio Secret"
4. Expiry: Choose appropriate duration (24 months recommended)
5. Click **Add**
6. **Copy the secret value immediately** (it won't be shown again)

### Step 4: Environment Variables

```bash
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
```

---

## GitHub

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - Application name: "Sim Studio"
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-domain.com/api/auth/oauth2/callback/github`
4. Click **Register application**

### Step 2: Generate Client Secret

1. Click **Generate a new client secret**
2. Copy the **Client ID** and **Client Secret**

### Step 3: Environment Variables

```bash
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

**Note:** For repository access features, you may also need:
```bash
GITHUB_REPO_CLIENT_ID=your-repo-client-id
GITHUB_REPO_CLIENT_SECRET=your-repo-client-secret
```

---

## Slack

### Step 1: Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App Name: "Sim Studio"
4. Select your workspace
5. Click **Create App**

### Step 2: Configure OAuth & Permissions

1. Go to **OAuth & Permissions**
2. Add Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/slack`
3. Under **Scopes** → **Bot Token Scopes**, add:
   ```
   channels:read
   channels:history
   groups:read
   groups:history
   chat:write
   chat:write.public
   im:write
   im:history
   im:read
   users:read
   files:write
   files:read
   canvases:write
   reactions:write
   ```

### Step 3: Install App

1. Go to **Install App**
2. Click **Install to Workspace**
3. Authorize the permissions

### Step 4: Get Credentials

1. Go to **Basic Information**
2. Copy **Client ID** and **Client Secret**

### Step 5: Environment Variables

```bash
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
```

---

## Atlassian (Jira & Confluence)

Both Jira and Confluence use Atlassian's OAuth 2.0 (3LO).

### Step 1: Create Atlassian Developer App

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Click **Create** → **OAuth 2.0 integration**
3. Name: "Sim Studio"
4. Click **Create**

### Step 2: Configure Permissions

1. Go to **Permissions**
2. For **Jira**, add:
   - Jira API: `read:jira-user`, `read:jira-work`, `write:jira-work`
   - Add granular scopes as needed (issues, projects, comments, etc.)
3. For **Confluence**, add:
   - Confluence API: `read:confluence-content.all`, `write:confluence-content`, etc.

### Step 3: Configure Authorization

1. Go to **Authorization**
2. Add callback URL:
   - For Jira: `https://your-domain.com/api/auth/oauth2/callback/jira`
   - For Confluence: `https://your-domain.com/api/auth/oauth2/callback/confluence`

### Step 4: Get Credentials

1. Go to **Settings**
2. Copy **Client ID** and **Secret**

### Step 5: Environment Variables

```bash
# For Jira
JIRA_CLIENT_ID=your-jira-client-id
JIRA_CLIENT_SECRET=your-jira-client-secret

# For Confluence
CONFLUENCE_CLIENT_ID=your-confluence-client-id
CONFLUENCE_CLIENT_SECRET=your-confluence-client-secret
```

---

## Notion

### Step 1: Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Name: "Sim Studio"
4. Select a workspace
5. Click **Submit**

### Step 2: Configure OAuth

1. Go to **Distribution** tab
2. Enable **Public integration**
3. Add Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/notion`
4. Fill in company info and links

### Step 3: Get Credentials

1. Go to **Secrets** tab
2. Copy **OAuth client ID** and **OAuth client secret**

### Step 4: Environment Variables

```bash
NOTION_CLIENT_ID=your-client-id
NOTION_CLIENT_SECRET=your-client-secret
```

---

## Linear

### Step 1: Create Linear OAuth App

1. Go to [Linear Settings](https://linear.app/settings/api) → **OAuth Applications**
2. Click **New Application**
3. Name: "Sim Studio"
4. Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/linear`
5. Click **Create**

### Step 2: Get Credentials

Copy the **Client ID** and **Client Secret**

### Step 3: Environment Variables

```bash
LINEAR_CLIENT_ID=your-client-id
LINEAR_CLIENT_SECRET=your-client-secret
```

---

## Airtable

### Step 1: Create Airtable OAuth Integration

1. Go to [Airtable Developer Hub](https://airtable.com/create/oauth)
2. Click **Register new OAuth integration**
3. Name: "Sim Studio"
4. Add Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/airtable`
5. Add scopes:
   - `data.records:read`
   - `data.records:write`
   - `user.email:read`
   - `webhook:manage`

### Step 2: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 3: Environment Variables

```bash
AIRTABLE_CLIENT_ID=your-client-id
AIRTABLE_CLIENT_SECRET=your-client-secret
```

---

## Dropbox

### Step 1: Create Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **Create app**
3. Choose **Scoped access**
4. Choose **Full Dropbox** access
5. Name your app: "Sim Studio"
6. Click **Create app**

### Step 2: Configure OAuth

1. Go to **Settings** tab
2. Add Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/dropbox`
3. Under **Permissions** tab, enable:
   - `account_info.read`
   - `files.metadata.read`
   - `files.metadata.write`
   - `files.content.read`
   - `files.content.write`
   - `sharing.read`
   - `sharing.write`

### Step 3: Get Credentials

Copy **App key** (Client ID) and **App secret** (Client Secret)

### Step 4: Environment Variables

```bash
DROPBOX_CLIENT_ID=your-app-key
DROPBOX_CLIENT_SECRET=your-app-secret
```

---

## HubSpot

### Step 1: Create HubSpot App

1. Go to [HubSpot Developer](https://developers.hubspot.com/)
2. Click **Manage apps** → **Create app**
3. Name: "Sim Studio"
4. Go to **Auth** tab

### Step 2: Configure OAuth

1. Add Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/hubspot`
2. Add scopes:
   ```
   crm.objects.contacts.read
   crm.objects.contacts.write
   crm.objects.companies.read
   crm.objects.companies.write
   crm.objects.deals.read
   crm.objects.deals.write
   crm.objects.owners.read
   crm.lists.read
   crm.lists.write
   tickets
   ```

### Step 3: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 4: Environment Variables

```bash
HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-client-secret
```

---

## Salesforce

### Step 1: Create Salesforce Connected App

1. Go to **Setup** → **App Manager**
2. Click **New Connected App**
3. Fill in:
   - Connected App Name: "Sim Studio"
   - API Name: "Sim_Studio"
   - Contact Email: your email
4. Enable **OAuth Settings**
5. Callback URL: `https://your-domain.com/api/auth/oauth2/callback/salesforce`
6. Add OAuth Scopes:
   - `api`
   - `refresh_token`
   - `openid`
   - `offline_access`
7. Click **Save**

### Step 2: Get Credentials

1. After creation, go to **Manage Consumer Details**
2. Copy **Consumer Key** (Client ID) and **Consumer Secret**

### Step 3: Environment Variables

```bash
SALESFORCE_CLIENT_ID=your-consumer-key
SALESFORCE_CLIENT_SECRET=your-consumer-secret
```

---

## Pipedrive

### Step 1: Create Pipedrive App

1. Go to [Pipedrive Developer Hub](https://developers.pipedrive.com/)
2. Click **Create an app**
3. Choose **OAuth app**
4. Name: "Sim Studio"
5. Add Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/pipedrive`

### Step 2: Configure Scopes

Add the following scopes:
- `base`
- `deals:full`
- `contacts:full`
- `leads:full`
- `activities:full`
- `mail:full`
- `projects:full`

### Step 3: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 4: Environment Variables

```bash
PIPEDRIVE_CLIENT_ID=your-client-id
PIPEDRIVE_CLIENT_SECRET=your-client-secret
```

---

## Asana

### Step 1: Create Asana App

1. Go to [Asana Developer Console](https://app.asana.com/0/developer-console)
2. Click **Create new app**
3. Name: "Sim Studio"
4. Add Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/asana`

### Step 2: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 3: Environment Variables

```bash
ASANA_CLIENT_ID=your-client-id
ASANA_CLIENT_SECRET=your-client-secret
```

---

## Trello

Trello uses API Key authentication (not standard OAuth).

### Step 1: Get Trello API Key

1. Go to [Trello Power-Ups Admin](https://trello.com/power-ups/admin)
2. Create a new Power-Up or use the API Key page
3. Copy your **API Key**

### Step 2: Environment Variables

```bash
TRELLO_API_KEY=your-api-key
```

---

## Shopify

### Step 1: Create Shopify App

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Create a new app → **Custom app**
3. Name: "Sim Studio"

### Step 2: Configure OAuth

1. Add Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/shopify`
2. Add scopes:
   - `write_products`
   - `write_orders`
   - `write_customers`
   - `write_inventory`
   - `read_locations`
   - `write_merchant_managed_fulfillment_orders`

### Step 3: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 4: Environment Variables

```bash
SHOPIFY_CLIENT_ID=your-client-id
SHOPIFY_CLIENT_SECRET=your-client-secret
```

**Note:** Shopify access tokens don't expire and don't support refresh tokens.

---

## Zoom

### Step 1: Create Zoom App

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Click **Develop** → **Build App**
3. Choose **OAuth** app type
4. Name: "Sim Studio"

### Step 2: Configure OAuth

1. Add Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/zoom`
2. Add scopes:
   - `user:read:user`
   - `meeting:write:meeting`
   - `meeting:read:meeting`
   - `meeting:read:list_meetings`
   - `meeting:update:meeting`
   - `meeting:delete:meeting`
   - `meeting:read:invitation`
   - `cloud_recording:read:list_user_recordings`
   - `cloud_recording:read:list_recording_files`
   - `cloud_recording:delete:recording_file`

### Step 3: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 4: Environment Variables

```bash
ZOOM_CLIENT_ID=your-client-id
ZOOM_CLIENT_SECRET=your-client-secret
```

---

## LinkedIn

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click **Create app**
3. Fill in app details
4. Select company page (required)

### Step 2: Configure OAuth

1. Go to **Auth** tab
2. Add Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/linkedin`
3. Request access to products:
   - **Share on LinkedIn**
   - **Sign In with LinkedIn using OpenID Connect**

### Step 3: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 4: Environment Variables

```bash
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
```

---

## Reddit

### Step 1: Create Reddit App

1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click **create another app...**
3. Choose **web app**
4. Name: "Sim Studio"
5. Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/reddit`
6. Click **create app**

### Step 2: Get Credentials

- **Client ID**: The string under "web app" (after the app name)
- **Client Secret**: The "secret" field

### Step 3: Environment Variables

```bash
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
```

---

## X (Twitter)

### Step 1: Create X Developer App

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a project and app
3. Go to **User authentication settings**

### Step 2: Configure OAuth 2.0

1. Enable **OAuth 2.0**
2. Type of App: **Web App**
3. Callback URL: `https://your-domain.com/api/auth/oauth2/callback/x`
4. Add scopes:
   - `tweet.read`
   - `tweet.write`
   - `users.read`
   - `offline.access`

### Step 3: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 4: Environment Variables

```bash
X_CLIENT_ID=your-client-id
X_CLIENT_SECRET=your-client-secret
```

---

## Webflow

### Step 1: Create Webflow App

1. Go to [Webflow Dashboard](https://webflow.com/dashboard)
2. Go to **Apps & Integrations**
3. Click **Create New App**
4. Name: "Sim Studio"

### Step 2: Configure OAuth

1. Add Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/webflow`
2. Add scopes:
   - `cms:read`
   - `cms:write`
   - `sites:read`
   - `sites:write`

### Step 3: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 4: Environment Variables

```bash
WEBFLOW_CLIENT_ID=your-client-id
WEBFLOW_CLIENT_SECRET=your-client-secret
```

---

## WordPress

WordPress.com OAuth (not self-hosted WordPress sites).

### Step 1: Create WordPress.com App

1. Go to [WordPress.com Developer](https://developer.wordpress.com/apps/)
2. Click **Create New Application**
3. Fill in:
   - Name: "Sim Studio"
   - Description: Your description
   - Website URL: `https://your-domain.com`
   - Redirect URL: `https://your-domain.com/api/auth/oauth2/callback/wordpress`

### Step 2: Get Credentials

Copy **Client ID** and **Client Secret**

### Step 3: Environment Variables

```bash
WORDPRESS_CLIENT_ID=your-client-id
WORDPRESS_CLIENT_SECRET=your-client-secret
```

**Note:** WordPress.com does NOT support refresh tokens. Users need to re-authorize when tokens expire (~2 weeks).

---

## Spotify

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Name: "Sim Studio"
4. Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/spotify`
5. Select **Web API** and **Web Playback SDK**

### Step 2: Get Credentials

Go to **Settings** and copy **Client ID** and **Client Secret**

### Step 3: Environment Variables

```bash
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
```

---

## Wealthbox

### Step 1: Contact Wealthbox

Wealthbox requires direct partnership. Contact Wealthbox at [partners@wealthbox.com](mailto:partners@wealthbox.com) to request API access.

### Step 2: Configure OAuth

Once approved:
1. Add Redirect URI: `https://your-domain.com/api/auth/oauth2/callback/wealthbox`
2. Request scopes: `login`, `data`

### Step 3: Environment Variables

```bash
WEALTHBOX_CLIENT_ID=your-client-id
WEALTHBOX_CLIENT_SECRET=your-client-secret
```

---

## Environment Variables Summary

Here's a complete list of all OAuth-related environment variables:

```bash
# ============================================
# OAUTH PROVIDER CREDENTIALS
# ============================================

# Google (Gmail, Drive, Docs, Sheets, Calendar, Forms, Vault, Groups, Vertex AI)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Microsoft (Outlook, OneDrive, SharePoint, Excel, Planner, Teams)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REPO_CLIENT_ID=
GITHUB_REPO_CLIENT_SECRET=

# Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# Atlassian
JIRA_CLIENT_ID=
JIRA_CLIENT_SECRET=
CONFLUENCE_CLIENT_ID=
CONFLUENCE_CLIENT_SECRET=

# Productivity
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
AIRTABLE_CLIENT_ID=
AIRTABLE_CLIENT_SECRET=
ASANA_CLIENT_ID=
ASANA_CLIENT_SECRET=
TRELLO_API_KEY=

# Cloud Storage
DROPBOX_CLIENT_ID=
DROPBOX_CLIENT_SECRET=

# CRM
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
PIPEDRIVE_CLIENT_ID=
PIPEDRIVE_CLIENT_SECRET=
WEALTHBOX_CLIENT_ID=
WEALTHBOX_CLIENT_SECRET=

# E-commerce
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=

# Communication & Meetings
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# Social Media
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
X_CLIENT_ID=
X_CLIENT_SECRET=

# Web/Content
WEBFLOW_CLIENT_ID=
WEBFLOW_CLIENT_SECRET=
WORDPRESS_CLIENT_ID=
WORDPRESS_CLIENT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

---

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Ensure the redirect URI in your OAuth app exactly matches the pattern `https://your-domain.com/api/auth/oauth2/callback/[provider]`

2. **"Missing client credentials"**: Check that both `CLIENT_ID` and `CLIENT_SECRET` environment variables are set for the provider.

3. **"Token refresh failed"**: Some providers (WordPress, Shopify) don't support refresh tokens. Users need to re-authorize periodically.

4. **"Insufficient scopes"**: Ensure all required scopes are added to your OAuth app configuration.

5. **HTTPS required**: Most OAuth providers require HTTPS redirect URIs. Use a valid SSL certificate in production.

### Testing OAuth Locally

For local development, you can:
1. Use a tool like [ngrok](https://ngrok.com/) to create an HTTPS tunnel
2. Add the ngrok URL as a redirect URI in your OAuth apps
3. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your ngrok URL

---

## Security Recommendations

1. **Store secrets securely**: Never commit OAuth secrets to version control. Use environment variables or secret management tools.

2. **Rotate secrets periodically**: Regenerate client secrets every 6-12 months.

3. **Use least privilege**: Only request the scopes you actually need.

4. **Monitor OAuth usage**: Check provider dashboards for unusual activity.

5. **Review connected apps**: Periodically audit which users have connected accounts.
