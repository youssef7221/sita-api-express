type LogMeta = Record<string, unknown>;

const getErrorLogDetails = (error: unknown) => {
	if (error instanceof Error) {
		return { message: error.message, stack: error.stack };
	}

	return { error };
};

export const createServiceLogger = (serviceName: string) => {
	const formatPrefix = () => `[${new Date().toISOString()}] [${serviceName}]`;

	const info = (message: string, meta?: LogMeta) => {
		if (meta) {
			console.log(`${formatPrefix()} ${message}`, meta);
			return;
		}

		console.log(`${formatPrefix()} ${message}`);
	};

	const warn = (message: string, meta?: LogMeta) => {
		if (meta) {
			console.warn(`${formatPrefix()} ${message}`, meta);
			return;
		}

		console.warn(`${formatPrefix()} ${message}`);
	};

	const error = (message: string, err: unknown, meta?: LogMeta) => {
		const details = getErrorLogDetails(err);

		if (meta) {
			console.error(`${formatPrefix()} ${message}`, {
				...meta,
				...details,
			});
			return;
		}

		console.error(`${formatPrefix()} ${message}`, details);
	};

	return {
		info,
		warn,
		error,
	};
};
