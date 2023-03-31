if (!process.env.REACT_APP_OSS_ASSETS_BUCKET) {
  throw new Error(`REACT_APP_OSS_ASSETS_BUCKET must be a defined environment variable`);
}

export default function getImageLink(filename: string | undefined | null): string | null {
  if (!filename) {
    return null;
  }

  if (filename.startsWith(process.env.REACT_APP_OSS_ASSETS_BUCKET || '')) {
    return filename;
  }

  return `${process.env.REACT_APP_OSS_ASSETS_BUCKET}/${filename}`;
}
