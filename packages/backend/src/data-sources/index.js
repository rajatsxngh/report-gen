import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const sales = require('./sales.json');
const userMetrics = require('./user-metrics.json');
const inventory = require('./inventory.json');

const dataSources = new Map([
  [sales.id, sales],
  [userMetrics.id, userMetrics],
  [inventory.id, inventory],
]);

export function getAllDataSources() {
  return Array.from(dataSources.values()).map(({ id, name, schema }) => ({
    id,
    name,
    schema,
  }));
}

export function getDataSourceById(id) {
  return dataSources.get(id) || null;
}
