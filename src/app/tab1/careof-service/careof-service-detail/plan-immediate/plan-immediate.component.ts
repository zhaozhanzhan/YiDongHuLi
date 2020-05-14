import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '../../../../../common/service/http-config.service';
import { ToastService } from 'ng-zorro-antd-mobile';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { SpeakService } from '../../../../../common/service/speak.service';
@Component({
  selector: 'app-plan-immediate',
  templateUrl: './plan-immediate.component.html',
  styleUrls: ['./plan-immediate.component.scss'],
})
export class PlanImmediateComponent implements OnInit {
  @Input() olderId;
  InTimeInfoProject = [];
  constructor(
    private toast: ToastService,
    public http: HttpService,
    public nav: NavController,
    private Speak: SpeakService,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.getImmediateList(this.olderId)
  }

  // 获取服务列表
  getImmediateList(id) {
    this.http.post('care_service/listInstant', {oldmanId: id}).then(data => {
      if(data.code === 0){
        let arr = [];
        if(data.data instanceof Array){
          arr = data.data.map(item=>{
            let x = item["serviceItem"];
            x["classify"] = x["classifyName"];
            if(x["picEl"]){
              x["picEl"] = JSON.parse(x["picEl"]);
            }
            return x;
          });
        }
        this.InTimeInfoProject = arr;
        console.log(this.InTimeInfoProject);
      }
    });
  }

  // 详情页
  goDetail(data) {
    this.speak(data.project);
    this.nav.navigateForward('/careof-service/careof-service-detail/project-detail', {
      queryParams: { info: data, olderId: this.olderId }
    });
  }

  //
  speak(some){
    if (typeof some === 'string') {
      this.Speak.speak(some);
    }
  }


}
