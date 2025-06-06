import * as THREE from 'three';

type GraphNode = {
  id: string;
  name: string;
  val: number;
  color: string;
  originalColor: string;
};

const colorMap: Record<string, string> = {
  'bg-slate-100': '#f1f5f9',
  'bg-gray-100': '#f3f4f6',
  'bg-zinc-100': '#f4f4f5',
  'bg-neutral-100': '#f5f5f5',
  'bg-stone-100': '#f5f5f4',
  'bg-red-100': '#fee2e2',
  'bg-orange-100': '#ffedd5',
  'bg-amber-100': '#fef3c7',
  'bg-yellow-100': '#fef9c3',
  'bg-lime-100': '#ecfccb',
  'bg-green-100': '#dcfce7',
  'bg-emerald-100': '#d1fae5',
  'bg-teal-100': '#ccfbf1',
  'bg-cyan-100': '#cffafe',
  'bg-sky-100': '#e0f2fe',
  'bg-blue-100': '#dbeafe',
  'bg-indigo-100': '#e0e7ff',
  'bg-violet-100': '#ede9fe',
  'bg-purple-100': '#f3e8ff',
  'bg-fuchsia-100': '#fae8ff',
  'bg-pink-100': '#fce7f3',
  'bg-rose-100': '#ffe4e6'
};

export const createNodeObject = (node: GraphNode, darkMode: boolean) => {
  const color = node.color.includes('bg-') 
    ? colorMap[node.color.split(' ')[0]] || '#e2e8f0'
    : '#e2e8f0';

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(Math.sqrt(node.val) * 1.5),
    new THREE.MeshBasicMaterial({
      color
    })
  );

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(createTextCanvas(node.name, darkMode)),
      transparent: true,
      opacity: 0.9
    })
  );

  sprite.scale.set(12, 6, 1);
  sprite.position.y = Math.sqrt(node.val) * 2;

  const group = new THREE.Group();
  group.add(sphere);
  group.add(sprite);
  return group;
};

const createTextCanvas = (text: string, isDarkMode: boolean) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const fontSize = 24;
  const maxWidth = 200;

  ctx.font = `${fontSize}px Arial`;
  const textWidth = Math.min(ctx.measureText(text).width, maxWidth);
  canvas.width = textWidth + 10;
  canvas.height = fontSize + 10;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2, maxWidth);

  return canvas;
};