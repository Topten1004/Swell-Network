import fs from "fs";
import { Upload } from "graphql-upload";
import path from "path";

import { server } from "../app";
import { UPLOAD_FILE } from "../shared/graphql";

jest.setTimeout(70000);

const testServer = server;

const validImgPath = path.join(__dirname, "./misc/mockImg.png");
const validFileName = "mockImg.png";

describe("uploadFile Mutation API test", () => {
  test("(1) should be succeeded with valid image file", async () => {
    const file = fs.createReadStream(validImgPath);
    const upload = new Upload();
    const fileUpload: any = {
      filename: validFileName,
      createReadStream: () => file,
    };
    upload.promise = new Promise((r) => r(fileUpload));
    upload.file = fileUpload;

    const res: any = await testServer.executeOperation({
      query: UPLOAD_FILE,
      variables: {
        file: upload,
      },
    });

    expect(res.data.uploadFile.includes(validFileName)).toEqual(true);
  });
});
