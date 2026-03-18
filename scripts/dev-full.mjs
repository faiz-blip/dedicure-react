import { spawn } from 'node:child_process'

const children = []

function run(command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  })
  children.push(child)
  child.on('exit', (code) => {
    if (code && code !== 0) {
      for (const other of children) {
        if (other !== child && !other.killed) other.kill()
      }
      process.exit(code)
    }
  })
}

run('node', ['--env-file=.env.local', '--env-file=.env', 'server/index.mjs'])
run('npm', ['run', 'dev:client'])

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const child of children) {
      if (!child.killed) child.kill(signal)
    }
    process.exit(0)
  })
}
