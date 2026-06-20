const facts = require('../data/funfacts.json');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const random = facts[Math.floor(Math.random() * facts.length)];
  res.status(200).json({ fact: random, all: facts });
};
