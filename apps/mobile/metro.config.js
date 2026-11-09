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

/*
 * Hierarchical lookup stays on. npm does not hoist everything to the root of
 * a workspace: the packages that only the app needs — expo-router's own
 * dependencies, for one — are nested inside it, and with the lookup disabled
 * Metro cannot see them and the bundle fails to resolve them.
 */
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
