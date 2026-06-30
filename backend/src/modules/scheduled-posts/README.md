# Scheduled Posts Module

## Purpose

The Scheduled Posts module publishes due scheduled posts from the database. It runs from an in-process cron worker and uses provider modules for the actual platform API calls.

## Runtime Flow

The cron worker runs on `SCHEDULED_POSTS_CRON_EXPRESSION`, which defaults to every minute.

Each tick:

1. Loads due scheduled targets.
2. Claims each pending target by changing it to `publishing`.
3. Loads the target social account and OAuth token through Social Connections.
4. Dispatches publishing by platform code.
5. Marks the target as `published` or `failed`.
6. Updates the parent post status when all targets are finished.

The cron starts from `server.js`. Importing `src/app.js` does not start background work.

## Environment Variables

| Name | Default | Purpose |
| --- | --- | --- |
| `SCHEDULED_POSTS_CRON_ENABLED` | `true` | Set to `false` to disable the worker. |
| `SCHEDULED_POSTS_CRON_EXPRESSION` | `* * * * *` | Cron expression for scheduled execution. |
| `SCHEDULED_POSTS_BATCH_SIZE` | `10` | Maximum due targets processed per tick. |

## Database Statuses

The scheduler reads:

- `posts.status = scheduled`
- `posts.scheduled_at <= now`
- `post_targets.status = pending`

Target status transitions:

```text
pending -> publishing -> published
pending -> publishing -> failed
```

Parent post status updates:

- `published` when all targets are published
- `failed` when all targets are terminal and at least one failed
- remains `scheduled` while any target is still pending or publishing

## Provider Rules

Supported platform codes:

- `facebook`
- `instagram`
- `pinterest`

Facebook uses:

- `posts.body_text` as message
- `posts.link_url` as optional link
- first `posts.media_urls` item as optional media link

Instagram uses:

- first `posts.media_urls` item as required media
- `posts.body_text` as caption
- `content_types.code` of `reel` or `video` to publish as Reel
- image publishing for other content types

Pinterest uses:

- first `posts.media_urls` item as required image
- `posts.body_text` as description
- `posts.link_url` as optional destination link
- `posts.metadata.pinterest.board_id` as required board id

Missing required provider data fails only that target and stores the reason in `post_targets.error_message`.

## Module Files

- `scheduled-posts.cron.js` owns cron startup, shutdown, and overlap prevention.
- `scheduled-posts.service.js` owns execution flow and provider dispatch.
- `scheduled-posts.repository.js` owns `posts` and `post_targets` reads/writes.

## Limitations

This worker is designed for a single backend process. The target claim step prevents most duplicate work inside one process, but it is not a full distributed lock. Add a stronger locking strategy before running multiple scheduler workers in production.

Retries, backoff, analytics, notifications, and automatic token refresh before publish are intentionally out of scope for the first version.
