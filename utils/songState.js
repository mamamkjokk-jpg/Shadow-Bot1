const states = {};

module.exports = {
  get: (threadID) => states[threadID],
  set: (threadID, state) => { states[threadID] = state; },
  clear: (threadID) => { delete states[threadID]; }
};
