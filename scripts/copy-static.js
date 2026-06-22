import fs from 'fs'
import path from 'path'

const staticHtml = [
  'index.html', 'tienda.html', 'contacto.html', 'plataforma.html',
  'legal.html', 'terminos.html', 'privacidad.html', 'reembolsos.html',
  'nosotros.html', 'ayuda.html', 'producto.html',
]

const staticDirs = ['assets', 'soluciones']

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item)
    const d = path.join(dest, item)
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d)
  }
}

for (const file of staticHtml) {
  if (fs.existsSync(file)) fs.copyFileSync(file, path.join('dist', file))
}

for (const dir of staticDirs) {
  if (fs.existsSync(dir)) copyDir(dir, path.join('dist', dir))
}

console.log('Archivos estáticos copiados a dist/')
