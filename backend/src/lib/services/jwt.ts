import jsonwebtoken from 'jsonwebtoken'

class JwtService {
  constructor(
    private secret: string,
    private options?: jsonwebtoken.SignOptions,
  ) {}

  sign<P extends string | object | Buffer>(payload: P, opts?: jsonwebtoken.SignOptions) {
    return jsonwebtoken.sign(payload, this.secret, opts ? { ...this.options, ...opts } : this.options)
  }

  verify(token: string) {
    return jsonwebtoken.verify(token, this.secret, this.options)
  }
}

export default JwtService
