import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export default jwt({
  // Dynamically provide a signing key based on the [Key ID](https://tools.ietf.org/html/rfc7515#section-4.1.4) header parameter ("kid") and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://liekkas.us.auth0.com/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: 'https://liekkas.us.auth0.com/api/v2/',
  issuer: [`https://liekkas.us.auth0.com/`],
  algorithms: ['RS256'],
});
