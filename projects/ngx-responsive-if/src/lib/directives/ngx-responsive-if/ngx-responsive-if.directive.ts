import { DestroyRef, Directive, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MEDIA_QUERY_REGEX, WINDOW_RESIZE$ } from '../../constants';

@Directive({
  selector: '[ngxResponsiveIf]',
  standalone: true,
})
export class NgxResponsiveIfDirective implements OnChanges, OnInit {
  @Input('ngxResponsiveIf')
  mediaQuery!: string;

  @Input('ngxResponsiveIfElse')
  elseTemplate?: TemplateRef<any>;

  @Input('ngxResponsiveIfStrictMode')
  strictMode = true;

  private hasView = false;

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
    private readonly destroyRef: DestroyRef,
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
    WINDOW_RESIZE$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.updateView.bind(this));
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
    this.viewContainer.createEmbeddedView(this.elseTemplate!);
  }
}
