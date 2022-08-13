import { onValue, ref, getDatabase } from "firebase/database";
import dotenv from "dotenv";
import Heroku from "heroku-client";
import * as http from "http";
import { initializeApp } from "@firebase/app";
import { setInterval } from "timers";
import { Observable } from "rxjs";
import loadApps from "./appsLoader.js";

dotenv.config();
const client = new Heroku({ token: process.env.HEROKU_API_KEY });

initializeApp({
  databaseURL: process.env.MAIN_SCHEDULER_DB,
});
const db = getDatabase();

http
  .createServer((req, res) => {
    res.end("Scheduler's up");
  })
  .listen(3000);

let scheduled_apps = loadApps();

console.log(scheduled_apps);
setInterval(updateLoop, 1000);

function updateLoop() {
  logWithTimestamp("Checking for updates...");
  scheduled_apps.forEach((app) => app.update(client));
}

export function createObserverForFirebaseValue(updatePath, database = db) {
  return new Observable((subscriber) => {
    let startDateTime = new Date().getTime();
    let unsub = onValue(ref(database, updatePath), (val) => {
      if (val.val() >= startDateTime) {
        subscriber.complete();
      }
    });

    return () => unsub();
  });
}

const logWithTimestamp = (text) =>
  console.log("[" + new Date().toLocaleString("he-IL") + "]: " + text);
