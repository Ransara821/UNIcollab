function mapToObj(m) {
  if (!m) return {};
  if (m instanceof Map) return Object.fromEntries(m.entries());
  if (typeof m === 'object' && !Array.isArray(m)) return m;
  return {};
}

function buildSkillVector(skills) {
  const vec = {};
  (skills || []).forEach(s => {
    const key = s.toLowerCase().trim().replace(/\s+/g, '_');
    if (key) vec[key] = 1;
  });
  return vec;
}

function buildAvailabilityVector(availability) {
  const vec = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of days) {
    ((availability && availability[day]) || []).forEach(slot => {
      vec[`${day}_${slot}`] = 1;
    });
  }
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  if (!keys.size) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (const k of keys) {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeCompatibility(profile, group) {
  const skillScore = cosineSimilarity(mapToObj(profile.skillVector), mapToObj(group.skillVector));

  let styleScore = 0;
  if (profile.workingStyle && group.workingStyle) {
    if (profile.workingStyle === group.workingStyle) styleScore = 1;
    else if (profile.workingStyle === 'mixed' || group.workingStyle === 'mixed') styleScore = 0.5;
  }

  let deadlineScore = 0;
  if (profile.deadline && group.deadline) {
    const diffDays = Math.abs(new Date(profile.deadline) - new Date(group.deadline)) / 86400000;
    deadlineScore = Math.max(0, 1 - diffDays / 30);
  }

  return Math.round((skillScore * 0.5 + styleScore * 0.3 + deadlineScore * 0.2) * 100);
}

function computeUrgencyScore(profile) {
  let score = 0;
  if (profile.sosFlag) score += 100;
  if (profile.deadline) {
    const daysLeft = (new Date(profile.deadline) - new Date()) / 86400000;
    if (daysLeft <= 3) score += 50;
    else if (daysLeft <= 7) score += 35;
    else if (daysLeft <= 14) score += 20;
    else if (daysLeft <= 30) score += 10;
  }
  score += Math.min(30, (profile.joinRequestCount || 0) * 5);
  const daysInPool = (new Date() - new Date(profile.poolEnteredAt || profile.createdAt)) / 86400000;
  score += Math.min(20, Math.floor(daysInPool * 2));
  return score;
}

module.exports = { buildSkillVector, buildAvailabilityVector, computeCompatibility, computeUrgencyScore };
