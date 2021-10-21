#!/usr/bin/env node

import { fileURLToPath } from 'url'
import { init } from 'isomorphic-git'
import { dirname, resolve } from 'path'
import { copyFile, mkdir, writeFile } from 'fs/promises'
import * as fs from 'fs'

const module_dir = dirname(fileURLToPath(import.meta.url))
const user_dir = resolve(process.cwd(), process.argv.slice(2).join(' '))

if (!user_dir) throw 'you need to provide a directory to create your project in'

console.log('creating directory ' + user_dir)
await mkdir(resolve(user_dir, '.vscode'), { recursive: true })

console.log('creating git repo')
await init({
	fs,
	dir: user_dir
})

function copy(...files) {
	return Promise.all(
		files.map((file) =>
			copyFile(resolve(module_dir, file), resolve(user_dir, file))
		)
	)
}

console.log('making files')
await copy('jsconfig.json', '.gitignore', '.editorconfig', '.prettierrc', '.vscode/settings.json')
await writeFile(
	resolve(user_dir, 'package.json'),
	JSON.stringify(
		{
			main: 'index.js',
			type: 'module',
			name: process.argv.slice(2).join('-'),
			version: '1.0.0',
			exports: './index.js',
			esnext: './index.js',
			bin: './index.js'
		},
		null,
		'\t'
	)
)
writeFile(
	resolve(user_dir, 'index.js'),
	'// your code here! use imports, not requires!'
)
console.log('done!')
