import { Graphics } from 'pixi.js';

const FILL_COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8'];
const STROKE_COLORS = ['#ffffff', '#2d3436', '#00cec9', '#fdcb6e'];

export function addRandomShape(container: import('pixi.js').Container): Graphics {
  const g = new Graphics();
  const x = 40 + Math.random() * 280;
  const y = 40 + Math.random() * 200;
  const angle = Math.random() * 60 - 30;
  const scale = 0.7 + Math.random() * 0.8;

  g.position.set(x, y);
  g.angle = angle;
  g.scale.set(scale, scale);

  const kind = Math.floor(Math.random() * 4);

  switch (kind) {
    case 0:
      g.beginFill(FILL_COLORS[Math.floor(Math.random() * FILL_COLORS.length)]!)
        .drawEllipse(0, 0, 40 + Math.random() * 60, 25 + Math.random() * 40)
        .endFill();
      break;
    case 1:
      g.beginFill(FILL_COLORS[Math.floor(Math.random() * FILL_COLORS.length)]!)
        .drawRect(-40 - Math.random() * 30, -30 - Math.random() * 20, 60 + Math.random() * 50, 50 + Math.random() * 40)
        .endFill();
      break;
    case 2:
      g.lineStyle(4 + Math.random() * 8, STROKE_COLORS[Math.floor(Math.random() * STROKE_COLORS.length)]!, 1)
        .moveTo(0, 0)
        .lineTo(80 + Math.random() * 80, Math.random() * 100 - 50);
      break;
    default:
      g.lineStyle(6, STROKE_COLORS[Math.floor(Math.random() * STROKE_COLORS.length)]!, 1)
        .moveTo(-30, 0)
        .lineTo(30, 0)
        .lineTo(0, 50)
        .lineTo(-30, 0);
      break;
  }

  container.addChild(g);
  return g;
}
