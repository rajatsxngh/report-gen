const dataSources = {
  sales: {
    id: 'sales',
    name: 'Sales Data',
    schema: [
      { field: 'month', type: 'string' },
      { field: 'revenue', type: 'number' },
      { field: 'units', type: 'number' },
      { field: 'region', type: 'string' },
    ],
    rows: [
      { month: 'Jan', revenue: 12000, units: 150, region: 'North' },
      { month: 'Feb', revenue: 15000, units: 200, region: 'North' },
      { month: 'Mar', revenue: 18000, units: 250, region: 'South' },
      { month: 'Apr', revenue: 14000, units: 180, region: 'East' },
      { month: 'May', revenue: 21000, units: 300, region: 'West' },
      { month: 'Jun', revenue: 19000, units: 270, region: 'North' },
      { month: 'Jul', revenue: 22000, units: 320, region: 'South' },
      { month: 'Aug', revenue: 20000, units: 290, region: 'East' },
      { month: 'Sep', revenue: 17000, units: 230, region: 'West' },
      { month: 'Oct', revenue: 23000, units: 340, region: 'North' },
      { month: 'Nov', revenue: 25000, units: 380, region: 'South' },
      { month: 'Dec', revenue: 28000, units: 420, region: 'East' },
    ],
  },
  'user-metrics': {
    id: 'user-metrics',
    name: 'User Metrics',
    schema: [
      { field: 'date', type: 'string' },
      { field: 'active_users', type: 'number' },
      { field: 'signups', type: 'number' },
      { field: 'churn_rate', type: 'number' },
    ],
    rows: [
      { date: '2024-01', active_users: 1200, signups: 150, churn_rate: 2.1 },
      { date: '2024-02', active_users: 1350, signups: 200, churn_rate: 1.8 },
      { date: '2024-03', active_users: 1500, signups: 220, churn_rate: 1.5 },
      { date: '2024-04', active_users: 1420, signups: 180, churn_rate: 2.0 },
      { date: '2024-05', active_users: 1600, signups: 260, churn_rate: 1.3 },
      { date: '2024-06', active_users: 1750, signups: 300, churn_rate: 1.1 },
      { date: '2024-07', active_users: 1680, signups: 240, churn_rate: 1.6 },
      { date: '2024-08', active_users: 1820, signups: 310, churn_rate: 1.0 },
    ],
  },
  inventory: {
    id: 'inventory',
    name: 'Inventory',
    schema: [
      { field: 'product', type: 'string' },
      { field: 'category', type: 'string' },
      { field: 'stock', type: 'number' },
      { field: 'price', type: 'number' },
      { field: 'reorder_level', type: 'number' },
    ],
    rows: [
      { product: 'Widget A', category: 'Widgets', stock: 500, price: 9.99, reorder_level: 100 },
      { product: 'Widget B', category: 'Widgets', stock: 250, price: 14.99, reorder_level: 50 },
      { product: 'Gadget X', category: 'Gadgets', stock: 120, price: 29.99, reorder_level: 30 },
      { product: 'Gadget Y', category: 'Gadgets', stock: 80, price: 49.99, reorder_level: 20 },
      { product: 'Gizmo Pro', category: 'Gizmos', stock: 340, price: 19.99, reorder_level: 75 },
      { product: 'Gizmo Lite', category: 'Gizmos', stock: 600, price: 7.99, reorder_level: 150 },
      { product: 'Doohickey', category: 'Misc', stock: 45, price: 99.99, reorder_level: 10 },
      { product: 'Thingamajig', category: 'Misc', stock: 200, price: 24.99, reorder_level: 40 },
    ],
  },
};

export function getAllDataSources() {
  return Object.values(dataSources).map(({ id, name, schema }) => ({
    id,
    name,
    schema,
  }));
}

export function getDataSource(id) {
  return dataSources[id] || null;
}
