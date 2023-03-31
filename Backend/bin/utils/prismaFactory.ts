import { PrismaClient } from "@prisma/client";

class PrismaFactory {
  prismas: any = {};

  constructor() {
    const dbUrlPrefix = `postgresql://${process.env["DB_USERNAME"]}:${process.env["DB_PASSWORD"]}@${process.env["DB_HOSTNAME"]}`;
    if (process.env["NODE_ENV"] === "test") {
      this.prismas = {
        2077117572: new PrismaClient({
          datasources: {
            db: {
              url: `${dbUrlPrefix}/TEST-${process.env["DB_NAME"]}`,
            },
          },
        }),
        5: new PrismaClient({
          datasources: {
            db: {
              url: `${dbUrlPrefix}/TEST-${process.env["DB_NAME"]}`,
            },
          },
        }),
        1: new PrismaClient({
          datasources: {
            db: {
              url: `${dbUrlPrefix}/TEST-${process.env["DB_NAME"]}`,
            },
          },
        }),
      };
    } else {
      this.prismas = {
        1: new PrismaClient({
          datasources: {
            db: {
              url: `${dbUrlPrefix}/MAIN-${process.env["DB_NAME"]}`,
            },
          },
        }),
        5: new PrismaClient({
          datasources: {
            db: {
              url: `${dbUrlPrefix}/GOERLI-${process.env["DB_NAME"]}`,
            },
          },
        }),
        2077117572: new PrismaClient({
          datasources: {
            db: {
              url: `${dbUrlPrefix}/KALEIDO-${process.env["DB_NAME"]}`,
            },
          },
        }),
      };
    }
  }

  getPrisma = (chainId: string): any => {
    return this.prismas[chainId];
  };
}

export { PrismaFactory };
