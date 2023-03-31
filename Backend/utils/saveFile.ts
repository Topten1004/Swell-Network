import fs from "fs";
import os from "os";
import path from "path";

const saveFileToTmp = async (file: any) => {
  const { createReadStream, filename } = await file;
  const stream = createReadStream();
  const file_name = `${Date.now().toString()}_${filename.split(" ").join("_")}`;
  const filepath = path.join(os.tmpdir(), "images", file_name);

  fs.mkdirSync(path.join(os.tmpdir(), "images"), { recursive: true });

  const output = fs.createWriteStream(filepath);

  stream.pipe(output);

  await new Promise(function (resolve, reject) {
    output.on("close", () => {
      resolve(1);
    });

    output.on("error", (err) => {
      console.log(err);
      reject(err);
    });
  });

  return { file_name: `images/${file_name}`, filepath };
};

export { saveFileToTmp };
