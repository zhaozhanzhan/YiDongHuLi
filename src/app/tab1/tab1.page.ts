import { Component } from '@angular/core';
import { HttpService } from '../../common/service/http-config.service';
import { ToastService } from 'ng-zorro-antd-mobile';
import { SpeakService } from '../../common/service/speak.service';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  show = true;
  constructor(
    public http: HttpService,
    private Speak: SpeakService,
    private _toast: ToastService
  ) {}

  ionViewDidEnter(){ }
  
  speak(some:string){
    if(typeof some === 'string'){
      this.Speak.speak(some);
    }
  }


}
