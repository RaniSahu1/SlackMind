//  Authorization service

export function getUserPermissions(userId) {
  // For now, every authenticated Slack user
  // can access public knowledge.

  return {
    userId,
    allowedChannels: [],
    allowedUsers: [userId],
    canAccessPublic: true,
  };
}

export function canAccessKnowledge(userId, knowledge) {
  const permissions = getUserPermissions(userId);

  //  Public knowledge is accessible
  if (knowledge.visibility === "public") {
    return permissions.canAccessPublic;
  }

  //  User-restricted knowledge
  if (
    knowledge.allowedUsers?.includes(userId)
  ) {
    return true;
  }

  // Channel-restricted knowledge
  if (
    knowledge.allowedChannels?.some((channelId) =>
      permissions.allowedChannels.includes(channelId)
    )
  ) {
    return true;
  }

  return false;
}