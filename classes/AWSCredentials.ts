export class AWSCredentials {
  constructor(AWSAccessKeyId: string, AWSSecretKey: string) {
    this.AWSAccessKeyId = AWSAccessKeyId
    this.AWSSecretKey = AWSSecretKey
  }

  AWSAccessKeyId: string
  AWSSecretKey: string
}
