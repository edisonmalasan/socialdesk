# Scheduled Posts Module

## Purpose

The Scheduled Posts module publishes due scheduled posts from the database. It uses BullMQ backed by Redis so multiple backend instances can safely share scheduling and publishing work.

## Runtime Flow

A BullMQ scheduler runs on `SCHEDULED_POSTS_SCHEDULER_PATTERN`, which defaults to every minute.

Each tick:

1. Loads due scheduled targets.
2. Enqueues one publish job per due `post_targets.id` with a stable job id.
3. The publish worker claims each pending target by changing it to `publishing`.
4. Loads the target social account and OAuth token through Social Connections.
5. Dispatches publishing by platform code.
6. Marks the target as `published` or, after the final BullMQ retry, `failed`.
7. Updates the parent post status when all targets are finished.

The queue runtime starts from `server.js`. Importing `src/app.js` does not start background work.

## Environment Variables

| Name | Default | Purpose |
| --- | --- | --- |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection string used by BullMQ. |
| `SCHEDULED_POSTS_QUEUE_ENABLED` | `true` | Set to `false` to disable the queue runtime. |
| `SCHEDULED_POSTS_SCHEDULER_PATTERN` | `* * * * *` | Cron pattern for scheduled enqueueing. |
| `SCHEDULED_POSTS_BATCH_SIZE` | `10` | Maximum due targets enqueued per scheduler run. |
| `SCHEDULED_POSTS_QUEUE_ATTEMPTS` | `3` | Publish job attempts before final failure. |
| `SCHEDULED_POSTS_QUEUE_BACKOFF_DELAY_MS` | `30000` | Initial exponential backoff delay. |
| `SCHEDULED_POSTS_QUEUE_CONCURRENCY` | `5` | Number of publish jobs processed concurrently. |

The legacy `SCHEDULED_POSTS_CRON_ENABLED` and `SCHEDULED_POSTS_CRON_EXPRESSION` names are still accepted as fallbacks.

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

- `scheduled-posts.queue.js` owns BullMQ startup, shutdown, scheduler setup, and worker creation.
- `scheduled-posts.service.js` owns due target enqueueing, execution flow, retry-aware failure handling, and provider dispatch.
- `scheduled-posts.repository.js` owns `posts` and `post_targets` reads/writes.

## Limitations

Redis must be available before starting the backend with scheduled publishing enabled. Analytics, notifications, and automatic token refresh before publish are intentionally out of scope for this version.
