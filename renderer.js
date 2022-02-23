const { ipcRenderer } = require('electron')


/**
 * 使用ipcRenderer
 * 与主进程通信
 */

// 开始
ipcRenderer.on('game-start', (event, arg) => {
    flag=0;
    pause=false;
    timer=0;
    myTimer();
    initial();
})

// 暂停恢复
ipcRenderer.on('game-pause', (event, arg) => {
    if (!pause) suspend()
    else initial()
    pause = !pause
})

// 停止
ipcRenderer.on('game-stop', (event, arg) => {
    hideElement();
    suspend();
})

// 切换提示显示/隐藏
ipcRenderer.on('show-tips', (event, arg) => {
    if(arg==true)document.getElementById("text").style="";
    else document.getElementById("text").style="VISIBILITY: hidden";
})

// 唱名和音名的切换显示
ipcRenderer.on('show-pitch-name', (event, arg) => {
    if(arg==true)
        for(let i=0;i<pitchNames.length;i++)document.getElementsByClassName("button")[i].innerHTML=pitchNames[i];
    else for(let i=0;i<pitchNames.length;i++)document.getElementsByClassName("button")[i].innerHTML=syllableNames[i];
    timer=0;
})

// 改变切换速度
ipcRenderer.on('speed-change', (event, arg1, arg2) => {
    if(arg1>0)countdown=arg1;
    timer=0;
    console.log("Speed change to", arg2,", image changes every", arg1, "seconds.");
})

// 改变五线谱范围
ipcRenderer.on('range-change', (event, arg1, arg2) => {
    flag1=arg1, flag2=arg2;
    notation = [];
    if(flag2==true)notation=notation.concat(lower);
    if(flag1==true)notation=notation.concat(higher);
    timer=0;
    console.log("Range changed", flag1, flag2);
})

// 数据统计
ipcRenderer.on('get-statistic', (event, arg) => {
    if(arg){
        if(right+wrong==0) alert('还没开始练习呢，请练习后再查看。');
        else{
            suspend();
            alert('共尝试'+(right+wrong)+'次练习，其中答对'+right+'次，正确率为'+right/(right+wrong)*100+'%，请继续努力！');
            initial();
        }
    }
    else{
        right=0,wrong=0;
        console.log('clear');
        message.run("数据已清除！");
    }
})

const syllableNames = [1,2,3,4,5,6,7];  //唱名
const pitchNames = ['C','D','E','F','G','A','B'];  //音名
const lower = ['1_','2_','3_','4_'];  //低音谱
const higher = ['3','4','5','6'];  //高音谱
const path = 'image/';  //路径
const suffix = '.png';  //文件后缀
let countdown = 5;  //倒计时
let notation = lower.concat(higher); //选择范围
let timerId;
let right = 0, wrong = 0;// 情况统计
let currentnote = 0;

let flag1=true;
let flag2=true;
let pause=false;
let timer = 0;
var flag = 0;
 

function showMessage(){
    message.run("列表查询成功！");
        setTimeout(() => {
            message.run("warning", "warning");
        }, 1000);
        setTimeout(() => {
            message.run("error", "error");
        }, 2000);
        setTimeout(() => {
            message.run("info", "info");
        }, 3000);
}

/**
 * 计时器
 * 每隔一定时间执行一次
 */
function myTimer()
{
    timer--;
    if(timer<0){
        timer=countdown;
        let melody = parseInt(Math.random()*syllableNames.length,10);
        currentnote = syllableNames[melody]
        let note = parseInt(Math.random()*notation.length,10);
        let fileName = pitchNames[melody]+notation[note];
        document.getElementById("image").src=path+fileName+suffix;
        document.getElementById("syllableNames").innerHTML=syllableNames[melody];
        document.getElementById("pitchNames").innerHTML=pitchNames[melody];
        if(flag==0)showElement();
    }
    document.getElementById("num").innerHTML=timer;
}

// 选项按钮点击
function buttonClick(arg){
    if(pause){
        console.log('现实中可没有子弹时间这种东西哦');
        return;
    }
    if(currentnote==arg){
        message.run("√");
        right+=1;
        timer=-1;
    }else{
        message.run("×","error");
        wrong+=1;
    }
    console.log(right+'/'+(right+wrong));
}

/**
 * 隐藏界面
 */
function hideElement(){
    document.getElementById("image").style="VISIBILITY: hidden";
    document.getElementById("text").style="VISIBILITY: hidden";
    document.getElementById("countdown").style="VISIBILITY: hidden";
    for (const buttons of document.getElementsByClassName("button"))buttons.style="VISIBILITY: hidden";
}

/**
 * 显示界面
 */
function showElement(){
    flag++;
    document.getElementById("image").style="";
    document.getElementById("text").style="";
    document.getElementById("countdown").style="";
    for (const buttons of document.getElementsByClassName("button"))buttons.style="";
}

/**
 * 界面初始化
 */
function initial()
{
    if(timerId) return;
    console.log("Timer start");
    var myVar=setInterval(function(){myTimer()},1000);
    timerId = myVar;
}

/**
 * 停止及数据统计
 */
function suspend()
{
    if(timerId){
        clearInterval(timerId);
        timerId = null;
        console.log("Timer stop");
    }
}

// 显示通知
async function notification (){
    const myNotification = new Notification('渲染进程显示通知', {body: '这是一个渲染进程的通知'})
      myNotification.onclick = () => {
        console.log('Notification clicked')
      }
      myNotification.onclose = () => {
        console.log('Notification closed')
      }
}

function showVersion(){
    alert("We are using Node.js <span id=\"node-version\"></span>,Chromium <span id=\"chrome-version\"></span>,and Electron <span id=\"electron-version\"></span>.")
}

module.exports = showVersion;