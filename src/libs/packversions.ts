export const PackVersions: { [key: number]: string } = {
  1: "1.6.1 – 1.8.9",
  2: "1.9 – 1.10.2",
  3: "1.11 – 1.12.2",
  4: "1.13 – 1.14.4",
  5: "1.15 – 1.16.1",
  6: "1.16.2 – 1.16.5",
  7: "1.17.x",
  8: "1.18.x",
  9: "1.19 – 1.19.2",
  12: "1.19.3",
  13: "1.19.4",
  15: "1.20.0 - 1.20.1",
  18: "1.20.2",
  22: "1.20.3 – 1.20.4",
  34: "1.21",
};


export const getVersion = (packVer: number): string => {
    return PackVersions[packVer];
}