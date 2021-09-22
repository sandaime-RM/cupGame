//変数の定義
var lotteryResult;
var LotLastTime;
var currentPoint;
var points = 0;
var status;
var alertCode = "";

//ページ「gameHome.html」を読み込み時、最初に実行
window.onload = function() {
    
    //最後にガチャを引いた時刻を確認
    storageLotTime = JSON.parse(localStorage.getItem("lotteryTime"));
    LotLastTime = new Date(storageLotTime);
    console.log(LotLastTime);

    //紙コップの状態を確認
    var status = JSON.parse(localStorage.getItem("cupStatus"));
    console.log(status);

    var currentTime = new Date();

    if(status == "null" || status == null) {

        var status = {
            point : 0,
            name : "",
            size: 0,
            voice: "大きいサイズに対してコンプレックスがあります(´・ω・`)",
            fridge: false,
            fridgeTime: null,
            startedTime: currentTime.getTime(),
            items: [0, 0, 0, 0]
        }

        localStorage.setItem("cupStatus", JSON.stringify(status));
    } else {

        if(status.fridge == true) {
            
            var diff = currentTime.getTime() - status.fridgeTime;
            diffHour = diff / (60*60*1000);

            if(diffHour > 24*7) {
                gameOver(1);　//冷蔵庫に放置しすぎたパターン
            }
        } else {
            var diff = currentTime.getTime() - status.startedTime;
            diffHour = diff / (60*60*1000);

            if(diffHour > 3) {
                gameOver(2); //冷蔵庫に入れてなかったパターン
            }
        }

        status.startedTime = currentTime.getTime();
        localStorage.setItem("cupStatus", JSON.stringify(status));
    }

    //コップに名前が付いているか判定
    if(status.name == "") giveName();

    //ステータスを表示
    dispPoint(status);

    //アイテムの所持状態を確認
    myItems = JSON.parse(localStorage.getItem("possessingItems"));

    status.fridge = false;
    localStorage.setItem("cupStatus", JSON.stringify(status));
}

//ガチャを引けるか確認する処理
function startLottery() {
    //現在時刻と最後にガチャを引いた時刻の差分を計算
    currentTime = new Date();
    
    var diff = currentTime.getTime() - LotLastTime.getTime();
    diffHour = diff / (60*60*1000);

    if(diffHour < 1) {
        showAlert("ガチャを引く", "ガチャは1時間に一回までです！", "");
    } else {
        lottery();
    }
}

//ガチャを引いて記録する処理
function lottery() {
    //抽選とそれに応じた結果の表示
    lotteryNum = Math.floor(Math.random()*5);
    var resultText = "";
    var resultImg = "";
    var itemNum = 0;

    switch(lotteryNum) {
        case 0, 1:
            resultText = "はずれ";
            resultImg = "orange.jpg";
            itemNum = null;
        
        case 2:
            resultText = "セノビ〇ク";
            resultImg = "senobikku.jpg";
            itemNum = 0;
        
        case 3:
            resultText = "ビッ〇マック";
            resultImg = "bigMac.png";
            itemNum = 1;

        case 4:
            resultText = "ナゲット";
            resultImg = "macNaget.png";
            itemNum = 2;
        
        case 5:
            resultText = "モ〇バーガー";
            resultImg = "MosBurger.jpg";
            itemNum = 3;
    }

    //結果を表示
    var resultWindow = document.getElementById("lotteryResult");
    resultWindow.style.visibility = "visible";
    document.getElementById("lotteryText").textContent = resultText;
    document.getElementById("lotteryImg").src = "images/" + resultImg;

    //アイテムの数を追加
    if(itemNum != null) {
        var status = JSON.parse(localStorage.getItem("cupStatus"));
        status.items[itemNum] ++;
        localStorage.setItem("cupStatus", JSON.stringify(status));
    }

    //ガチャをした時刻をlocalStorageに記録（「1時間に1回」を判定するため）
    if(!lotteryResult) {
        lotteryResult = lotteryNum;
        console.log(currentTime);
        localStorage.setItem("lotteryTime", JSON.stringify(currentTime));
    }
}

//OKボタンを押した後、ガチャの結果を非表示にする
function hideResult() {
    document.getElementById("lotteryResult").style.visibility = "hidden";
    window.location.reload();
}

//「かわいがる」を処理
function praise() {
    var cupPinkEffect = document.getElementById("cupEffectPink");
    cupPinkEffect.style.visibility = "visible";
    window.setTimeout(hideEffectPink, 4000);

    var status = JSON.parse(localStorage.getItem("cupStatus"));
    status.point ++;

    dispPoint(status);
    savePoint(status.point);
}

function hideEffectPink() {
    var cupPinkEffect = document.getElementById("cupEffectPink");
    cupPinkEffect.style.visibility= "hidden";
}

//ゲームデータのリセット
function reset() {
    ask = showConfirm("データのリセット", "現在のゲームデータをすべてリセットします。<br>よろしいですか？");
    if(ask == false) return;
}

function doReset() {
    localStorage.clear();
    
    window.location = "./index.html";
}

//成長ポイントなどのステータスを表示
function dispPoint(status) {
    if(status.point >= 100) evolve()

    var cupSize;
    switch(status.size) {
        case 0:
            cupSize = "S";
            break;
        case 1:
            cupSize = "M";
            break;
        case 2:
            cupSize = "L";
            break;
    }

    document.getElementById("statusName").textContent = "「"+status.name+"」の";
    document.getElementById("pointArea").textContent = "成長ポイント：" + status.point.toString() + "/100 pt";
    document.getElementById("pointBar").style.width = status.point.toString() + "%";
    document.getElementById("sizeArea").innerHTML = "サイズ：<strong>"+cupSize+"</strong>"
    document.getElementById("voiceArea").textContent = status.voice;

    document.getElementById("voiceName").textContent = "「"+status.name+"」の声";
}

//成長ポイントをlocalStorageに保存
function savePoint(newPoint) {
    var status = JSON.parse(localStorage.getItem("cupStatus"));
    status.point = newPoint;
    localStorage.setItem("cupStatus", JSON.stringify(status));
}

//コップに名前を付けるフォームを表示
function giveName() {
    var form = document.getElementById("giveName");

    form.style.visibility = "visible";
}

//名付け用フォームのOKボタンが押されたとき、名前を保存
function saveName() {
    var form = document.getElementById("giveName");

    var givenName = document.getElementById("nameArea").value;

    if(givenName == "") {
        nameAlert();
        return;
    }

    var status = JSON.parse(localStorage.getItem("cupStatus"));
    status.name = givenName;
    localStorage.setItem("cupStatus", JSON.stringify(status));

    form.style.visibility = "hidden";

    dispPoint(status);
}

//名付け用フォームのテキスト欄が空欄だった時の警告
function nameAlert() {
    alertArea = document.getElementById("nameAlert");

    alertArea.textContent = "名前の入力は必須です！";
    alertArea.style.color = "red";
}

//単純アラートを表示する処理
function showAlert(title, content, code) {
    document.getElementById("alert").style.visibility = "visible";
    document.getElementById("alertTitle").textContent = title;
    document.getElementById("alertContent").textContent = content;
    alertCode = code;
}

//単純アラートを閉じる処理
function hideAlert() {
    document.getElementById("alert").style.visibility = "hidden";
    eval(alertCode);
}

//単純確認フォームを表示
function showConfirm(title, content) {
    document.getElementById("confirm").style.visibility = "visible";
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmContent").innerHTML = content;
}

//単純確認フォームを閉じる
function hideConfirm() {
    document.getElementById("confirm").style.visibility = "hidden";
}

function confirmOK() {
    document.getElementById("confirm").style.visibility = "hidden";
    doReset();
}

//冷蔵庫に入れる
function inFridge() {
    var status = JSON.parse(localStorage.getItem("cupStatus"));
    status.fridge = true;

    var currentTime = new Date();
    status.fridgeTime = currentTime.getTime();
    console.log(status.fridgeTime);

    localStorage.setItem("cupStatus", JSON.stringify(status));

    showAlert("冷蔵庫に入れる", "冷蔵庫に紙コップを入れました。タイトル画面に戻ります。", "window.location = './index.html'");
}

//サイズアップ
function evolve() {
    var status = JSON.parse(localStorage.getItem("cupStatus"));
    var alertContent;
    status.size ++;
    // status.point = 0;

    switch(status.size) {
        case 1:
            alertContent = "SサイズからMサイズになりました！次はLサイズを目指そう！";
            break;
        
        case 2:
            alertContent = "MサイズからLサイズになりました！おめでとうございます！！次は・・・？";
            break;

        default:
            alertContent = "エラー（Number status.size is too large.）";
    }

    showAlert("サイズアップ！", alertContent, "var status = JSON.parse(localStorage.getItem('cupStatus'));status.size ++;status.point = 0;localStorage.setItem('cupStatus', JSON.stringify(status));");
    
    console.log(status);
}

function gameOver() {
    showAlert("ゲームオーバー", "コップを冷蔵庫に入れましたか？冷蔵庫に入れたまま何日も放置していませんでしたか？紙コップは体調を崩して病気になってしまったようです…。", "localStorage.clear(); window.location = './index.html'");
}

//ゲームオーバー
function gameOver(type) {
    var text;

    switch(type) {
        case 1:
            text = "冷蔵庫に入れたままずっと放置され続けて、流石に1週間経ってもう力尽きたみたい…。";
            break;
        
        case 2:
            text = "冷蔵庫に入れずに何時間も放置してた？暑くてもうダメになっちゃったみたい…";
            break;
        
        default:
            text = "エラー (Unexpected number of gameover-type)";
    }

    showAlert("ゲームオーバー", text, "localStorage.clear(); window.location.href ='./index.html';");
}