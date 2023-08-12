const path = require('path');

module.exports = {
  /**
   * The port to run Nucleus Server on, if the port is in use the server will not start
   */
  port: 3030,

  /**
   * The fully qualified domain + path that Nucleus is being hosted at
   */
  baseURL: 'http://162.1.1.69:8888',

  /**
   * The data store to use when persisting plugins and versions.Current possible values
   * are "sequelize", ensure you also supply valid connection details for your
   * chosen strategy below.
   * 
   * PR's welcome to add another data store.
   */
  dbStrategy: 'sequelize',

  /**
   * Sequelize connection information, please note all options are required
   * 
   * database: The name of the database to connect to
   * dialect: The type of SQL database this is, check sequelize docs for more info
   * username: Username to use when connecting
   * password; Password to use when connecting
   * host: Hostname of database
   * port: Port to use when connecting
   * storage: Path to sqlite file, only used for sqlite dialect
   */
  sequelize: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, './data/db.sqlite'),
  },

  /**
   * The file store to use when persisting update files and metadata.Current possible
   * values are "s3" and "local" ensure you also supply valid connection details if
   * required for your chosen strategy below.
   * 
   * PR's welcome to add another file store.
   */
  fileStrategy: 'local',

  /**
   * Local file configuration
   * 
   * root: Path on disk to the root of the static file store
   * staticUrl: The HTTP url to use to access the static file store remotely
   */
  local: {
    root: path.resolve(__dirname, './data/.file'),
    staticUrl: 'http://162.1.1.69:9999',
    port: 9999
  },

  /**
   * There is actually no authentication config for s3, all config must be done through the standard AWS
   * environment variables or through EC2 IAM roles.
   * 
   * See http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
   * 
   * Bucket / Region / CloudFront config goes here though
   */
  s3: {
    bucketName: '', // The name for your S3 Bucket

    cloudfront: { // If you don't have CloudFront set up and just want to use the S3 bucket set this to "null
      distributionId: '', // The CloudFront distribution ID, used for invalidating files
      publicUrl: '', // Fully qualified URL for the root of the CloudFront proxy for the S3 bucket
    }
  },

  /**
   * The authentication strategy to use when logging users in.Current possible values are "local",
   * "openid" and "github".Make you also supply the required authentication details 
   */
  authStrategy: 'local',

  /**
   * Local authentication details
   * 
   * The `adminIdentifiers` array should be a list of usernames
   * 
   * DISCLAIMER: This strategy should ONLY be used for local development and NEVER
   * used in production.Unicorns cry every time this setting is used in production.
   * Don't make the unicorns cry.
   * 
   * displayName: The user friendly name of this user
   * username: A unique identifier to use when this user signs in, please note uniqueness is
   * not enforced
   * password: Well, uhhh, their password
   * photo: A URL for their profile, entirely optional, just makes things look nicer ;)
   */
  localAuth: [{
    displayName: 'luckserver',
    username: 'lucksoft',
    password: 'luckserver',
    photo: 'https://pbs.twimg.com/profile_images/1219364727/charlie-support_400x400.png'
  }],

  /**
   * OpenID authentication details
   * 
   * The `adminIdentifiers` array should be a list of email
   * addresses for users to consider admins
   * 
   * realm: The domain that the server is hosted on
   * stateless: Stateless mode for openID
   * profile: Whether to fetch profile information, should normally be true 
   * providerURL: Your openID provider URL
   * domain: Domain to restrict email addresses to
   */
  openid: {
    realm: 'http://localhost:8888',
    stateless: true,
    profile: true,
    providerURL: 'https://auth.myservice.com/openid/v2/op',
    domain: 'myservice.com'
  },

  /**
   * GitHub authentication details
   * 
   * The `adminIdentifiers` array should be a list of GitHub usernames
   * to consider admins
   * 
   * clientID: GitHub API client ID
   * clientSecret: GitHub API clientSecret
   * realm: The domain the server is hosted on
   */
  github: {
    clientID: '',
    clientSecret: ''
  },

  /**
   * See the documentation for your authentication strategy for what this array does
   */
  adminIdentifiers: ['lucksoft'],

  /**
   * Session options, in development just leave this as default.
   * 
   * IN PRODUCTION PLEASE USE REDIS!
   * 
   * type: Can be either "redis" or null
   * 
   * redis:
   * host: The host URL for the redis instance
   * port: The port for the redis instance
   */
  sessionConfig: {
    type: null,
    secret: 'ThisIsNotSecret',

    redis: {
      host: '',
      port: ''
    }
  },

  organization: 'lucksoft',

  /**
   * GPG key to use when signing APT and YUM releases
   * 
   * Requires to be unlocked (no password) and have both the private and
   * public key.
   */
  gpgSigningKey: `
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
IaXPeb3e0Bykm+E=
=AHRL

-----END PGP PUBLIC KEY BLOCK-----
-----BEGIN PGP PRIVATE KEY BLOCK-----

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
=ihK/

-----END PGP PRIVATE KEY BLOCK-----
`,

  /**
   * The default percentage rollout for new releases.The first release for
   * any channel will always be 100% but all future releases will have a
   * default rollout value of this setting
   */
  defaultRollout: 0
};