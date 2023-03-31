import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ethers } from "ethers";
import express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import logger from "morgan";
import path from "path";

import { getContract } from "./bin/utils/getSWNFTContract";
import { PrismaFactory } from "./bin/utils/prismaFactory";
import { schema } from "./schema";

const app = express();
const router = express.Router();
const prismaFactory = new PrismaFactory();

const context: any = {
  prisma: prismaFactory.getPrisma(process.env["CHAIN_ID"] || "1"),
  contract: getContract(process.env["CHAIN_ID"] || "1"),
  chainid: process.env["NODE_ENV"] === "test" ? "2077117572" : "1",
};
router.use(async (req: any, res: any, next) => {
  context.origin = req.get("origin");
  context.prisma = prismaFactory.getPrisma(req.headers["chainid"] || "1");
  context.contract = getContract(req.headers["chainid"] || "1");
  context.chainid = req.headers["chainid"] || "1";

  if (context.prisma == null)
    return res.status(400).send({ error: "unspported network" });

  if (req.headers["account"]) {
    const account: any = req.headers["account"];
    try {
      if (!ethers.utils.isAddress(account)) {
        throw new Error("Account invalid");
      }

      context.user = await context.prisma.User.upsert({
        where: {
          wallet: account,
        },
        update: {},
        create: {
          wallet: account,
        },
      });
    } catch (e) {
      console.log(e);
      res.status(400).send({ error: "user invalid" });
      return;
    }
  }

  next();
});

app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(graphqlUploadExpress() as any);
app.use("/", router);

const loggingPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse(requestContext: any) {
        console.log(`query ${requestContext.operationName} finished`);
      },
    };
  },
};

const server: any = new ApolloServer({
  schema: schema,
  context: context,
  plugins: [loggingPlugin],
  cache: new InMemoryLRUCache(),
  introspection: true,
});

export { app, server, prismaFactory };
