const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const x_pos = 1500, y_pos = 400

let win,win2,win3;
let menu;
/**
 * 创建窗口
 */
function createWindow() {
  //主窗口
  win = new BrowserWindow({
    // x: x_pos,
    // y: y_pos,
    width: 1000,
    height: 800,
    resizable:false,
    icon: path.join(__dirname, 'screen.ico'),
    backgroundColor: '#66ccff',
    // alwaysOnTop:true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  // win.webContents.openDevTools();  //自动开启开发者工具
  win.loadFile('index.html')

  //无边框透明窗口
  win3 = new BrowserWindow({
    // x: x_pos+50,
    // y: y_pos+50,
    width: 220,
    height: 220,
    frame:false,
    parent: win,
    transparent: true,
    show: false
  })
  win3.loadFile('transparent_window.html')
}


/**
 * 弹出窗口
 * 显示版本信息
 */
function popupWindow(){
  win2 = new BrowserWindow({
    // x: x_pos+200,
    // y: y_pos+100,
    width:400,
    height:300,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    webPreferences:{
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration:true
    },
    parent: win,
    modal: true
  })
  win2.loadFile('popup_window.html')
}



app.whenReady().then(() => {
  menu = Menu.buildFromTemplate(template)  //加载菜单模板
  Menu.setApplicationMenu(menu) // 设置菜单部分
  createWindow();
  // setInterval(function(){win3.close()},1000);

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('closed')
    app.quit()
  }
})

/**
 * 自定义菜单栏
 * 注册键盘快捷键
 * 其中：label: '切换开发者工具',这个可以在发布时注释掉
 */
let template = [
  {
    label: 'Edit ( 操作 )',
    submenu: [
    {
      label: '刷新',
      accelerator: 'CmdOrCtrl+R',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          // on reload, start fresh and close any old
          // open secondary windows
          if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach(function (win) {
              if (win.id > 1) {
                win.hide()
              }
            })
          }
          focusedWindow.reload()
          menu.getMenuItemById('stop').click();
          menu.getMenuItemById('transparent').checked=false;
        }
      }
    }, {
      label: '设置初始化',
      accelerator: 'CmdOrCtrl+I',
      click: (item, focusedWindow) => {
        menu.getMenuItemById('range').click();
        menu.getMenuItemById('speed').click();
        menu.getMenuItemById('tips').checked=true;
        menu.getMenuItemById('tips').click();
        menu.getMenuItemById('pitchName').checked=true;
        menu.getMenuItemById('pitchName').click();
      }
    }]
  },
  {
    label: 'Window ( 窗口 )',
    role: 'window',
    submenu: [{
      label: '最小化',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize',
    }, {
      label: '最大化/还原',
      accelerator: 'CmdOrCtrl+H',
      role: 'togglefullscreen'
    }, {
      label: '关闭窗口',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, {
      type: 'separator'
    }, {
      label: '切换开发者工具',
      accelerator: (function () {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I'
        } else {
          return 'F12'
        }
      })(),
      // click: function (item, focusedWindow) {
      //   if (focusedWindow) {
      //     focusedWindow.toggleDevTools()
      //   }
      // }
      role: 'toggleDevTools'
    }, {
      label: '显示图标',
      type: 'checkbox',
      id:'transparent',
      click: (menuItem) => {
        if(menuItem.checked==false){
          win3.hide()
        }else{
          win3.show()
        }
      }
    }]
  },
  {
    label:'Control ( 控制 )',
    submenu: [{
      label: '开始',
      id: 'start',
      click: (menuItem) => {
        menu.getMenuItemById('stop').enabled = true
        menu.getMenuItemById('pause').enabled = true
        menuItem.enabled = false
        win.webContents.send('game-start')
        win.webContents.send('show-tips', menu.getMenuItemById('tips').checked)
      }
    }, {
      label: '暂停/继续',
      id: 'pause',
      enabled: false,
      click: (menuItem) => {
        win.webContents.send('game-pause')
      }
    }, {
      label: '停止',
      id: 'stop',
      enabled: false,
      click: (menuItem) => {
        menu.getMenuItemById('start').enabled = true
        menu.getMenuItemById('pause').enabled = false
        menuItem.enabled = false
        win.webContents.send('game-stop')
      }
    }, {
      type:'separator'
    }, {
      label: '成绩统计',
      click: (menuItem) => {
        win.webContents.send('get-statistic', true)
      }
    }, {
      label: '清除数据',
      click: (menuItem) => {
        win.webContents.send('get-statistic', false)
      }
    }]
  },
  {
    label:'Settings ( 设置 )',
    submenu:[{
      label: '显示提示',
      id: 'tips',
      type: 'checkbox',
      checked: false,
      click: (menuItem) => {
        if(menu.getMenuItemById('start').enabled == false)
          win.webContents.send('show-tips', menuItem.checked)
        else{
          menuItem.checked=!menuItem.checked
        }
      }
    }, {
      label: '切换唱名',
      id: 'pitchName',
      type: 'checkbox',
      click: (menuItem) => {
        win.webContents.send('show-pitch-name', menuItem.checked)
      }
    }, {
      type: 'separator'
    }, {
      label: '高音谱线',
      type: 'radio',
      click: () => {
        win.webContents.send('range-change', true, false)
      }
    }, {
      label: '低音谱线',
      type: 'radio',
      click: () => {
        win.webContents.send('range-change', false, true)
      }
    }, {
      label: '高低音谱线',
      id:'range',
      type: 'radio',
      checked: true,
      click: () => {
        win.webContents.send('range-change', true, true)
      }
    }, {
      type: 'separator'
    } ,{
      label: '快速 ( 3s )',
      type: 'radio',
      click: (menuItem) => {
        win.webContents.send('speed-change', 2, '快速')
      }
    }, {
      label: '中速 ( 5s )',
      type: 'radio',
      id: 'speed',
      checked: true,
      click: (menuItem) => {
        win.webContents.send('speed-change', 5, '中速')
      }
    }, {
      label: '慢速 (10s)',
      type: 'radio',
      click: (menuItem) => {
        win.webContents.send('speed-change', 10, '慢速')
      }
    }]
  },
  {
    label: 'Help ( 帮助 ) ',
    role: 'help',
    submenu: [{
      label: '版本信息',
      click: function () {
        popupWindow()
      }
    }, {
      label: '更多信息',
      click: async () => {
        const { shell } = require('electron')
        await shell.openExternal('https://electronjs.org')
      }
    }]
  }
]