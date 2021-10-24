import { Worker, WorkerOptions } from 'worker_threads'
export function create(absolutePath: string, options?: WorkerOptions): Worker {
	return new Worker(absolutePath + '.js', options)
}