exports.computeGroupMatch = (users) => {
  // Compute FinalScore = 0.35*Beauty + 0.35*Affinity + 0.2*Lifestyle + 0.1*Budget
  const groups = [];
  // Group users 5-6, optimize gender parity & social level
  // Simple placeholder logic: shuffle + split
  const shuffled = users.sort(() => 0.5 - Math.random());
  while (shuffled.length) groups.push(shuffled.splice(0, 6));
  return groups;
};
