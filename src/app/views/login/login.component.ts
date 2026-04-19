import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../api.service';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  serverUrl = '';
  apiKeys = '';
  changeServerUrl = '';
  hsVersion = '';

  changeServerShow = false;

  constructor(private api: ApiService, private router: Router, private msg: NzMessageService) {
  }

  ngOnInit() {
    this.serverUrl = localStorage.getItem('serverUrl') ?? '';
    this.apiKeys = localStorage.getItem('serverKey') ?? '';
    this.hsVersion = localStorage.getItem('hsVersion') ?? 'v0.28';
    let apikey = this.apiKeys;
    if (apikey) {
      this.checkLogin();
    }
  }

  handleCancel() {
    this.changeServerShow = false;
  }

  doLogin() {
    localStorage.setItem('serverKey', this.apiKeys);
    this.checkLogin();
  }

  checkLogin() {
    this.api.userList().subscribe(() => {
      this.router.navigateByUrl('');
    }, error => {
      this.msg.error(error.error?.message ?? error.error ?? 'Login failed');
    });
  }

  handleOk() {
    if (!this.changeServerUrl) {
      this.serverUrl = '';
    } else {
      this.serverUrl = this.changeServerUrl;
    }
    
    if (!this.hsVersion) {
      this.hsVersion = 'v0.28';
    }

    localStorage.setItem('serverUrl', this.serverUrl);
    localStorage.setItem('hsVersion', this.hsVersion);
    this.changeServerShow = false;
  }

  showChangeServer() {
    this.changeServerUrl = localStorage.getItem('serverUrl') ?? '';
    this.hsVersion = localStorage.getItem('hsVersion') ?? 'v0.28';
    this.changeServerShow = true;
  }

}
