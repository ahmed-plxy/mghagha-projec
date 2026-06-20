function dashboard(req, res) {
  res.render('customer/dashboard', { title: 'لوحة التحكم' });
}

module.exports = { dashboard };
