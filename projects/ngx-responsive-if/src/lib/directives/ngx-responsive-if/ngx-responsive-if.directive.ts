import { Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MEDIA_QUERY_REGEX, WINDOW_RESIZE$ } from '../../constants';

@Directive({
  selector: '[ngxResponsiveIf]',
})
export class NgxResponsiveIfDirective implements OnChanges, OnInit, OnDestroy {
  @Input('ngxResponsiveIf')
  mediaQuery!: string;

  @Input('ngxResponsiveIfElse')
  elseTemplate?: TemplateRef<any>;

  @Input('ngxResponsiveIfStrictMode')
  strictMode = true;

  private hasView = false;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (('mediaQuery' in changes) && this.strictMode && !MEDIA_QUERY_REGEX.test(this.mediaQuery)) {
      throw new Error(`[ngxResponsiveIf] Invalid media query: "${ this.mediaQuery }".`);
    }

    if ('strictMode' in changes && typeof this.strictMode !== 'boolean') {
      throw new Error(`[ngxResponsiveIf] "strictMode" must be a boolean value.`);
    }
  }

  ngOnInit(): void {
    WINDOW_RESIZE$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.updateView.bind(this));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private updateView(): void {
    const mediaQuery = this.strictMode ? `(${ this.mediaQuery })` : this.mediaQuery;

    if (window.matchMedia(mediaQuery).matches) {
      if (!this.hasView) {
        this.renderView();
      }
    } else {
      if (this.hasView) {
        this.destroyView();
      }

      if (this.elseTemplate) {
        this.renderElseView();
      }
    }
  }

  private renderView(): void {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private destroyView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }

  private renderElseView(): void {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.elseTemplate);
  }
}
