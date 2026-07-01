module.exports = (api, event, args, startTime, loadData, saveData) => {
  const threadID = event.threadID;
  const data = loadData();
  if (!data.admins) data.admins = [];

  const sub = args[1];
  if (!sub) return api.sendMessage(`المشرفون: ${data.admins.length === 0 ? "لا يوجد" : data.admins.join(", ")}`, threadID);

  if (sub === "ازل") {
    const id = args[2];
    if (!id) return;
    data.admins = data.admins.filter(a => a !== id);
    saveData(data);
    return;
  }

  const userID = sub;
  if (data.admins.includes(userID)) return;
  data.admins.push(userID);
  saveData(data);
  api.sendMessage(`تم إضافة ${userID} كمشرف.`, threadID);
};
