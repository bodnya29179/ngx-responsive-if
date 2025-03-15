import { asyncScheduler, fromEvent, throttleTime } from 'rxjs';
import { shareReplay, startWith } from 'rxjs/operators';

export const WINDOW_RESIZE$ = fromEvent(window, 'resize')
  .pipe(
    startWith(window.innerWidth),
    throttleTime(200, asyncScheduler, { leading: true, trailing: true }),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
