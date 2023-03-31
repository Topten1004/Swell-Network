import OSS from "ali-oss";

class OSSClient {
  ossStore: any = {};

  constructor() {
    if (!process.env["OSS_ACCESS_KEY_ID"]) {
      throw new Error("OSS_ACCESS_KEY_ID not set");
    }
    if (!process.env["OSS_ACCESS_KEY_SECRET"]) {
      throw new Error("OSS_ACCESS_KEY_SECRET not set");
    }
    if (!process.env["OSS_ASSETS_BUCKET"]) {
      throw new Error("OSS_ASSETS_BUCKET not set");
    }
    if (!process.env["OSS_ENDPOINT"]) {
      throw new Error("OSS_ENDPOINT not set");
    }

    this.ossStore = new OSS({
      accessKeyId: process.env["OSS_ACCESS_KEY_ID"],
      accessKeySecret: process.env["OSS_ACCESS_KEY_SECRET"],
      bucket: process.env["OSS_ASSETS_BUCKET"],
      endpoint: process.env["OSS_ENDPOINT"],
    });
  }

  put = (filename: any, filepath: any): void => {
    return this.ossStore.put(filename, filepath);
  };
}

export { OSSClient };
