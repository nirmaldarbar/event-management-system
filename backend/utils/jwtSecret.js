// One source of truth for the JWT secret so signing and verifying always match.
// Set JWT_SECRET in backend/.env for real deployments.
module.exports = () => process.env.JWT_SECRET || 'dev_only_jwt_secret_change_me';
