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

    if(status == "null" || status == null) {

        var status = {
            point : 0,
            name : "",
            size: 0,
            voice: "大きいサイズに対してコンプレックスがあります(´・ω・`)",
            fridge: false,
            fridgeTime: null
        }

        localStorage.setItem("cupStatus", JSON.stringify(status));
    }

    //コップに名前が付いているか判定
    if(status.name == "") giveName();

    //ステータスを表示
    dispPoint(status);

    //アイテムの所持状態を確認
    myItems = JSON.parse(localStorage.getItem("possessingItems"));
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

    switch(lotteryNum) {
        case 0, 1:
            console.log("はずれ");
        
        case 2:
            console.log("セノビ〇ク");
        
        case 3:
            console.log("タオル");

        case 4:
            console.log("高級ストロー");
        
        case 5:
            console.log("音楽プレーヤー")
    }

    var resultWindow = document.getElementById("lotteryResult");
    resultWindow.style.visibility = "visible";

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
    var status = {
        point : 0,
        name : "",
        size: 0,
        voice: "大きいサイズに対してコンプレックスがあります(´・ω・`)"
    }
    localStorage.setItem("cupStatus", JSON.stringify(status));
    
    window.location = "./index.html";
}

//成長ポイントなどのステータスを表示
function dispPoint(status) {
    var cupSize;
    switch(status.size) {
        case 0:
            cupSize = "S";
            break;
        case 1:
            cupSize = "M";
        case 2:
            cupSize = "L";
    }

    document.getElementById("statusName").textContent = "「"+status.name+"」の";
    document.getElementById("pointArea").textContent = "成長ポイント：" + status.point.toString() + "/100 pt";
    document.getElementById("pointBar").style.width = status.point.toString() + "%";
    document.getElementById("sizeArea").innerHTML = "サイズ：<strong>"+cupSize+"</strong>"

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
    localStorage.setItem("cupStatus", JSON.stringify(status));

    showAlert("冷蔵庫に入れる", "冷蔵庫に紙コップを入れました。タイトル画面に戻ります。", "window.location = './index.html'");
}