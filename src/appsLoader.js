import { readFileSync } from "fs";
import ScheduleApp from "./scheduledApp.js";
import { createObserverForFirebaseValue } from "./index.js";
import { initializeApp } from "@firebase/app";
import { getDatabase } from "firebase/database";
import os from "os";

function loadApps() {
  let jsonText =
    os.platform() == "win32" // Running locally or running on host.
      ? readFileSync("scheduled_apps.json", "utf-8")
      : process.env.appsJSON;
  return loadAppsFromJSON(jsonText);
}

function loadAppsFromJSON(jsonText) {
  let json = JSON.parse(jsonText);

  let apps = [];

  json["apps"].forEach((element) => {
    let appInfo = {
      appName: element.name,
      appId: element.appId,
      formationId: element.formationId,
      scheduleFrequency: element.scheduleFrequency,
    };

    let finishedObserverFunction;
    if (element.endCallback.type == "firebase") {
      finishedObserverFunction = () =>
        createObserverForFirebaseValue(element.endCallback.firebasePath);
    } else if (element.endCallback.type == "firebase-custom") {
      let fbAppName = element.name.toLowerCase().replace(" ", "-");

      const customApp = initializeApp(
        { databaseURL: element.endCallback.dbURL },
        fbAppName
      );

      finishedObserverFunction = () =>
        createObserverForFirebaseValue(
          element.endCallback.firebasePath,
          getDatabase(customApp)
        );
    }

    apps.push(new ScheduleApp(appInfo, finishedObserverFunction));
  });

  return apps;
}

export default loadApps;
