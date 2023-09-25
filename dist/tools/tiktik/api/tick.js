'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var request = require('request');
var ObjectID = require("bson-objectid");
module.exports = class tick {
    constructor(options) {
        Object.defineProperty(this, "sortOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "request", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inboxId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cookieHeader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /*
        options should include {
            username: "email@email.com"
            password: "user password here"
        }
        */
        this.sortOrder = 0;
        this.request = request.defaults({ 'jar': true });
        this.options = options;
    }
    get_all_tasks() {
        return new Promise((resolve, _reject) => {
            this.login(this.options.username, this.options.password)
                .then(async () => {
                const resutls = await this.getSortOrder();
                resolve(resutls);
            });
        });
    }
    login(username, password) {
        const url = "https://ticktick.com/api/v2/user/signon?wc=true&remember=true";
        console.log("login started");
        const options = {
            method: "POST",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:95.0) Gecko/20100101 Firefox/95.0",
                "x-device": '{"platform":"web","os":"OS X","device":"Firefox 95.0","name":"TeleGTP","version":4531, "id":"6490' + "4a81b03a30bd8f586cde" + '","channel":"website","campaign":"","websocket":""}',
                Origin: "https://ticktick.com"
            },
            json: {
                username: username,
                password: password
            }
        };
        return new Promise((resolve, _reject) => {
            this.request(options, (_error, response, body) => {
                console.log("login done");
                console.log(body);
                if (body.username !== undefined) {
                    // Set the cookies
                    var cookies = response.headers["set-cookie"];
                    this.cookieHeader = cookies.join("; ") + ";";
                    resolve();
                }
                else {
                    throw new Error("Could not login");
                }
            });
        });
    }
    getSortOrder() {
        console.log("get sort order started");
        return new Promise((resolve, _reject) => {
            var parent = this;
            const url = "https://ticktick.com/api/v2/batch/check/0";
            this.request({
                method: "GET",
                headers: {
                    Origin: "https://ticktick.com",
                    Cookie: this.cookieHeader,
                },
                url: url
            }, function (_error, _response, body) {
                body = JSON.parse(body);
                parent.inboxId = body.inboxId;
                body.syncTaskBean.update.forEach((task) => {
                    if (task.projectId == parent.inboxId && task.sortOrder < parent.sortOrder) {
                        parent.sortOrder = task.sortOrder;
                    }
                });
                parent.sortOrder--;
                // console.log("the sort order is: ", parent.sortOrder);
                var extractedData = body.syncTaskBean.update.map((item) => ({
                    id: item.id,
                    title: item.title,
                    startDate: item.startDate,
                    dueDate: item.dueDate,
                    isAllDay: item.isAllDay,
                    reminder: item.reminder,
                    repeatFlag: item.repeatFlag,
                    priority: item.priority,
                    status: item.status,
                }));
                const date_string = new Date().toISOString();
                const dayName = new Date().toLocaleString('en-us', { weekday: 'long' });
                let date = new Date();
                let hh = date.getHours();
                let mm = date.getMinutes();
                let ss = date.getSeconds();
                let session = "AM";
                if (hh == 0) {
                    hh = 12;
                }
                if (hh > 12) {
                    hh = hh - 12;
                    session = "PM";
                }
                let time = (hh < 10) ? "0" + hh : hh + ":" + (mm < 10) ? "0" + mm : mm + ":" + (ss < 10) ? "0" + ss : ss + " " + session;
                const introduction = `The following are the parameters
                title: string - Task title
                isAllDay: boolean - Is the task an all day event or not
                startDate: Date - Start date and time in "yyyy-MM-dd'T'HH:mm:ssZ" format Example : "2019-11-13T03:00:00+0000"
                dueDate: Date - Due date and time in "yyyy-MM-dd'T'HH:mm:ssZ" format Example : "2019-11-13T03:00:00+0000"
                reminder: string - Reminder specific to the task. The default value is "TRIGGER:-PT15M", indicating to remind 15mins before. The format "TRIGGER:-PTxxM" should be used where xx is the number of mins before the event that the reminder should be given
                repeatFlag: string - Recurring rules of task Example : "RRULE:FREQ=DAILY;INTERVAL=1" would mean to repeat every day
                priority: number - Value: None:0, Low:1, Medium:3, High:5

                Date format: YYYY-MM-DDThh:mm:ss+00:00
                Today's datetime on UTC time ` + date_string + ` , it's ` + dayName + ` the timezone of the user +10, and the current time is: ` + time + `,

                Current tasks:
                `;
                resolve(introduction + JSON.stringify(extractedData));
            });
        });
    }
    getAllUncompletedTasks() {
        console.log("Get all Uncompleted tasks started");
        const url = "https://ticktick.com/api/v2/batch/check/1";
        const options = {
            method: "GET",
            url: url,
            headers: {
                Origin: "https://ticktick.com",
                Cookie: this.cookieHeader,
            },
        };
        return new Promise((resolve, _reject) => {
            this.request(options, function (_error, _response, body) {
                body = JSON.parse(body);
                console.log("UNCOMPLETED TASKS");
                console.log(body);
                var tasks = body["syncTaskBean"]["update"];
                console.log("Retrevied all uncompleted tasks");
                resolve(tasks);
            });
        });
    }
    //the default list will be inbox
    addTask(jsonOptions) {
        const url = "https://ticktick.com/api/v2/task";
        console.log("Add task started");
        const options = {
            method: "POST",
            url: url,
            headers: {
                "Content-Type": "application/json",
                Origin: "https://ticktick.com",
                Cookie: this.cookieHeader
            },
            json: {
                assignee: (jsonOptions.assignee) ? jsonOptions.assignee : null,
                content: (jsonOptions.content) ? jsonOptions.content : "",
                deleted: (jsonOptions.deleted) ? jsonOptions.deleted : 0,
                dueDate: (jsonOptions.dueDate) ? jsonOptions.dueDate : null,
                id: (jsonOptions.id) ? jsonOptions.id : ObjectID(),
                isAllDay: (jsonOptions.isAllDay) ? jsonOptions.isAllDay : null,
                isDirty: (jsonOptions.isDirty) ? jsonOptions.isDirty : true,
                items: (jsonOptions.items) ? jsonOptions.items : [],
                local: (jsonOptions.local) ? jsonOptions.local : true,
                modifiedTime: (jsonOptions.modifiedTime) ? jsonOptions.modifiedTime : new Date().toISOString().replace("Z", "+0000"),
                priority: (jsonOptions.priority) ? jsonOptions.priority : 0,
                progress: (jsonOptions.progress) ? jsonOptions.progress : 0,
                projectId: (jsonOptions.projectId) ? jsonOptions.projectId : this.inboxId,
                reminder: (jsonOptions.reminder) ? jsonOptions.reminder : null,
                reminders: (jsonOptions.reminders) ? jsonOptions.reminders : [{ id: ObjectID(), trigger: "TRIGGER:PT0S" }],
                remindTime: (jsonOptions.remindTime) ? jsonOptions.remindTime : null,
                repeatFlag: (jsonOptions.repeatFlag) ? jsonOptions.repeatFlag : null,
                sortOrder: (jsonOptions.sortOrder) ? jsonOptions.sortOrder : this.sortOrder,
                startDate: (jsonOptions.startDate) ? jsonOptions.startDate : null,
                status: (jsonOptions.status) ? jsonOptions.status : 0,
                tags: (jsonOptions.tags) ? jsonOptions.tags : [],
                timeZone: (jsonOptions.timeZone) ? jsonOptions.timeZone : "America/New_York",
                title: jsonOptions.title,
            }
        };
        return new Promise((resolve, _reject) => {
            this.request(options, (_error, _response, body) => {
                console.log("Added: " + jsonOptions.title);
                this.sortOrder = body.sortOrder - 1;
                resolve(body);
            });
        });
    }
};
//# sourceMappingURL=tick.js.map