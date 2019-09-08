const { App } = require("@slack/bolt");
const fetch = require("node-fetch");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

const TIMETREE_PERSONAL_TOKEN = process.env.TIMETREE_PERSONAL_TOKEN;

// Slack Boltエラー出力
app.error(err => {
  console.error(err);
});

// TimeTree APIへのリクエスト
const fetchApi = url => {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.timetree.v1+json",
      Authorization: `Bearer ${TIMETREE_PERSONAL_TOKEN}`
    }
  }).then(res => res.json());
};

// エラーハンドラー
const errorHandler = err => {
  console.error(err);
  return `エラーです`;
};

// カレンダー一覧を取得
const getCalendarList = () => {
  return fetchApi("https://timetreeapis.com/calendars?include=labels,members")
    .then(res => {
      const { data } = res;
      if (data.length > 0) {
        let message = "以下のカレンダーが見つかりました \n";
        data.forEach(calendar => {
          message += "- " + calendar.attributes.name + "\n";
        });
        return message;
      } else {
        return `カレンダーが見つかりませんでした`;
      }
    })
    .catch(errorHandler);
};

app.command("/timetree", async ({ command, ack, say }) => {
  // コマンドリクエストを確認
  ack();
  switch (command.text) {
    case "list":
      const calendarList = await getCalendarList();
      say(calendarList);
      break;
    default:
      say("そのコマンドには対応していません");
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
