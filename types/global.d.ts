declare type WorkerRunnerStopReason =
	200 | // 结束
	401 | // 内部中断
	402 | // 外部中断
	403 | // 超时
	404 // 未知错误



declare interface WorkerRunnerReturn<ReturnType> {
	reason: WorkerRunnerStopReason,
	data: ReturnType
}

declare interface WorkerRunner<ReturnTYpe> {
	stop: () => void
	__runner: Promise<WorkerRunnerReturn<ReturnTYpe>>
}