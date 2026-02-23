const { OAuth2Client } = require("google-auth-library");
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");

/**
 * Verify Google ID token and return payload (email, name, picture)
 */
exports.verifyGoogleToken = async (idToken) => {
  const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_WEB_CLIENT_ID not configured");
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();

  return {
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,
    givenName: payload.given_name,
    familyName: payload.family_name,
    picture: payload.picture,
    sub: payload.sub,
  };
};

/**
 * Verify Apple identity token and return payload
 * Apple only sends name/email on first sign-in; subsequent sign-ins may not include them
 */
exports.verifyAppleToken = async (identityToken) => {
  const decoded = jwt.decode(identityToken, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error("Invalid Apple token");
  }

  const client = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
    cache: true,
  });

  const key = await client.getSigningKey(decoded.header.kid);
  const publicKey = key.getPublicKey();

  const appleClientId = process.env.APPLE_CLIENT_ID || process.env.APPLE_BUNDLE_ID;
  const payload = jwt.verify(identityToken, publicKey, {
    algorithms: ["RS256"],
    issuer: "https://appleid.apple.com",
    ...(appleClientId && { audience: appleClientId }),
  });

  return {
    email: payload.email,
    sub: payload.sub,
    emailVerified: payload.email_verified === "true",
  };
};

