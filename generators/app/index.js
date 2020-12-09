"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const path = require("path");
const console = require("console");
const { exit } = require("process");
const fs = require("fs");

module.exports = class extends Generator {
  initializing() {
    console.log("Initializing");
    if (this.fs.exists(path.join(this.destinationRoot(), "./.yo-rc.json"))) {
      var rootFolderName = this.config.get("rootFolderName");
      console.log("init::rootFolderName :>> ", rootFolderName);
      this.modules = this.config.get("modules");
      console.log("init::modules :>> ", this.modules);
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

  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the phenomenal ${chalk.red(
          "generator-directory-creator"
        )} generator!`
      )
    );

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
      // To access props later use this.props.someAnswer;
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
      console.log(this.modules);
      exit(-100);
    } else {
      var modules = this.config.get("modules");
      if (modules === undefined || modules === null) {
        modules = [];
      }

      console.log(modules);
      modules.push(newModule);
      console.log("this.modules :>> ", modules);
      this.config.set("modules", modules);
      this.config.save();
    }
  }

  refreshingSettingsGradle() {
    console.log("this.config.get('modules') :>> ", this.config.get("modules"));
    var moduleList = this.config.get("modules");
    var config = {
      rootFolderName: this.config.get("rootFolderName"),
      modules: moduleList
    };
    console.log("config :>> ", config);
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
    console.log("library method called");
    var moduleName = this.props.moduleName;
    var packageName = this.props.package.replace(/\./g, "/");
    const config = {
      moduleName: moduleName,
      packageName: this.props.package
    };
    console.log("template config input: " + JSON.stringify(config));
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
    console.log("springboot application method called");
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
          console.log(
            "configModName: " + configModName + " moduleName: " + moduleName
          );
          exists = true;
        }
      });
    }

    return exists;
  }
};
