"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-gradle-springboot:library", () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, "../generators/app")).withPrompts({
      projectType: "javaLibrary",
      moduleName: "samplelib",
      package: "com.sample.lib"
    });
  });

  it("creates project related files and folders", () => {
    assert.file([
      ".yo-rc.json",
      "settings.gradle",
      "gradlew",
      "gradlew.bat",
      "gradle",
      "gradle/wrapper",
      "gradle/wrapper/gradle-wrapper.jar",
      "gradle/wrapper/gradle-wrapper.properties",
      "buildSrc/src/main/groovy/java-common-conventions.gradle",
      "buildSrc/src/main/groovy/java-library-conventions.gradle",
      "buildSrc/src/main/groovy/java-application-conventions.gradle",
      "buildSrc/build.gradle",
      "samplelib/build.gradle",
      "samplelib/src/main/java/com/sample/lib/LinkedList.java",
      "samplelib/src/test/java/com/sample/lib/LinkedListTest.java"
    ]);
  });
  it("generated file content", () => {
    assert.fileContent([
      ["settings.gradle", "rootProject.name = 'tmp'\n\n\ninclude 'samplelib'"]
    ]);
  });
});

describe("generator-gradle-springboot:app", () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, "../generators/app")).withPrompts({
      projectType: "springBootApplication",
      moduleName: "sampleapp",
      package: "com.sample.app"
    });
  });

  it("creates project related files and folders", () => {
    assert.file([
      ".yo-rc.json",
      "gradlew",
      "gradlew.bat",
      "gradle",
      "gradle/wrapper",
      "gradle/wrapper/gradle-wrapper.jar",
      "gradle/wrapper/gradle-wrapper.properties",
      "settings.gradle",
      "buildSrc/src/main/groovy/java-common-conventions.gradle",
      "buildSrc/src/main/groovy/java-library-conventions.gradle",
      "buildSrc/src/main/groovy/java-application-conventions.gradle",
      "buildSrc/build.gradle",
      "sampleapp/build.gradle",
      "sampleapp/src/main/java/com/sample/app/App.java",
      "sampleapp/src/main/java/com/sample/app/MessageUtils.java",
      "sampleapp/src/test/java/com/sample/app/MessageUtilsTest.java"
    ]);
  });

  it("generated file content", () => {
    assert.fileContent([
      ["settings.gradle", "rootProject.name = 'tmp'\n\n\ninclude 'sampleapp'"]
    ]);
  });
});
