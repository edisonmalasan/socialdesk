const accountsRepository = require("./accounts.repository");

/**
 * Returns all active accounts for the given user.
 */
exports.listAccounts = async (userId) => {
  return accountsRepository.findAllByUser(userId);
};

/**
 * Validates the platform code and creates a new account.
 */
exports.connectAccount = async (userId, payload) => {
  const { platformCode, username, display_name, external_id } = payload;

  const platform = await accountsRepository.findPlatformByCode(platformCode);

  return accountsRepository.createAccount({
    userId,
    platformId: platform.id,
    externalId: external_id,
    username,
    displayName: display_name,
  });
};

/**
 * Disconnects an account (soft delete).
 */
exports.disconnectAccount = async (accountId, userId) => {
  await accountsRepository.deactivateAccount(accountId, userId);
};
