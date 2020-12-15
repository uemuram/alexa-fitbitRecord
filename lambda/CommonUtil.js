const AWS = require('aws-sdk');

class CommonUtil {

    // 状態をチェック
    checkState(h, state) {
        return (this.getState(h) == state);
    }

    //状態を取得
    getState(h) {
        return this.getSessionValue(h, 'STATE');
    }

    //状態を保存
    setState(h, state) {
        this.setSessionValue(h, 'STATE', state);
    }

    // セッションから値を取得
    getSessionValue(h, key) {
        const attr = h.attributesManager.getSessionAttributes();
        return attr[key];
    }

    // セッションに値を入れる
    setSessionValue(h, key, value) {
        let attr = h.attributesManager.getSessionAttributes();
        attr[key] = value
        h.attributesManager.setSessionAttributes(attr);
        console.log("セッション保存 : " + JSON.stringify({ 'key': key, 'value': value }));
    }

    // パラメータストアから値を取得(再利用のために取得後にセッションに格納)
    // 非同期処理を含むので、呼び出し元ではawaitを付けて呼び出すこと
    async getParameterFromSSM(handlerInput, key) {
        // セッションにあればそこから取得、なければパラメータストアから取得
        let parameter = this.getSessionValue(handlerInput, key);
        if (parameter) {
            console.log(key + ' : ' + parameter + '(セッションから取得)');
        } else {
            const ssm = new AWS.SSM();
            const request = { Name: key, WithDecryption: true };
            const response = await ssm.getParameter(request).promise();
            parameter = response.Parameter.Value;
            console.log(key + ' : ' + parameter + '(SSMから取得)');
            // セッションに保管
            this.setSessionValue(handlerInput, key, parameter);
        }
        return parameter;
    }

    // 同じ日付けかどうか判定する
    isSameDate(date1, date2) {
        if (
            (date1.getFullYear() == date2.getFullYear())
            && (date1.getMonth() == date2.getMonth())
            && (date1.getDate() == date2.getDate())
        ) {
            return true;
        } else {
            return false;
        }
    }

    // 日付けをYYYY-MM-DD形式にフォーマットする
    formatDate(date) {
        return date.getFullYear()
            + '-' + ('0' + (date.getMonth() + 1)).slice(-2)
            + '-' + ('0' + date.getDate()).slice(-2);
    }

    // 整数部と小数部の数値から結果の数値を返す。Alexaの音声認識の都合で正しく認識できない場合は補正する。
    adjustDecimalValue(integerValue, decimalValue) {
        // 整数部と小数部を結合
        let value = parseInt(integerValue);
        if (decimalValue) {
            value += parseFloat(`0.${decimalValue}`);
        }

        // 値が正しくとれない場合が多いためケア
        if (value >= 1000) {
            console.log('値修復');
            let valueStr = value + '';
            const valueChars = valueStr.split('');

            if (valueChars[2] == '1' || valueChars[2] == '8') {
                // 72.6が7216や7286になってしまう問題の対応
                console.log('修正パターンA');
                value = parseFloat(`${valueChars[0]}${valueChars[1]}.${valueChars[3]}`);
            } else if (valueChars[1] == '0') {
                // 75.3が7053になってしまう問題の対応
                console.log('修正パターンB');
                value = parseFloat(`${valueChars[0]}${valueChars[2]}.${valueChars[3]}`);
            } else {
                // 72.33が7233になってしまう問題の対応
                console.log('修正パターンC');
                value = parseFloat(`${valueChars[0]}${valueChars[1]}.${valueChars[2]}${valueChars[3]}`);
            }
            console.log(`${valueStr} -> ${value}`);
        }
        return value;
    }

}

module.exports = CommonUtil;