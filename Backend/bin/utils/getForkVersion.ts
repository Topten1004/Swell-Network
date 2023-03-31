const getForkVersion = (chainId: string): string => {
  switch (chainId) {
    case "1":
      return "";
    case "5":
      if (!process.env["GOERLI_FORK_VERSION"]) {
        throw new Error("GOERLI_FORK_VERSION not set");
      }
      return `--forkversion=${process.env["GOERLI_FORK_VERSION"]}`;
    case "2077117572":
      return "";
    default:
      return "";
  }
};

export { getForkVersion };
