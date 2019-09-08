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
const fetchApi = (url, method = 'GET', body = null) => {
  return fetch(url, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      'Accept': "application/vnd.timetree.v1+json",
      'Authorization': `Bearer ${TIMETREE_PERSONAL_TOKEN}`
    }
  })
  .then(res => res.json())
  .catch(errorHandler);
};

// エラーハンドラー
const errorHandler = err => {
  console.error(err);
};

// カレンダー一覧GET
const getCalendars = () => {
  return fetchApi("https://timetreeapis.com/calendars?include=labels,members")
    .then(res => res.data);
};

// イベントPOST
const postEvent = (calendarId, params) => {
  return fetchApi(`https://timetreeapis.com/calendars/${calendarId}/events`, 'POST', params)
    .then(res => {
      console.log(res);
      return res
    });
}

// カレンダーを名前で取得
const getCalendarByName = name => {
  return getCalendars()
    .then(calendars => 
      calendars.find(calendar => calendar.attributes.name === name)
    );
};

// 日付バリデーション
const validateDate = date => /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(date);

// 予定を作成
const createEvent = (calendarName, title, startAt, endAt) => {
  return getCalendarByName(calendarName).then(calendar => {
    if (!calendar) return '指定したカレンダーが見つかりませんでした...';
    if (!title) return '予定タイトルを指定してください';
    if (!validateDate(startAt)) return '正しいフォーマットで開始日をしてしてください';
    if (!validateDate(endAt)) return '正しいフォーマットで終了日をしてしてください';
    const params = {
      data: {
        attributes: {
          title: title,
          category: 'schedule', // 予定
          all_day: true, // 終日
          start_at: `${startAt}T00:00:00.000Z`,
          end_at: `${endAt}T00:00:00.000Z`,
        },
        relationships: {
          label: {
            data: {
              id: `${calendar.id},1`, // ラベル１
              type: 'label'
            }
          }
        }
      }
    }
    return postEvent(calendar.id, JSON.stringify(params)).then(() => '予定を作成しました')
  })
}

// カレンダー一覧メッセージ取得
const getCalendarListMessage = () => {
  return getCalendars()
    .then(calendars => {
      console.log(JSON.stringify(calendars[0]));
      if (calendars.length <= 0) return "カレンダーが見つかりませんでした";

      return calendars.reduce(
        (reducer, calendar) => reducer + `- ${calendar.attributes.name}\n`,
        "以下のカレンダーが見つかりました \n"
      );
    })
    .catch(errorHandler);
};

app.command("/timetree", async ({ command, ack, say }) => {
  // コマンドリクエストを確認
  ack();
  const [ commandName, calendarName, title, startAt, endAt ] = command.text.split(' ');
  switch (commandName) {
    case "list":
      const calendarList = await getCalendarListMessage();
      say(calendarList);
      break;
    case "create":
      const result = await createEvent(calendarName, title, startAt, endAt);
      say(result);
      break;
    default:
      say("そのコマンドには対応していません");
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
