// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Axios = require('axios');
const CommonUtil = require('./CommonUtil.js');
const util = new CommonUtil();

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = '何を記録しますか?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }

    // TODO 体重はxxキロ、という言い方でも対応できるようにする
    // TODO ダイアログモデルで何かできる?
    // よさそうだが今回は数値入力のせいで無理かな・・・
    // https://developer.amazon.com/ja-JP/docs/alexa/custom-skills/define-the-dialog-to-collect-and-confirm-required-information.html
};

const SelectLogTypeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SelectLogTypeIntent';
    },
    handle(handlerInput) {
        const speakOutput = '今日の体重を教えてください。';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RecordLogIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecordLogIntent';
    },
    async handle(handlerInput) {
        // アクセストークンを取得
        const token = Alexa.getAccountLinkingAccessToken(handlerInput.requestEnvelope);
        // TODO トークン取得ができなかった時の処理

        // スロット値を取得
        const integerSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Integer');
        console.log('スロット値(Integer) : ' + integerSlotValue);
        const onesPlacePointSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'OnesPlacePoint');
        console.log('スロット値(OnesPlacePoint) : ' + onesPlacePointSlotValue);
        const decimalSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Decimal');
        console.log('スロット値(Decimal) : ' + decimalSlotValue);

        // 値を整理
        let logValue = parseInt(integerSlotValue);
        if (decimalSlotValue) {
            logValue += parseFloat(`0.${decimalSlotValue}`);
        }

        // 値が正しくとれない場合が多いためケア
        if (logValue >= 1000) {
            console.log('値修復');
            let logValueStr = logValue + '';
            const logValueChars = logValueStr.split('');

            if (logValueChars[2] == '1' || logValueChars[2] == '8') {
                // 72.6が7216や7286になってしまう問題の対応
                console.log('修正パターンA');
                logValue = parseFloat(`${logValueChars[0]}${logValueChars[1]}.${logValueChars[3]}`);
            } else if (logValueChars[1] == '0') {
                // 75.3が7053になってしまう問題の対応
                console.log('修正パターンB');
                logValue = parseFloat(`${logValueChars[0]}${logValueChars[2]}.${logValueChars[3]}`);
            } else {
                // 72.33が7233になってしまう問題の対応
                console.log('修正パターンC');
                logValue = parseFloat(`${logValueChars[0]}${logValueChars[1]}.${logValueChars[2]}${logValueChars[3]}`);
            }
            console.log(`${logValueStr} -> ${logValue}`);
        }
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
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// リクエストインターセプター(エラー調査用)
const RequestLog = {
    process(handlerInput) {
        //console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));
        console.log("HANDLER INPUT = " + JSON.stringify(handlerInput));
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        console.log("REQUEST TYPE =  " + requestType);
        if (requestType === 'IntentRequest') {
            console.log("INTENT NAME =  " + Alexa.getIntentName(handlerInput.requestEnvelope));
        }
        return;
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SelectLogTypeIntentHandler,
        RecordLogIntent,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .addRequestInterceptors(RequestLog)
    .lambda();
