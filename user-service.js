/**
 * Basic ones cnpm user authorization module
 * auth with token fetched from npm.
 *
 * Tutorial:
 * https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization
 */

const { request } = require('./services/npm');

function DefaultUserService() {}

var proto = DefaultUserService.prototype;

/**
 * Auth user with login name and password
 * @param  {String} login    login name
 * @param  {String} password login password
 * @return {User}
 */
proto.auth = function* (login, password) {
  if (!login || !password) {
    return null;
  }

  const url = '/@ones-ai/vendor';
  const options = {
    registry: 'https://registry.npmjs.org',
    headers: {
      authorization: `Bearer ${password}`,
    },
  };

  const res = yield request(url, options);
  const { status, data } = res;

  if (status === 200 && !data.error) {
    return { login, email: 'npm@ones.ai' };
  }

  return null;
};

/**
 * Get user by login name
 * @param  {String} login  login name
 * @return {User}
 */
proto.get = function* (login) {};

/**
 * List users
 * @param  {Array<String>} logins  login names
 * @return {Array<User>}
 */
proto.list = function* (logins) {};

/**
 * Search users
 * @param  {String} query  query keyword
 * @param  {Object} [options] optional query params
 *  - {Number} limit match users count, default is `20`
 * @return {Array<User>}
 */
proto.search = function* (query, options) {};

module.exports = DefaultUserService;
