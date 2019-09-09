const { App } = require("@slack/bolt");
const { getCalendarListMessage, createEvent } = require("./timetree");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

// Slack Boltエラー出力
app.error(err => {
  console.error(err);
});

// /timetreeコマンド
app.command("/timetree", async ({ command, ack, say }) => {
  // コマンドリクエストを確認
  ack();
  const [commandName, calendarName, title, startAt, endAt] = command.text.split(
    /(\s+)/
  );
  switch (commandName) {
    case "list": // カレンダー一覧コマンド
      const calendarList = await getCalendarListMessage();
      say(calendarList);
      break;
    case "create": // 予定作成コマンド
      const result = await createEvent(calendarName, title, startAt, endAt);
      say(result);
      break;
    default:
      // 該当なし
      say("そのコマンドには対応していません");
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
