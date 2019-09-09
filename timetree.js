const fetch = require("node-fetch");

const TIMETREE_PERSONAL_TOKEN = process.env.TIMETREE_PERSONAL_TOKEN;

// TimeTree APIへのリクエスト
const fetchApi = (url, method = "GET", body = null) => {
  return fetch(url, {
    method,
    body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.timetree.v1+json",
      Authorization: `Bearer ${TIMETREE_PERSONAL_TOKEN}`
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
  return fetchApi("https://timetreeapis.com/calendars").then(res => res.data);
};

// イベントPOST
const postEvent = (calendarId, params) => {
  return fetchApi(
    `https://timetreeapis.com/calendars/${calendarId}/events`,
    "POST",
    params
  ).then(res => {
    console.log(res);
    return res;
  });
};

// カレンダーを名前で取得
const getCalendarByName = name => {
  return getCalendars().then(calendars =>
    calendars.find(calendar => calendar.attributes.name === name)
  );
};

// 日付バリデーション
const validateDate = date =>
  /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(date);

// 予定を作成
module.exports.createEvent = (calendarName, title, startAt, endAt) => {
  return getCalendarByName(calendarName).then(calendar => {
    // 入力値バリデーション
    if (!calendar) return "指定したカレンダーが見つかりませんでした...";
    if (!title) return "予定タイトルを指定してください";
    if (!validateDate(startAt))
      return "正しいフォーマットで開始日をしてしてください";
    if (!validateDate(endAt))
      return "正しいフォーマットで終了日をしてしてください";

    // POSTパラメータ
    const params = {
      data: {
        attributes: {
          title: title,
          category: "schedule", // 予定
          all_day: true, // 終日
          start_at: `${startAt}T00:00:00.000Z`,
          end_at: `${endAt}T00:00:00.000Z`
        },
        relationships: {
          label: {
            data: {
              id: `${calendar.id},1`, // ラベル１
              type: "label"
            }
          }
        }
      }
    };
    return postEvent(calendar.id, JSON.stringify(params)).then(
      () => "予定を作成しました"
    );
  });
};

// カレンダー一覧メッセージ取得
module.exports.getCalendarListMessage = () => {
  return getCalendars()
    .then(calendars => {
      if (calendars.length <= 0) return "カレンダーが見つかりませんでした";

      return calendars.reduce(
        (reducer, calendar) => reducer + `- ${calendar.attributes.name}\n`,
        "以下のカレンダーが見つかりました \n"
      );
    })
    .catch(errorHandler);
};
