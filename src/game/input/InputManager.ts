export class InputManager {
  private keys     = new Set<string>();
  private prevKeys = new Set<string>();
  private onKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);
  private onKeyUp   = (e: KeyboardEvent) => this.keys.delete(e.code);

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup',   this.onKeyUp);
  }

  // 매 프레임 시작 시 Game이 호출 — 이전 프레임 키 상태 스냅샷
  update() {
    this.prevKeys = new Set(this.keys);
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  justPressed(code: string): boolean {
    return this.keys.has(code) && !this.prevKeys.has(code);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup',   this.onKeyUp);
  }
}
