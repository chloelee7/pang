import { useEffect, useRef, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import { InputManager } from '../game/input/InputManager';
import { Player } from '../game/entities/Player';
import { Game } from '../game/Game';
import { loadImages } from '../game/assets/ImageLoader';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    let game: Game | null = null;
    let input: InputManager | null = null;
    let cancelled = false;

    loadImages()
      .then(images => {
        if (cancelled) return;
        input  = new InputManager();
        const player = new Player();
        game   = new Game(ctx, input, player, images);
        game.start();
        setLoading(false);
      })
      .catch(err => {
        // 이미지 로드 실패 시 이미지 없이 실행
        console.warn('이미지 로드 실패, 폴백 렌더링으로 실행:', err);
        if (cancelled) return;
        input  = new InputManager();
        const player = new Player();
        game   = new Game(ctx, input, player);
        game.start();
        setLoading(false);
      });

    return () => {
      cancelled = true;
      game?.stop();
      input?.destroy();
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'block', margin: '0 auto' }}
      />
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#111', color: '#fff', fontSize: 24, fontFamily: 'monospace',
        }}>
          Loading...
        </div>
      )}
    </div>
  );
}
