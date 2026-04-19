import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {ApiService} from '../../api.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {OneInputComponent} from '../../components/one-input/one-input.component';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.css']
})
export class UserManagerComponent implements OnInit {

  users: Array<any> = [];
  expandSet = new Set<string>();

  preAuthKeys: { [key: string]: any } = {}

  constructor(private api: ApiService, private modal: NzModalService,
              private viewContainerRef: ViewContainerRef, private msg: NzMessageService) {
  }

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.api.userList().subscribe(x => {
      this.users = x.users.sort((a: any, b: any) => parseInt(a.id) - parseInt(b.id));
    });
  }

  getPreAuthKeys(user: any) {
    this.api.preAuthKeyList().subscribe(x => {
      this.preAuthKeys[user.id] = (x.preAuthKeys ?? []).filter((key: any) => key.user?.id === user.id);
    });
  }

  onExpandChange(user: any, checked: boolean): void {
    if (checked) {
      this.expandSet.add(user.id);
      this.getPreAuthKeys(user);
    } else {
      this.expandSet.delete(user.id);
    }
  }

  newUser() {
    this.modal.create({
      nzTitle: 'New User',
      nzContent: OneInputComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzFooter: null
    }).afterClose.subscribe(x => {
      if (x) {
        this.api.userAdd(x).subscribe(x => {
          this.msg.success('User add success');
          this.getList();
        })
      }
    })
  }

  renameUser(user: any) {
    this.modal.create({
      nzTitle: `Rename User - ${user.name}`,
      nzComponentParams: {notice: user.name},
      nzContent: OneInputComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzFooter: null
    }).afterClose.subscribe(x => {
      if (x) {
        this.api.userRename(user.id, x).subscribe(() => {
          this.msg.success('User Rename success');
          this.getList();
        });
      }
    });
  }

  deleteUser(user: any) {
    this.modal.warning({
      nzTitle: 'Delete Confirm',
      nzContent: `will delete user 【 ${user.name} 】 ,Are you sure？`,
      nzOkDanger: true,
      nzOkText: 'Delete',
      nzCancelText: 'cancel',
      nzOnOk: () => {
        this.api.userDelete(user.id).subscribe(_ => {
          this.msg.success('User delete success');
          this.getList();
        });
      }
    });
  }

  createPreAuthKey(user: any) {
    this.api.preAuthKeyAdd(user.id, '9999-03-23T13:41:44.928Z').subscribe(_ => {
      this.msg.success('Create PreAuthKey success');
      this.getPreAuthKeys(user);
    });
  }

  expirePreAuthKey(user: any, key: any) {
    this.modal.warning({
      nzTitle: 'Expire Confirm',
      nzContent: `will expire PreAuthKey 【 ${key.key} 】 ,Are you sure？`,
      nzOkDanger: true,
      nzOkText: 'Expire It',
      nzCancelText: 'cancel',
      nzOnOk: () => {
        this.api.preAuthKeyExpire(key.id).subscribe(_ => {
          this.msg.success('Expire PreAuthKey success');
          this.getPreAuthKeys(user);
        });
      }
    });
  }
}
