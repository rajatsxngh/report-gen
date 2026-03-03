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
      { month: 'Nov', revenue: 25000, units: 370, region: 'South' },
      { month: 'Dec', revenue: 28000, units: 400, region: 'East' },
    ],
  },
  'user-metrics': {
    id: 'user-metrics',
    name: 'User Metrics',
    schema: [
      { field: 'date', type: 'string' },
      { field: 'active_users', type: 'number' },
      { field: 'new_signups', type: 'number' },
      { field: 'churn_rate', type: 'number' },
    ],
    rows: [
      { date: '2024-01', active_users: 1200, new_signups: 150, churn_rate: 2.1 },
      { date: '2024-02', active_users: 1350, new_signups: 200, churn_rate: 1.8 },
      { date: '2024-03', active_users: 1500, new_signups: 220, churn_rate: 1.5 },
      { date: '2024-04', active_users: 1420, new_signups: 180, churn_rate: 2.0 },
      { date: '2024-05', active_users: 1600, new_signups: 250, churn_rate: 1.3 },
      { date: '2024-06', active_users: 1750, new_signups: 280, churn_rate: 1.1 },
      { date: '2024-07', active_users: 1680, new_signups: 200, churn_rate: 1.6 },
      { date: '2024-08', active_users: 1800, new_signups: 300, churn_rate: 1.0 },
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
    ],
    rows: [
      { product: 'Widget A', category: 'Electronics', stock: 500, price: 29.99 },
      { product: 'Widget B', category: 'Electronics', stock: 320, price: 49.99 },
      { product: 'Gadget X', category: 'Accessories', stock: 150, price: 14.99 },
      { product: 'Gadget Y', category: 'Accessories', stock: 80, price: 24.99 },
      { product: 'Tool Alpha', category: 'Hardware', stock: 200, price: 39.99 },
      { product: 'Tool Beta', category: 'Hardware', stock: 60, price: 59.99 },
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

export function getDataSourceRows(id) {
  const source = dataSources[id];
  return source ? source.rows : [];
}
