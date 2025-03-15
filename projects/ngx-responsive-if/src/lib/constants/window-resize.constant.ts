import { asyncScheduler, fromEvent } from 'rxjs';
import { shareReplay, startWith, throttleTime } from 'rxjs/operators';

export const WINDOW_RESIZE$ = fromEvent(window, 'resize')
  .pipe(
    startWith(window.innerWidth),
    throttleTime(200, asyncScheduler, { leading: true, trailing: true }),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
