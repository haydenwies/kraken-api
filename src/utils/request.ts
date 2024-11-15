const decodeResponseBody = async (
	body: ReadableStream<Uint8Array> | null
): Promise<string | null> => {
	if (!body) return null

	const reader = body.getReader()
	const decoder = new TextDecoder()
	let result: string | null = null

	if (reader) {
		result = ""

		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			result += decoder.decode(value, { stream: true })
		}

		result += decoder.decode()
	}

	return result
}

const parseResponseBody = (decodedBody: string | null) => {
	let result: any | null

	if (decodedBody) {
		try {
			result = JSON.parse(decodedBody)
		} catch (err: unknown) {
			result = null
		}
	}

	return result
}
