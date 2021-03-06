const AWS = require('aws-sdk');

const Alexa = require('ask-sdk-core');
const Axios = require('axios');
const CommonUtil = require('./CommonUtil.js');
const util = new CommonUtil();

class Logic {

    // ログタイプ要求メッセージ
    requestLogType(handlerInput) {
        console.log('ログタイプ要求');
        util.setSessionValue(handlerInput, 'LOG_TYPE', null);
        const speakOutput = '体重、体脂肪率、水分量を記録できます。何を記録しますか?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
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
        // TODO logValueの値チェック。undefだったりした場合の処理
        // TODO 上限値の設定が必要

        // 本日日付け(日本時間にするために+9時間する)
        let today = new Date();
        today.setHours(today.getHours() + 9);

        // リクエストURL組み立て
        const url = `https://api.fitbit.com/1/user/-/body/log/weight.json?weight=${logValue}&date=${util.formatDate(today)}`;
        console.log(`url : ${url}`);

        // リクエスト実行
        let response;
        try {
            response = await Axios.post(url, null, { headers: { Authorization: `Bearer ${token}` } });
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

    // 体脂肪率を記録
    async recodeFat(handlerInput, token) {
        // スロット値を取得
        const integerSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Integer');
        console.log('スロット値(Integer) : ' + integerSlotValue);
        const decimalSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Decimal');
        console.log('スロット値(Decimal) : ' + decimalSlotValue);

        // 値を整理
        let logValue = util.adjustDecimalValue(integerSlotValue, decimalSlotValue);
        // 小数第2位で四捨五入
        logValue = (Math.round(logValue * 10)) / 10;
        // TODO logValueの値チェック。undefだったりした場合の処理
        // TODO 上限値の設定が必要

        // 本日日付け(日本時間にするために+9時間する)
        let today = new Date();
        today.setHours(today.getHours() + 9);

        // リクエストURL組み立て
        const url = `https://api.fitbit.com/1/user/-/body/log/fat.json?fat=${logValue}&date=${util.formatDate(today)}`;
        console.log(`url : ${url}`);

        // リクエスト実行
        let response;
        try {
            response = await Axios.post(url, null, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.log(JSON.stringify(error.response.data));
        }
        console.log(response.data);

        const speakOutput = `体脂肪率を${logValue}パーセントで記録しました。`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('タイトル', integerSlotValue + "/" + decimalSlotValue)
            .reprompt(speakOutput)
            .getResponse();
    }

    // 水分摂取量を記録
    async recodeWater(handlerInput, token) {
        // スロット値を取得
        const integerSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Integer');
        console.log('スロット値(Integer) : ' + integerSlotValue);
        const decimalSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Decimal');
        console.log('スロット値(Decimal) : ' + decimalSlotValue);

        // 値を整理
        let logValue = util.adjustDecimalValue(integerSlotValue, decimalSlotValue);
        // 小数第2位で四捨五入
        logValue = (Math.round(logValue * 10)) / 10;
        // TODO logValueの値チェック。undefだったりした場合の処理
        // TODO 上限値の設定が必要

        // 本日日付け(日本時間にするために+9時間する)
        let today = new Date();
        today.setHours(today.getHours() + 9);

        // リクエストURL組み立て
        const url = `https://api.fitbit.com/1/user/-/foods/log/water.json?amount=${logValue}&date=${util.formatDate(today)}&unit=cup`;
        console.log(`url : ${url}`);

        // リクエスト実行
        let response;
        try {
            response = await Axios.post(url, null, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.log(JSON.stringify(error.response.data));
        }
        console.log(response.data);

        const speakOutput = `${logValue}カップの水分摂取量を記録しました。`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('タイトル', integerSlotValue + "/" + decimalSlotValue)
            .reprompt(speakOutput)
            .getResponse();
    }


}

module.exports = Logic;