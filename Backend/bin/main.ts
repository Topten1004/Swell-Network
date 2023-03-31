import createDepositData from "./utils/createDepositData";

async function main() {
  await createDepositData();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
