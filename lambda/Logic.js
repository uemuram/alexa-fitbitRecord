const AWS = require('aws-sdk');

const Alexa = require('ask-sdk-core');
const Axios = require('axios');
const CommonUtil = require('./CommonUtil.js');
const util = new CommonUtil();

class Logic {

    // 状態をチェック
    test() {
        return "テスト";
    }

    // 体重を記録
    async recodeWeight(handlerInput, token) {
        // スロット値を取得
        const integerSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Integer');
        console.log('スロット値(Integer) : ' + integerSlotValue);
        const decimalSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Decimal');
        console.log('スロット値(Decimal) : ' + decimalSlotValue);

        // 値を整理
        let logValue = util.adjustDecimalValue(integerSlotValue, decimalSlotValue);
        // 小数第2位で四捨五入
        logValue = (Math.round(logValue * 10)) / 10;

        // TODO 上限値の設定が必要

        // 本日日付け(日本時間にするために+9時間する)
        let today = new Date();
        today.setHours(today.getHours() + 9);

        // リクエストURL組み立て
        const url = `https://api.fitbit.com/1/user/-/body/log/weight.json?weight=${logValue}&date=${util.formatDate(today)}`
        console.log(`url : ${url}`);

        let response;
        try {
            response = await Axios.post(
                url,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.log(JSON.stringify(error.response.data));
        }
        console.log(response.data);

        const speakOutput = `体重を${logValue}キロで記録しました。`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('タイトル', integerSlotValue + "/" + decimalSlotValue)
            .reprompt(speakOutput)
            .getResponse();
    }


}

module.exports = Logic;