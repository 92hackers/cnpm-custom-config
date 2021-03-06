'use strict';

var mkdirp = require('mkdirp');
var copy = require('copy-to');
var path = require('path');
var fs = require('fs');
var os = require('os');

var version = require('../package.json').version;
const DefaultUserService = require('../user-service');

var root = path.dirname(__dirname);
var dataDir = process.env.CNPM_DATA_DIR ;

var config = {
  version: version,
  dataDir: dataDir,

  /**
   * Cluster mode
   */
  enableCluster: true,
  numCPUs: os.cpus().length - 1,

  /*
   * server configure
   */
  registryPort: 7001,

  //webPort: 7002, 关闭 web 界面，不会出现 web 界面
  //
  bindingHost: '0.0.0.0', // binding on 0.0.0.0 for outside of container access

  // session secret
  sessionSecret: 'ones.ai',

  // max request json body size
  jsonLimit: '1000mb',

  // log dir name
  logdir: path.join(dataDir, 'logs'),
  // update file template dir
  uploadDir: path.join(dataDir, 'downloads'),
  // web page viewCache
  viewCache: false,

  // config for koa-limit middleware
  // for limit download rates
  limit: {
    enable: false,
    token: 'koa-limit:download',
    limit: 1000,
    interval: 1000 * 60 * 60 * 24,
    whiteList: [],
    blackList: [],
    message: 'request frequency limited, any question, please contact fengmk2@gmail.com',
  },

  enableCompress: true, // enable gzip response or not

  // default system admins
  admins: {
    // name: email
    chenyuan: 'chenyuan@ones.ai',
    //fengmk2: 'fengmk2@gmail.com',
    //admin: 'admin@cnpmjs.org',
    //dead_horse: 'dead_horse@qq.com',
  },

  // email notification for errors
  // check https://github.com/andris9/Nodemailer for more informations
  mail: {
    enable: false,
    appname: 'cnpmjs.org',
    from: 'cnpmjs.org mail sender <adderss@gmail.com>',
    service: 'gmail',
    auth: {
      user: 'address@gmail.com',
      pass: 'your password'
    }
  },

  logoURL: '', // cnpm logo image url
  adBanner: '',
  customReadmeFile: '', // you can use your custom readme file instead the cnpm one
  customFooter: '<footer>Ones.ai</footer>', // you can add copyright and site total script html here
  npmClientName: 'npm', // use `${name} install package`
  packagePageContributorSearch: true, // package page contributor link to search, default is true

  // max handle number of package.json `dependencies` property
  maxDependencies: 2000,

  // backup filepath prefix
  backupFilePrefix: '/cnpm/backup/',

  /**
   * database config
   */

  database: {
    db: 'cnpmjs_test',
    username: 'root',
    password: '',

    // the sql dialect of the database
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: 'mysql',

    // the Docker container network hostname defined at docker-compose.yml
    host: 'mysql-db',

    // custom port; default: 3306
    port: 3306,

    // use pooling in order to reduce db connection overload and to increase speed
    // currently only for mysql and postgresql (since v1.5.0)
    pool: {
      maxConnections: 10,
      minConnections: 0,
      maxIdleTime: 30000
    },

    // the storage engine for 'sqlite'
    // default store into ~/.cnpmjs.org/data.sqlite
    //storage: path.join(dataDir, 'data.sqlite'),

    logging: !!process.env.SQL_DEBUG,
  },

  // package tarball store in local filesystem by default
  nfs: require('fs-cnpm')({
    dir: path.join(dataDir, 'nfs')
  }),
  // if set true, will 302 redirect to `nfs.url(dist.key)`
  downloadRedirectToNFS: false,

  // registry url name
  registryHost: 'npm.ones.team',

  /**
   * registry mode config
   */

  // enable private mode or not
  // private mode: only admins can publish, other users just can sync package from source npm
  // public mode: all users can publish
  enablePrivate: false,

  // registry scopes, if don't set, means do not support scopes
  scopes: [ '@ones-ai' ],

  // Only allowed to publish packages to scope mode.
  forcePublishWithScope: true,

  // some registry already have some private packages in global scope
  // but we want to treat them as scoped private packages,
  // so you can use this white list.
  privatePackages: [],

  /**
   * sync configs
   */

  // the official npm registry
  // cnpm wont directly sync from this one
  // but sometimes will request it for some package infomations
  // please don't change it if not necessary
  officialNpmRegistry: 'https://registry.npmjs.com',
  officialNpmReplicate: 'https://replicate.npmjs.com',

  // sync source, upstream registry
  // If you want to directly sync from official npm's registry
  // please drop them an email first
  sourceNpmRegistry: 'https://registry.npm.taobao.org',

  // upstream registry is base on cnpm/cnpmjs.org or not
  // if your upstream is official npm registry, please turn it off
  sourceNpmRegistryIsCNpm: true,

  // if install return 404, try to sync from source registry
  syncByInstall: true,

  // sync mode select
  // none: do not sync any module, proxy all public modules from sourceNpmRegistry
  // exist: only sync exist modules
  // all: sync all modules
  syncModel: 'exist', // 'none', 'all', 'exist'

  syncConcurrency: 1,
  // sync interval, default is 10 minutes
  syncInterval: '10m',

  // sync polular modules, default to false
  // because cnpm can't auto sync tag change for now
  // so we want to sync popular modules to ensure their tags
  syncPopular: false,
  syncPopularInterval: '1h',
  // top 100
  topPopular: 100,

  // sync devDependencies or not, default is false
  syncDevDependencies: false,

  // changes streaming sync
  syncChangesStream: false,
  handleSyncRegistry: 'http://npm.ones.team',

  // badge subject on http://shields.io/
  badgePrefixURL: 'https://img.shields.io/badge',
  badgeSubject: 'npm',

  // custom user service, @see https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization
  // when you not intend to ingegrate with your company's user system, then use null, it would
  // use the default cnpm user system
  userService: new DefaultUserService(),

  // always-auth https://docs.npmjs.com/misc/config#always-auth
  // Force npm to always require authentication when accessing the registry, even for GET requests.
  alwaysAuth: false,

  // if you're behind firewall, need to request through http proxy, please set this
  // e.g.: `httpProxy: 'http://proxy.mycompany.com:8080'`
  httpProxy: null,

  // snyk.io root url
  snykUrl: 'https://snyk.io',

  // https://github.com/cnpm/cnpmjs.org/issues/1149
  // if enable this option, must create module_abbreviated and package_readme table in database
  enableAbbreviatedMetadata: true,

  // global hook function: function* (envelope) {}
  // envelope format please see https://github.com/npm/registry/blob/master/docs/hooks/hooks-payload.md#payload
  globalHook: null,
};

mkdirp.sync(config.logdir);
mkdirp.sync(config.uploadDir);

module.exports = config;

config.loadConfig = function (customConfig) {
  if (!customConfig) {
    return;
  }
  copy(customConfig).override(config);
};
