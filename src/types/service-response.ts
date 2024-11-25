type ServiceRes<T> =
	| {
			success: true
			data: T
	  }
	| {
			success: false
			error: string[]
	  }

export { type ServiceRes }
