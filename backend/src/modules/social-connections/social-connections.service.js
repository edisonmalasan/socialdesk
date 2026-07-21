const repository = require("./social-connections.repository");

/**
 * Retrieves all available platforms.
 */
exports.getPlatforms = async () => {
  return repository.getAllPlatforms();
};

/**
 * Retrieves all connected social accounts for a user and calculates
 * their token health without leaking the actual token strings.
 */
exports.getUserConnections = async (userId) => {
  const accounts = await repository.getAccountsWithTokensByUser(userId);

  return accounts.map((account) => {
    const token = Array.isArray(account.oauth_tokens)
      ? account.oauth_tokens[0]
      : account.oauth_tokens;

    let tokenHealth = null;
    if (token) {
      const expiresAt = token.expires_at ? new Date(token.expires_at).getTime() : 0;
      tokenHealth = {
        hasAccessToken: Boolean(token.access_token),
        hasRefreshToken: Boolean(token.refresh_token),
        expiresAt: token.expires_at,
        isExpired: expiresAt > 0 ? Date.now() >= expiresAt : false,
      };
    }

    // Strip out the raw oauth_tokens array before returning to the controller
    const { oauth_tokens, ...safeAccount } = account;
    
    return {
      ...safeAccount,
      tokenHealth,
    };
  });
};

// Re-export repository methods for internal backend use
Object.assign(exports, repository);
