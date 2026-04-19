import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  ///Machine api start
  machineList(user: string): Observable<any> {
    const url = user ? `/api/v1/node?user=${encodeURIComponent(user)}` : '/api/v1/node';
    return this.http.get(url);
  }

  machineRegister(user: string, key: string): Observable<any> {
    return this.http.post(`/api/v1/node/register?user=${encodeURIComponent(user)}&key=${encodeURIComponent(key)}`, null);
  }

  machineDetail(machineId: string): Observable<any> {
    return this.http.get(`/api/v1/node/${machineId}`);
  }

  machineExpire(machineId: string): Observable<any> {
    return this.http.post(`/api/v1/node/${machineId}/expire`, null);
  }

  machineDelete(machineId: string): Observable<any> {
    return this.http.delete(`/api/v1/node/${machineId}`);
  }

  machineRename(machineId: string, name: string): Observable<any> {
    return this.http.post(`/api/v1/node/${machineId}/rename/${encodeURIComponent(name)}`, null);
  }

  machineTag(machineId: string, tags: Array<string>): Observable<any> {
    return this.http.post(`/api/v1/node/${machineId}/tags`, {nodeId: machineId, tags});
  }

  machineSetApprovedRoutes(machineId: string, routes: Array<string>): Observable<any> {
    return this.http.post(`/api/v1/node/${machineId}/approve_routes`, {nodeId: machineId, routes});
  }


  ///User api start
  userList(): Observable<any> {
    return this.http.get('/api/v1/user')
  }

  userAdd(name: string): Observable<any> {
    return this.http.post('/api/v1/user', {name});
  }

  userDelete(id: string): Observable<any> {
    return this.http.delete(`/api/v1/user/${id}`);
  }

  userRename(id: string, name: string): Observable<any> {
    return this.http.post(`/api/v1/user/${id}/rename/${encodeURIComponent(name)}`, {});
  }

  ///preauth key start
  preAuthKeyList(): Observable<any> {
    return this.http.get('/api/v1/preauthkey');
  }

  preAuthKeyAdd(userId: string, expiration: string, aclTags: Array<string> = [], reusable = false, ephemeral = false): Observable<any> {
    return this.http.post('/api/v1/preauthkey', {user: userId, reusable, ephemeral, aclTags, expiration});
  }

  preAuthKeyExpire(id: string): Observable<any> {
    return this.http.post('/api/v1/preauthkey/expire', {id});
  }

  ///api key start
  apikeyList(): Observable<any> {
    return this.http.get(`/api/v1/apikey`);
  }

  apikeyCreate(expiration: string): Observable<any> {
    return this.http.post('/api/v1/apikey', {expiration});
  }

  apikeyExpire(prefix: string): Observable<any> {
    return this.http.post('/api/v1/apikey/expire', {prefix});
  }
}
