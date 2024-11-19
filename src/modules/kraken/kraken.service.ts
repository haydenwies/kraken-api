import crypto from "crypto"
import querystring from "querystring"

import { decodeResponseBody, parseResponseBody } from "../../utils/request"
import * as https from "https"

class KrakenService {
	private krakenApiKey: string
	private krakenApiSecret: string

	private HOSTNAME = "api.vip.uat.lobster.kraken.com"

	constructor(krakenApiKey?: string, krakenApiSecret?: string) {
		if (!krakenApiKey) throw new Error("Cannot find KRAKEN_API_KEY")
		if (!krakenApiSecret) throw new Error("Cannot find KRAKEN_API_SECRET")

		this.krakenApiKey = krakenApiKey
		this.krakenApiSecret = krakenApiSecret
	}

	private makeRequest({
		path,
		nonce,
		data
	}: {
		path: string
		nonce: string
		data: Record<string, string>
	}) {
		// Convert POST data to URL-encoded string
		const api_post: string = querystring.stringify(data)

		// Create SHA-256 hash of nonce + POST data
		const api_sha256 = crypto.createHash("sha256")
		api_sha256.update(
			Buffer.concat([Buffer.from(nonce, "utf8"), Buffer.from(api_post, "utf8")])
		)
		const api_sha256_digest: Buffer = api_sha256.digest()

		// Create HMAC using SHA-512
		const secretBuffer: Buffer = Buffer.from(this.krakenApiSecret, "base64")
		const api_hmac = crypto.createHmac("sha512", secretBuffer)
		api_hmac.update(Buffer.concat([Buffer.from(path, "utf8"), api_sha256_digest]))
		const api_signature: string = api_hmac.digest("base64")

		// HTTP request options
		const options: https.RequestOptions = {
			hostname: this.HOSTNAME,
			path: path,
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"API-Key": this.krakenApiKey,
				"API-Sign": api_signature,
				"User-Agent": "Kraken REST API"
			}
		}

		// Perform HTTP request
		const req = https.request(options, (res) => {
			let data = ""

			res.on("data", (chunk) => {
				data += chunk
			})

			res.on("end", () => {
				console.log("API JSON DATA:")
				console.log(data)
			})
		})

		req.on("error", (error) => {
			console.error("Error making request:", error)
		})

		// Send POST data
		req.write(api_post)
		req.end()
	}

	private makeNonce() {
		return String(Date.now() * 1000)
	}

	public async addOrder() {
		const path = "/0/private/AddOrder"
		const nonce = this.makeNonce()
		const data = {
			nonce: nonce,
			ordertype: "limit",
			type: "buy",
			volume: "1.25",
			pair: "XBTUSD",
			price: "27500"
		}

		this.makeRequest({ path: path, nonce: nonce, data: data })
	}
}

export default KrakenService
