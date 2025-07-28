import { input, select } from "@inquirer/prompts";
import { getFullYear } from "./utils/getFullYear.js";
import { exec } from "child_process";
import { promisify } from "util";
import { dbEnvironments } from "./dbEnvironment.js";
import "dotenv/config";

//以下、postgresを対象に実装する

const execAsync = promisify(exec);
//バックアップを実行
async function dumpDatabase(host, dbName) {
  try {
    const filePath =
      process.env.ROOT_PATH + `${getFullYear()}_${dbName}.backup`;
    const command = `pg_dump -Fc -C -h ${host} -U postgres -d ${dbName} -f ${filePath}`;
    const { stdout, stderr } = await execAsync(command);

    console.log("バックアップ完了:", stdout);
    if (stderr) console.error("警告:", stderr);

    return filePath;
  } catch (error) {
    console.error("バックアップ失敗:", error);
    return null;
  }
}

//リストアを実行
async function restoreDatabase(host, filePath) {
  try {
    //リストア前にDBが存在していないため、DB名の指定はしない。
    //-C：DB作成オプション
    const command = `pg_restore -C -h ${host} -p 5432 -U postgres -d postgres ${filePath}`;
    const { stdout, stderr } = await execAsync(command);

    console.log("リストア完了:", stdout);
    if (stderr) console.log("警告:", stderr);
  } catch (e) {
    console.log(e);
  }
}

//バックアップを取得する処理
const backupOperation = async () => {
  //DB環境を選択「localhost」「db02_work」「db02_stage」「gis05」「gis06」
  const dbEnvironment = await select({
    message: "どの環境のDBのバックアップを取得しますか？",
    choices: dbEnvironments,
  });

  //DB名を入力
  const dbName = await input({
    message: "DB名を入力してください",
  });

  //バックアップコマンドの実行
  const filePath = await dumpDatabase(dbEnvironment, dbName);
  filePath != null
    ? console.log("ファイルが出力されました：", filePath)
    : console.log("ファイルの出力に失敗しました");
};

//DBを特定の環境にリストアする処理
const backupandrestoreOperation = async () => {
  //DB環境を選択「localhost」「db02_work」「db02_stage」「gis05」「gis06」
  const dbEnvironmentForBackup = await select({
    message: "どの環境のDBのバックアップを取得しますか？",
    choices: dbEnvironments,
  });
  //リストア先の環境「localhost」「db02_work」「db02_stage」「gis05」「gis06」
  const dbEnvironmentForRestore = await select({
    message: "どの環境にDBをリストアしますか？",
    choices: dbEnvironments,
  });
  //DB名を入力
  const dbName = await input({
    message: "DB名を入力してください",
  });
  //バックアップ、リストアを実行
  const filePath = await dumpDatabase(dbEnvironmentForBackup, dbName);
  await restoreDatabase(dbEnvironmentForRestore, filePath);
};

//「バックアップファイルを取得する」、「DBを特定の環境にリストアする」の選択肢から選ぶ
const selectedOperation = await select({
  message: "DBの操作を選択してください",
  choices: [
    {
      value: "backup",
      name: "バックアップファイルを取得する",
    },
    {
      value: "backupandrestore",
      name: "DBを特定の環境にリストアする",
    },
  ],
});

//操作の分岐
switch (selectedOperation) {
  case "backup":
    await backupOperation();
    break;
  case "backupandrestore":
    await backupandrestoreOperation();
    break;
}
