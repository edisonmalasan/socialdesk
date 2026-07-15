const { Queue, Worker } = require("bullmq");
const analyticsIngestionService = require("./analytics.ingestion.service");

const DEFAULT_SYNC_PATTERN = "0 */6 * * *"; // Every 6 hours
const DEFAULT_QUEUE_NAME = "analytics";
const SCHEDULER_ID = "analytics-sync-all";

const JOB_NAMES = {
  SYNC_ANALYTICS: "sync-analytics",
};

let schedulerQueue = null;
let syncWorker = null;

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const isEnabled = () => {
  return process.env.ANALYTICS_QUEUE_ENABLED !== "false";
};

const getSyncPattern = () => {
  return process.env.ANALYTICS_SYNC_PATTERN || DEFAULT_SYNC_PATTERN;
};

const getQueueName = () => {
  return process.env.ANALYTICS_QUEUE_NAME || DEFAULT_QUEUE_NAME;
};

const getConnection = () => {
  if (process.env.REDIS_URL) {
    const redisUrl = new URL(process.env.REDIS_URL);
    const db = Number.parseInt(redisUrl.pathname.slice(1) || "0", 10);

    return {
      host: redisUrl.hostname,
      port: parsePositiveInteger(redisUrl.port, 6379),
      username: redisUrl.username || undefined,
      password: redisUrl.password || undefined,
      db: Number.isInteger(db) ? db : 0,
      tls: redisUrl.protocol === "rediss:" ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  }

  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parsePositiveInteger(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number.parseInt(process.env.REDIS_DB || "0", 10),
    maxRetriesPerRequest: null,
  };
};

const createSchedulerQueue = () => {
  return new Queue(`${getQueueName()}:scheduler`, {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: 100,
    },
  });
};

const logQueueError = (label) => (error) => {
  console.error(`${label} error:`, error.message || error);
};

const startScheduler = async () => {
  await schedulerQueue.upsertJobScheduler(
    SCHEDULER_ID,
    { pattern: getSyncPattern() },
    {
      name: JOB_NAMES.SYNC_ANALYTICS,
      data: {},
      opts: {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    },
  );
};

const createWorkers = () => {
  syncWorker = new Worker(
    schedulerQueue.name,
    async () => analyticsIngestionService.syncAllAccounts(),
    { connection: getConnection(), concurrency: 1 },
  );

  syncWorker.on("completed", (job) => {
    console.log(`Analytics sync job completed: ${job.id}`);
  });

  syncWorker.on("failed", (job, error) => {
    console.error("Analytics sync job failed:", job?.id, error.message || error);
  });

  syncWorker.on("error", logQueueError("Analytics sync worker"));
};

exports.start = async () => {
  if (!isEnabled()) {
    console.log("Analytics queue is disabled");
    return null;
  }

  if (schedulerQueue) {
    return { schedulerQueue };
  }

  schedulerQueue = createSchedulerQueue();
  schedulerQueue.on("error", logQueueError("Analytics scheduler queue"));

  try {
    await startScheduler();
    createWorkers();
  } catch (error) {
    await exports.stop();
    throw error;
  }

  console.log(`Analytics queue started with sync pattern: ${getSyncPattern()}`);
  return { schedulerQueue };
};

exports.stop = async () => {
  await Promise.all([
    syncWorker?.close(),
    schedulerQueue?.close(),
  ]);

  syncWorker = null;
  schedulerQueue = null;

  console.log("Analytics queue stopped");
};

exports._private = {
  getConnection,
  getQueueName,
  getSyncPattern,
  isEnabled,
  JOB_NAMES,
};
