// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Axios = require('axios');
const CommonUtil = require('./CommonUtil.js');
const util = new CommonUtil();
const Logic = require('./Logic.js');
const logic = new Logic();


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

    // TODO 初回起動時のみ何を記録するかを読み上げる、2回目以降は何を記録しますか、とだけ聞く
    // TODO 何を記録するかでヒットしなければ記録できる候補を読み上げる
    // TODO RecordWeightLogIntent、RecordFatLogIntentは集約するか?
};

const SelectLogTypeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SelectLogTypeIntent';
    },
    handle(handlerInput) {
        // ログタイプを取得
        const logType = util.getSlotInfo(handlerInput, 'LogType').id;
        console.log(`ログタイプ : ${logType}`);
        if (!logType) {
            return logic.requestLogType(handlerInput);
        }

        let speakOutput;
        util.setSessionValue(handlerInput, 'LOG_TYPE', logType);
        switch (logType) {
            case 'weight':
                speakOutput = '今日の体重を教えてください。';
                break;
            case 'fat':
                speakOutput = '今日の体脂肪率を教えてください。';
                break;
            case 'water':
                speakOutput = '水を何カップ飲みましたか?';
                break;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SpecifyLogTypeAndRecordLogIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SpecifyLogTypeAndRecordLogIntent';
    },
    async handle(handlerInput) {
        // アクセストークンを取得
        const token = Alexa.getAccountLinkingAccessToken(handlerInput.requestEnvelope);
        // TODO トークン取得ができなかった時の処理

        // ログタイプを取得
        const logType = util.getSlotInfo(handlerInput, 'LogType').id;
        console.log(`ログタイプ : ${logType}`);
        if (!logType) {
            return logic.requestLogType(handlerInput);
        }

        // ログタイプに応じて値を記録
        let response;
        switch (logType) {
            case 'weight':
                response = logic.recodeWeight(handlerInput, token);
                break;
            case 'fat':
                response = logic.recodeFat(handlerInput, token);
                break;
            case 'water':
                response = null;
                break;
        }

        return response;
    }
};

const RecordLogIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecordLogIntent';
    },
    async handle(handlerInput) {
        // アクセストークンを取得
        const token = Alexa.getAccountLinkingAccessToken(handlerInput.requestEnvelope);
        // TODO トークン取得ができなかった時の処理

        // セッションからログタイプを取得
        const logType = util.getSessionValue(handlerInput, 'LOG_TYPE');
        console.log(`ログタイプ : ${logType}`);
        if (!logType) {
            return logic.requestLogType(handlerInput);
        }

        // ログタイプに応じて値を記録
        let response;
        switch (logType) {
            case 'weight':
                response = logic.recodeWeight(handlerInput, token);
                break;
            case 'fat':
                response = logic.recodeFat(handlerInput, token);
                break;
            case 'water':
                response = null;
                break;
        }

        return response;
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
        SpecifyLogTypeAndRecordLogIntentHandler,
        RecordLogIntentHandler,
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
