const crypto = require('crypto');

function generateInviteToken() {
  return crypto.randomBytes(24).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateInviteToken,
  hashToken,
};
