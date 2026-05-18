CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CORE ENTITIES
-- Platform types (Facebook, TikTok, Instagram, etc.)
CREATE TABLE platforms (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    api_base_url VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Users of the management platform (added by admins, no self-registration)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    profile_url     VARCHAR(500),
    timezone        VARCHAR(50) DEFAULT 'UTC',
    role            VARCHAR(20) DEFAULT 'user',  -- admin, user
    status          VARCHAR(20) DEFAULT 'active',  -- active, inactive, pending
    created_by      UUID REFERENCES users(id),  -- admin who added this user
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Connected social accounts (user's Facebook page, TikTok profile, etc.)
CREATE TABLE social_accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_id     INTEGER NOT NULL REFERENCES platforms(id),
    external_id     VARCHAR(255) NOT NULL,
    username        VARCHAR(255),
    display_name    VARCHAR(255),
    profile_url     VARCHAR(500),
    avatar_url      VARCHAR(500),
    metadata        JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT true,
    connected_at    TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at  TIMESTAMPTZ,
    UNIQUE(platform_id, external_id)
);

CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform_id);

-- OAuth tokens for connected social accounts (access_token, refresh_token, etc.)
CREATE TABLE oauth_tokens (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    social_account_id   UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    access_token        TEXT NOT NULL,
    refresh_token       TEXT,
    token_type          VARCHAR(50) DEFAULT 'Bearer',
    expires_at          TIMESTAMPTZ,
    scope               VARCHAR(500),
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(social_account_id)
);

CREATE INDEX idx_oauth_tokens_account ON oauth_tokens(social_account_id);
CREATE INDEX idx_oauth_tokens_expires ON oauth_tokens(expires_at) WHERE expires_at IS NOT NULL;

-- CONTENT & SCHEDULING

-- Content types (post, story, reel, video, etc.)
CREATE TABLE content_types (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL
);

-- Scheduled/cross-posted content
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type_id INTEGER REFERENCES content_types(id) DEFAULT 1,
    title           VARCHAR(500),
    body_text        TEXT,
    media_urls       TEXT[], -- facebook, instagram, etc..
    thumbnail_url    VARCHAR(500),
    link_url         VARCHAR(500),
    hashtags         VARCHAR(255)[],
    metadata         JSONB DEFAULT '{}',
    status           VARCHAR(20) DEFAULT 'draft',  -- draft, scheduled, published, failed
    scheduled_at     TIMESTAMPTZ,
    published_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';

-- Links posts to target social accounts (multi-platform publishing)
CREATE TABLE post_targets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    external_post_id VARCHAR(255),
    platform_post_url VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'pending',  -- pending, published, failed
    published_at    TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, social_account_id)
);

CREATE INDEX idx_post_targets_post ON post_targets(post_id);
CREATE INDEX idx_post_targets_account ON post_targets(social_account_id);

-- ANALYTICS & ENGAGEMENT

-- Real-time engagement metrics per post per platform
CREATE TABLE engagement_metrics (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_target_id      UUID REFERENCES post_targets(id) ON DELETE CASCADE,
    social_account_id   UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    metric_type         VARCHAR(50) NOT NULL,  -- likes, comments, shares, views, saves, etc.
    value               BIGINT NOT NULL DEFAULT 0,
    recorded_at         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_target_id, metric_type, recorded_at)
);

CREATE INDEX idx_engagement_post_target ON engagement_metrics(post_target_id);
CREATE INDEX idx_engagement_account ON engagement_metrics(social_account_id);
CREATE INDEX idx_engagement_recorded ON engagement_metrics(recorded_at);

-- Account-level analytics snapshots (for weekly growth trends)
CREATE TABLE account_analytics (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    social_account_id   UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    snapshot_date       DATE NOT NULL,
    period_type         VARCHAR(20) NOT NULL,  -- daily, weekly, monthly
    followers_count     BIGINT DEFAULT 0,
    following_count     BIGINT DEFAULT 0,
    total_posts         INTEGER DEFAULT 0,
    total_likes         BIGINT DEFAULT 0,
    total_comments      BIGINT DEFAULT 0,
    total_shares        BIGINT DEFAULT 0,
    total_views         BIGINT DEFAULT 0,
    total_reach         BIGINT DEFAULT 0,
    impressions         BIGINT DEFAULT 0,
    engagement_rate     DECIMAL(8,4),
    custom_metrics      JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(social_account_id, snapshot_date, period_type)
);

CREATE INDEX idx_account_analytics_account ON account_analytics(social_account_id);
CREATE INDEX idx_account_analytics_date ON account_analytics(snapshot_date);
CREATE INDEX idx_account_analytics_period ON account_analytics(period_type);

-- Latest engagement per post 
CREATE TABLE post_engagement_summary (
    post_target_id      UUID PRIMARY KEY REFERENCES post_targets(id) ON DELETE CASCADE,
    likes               BIGINT DEFAULT 0,
    comments            BIGINT DEFAULT 0,
    shares              BIGINT DEFAULT 0,
    views               BIGINT DEFAULT 0,
    saves               BIGINT DEFAULT 0,
    reach               BIGINT DEFAULT 0,
    engagement_score    DECIMAL(10,2),
    last_updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- HELPER FUNCTIONS & TRIGGERS

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER oauth_tokens_updated_at
    BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- SEED DATA

INSERT INTO platforms (code, name) VALUES
    ('facebook',  'Facebook'),
    ('tiktok',    'TikTok'),
    ('instagram', 'Instagram'),
    ('x',         'X (Twitter)'),
    ('linkedin',  'LinkedIn'),
    ('youtube',   'YouTube'),
    ('pinterest', 'Pinterest');

INSERT INTO content_types (code, name) VALUES
    ('post',      'Post'),
    ('story',     'Story'),
    ('reel',      'Reel'),
    ('video',     'Video'),
    ('carousel',  'Carousel'),
    ('image',     'Image');

