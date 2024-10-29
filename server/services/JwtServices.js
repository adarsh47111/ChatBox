import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = "adfdafaffa"

class JwtService {
  static sign(payload, expiry = "1d", secret = JWT_ACCESS_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }

  static verify(token, secret = JWT_ACCESS_SECRET) {
    return jwt.verify(token, secret);
  }
}

export default JwtService;