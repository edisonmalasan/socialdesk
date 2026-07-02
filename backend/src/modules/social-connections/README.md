# Social Connections Module

## Purpose

The Social Connections module owns persisted social platform identity and OAuth token records. Provider modules call this module when they need to look up platform IDs, save linked accounts, save OAuth tokens, or refresh an account token.

## Public Module API

`social-connections.service.js` exports:

- `getPlatformId(platformCode)`
- `upsertSocialAccount(accountData)`
- `upsertOAuthToken(tokenData)`
- `getSocialAccountWithToken(socialAccountId)`
- `getPublishingConnection(socialAccountId)`

Provider modules should use these functions instead of importing the Supabase client directly.

## Data Ownership

Owned tables:

- `platforms`
- `social_accounts`
- `oauth_tokens`

The current upsert behavior is preserved: the repository first checks for an existing record and then updates or inserts with the same fields used before the modulith migration.

## Dependencies

- Infrastructure: `src/infrastructure/database/supabaseClient.js`
- Environment variables: `SUPABASE_URL`, `SUPABASE_KEY`

## Workflows

- Facebook and Instagram callbacks save linked accounts and page access tokens through this module.
- Pinterest callbacks save linked accounts and Pinterest OAuth token data through this module.
- Meta token refresh retrieves the current token through `getSocialAccountWithToken` and writes the replacement through `upsertOAuthToken`.
- Scheduled post execution loads platform and token data through `getPublishingConnection`.

## Known Limits

This module does not own provider OAuth exchanges or publishing. It stores connection state only.
