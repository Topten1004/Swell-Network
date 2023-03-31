/* eslint-disable no-unused-vars */
class OSSClientMock {
  put(filename: any) {
    return { url: filename };
  }
}

export { OSSClientMock };
