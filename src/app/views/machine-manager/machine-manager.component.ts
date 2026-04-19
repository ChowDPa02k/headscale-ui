import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {ApiService} from '../../api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {OneInputComponent} from '../../components/one-input/one-input.component';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-machine-manager',
  templateUrl: './machine-manager.component.html',
  styleUrls: ['./machine-manager.component.css']
})
export class MachineManagerComponent implements OnInit {
  expandSet = new Set<string>();

  machines: Array<any> = [];
  user = '';
  users: Array<any> = [];

  constructor(private api: ApiService, private route: ActivatedRoute, private msg: NzMessageService,
              private modal: NzModalService, private viewContainerRef: ViewContainerRef,
              private router: Router) {
  }

  ngOnInit() {
    this.getUsers();
    this.route.queryParams.subscribe(x => {
      if (x['user']) {
        this.user = x['user'];
      } else {
        this.user = ''
      }
      this.getList();
    })
  }

  getUsers() {
    this.api.userList().subscribe(x => {
      this.users = x.users;
    });
  }

  getList() {
    this.api.machineList(this.user).subscribe(x => {
      this.machines = (x.nodes ?? [])
        .map((node: any) => this.normalizeMachine(node))
        .sort((a: any, b: any) => parseInt(a.id) - parseInt(b.id));
    });
  }

  normalizeMachine(node: any) {
    const approvedRoutes = node.approvedRoutes ?? [];
    const routePrefixes = Array.from(new Set([
      ...(node.availableRoutes ?? []),
      ...approvedRoutes,
      ...(node.subnetRoutes ?? [])
    ]));
    const routes = routePrefixes.map((prefix: string) => ({
      nodeId: node.id,
      prefix,
      advertised: (node.availableRoutes ?? []).includes(prefix) || (node.subnetRoutes ?? []).includes(prefix),
      enabled: approvedRoutes.includes(prefix),
      isPrimary: false
    }));
    const exitNodes = routes.filter(route => ['0.0.0.0/0', '::/0'].includes(route.prefix));
    const subnets = routes.filter(route => !['0.0.0.0/0', '::/0'].includes(route.prefix));

    return {
      ...node,
      tags: node.tags ?? [],
      exitNodes,
      subnets,
      subnets_enabled_num: subnets.filter(route => route.enabled).length,
      exitNode_enabled_num: exitNodes.filter(route => route.enabled).length,
      lastSuccessfulUpdate: null
    };
  }

  setRouteState(machine: any, prefix: string, enabled: boolean) {
    const currentRoutes = machine.approvedRoutes ?? [];
    const nextRoutes = enabled
      ? Array.from(new Set([...currentRoutes, prefix]))
      : currentRoutes.filter((route: string) => route !== prefix);

    this.api.machineSetApprovedRoutes(machine.id, nextRoutes).subscribe(() => {
      this.msg.success(`Route ${enabled ? 'Enable' : 'Disable'} success`);
      this.getList();
    });
  }

  enableRoute(machine: any, prefix: string) {
    this.setRouteState(machine, prefix, true);
  }

  disableRoute(machine: any, prefix: string) {
    this.setRouteState(machine, prefix, false);
  }

  routeTrackBy(_: number, route: any) {
    return `${route.nodeId}:${route.prefix}`;
  }

  machineTrackBy(_: number, machine: any) {
    return machine.id;
  }

  routeSummaryLabel(machine: any, type: 'subnet' | 'exitNode') {
    if (type === 'subnet') {
      return `SubNet ${machine.subnets_enabled_num}/${machine.subnets.length}`;
    }

    return `ExitNode ${machine.exitNode_enabled_num}/${machine.exitNodes.length}`;
  }

  tagLabel(machine: any) {
    if (machine.tags.length === 0) {
      return 'None';
    }

    return machine.tags.join(', ');
  }

  renameMachine(machine: any) {
    this.modal.create({
      nzTitle: `Rename Machine - ${machine.givenName}`,
      nzComponentParams: {notice: machine.givenName},
      nzContent: OneInputComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzFooter: null
    }).afterClose.subscribe(x => {
      if (x) {
        this.api.machineRename(machine.id, x).subscribe(() => {
          this.msg.success('Machine Rename success');
          this.getList();
        });
      }
    });
  }

  deleteMachine(machine: any) {
    this.modal.warning({
      nzTitle: 'Delete Confirm',
      nzContent: `will delete machine 【 ${machine.givenName} 】 ,Are you sure？`,
      nzOkDanger: true,
      nzOkText: 'Delete',
      nzCancelText: 'cancel',
      nzOnOk: () => {
        this.api.machineDelete(machine.id).subscribe(_ => {
          this.msg.success('Machine delete success');
          this.getList();
        });
      }
    });
  }

  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  userChange(e: any) {
    if (e) {
      this.router.navigateByUrl(`/machine?user=${e}`)
    } else {
      this.router.navigateByUrl('/machine')
    }
  }

  registerMachine() {
    if (!this.user) {
      this.msg.error('Please select user first!')
      return;
    }
    this.modal.create({
      nzTitle: `Register Machine For User: ${this.user}`,
      nzContent: OneInputComponent,
      nzComponentParams: {notice: 'Registration ID (24 chars)'},
      nzViewContainerRef: this.viewContainerRef,
      nzFooter: null
    }).afterClose.subscribe(x => {
      if (x) {
        this.api.machineRegister(this.user, x.trim()).subscribe(() => {
          this.msg.success('Register machine success');
          this.getList();
        });
      }
    });
  }
}
