/**
 * Extracts @mentions from raw comment text.
 * Example text: "Hey @John Doe please check this bug or @alice@example.com"
 * Returns list of matching user IDs.
 */
const User = require('../models/User');

const parseMentions = async (content) => {
  if (!content) return [];

  // Match @username or @email or @"User Name"
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const matches = content.match(mentionRegex);

  if (!matches || matches.length === 0) return [];

  const cleanUsernames = matches.map(m => m.replace('@', '').toLowerCase());
  
  try {
    // Find users by email or name regex
    const users = await User.find({
      $or: [
        { email: { $in: cleanUsernames } },
        { name: { $in: cleanUsernames.map(u => new RegExp(`^${u}`, 'i')) } }
      ]
    });

    return users.map(u => u._id);
  } catch (err) {
    console.error('Error parsing mentions:', err);
    return [];
  }
};

module.exports = { parseMentions };
