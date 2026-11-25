import { EventBus } from './core/EventBus.js';
import { StateMachine } from './core/StateMachine.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';

async function preloadImages(riddles) {
  await Promise.all([...riddles.mole, ...riddles.other].map(item => new Promise(resolve => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = item.url;
  })));
}

async function start() {
  if (!window.api) await import('./browserApi.js');
  const [riddles, settings] = await Promise.all([window.api.getRiddles(), window.api.getSettings()]);
  await preloadImages(riddles);
  const context = { riddles, settings, bus: new EventBus(), machine: new StateMachine() };
  context.machine.register('TITLE', new TitleScene(context));
  context.machine.register('PLAYING', new GameScene(context));
  context.machine.register('RESULT', new ResultScene(context));
  context.machine.register('OPTIONS', new OptionsScene(context));
  if (new URLSearchParams(location.search).has('preview')) setupPreview(context);
  window.addEventListener('keydown', event => {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyQ') {
      event.preventDefault(); window.api.quitApp();
    }
  });
  const savedScene = window.name.startsWith('mogura-preview:')
    ? window.name.slice('mogura-preview:'.length) : 'TITLE';
  context.machine.change(context.machine.scenes.has(savedScene) ? savedScene : 'TITLE',
    savedScene === 'RESULT' ? { score: 1230 } : undefined);
  function loop(now) { context.machine.update(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
}

function setupPreview(context) {
  context.preview = true;
  const toolbar = document.createElement('nav');
  toolbar.className = 'preview-toolbar';
  toolbar.setAttribute('aria-label', 'デザインプレビュー');
  toolbar.innerHTML = `<span class="preview-live"><i></i> LIVE PREVIEW</span><div class="preview-scenes"><button type="button" data-scene="TITLE">タイトル</button><button type="button" data-scene="PLAYING">ゲーム</button><button type="button" data-scene="RESULT">結果</button><button type="button" data-scene="OPTIONS">設定</button></div><small>保存すると自動反映</small>`;
  document.body.append(toolbar);
  const originalChange = context.machine.change.bind(context.machine);
  context.machine.change = (name, params) => {
    originalChange(name, params);
    window.name = `mogura-preview:${name}`;
    toolbar.querySelectorAll('[data-scene]').forEach(button => {
      button.classList.toggle('selected', button.dataset.scene === name);
    });
  };
  toolbar.addEventListener('click', event => {
    const button = event.target.closest('[data-scene]');
    if (!button) return;
    const name = button.dataset.scene;
    context.machine.change(name, name === 'RESULT' ? { score: 1230 } : undefined);
  });
  window.__previewReloadCSS = () => {
    const link = document.querySelector('link[rel="stylesheet"]');
    const url = new URL(link.href);
    url.searchParams.set('previewUpdate', String(Date.now()));
    link.href = url.href;
  };
}

start().catch(error => {
  document.getElementById('fatal-error').hidden = false;
  document.getElementById('fatal-error').textContent = `起動できませんでした: ${error.message}`;
  console.error(error);
});
