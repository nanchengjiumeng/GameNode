import { AbortSignal } from 'abort-controller'
import { Worker, WorkerOptions } from 'worker_threads'
import { ChildProcess, fork, ForkOptions } from 'child_process'

export function create(absolutePath: string, options?: WorkerOptions): Worker {
	return new Worker(absolutePath + '.js', options)
}

interface createProccessOptons extends ForkOptions {
	signal: AbortSignal
}

export function createProccess(absolutePath: string, options?: createProccessOptons): ChildProcess {
	const child = fork(absolutePath, options)
	const signal = options.signal
	if (signal) {
		const listener = () => {
			signal.removeEventListener('abort', listener)
			child.kill()
		}
		signal.addEventListener('abort', listener)
	}
	return child
}

