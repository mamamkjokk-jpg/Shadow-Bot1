module.exports = async (api, event, args, startTime, loadData, saveData) => {
  const threadID = event.threadID;
  if (!args[1]) return;

  const newName = args.slice(1).join(" ");
  try {
    await api.gcname(newName, threadID);
  } catch {}
};
