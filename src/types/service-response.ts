type ServiceRes<T> =
	| {
			success: true
			data: T
	  }
	| {
			success: false
			error: unknown
	  }

export { type ServiceRes }
