import { Component } from '@angular/core';
import { ToastService } from 'ng-zorro-antd-mobile';
import { HttpService } from '../../common/service/http-config.service';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { SpeakService } from '../../common/service/speak.service';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public id: string; // 登陆者id
  public instantInfo = { // 即时任务
    time: '即时服务',
    projectList: [],
    showProjectList: []
  };
  public overTimeInfo = []; // 过期任务
  public intervalInfo = { // 时间段任务
    time: '',
    projectList: [],
    showProjectList: []
  };
  public dayInfo = { // 每日任务
    time: '每日服务',
    projectList: [],
    showProjectList: []
  };
  public weekInfo = { // 每周任务
    time: '每周服务',
    projectList: [],
    showProjectList: []
  };
  public timer: any;
  public previous = 0;
  todayWea: any;
  todayWeaInfo: any;
  constructor(
    private _toast: ToastService,
    public http: HttpService,
    public nav: NavController,
    private Speak: SpeakService,
    private storage: Storage
  ) {}

  ngOnInit(): void {
    this.storage.get('userINFO').then(data=>{
      // console.error(data);
      if(data.id) {
        this.id = data.id;
        this.getIntervalCareInfo(data.id);
        this.getInstantCareInfo(data.id);
        this.getWeekCareInfo(data.id);
        this.getMonthCareInfo(data.id);
        this.getWeather(data.id);
      } else { console.error("can not find the login id")}
    })
  }

  ionViewWillEnter(){
    if(this.id){
      this.throttle(this.getWeather, 10800000).call(this, this.id);
    }
  }

  getIntervalCareInfo(id){
    this.http.post('care/listIntervalItems',{id:id}).then(data=>{
      if (data.code === 0) {
        // 过期任务
        this.overTimeInfo = data.data.add;
        if(this.overTimeInfo.length){
          this.overTimeInfo.forEach(item=>{
            if(Array.isArray(item.itemDetail) && item.itemDetail.length){
              item.itemDetail.forEach(element => {
                if(element["item"]["picEl"]){
                  element["item"]["picEl"] = JSON.parse(element["item"]["picEl"]);
                }
              });
            }
          })
        }
        // 当前时段任务
        this.intervalInfo.time = data.data.dayInterval;
        this.intervalInfo.projectList = data.data.itemDetail;
        this.intervalInfo.projectList.forEach(item => {
          if(item["item"]["picEl"]){
            item["item"]["picEl"] = JSON.parse(item["item"]["picEl"]);
          }
        });
        this.intervalInfo.showProjectList = this.intervalInfo.projectList.slice(0, 4);
      } else {
        ToastService.show(data.message ? data.message : "请求遇到了问题呢~", 2000);
      }
    })
  }

  getInstantCareInfo(id){
    this.http.post('care/listInstantItems',{id:id}).then(data=>{
      if (data.code === 0) {
        this.instantInfo.projectList = data.data.itemDetail;
        this.instantInfo.projectList.forEach(item => {
          if(item["item"]["picEl"]){
            item["item"]["picEl"] = JSON.parse(item["item"]["picEl"]);
          }
        });
        this.instantInfo.showProjectList = this.instantInfo.projectList.slice(0, 4);
      } else {
        ToastService.show(data.message ? data.message : "请求遇到了问题呢~", 2000);
      }
    })
  }

  getWeekCareInfo(id){
    this.http.post('care/listWeekItems',{id:id}).then(data=>{
      if (data.code === 0) {
        this.dayInfo.projectList = data.data.itemDetail;
        this.dayInfo.projectList.forEach(item => {
          if(item["item"]["picEl"]){
            item["item"]["picEl"] = JSON.parse(item["item"]["picEl"]);
          }
        });
        this.dayInfo.showProjectList = this.dayInfo.projectList.slice(0, 4);
      } else {
        ToastService.show(data.message ? data.message : "请求遇到了问题呢~", 2000);
      }
    })
  }

  getMonthCareInfo(id){
    this.http.post('care/listMonthItems',{id:id}).then(data=>{
      if (data.code === 0) {
        this.weekInfo.projectList = data.data.itemDetail;
        this.weekInfo.projectList.forEach(item => {
          if(item["item"]["picEl"]){
            item["item"]["picEl"] = JSON.parse(item["item"]["picEl"]);
          }
        });
        this.weekInfo.showProjectList = this.weekInfo.projectList.slice(0, 4);
      } else {
        ToastService.show(data.message ? data.message : "请求遇到了问题呢~", 2000);
      }
    })
  }

  // 项目展示与隐藏
  showAllPro(name){
    let listLength = this[name]['projectList']['length'];
    let showListLength = this[name]['showProjectList']['length'];
    if(showListLength < listLength){
      this[name]['showProjectList'] = this[name]['projectList'];
    } else {
      this[name]['showProjectList'] = this[name]['projectList'].slice(0, 4);
    }
  }

  // 下拉刷新
  doRefresh(event) {
    console.log('Begin async operation');
    this.ngOnInit();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  // 详情页
  goDetail(data){
    this.Speak.speak(data.item.project);
    this.nav.navigateForward('/service-project', {
      queryParams: { info: data }
    });
  }

  //
  speak(){
    if(this.todayWea){
      let Y = new Date().getFullYear().toString().split('').join();
      let M = new Date().getMonth() + 1;
      let D = new Date().getDate();
      let mes = '';
      if(this.todayWea['wea'].indexOf("雨") >= 0){
        mes = '出门请带好雨具!';
      }
      let spe = `${Y}年${M}月${D}日，${this.todayWea.weekDay}，${this.todayWea.temperature}，${this.todayWea.wea}，空气污染程度：${this.todayWea.airLevel} ${mes}。`
      // console.log(spe);
      this.Speak.speak(spe);
    }
  }

  // 获取天气
  getWeather(id){
    this.http.get('appNurseConfig/getWeather',{id:id}).then(data=>{
      if(data.code === 0){
        // console.log(this.todayWea);
        if(data.data[0]){
          this.todayWea = data.data[0];
          let info = data.data[0];
          let Y = new Date().getFullYear();
          let mes = '';
          if(info['wea'].indexOf("雨") >= 0){
            mes = '出门请带好雨具!';
          }
          this.todayWeaInfo = `${Y}年${info.date}，${info.weekDay}，${info.temperature}，${info.wea}，空气污染程度：${info.airLevel} ${mes}`;
        }else{
          this.todayWeaInfo = "获取天气信息失败！";
        }
      }else{
        ToastService.fail(data.message ? data.message : "获取天气信息失败！");
      }
    })
  }

  debounce(func:Function, wait){
    var timer;
    return function(){
      var content = this,
          args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function(){
        func.apply(content, args)
      }, wait);
    }
  }

  throttle(func:Function, wait){
    var content, args;
    content = this;
    return function(){
      var now = +new Date();
      args = arguments;
      if (now - content.previous > wait) {
        func.apply(content, args);
        content.previous = now;
      }
    }
  }

}
