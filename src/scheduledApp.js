
class ScheduleApp {
  constructor(appInfo, finishedObserverFunction) {
    this.appInfo = appInfo;
    this.lastTime = new Date().getTime();
    this.finishedObserverFunction = finishedObserverFunction;
    this.running = false;
  }


  update(client) {
    let timePassed = new Date().getTime() - this.lastTime;

    if (timePassed >= this.appInfo.scheduleFrequency && !this.running) {
      this.running = true;
      this.logWithTimestamp(
        `${this.appInfo["appName"]} is scheduled to run. Starting app..`
      );
      this.startApp(client);
    }
  }

  logWithTimestamp(logText) {
    console.log("[" + new Date().toLocaleString("he-IL") + "]: " + logText);
  }

  async startApp(client) {
    client
      .patch(
        `/apps/${this.appInfo["appId"]}/formation/${this.appInfo["formationId"]}`,
        {
          body: {
            quantity: 1,
            size: "Free",
          },
        }
      )
      .then((value) => {
        this.logWithTimestamp(`Scaled up formation for  + ${this.appInfo["appName"]}`);
        console.log(value);
      })
      .catch((error) => console.log(error));

    this.finishedObserverFunction.call().subscribe({
      complete: () => {
        this.logWithTimestamp(
          this.appInfo["appName"] + " finished running, scaling down formation"
        );
        client
          .patch(
            `/apps/${this.appInfo["appId"]}/formation/${this.appInfo["formationId"]}`,
            {
              body: {
                quantity: 0,
                size: "Free",
              },
            }
          )
          .then((value) => {
            this.logWithTimestamp(
              `${this.appInfo[appName]} scaled down successfully`
            );
            this.logWithTimestamp("Heroku API Response: " + value);
            this.running = false;
            this.lastTime = new Date().getTime();
          })
          .catch((error) => console.log(error));
      }
    });
  }

  
}

export default ScheduleApp;
