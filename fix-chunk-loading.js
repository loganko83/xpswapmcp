import fs from 'fs';
import path from 'path';

const indexPath = path.join(process.cwd(), 'client/dist/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// react-core를 가장 먼저 로드하도록 수정
const scriptRegex = /<script type="module" crossorigin src="(.+?)"><\/script>/;
const linkRegex = /<link rel="modulepreload" crossorigin href="(.+?react-core.+?)">/;

// react-core 링크를 찾아서 script 태그로 변경
const reactCoreMatch = html.match(linkRegex);
if (reactCoreMatch) {
  const reactCorePath = reactCoreMatch[1];
  
  // 기존 modulepreload 제거
  html = html.replace(reactCoreMatch[0], '');
  
  // main script 앞에 react-core script 추가
  html = html.replace(
    scriptRegex,
    `<script type="module" crossorigin src="${reactCorePath}"></script>\n    $&`
  );
}

fs.writeFileSync(indexPath, html);
console.log('Fixed chunk loading order');
