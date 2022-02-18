import { existsSync } from "fs";
import { resolve } from "path";
import { prompt } from "enquirer";
import { writeJSON, readJSON } from "fs-extra";

class Main {
  projectDir = "";
  packageJSON = "";
  CLIName = "";
  version = "";
  constructor() {
    this.checkFile.call(this);
    this.generateUserParams.call(this);
  }
  async generateUserParams() {
    const { extensionName } = await prompt<{ extensionName: string }>({
      type: "input",
      name: "extensionName",
      message: "What is your extension name?",
    });
    if (!extensionName) return this.generateUserParams.call(this);

    const { description } = await prompt<{ description: string }>({
      type: "input",
      name: "description",
      message: "Please description what your plugin does",
    });

    const { typescript } = await prompt<{ typescript: string }>({
      type: "select",
      name: "typescript",
      message: "Need to support typescript?",
      choices: ["yes", "no"],
    });

    this.generate.call(this, extensionName, description, typescript === "yes");
  }
  checkFile() {
    this.projectDir = process.cwd();
    this.packageJSON = resolve(this.projectDir, "package.json");
    const isExist = existsSync(this.packageJSON);
    if (isExist) throw new Error(`Project configuration file package.json already exists in the ${this.projectDir}`);
  }
  createPackageJSONTemplate(name: string, description: string) {
    return {
      name,
      version: "1.0.0",
      description,
      scripts: {
        start: `${this.CLIName} start`,
        build: `${this.CLIName} build`,
      },
      license: "ISC",
      devDependencies: {
        [this.CLIName]: this.version,
      },
    };
  }
  async generate(name: string, description: string, supportTypeScript: boolean) {
    const packageJSON = await readJSON("../package.json");
    this.CLIName = packageJSON.name;
    this.version = packageJSON.version;

    const jsonFile = this.createPackageJSONTemplate(name, description);
    await writeJSON(this.packageJSON, jsonFile, { spaces: 2 });
  }
}

new Main();
