exports.dashboardStats = (req, res) => {
  // Aggregate stats: example only
  res.json({
    users: 100,
    products: 50,
    orders: 25
  });
};