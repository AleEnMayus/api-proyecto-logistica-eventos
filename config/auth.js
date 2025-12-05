module.exports = {
  secret: process.env.JWT_SECRET || "superSecretKey",
  expiresIn: "1h"
};
