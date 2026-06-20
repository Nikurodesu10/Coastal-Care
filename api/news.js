const news = require('../data/news.json');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const sorted = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.status(200).json(sorted);
};
