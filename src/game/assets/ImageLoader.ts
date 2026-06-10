export type GameImages = {
  player: HTMLImageElement;
  bubble: HTMLImageElement;
};

function loadOne(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
    img.src = src;
  });
}

export function loadImages(): Promise<GameImages> {
  return Promise.all([
    loadOne('/images/player.png'),
    loadOne('/images/bubble.png'),
  ]).then(([player, bubble]) => ({ player, bubble }));
}
