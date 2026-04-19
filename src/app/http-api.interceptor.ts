import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {

  constructor(private router: Router, private msg: NzMessageService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const serverKey = localStorage.getItem('serverKey') ?? '';
    const resetReq = request.clone({
      setHeaders: {
        Authorization: serverKey ? `Bearer ${serverKey}` : '',
        'Content-Type': 'application/json'
      },
      url: (localStorage.getItem('serverUrl') ?? '') + request.url
    });
    return next.handle(resetReq).pipe(catchError((error: any): Observable<any> => {
      if (error.error === 'Unauthorized') {
        this.msg.error(error.error.message ?? error.error);
        localStorage.setItem('serverKey', '');
        this.router.navigateByUrl('/login');
      }
      if (error.status === 404 || error.status == 0) {
        this.msg.error("Error message: " + error.error.message + "<br />API endpoint not found, either Headscale Url or version is wrong. <br /> Exit and configure the correct URL and version.");
        if(localStorage.getItem('serverKey') == null){
          this.router.navigateByUrl('/login');
        }
      }
      return of(error)
    }));
  }
}
