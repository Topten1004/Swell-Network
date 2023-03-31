const util = require("util");
const { getTag } = require("./helpers");
const { exec } = require("child_process");
const execProm = util.promisify(exec);

const getLastTagContractFactory = async () => {
  const tag = await getTag();

  if (process.env.SKIP_GIT_CLONE === "false") {
    await execProm("rm -rf contracts/latest-tag");
    await execProm("git clone git@github.com:SwellNetwork/v2-core.git latest");
    await execProm(
      `cd latest && git checkout tags/${tag} -b automatic-latest-testing-${new Date().getTime()}`
    );
    await execProm("cp -r latest/contracts contracts/latest-tag");
    await execProm("rm -rf latest");
  }

  await execProm(`npx hardhat compile`);
};

module.exports = {
  getLastTagContractFactory,
};
