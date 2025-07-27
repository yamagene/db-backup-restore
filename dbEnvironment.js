import "dotenv/config";

//DB環境の選択肢
export const dbEnvironments = [
  {
    name: "localhost",
    value: process.env.DB_HOST_LOCALHOST,
  },
  {
    name: "sample01",
    value: process.env.DB_HOST_01,
  },
  {
    name: "sample02",
    value: process.env.DB_HOST_02,
  },
  {
    name: "sample03",
    value: process.env.DB_HOST_03,
  },
  {
    name: "sample04",
    value: process.env.DB_HOST_04,
  },
];
