const { abi } = require("../abi/MultiSender.json");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const doc = new GoogleSpreadsheet(
  "1XvxgPpewaytUgSBhfPszS1eeZ2t7golFFGTyi43WAVo"
);
let sheet;
let rows;
async function assessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SHEET_CLIETN_EMAIL,
    private_key: process.env.GOOGLE_SHEET_PRIV_KEY
  });
  await doc.loadInfo();
  sheet = doc.sheetsByIndex[0];
  rows = await sheet.getRows();
}
async function getAddrs() {
  let addrs = [];
  rows.forEach(row => {
    if (row.tx_hash == undefined && row.address != undefined)
      addrs.push(row.address.trim());
  });
  return addrs;
}
async function updateSheet(transerredAddrs, value) {
  for (var i = 0; i < rows.length; i++) {
    if (transerredAddrs.indexOf(rows[i].address) >= 0) {
      rows[i].tx_hash = value;
      await rows[i].save();
    }
  }
}
task("dispatch", "Dispatch ETH to testers")
  .addParam("value", "Total amount of ETH")
  .setAction(async taskArgs => {
    await assessSpreadsheet();
    let data = await getAddrs();
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
    const balance = await signer.getBalance();
    const multicall = new ethers.Contract(
      process.env.MULTI_SENDER_CONTRACT,
      abi,
      signer
    );
    const amountToSend = taskArgs.value * data.length;
    const totalETH = balance.toString() / Math.pow(10, 18);
    if (totalETH < amountToSend) {
      throw "Not enough ETH";
    }
    data = data.length < 10 ? data : data.slice(0, 10);
    const res = await multicall.multiSend(data, {
      value: ethers.utils.parseEther(
        (parseInt(taskArgs.value) * data.length).toString()
      )
    });

    if (res.hash) {
      await updateSheet(data, res.hash);
    }
  });
