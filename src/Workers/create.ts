import { Worker, WorkerOptions } from 'worker_threads'
import { ChildProcess, fork, ForkOptions } from 'child_process'
export function create(absolutePath: string, options?: WorkerOptions): Worker {
	return new Worker(absolutePath + '.js', options)
}

export function createProccess(absolutePath: string, options?: ForkOptions): ChildProcess {
	const forked = fork(absolutePath, options)
	return forked
}