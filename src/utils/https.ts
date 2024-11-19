import * as https from "https"

const makeRequest = async (options: https.RequestOptions, data?: any): Promise<string> =>
	new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			let data = ""

			res.on("data", (chunk) => {
				data += chunk
			})

			res.on("end", () => {
				// Add status code check
				resolve(data)
			})
		})

		req.on("error", (err) => {
			reject(err)
		})

		// Data only required for POST methods
		if (data) {
			req.write(data)
		}

		req.end()
	})

export { makeRequest }
