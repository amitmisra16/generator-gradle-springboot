"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const path = require("path");
const { exit } = require("process");
const fs = require("fs");

module.exports = class extends Generator {
  initializing() {
    if (this.fs.exists(path.join(this.destinationRoot(), "./.yo-rc.json"))) {
      this.modules = this.config.get("modules");
    } else {
      var location = this.destinationRoot();
      var directory = location.substring(0, location.lastIndexOf("/"));
      var directoryName = directory.substring(directory.lastIndexOf("/") + 1);
      this.config.set("rootFolderName", directoryName);
      this.modules = [];
      this.config.set("modules", this.modules);
      this.config.save();
    }
  }

  _banner() {
    this.log(` e88~~\\                         888 888`);
    this.log(`d888     888-~\\    /~~~8e  e88~\\888 888  e88~~8e`);
    this.log(`8888 __  888          88b d888  888 888 d888  88b`);
    this.log(`8888   | 888     e88~-888 8888  888 888 8888__888`);
    this.log(`Y888   | 888    C888  888 Y888  888 888 Y888    ,`);
    this.log(` "88__/  888     "88_-888  "88_/888 888  "88___/`);
    this.log(
      `,d88~~\\                   ,e,               / 888~~\\                     d8`
    );
    this.log(
      `8888    888-~88e  888-~\\ "   888-~88e e88~88e 888   |  e88~-_   e88~-_  _d88__`
    );
    this.log(
      `\`Y88b   888  888b 888    888 888  888 888 888 888 _/  d888   i d888   i  888`
    );
    this.log(
      ` \`Y88b, 888  8888 888    888 888  888 "88_88" 888  \\  8888   | 8888   |  888`
    );
    this.log(
      `   8888 888  888P 888    888 888  888  /      888   | Y888   ' Y888   '  888`
    );
    this.log(
      `\\__88P' 888-_88"  888    888 888  888 Cb      888__/   "88_-~   "88_-~   "88_/`
    );
    this.log(`        888                            Y8""8D`);
  }

  prompting() {
    // Have Yeoman greet the user.
    this._banner();
    const projectTypes = [
      {
        value: "javaLibrary",
        name: "Gradle based Java library module"
      },
      {
        value: "springBootApplication",
        name: "Gradle based Springboot application module"
      }
    ];

    const prompts = [
      {
        type: "list",
        name: "projectType",
        message: `What ${chalk.yellow(
          "*type*"
        )} of project you would like to create?`,
        choices: projectTypes,
        default: "javaLibrary"
      },
      {
        type: "input",
        name: "moduleName",
        message: "What is the name of the module you want to create?"
      },
      {
        type: "input",
        name: "package",
        message: "What is the name of package for your module?"
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  addingModuleToConfig() {
    var newModule = {
      name: this.props.moduleName,
      type: this.props.projectType,
      package: this.props.package
    };

    const existsInConfig = this._checkModuleNameExists(this.props.moduleName);

    var alreadyExists = fs.existsSync(path.join(".", this.props.moduleName));
    if (alreadyExists) {
      this.log(
        "Project " +
          this.props.moduleName +
          " with same name already exists on the filesystem."
      );
      this.log(
        "Does this project exists in meta information: " + existsInConfig
      );
      exit(-100);
    } else {
      var modules = this.config.get("modules");
      if (modules === undefined || modules === null) {
        modules = [];
      }

      modules.push(newModule);
      this.config.set("modules", modules);
      this.config.save();
    }
  }

  refreshingSettingsGradle() {
    var moduleList = this.config.get("modules");
    var config = {
      rootFolderName: this.config.get("rootFolderName"),
      modules: moduleList
    };
    this.fs.copyTpl(
      path.join(this.templatePath(), "settings.gradle.ejs"),
      "settings.gradle",
      config
    );
  }

  configureBuildSrc() {
    const buildSrcExists = fs.existsSync(
      path.join(this.destinationRoot(), "buildSrc")
    );
    if (buildSrcExists) {
      this.log("buildSrc folder exists. Moving on!");
    } else {
      this.fs.copy(
        path.join(this.templatePath(), "buildSrc"),
        path.join(this.destinationRoot(), "buildSrc")
      );
    }
  }

  createProject() {
    const projectType = this.props.projectType;
    if (projectType === "javaLibrary") {
      this._createGradleLibraryProject();
    } else if (projectType === "springBootApplication") {
      this._createSpringBootProject();
    }
  }

  _createGradleLibraryProject() {
    var moduleName = this.props.moduleName;
    var packageName = this.props.package.replace(/\./g, "/");
    const config = {
      moduleName: moduleName,
      packageName: this.props.package
    };
    this.fs.copyTpl(
      path.join(
        this.templatePath(),
        "library/src/main/java/LinkedList.java.ejs"
      ),
      path.join(moduleName, "/src/main/java", packageName, "/LinkedList.java"),
      config
    );
    this.fs.copyTpl(
      path.join(
        this.templatePath(),
        "library/src/test/java/LinkedListTest.java.ejs"
      ),
      path.join(
        moduleName,
        "src/test/java",
        packageName,
        "LinkedListTest.java"
      ),
      config
    );
    this.fs.copy(
      path.join(this.templatePath(), "library/build.gradle"),
      path.join(moduleName, "build.gradle")
    );
  }

  _createSpringBootProject() {
    var moduleName = this.props.moduleName;
    var packageName = this.props.package.replace(/\./g, "/");
    const config = {
      moduleName: moduleName,
      packageName: this.props.package
    };
    this.fs.copyTpl(
      path.join(this.templatePath(), "app/src/main/java/App.java.ejs"),
      path.join(moduleName, "/src/main/java", packageName, "/App.java"),
      config
    );
    this.fs.copyTpl(
      path.join(this.templatePath(), "app/src/main/java/MessageUtils.java.ejs"),
      path.join(
        moduleName,
        "/src/main/java",
        packageName,
        "/MessageUtils.java"
      ),
      config
    );
    this.fs.copyTpl(
      path.join(
        this.templatePath(),
        "app/src/test/java/MessageUtilsTest.java.ejs"
      ),
      path.join(
        moduleName,
        "src/test/java",
        packageName,
        "MessageUtilsTest.java"
      ),
      config
    );
    this.fs.copy(
      path.join(this.templatePath(), "app/build.gradle"),
      path.join(moduleName, "build.gradle")
    );
  }

  _checkModuleNameExists(moduleName) {
    var configModules = this.modules;
    var exists = false;
    if (configModules) {
      configModules.forEach(configMod => {
        const configModName = configMod.name;
        if (configModName === moduleName) {
          exists = true;
        }
      });
    }

    return exists;
  }
};
