/**
 * Metro configuration for a monorepo.
 *
 * Metro normally refuses to look outside the app folder. Because the prayer
 * content lives in `packages/content`, we have to widen the search path and
 * watch the whole workspace, otherwise edits to a prayer never reach the app.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
