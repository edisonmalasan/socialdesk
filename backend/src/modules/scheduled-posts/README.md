# Scheduled Posts Module

## Purpose

The Scheduled Posts module publishes scheduled posts with BullMQ delayed jobs backed by Redis. Supabase remains the source of truth, while Redis owns the timer and retry mechanics.

## Runtime Flow

Normal scheduling is event-driven:

1. A scheduled post is saved in Supabase.
2. The post API asks the backend to schedule jobs for that post.
3. The backend adds one delayed BullMQ publish job per pending `post_targets.id`.
4. Redis holds each job until `posts.scheduled_at`.
5. The publish worker fetches the latest post and target data from Supabase.
6. The worker claims each pending target by changing it to `publishing`.
7. The worker loads the target social account and OAuth token through Social Connections.
8. The worker dispatches publishing by platform code.
9. The worker marks the target as `published` or, after the final BullMQ retry, `failed`.
10. The worker updates the parent post status when all targets are finished.

When a scheduled post is edited, the API removes the old delayed jobs for that post and adds new ones with the updated schedule. When a scheduled post is deleted or moved out of `scheduled`, the API removes pending delayed jobs.

## Recovery Scanner

A BullMQ recovery scheduler also runs on `SCHEDULED_POSTS_RECOVERY_PATTERN`, which defaults to every 15 minutes. This is not the primary scheduler. It exists to repair missed jobs, for example if Redis or the backend was unavailable when a scheduled post was created.

Each recovery run:

1. Loads due scheduled targets that are still pending.
2. Enqueues missing publish jobs with stable job ids.
3. Lets BullMQ workers publish them through the same retry-aware path.

The queue runtime starts from `server.js`. Importing `src/app.js` does not start background work.

## API Integration

The frontend post API calls these backend endpoints after Supabase writes:

- `POST /api/scheduled-posts/:postId/jobs` schedules delayed jobs for one scheduled post.
- `DELETE /api/scheduled-posts/:postId/jobs` removes pending delayed jobs for one post.

Set `BACKEND_API_URL` or `NEXT_PUBLIC_BACKEND_API_URL` for the frontend server if the backend is not running at `http://localhost:5000/api`.

## Environment Variables

| Name                                     | Default                  | Purpose                                           |
| ---------------------------------------- | ------------------------ | ------------------------------------------------- |
| `REDIS_URL`                              | `redis://127.0.0.1:6379` | Redis connection string used by BullMQ.           |
| `SCHEDULED_POSTS_QUEUE_ENABLED`          | `true`                   | Set to `false` to disable the queue runtime.      |
| `SCHEDULED_POSTS_RECOVERY_ENABLED`       | `true`                   | Set to `false` to disable the recovery scanner.   |
| `SCHEDULED_POSTS_RECOVERY_PATTERN`       | `*/15 * * * *`           | Cron pattern for missed-job recovery.             |
| `SCHEDULED_POSTS_BATCH_SIZE`             | `10`                     | Maximum due targets recovered per scheduler run.  |
| `SCHEDULED_POSTS_QUEUE_ATTEMPTS`         | `3`                      | Publish job attempts before final failure.        |
| `SCHEDULED_POSTS_QUEUE_BACKOFF_DELAY_MS` | `30000`                  | Initial exponential backoff delay.                |
| `SCHEDULED_POSTS_QUEUE_CONCURRENCY`      | `5`                      | Number of publish jobs processed concurrently.    |

The legacy `SCHEDULED_POSTS_CRON_ENABLED`, `SCHEDULED_POSTS_CRON_EXPRESSION`, and `SCHEDULED_POSTS_SCHEDULER_PATTERN` names are still accepted as fallbacks.

## Database Statuses

The worker publishes only when:

- `posts.status = scheduled`
- `posts.scheduled_at` is present
- `post_targets.status = pending`

The recovery scanner additionally requires `posts.scheduled_at <= now`.

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

- `scheduled-posts.queue.js` owns BullMQ startup, shutdown, delayed job scheduling, recovery scheduler setup, and worker creation.
- `scheduled-posts.service.js` owns target enqueueing, execution flow, retry-aware failure handling, and provider dispatch.
- `scheduled-posts.controller.js` and `scheduled-posts.routes.js` expose post-level schedule/cancel endpoints.
- `scheduled-posts.repository.js` owns `posts` and `post_targets` reads/writes.

## Limitations

Redis must be available for delayed scheduling and publishing. If Redis is unavailable when a post is created, the Supabase write can still succeed, and the recovery scanner can enqueue the missed job later after Redis is healthy. Analytics, notifications, and automatic token refresh before publish are intentionally out of scope for this version.
