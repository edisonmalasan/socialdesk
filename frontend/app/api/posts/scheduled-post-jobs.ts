const getBackendApiUrl = () => {
  return (
    process.env.BACKEND_API_URL
    || process.env.NEXT_PUBLIC_BACKEND_API_URL
    || 'http://localhost:5000/api'
  ).replace(/\/$/, '');
};

const requestScheduledPostJobUpdate = async ({
  method,
  postId,
}: {
  method: 'POST' | 'DELETE';
  postId: string;
}) => {
  const response = await fetch(`${getBackendApiUrl()}/scheduled-posts/${postId}/jobs`, {
    method,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Scheduled post job request failed with ${response.status}`);
  }
};

export const scheduleScheduledPostJobs = async (postId: string) => {
  try {
    await requestScheduledPostJobUpdate({ method: 'POST', postId });
  } catch (error) {
    console.error('Failed to schedule delayed publish jobs:', error);
  }
};

export const cancelScheduledPostJobs = async (postId: string) => {
  try {
    await requestScheduledPostJobUpdate({ method: 'DELETE', postId });
  } catch (error) {
    console.error('Failed to cancel delayed publish jobs:', error);
  }
};
