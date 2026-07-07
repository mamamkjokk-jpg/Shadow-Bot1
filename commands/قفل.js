module.exports = (api, event, args, startTime, loadData, saveData) => {
  const threadID = event.threadID;
  const data = loadData();
  if (!data.locked) data.locked = {};

  const isOn = data.locked[threadID];
  data.locked[threadID] = !isOn;
  saveData(data);

  api.sendMessage(data.locked[threadID] ? "قفل الإضافة: تفعيل" : "قفل الإضافة: إيقاف", threadID);
};
