import * as crypto from "crypto"
import * as querystring from "querystring"

import { makeRequest } from "../../utils/https"

class KrakenService {
	private krakenApiKey: string
	private krakenApiSecret: string
	private krakenApiWithdrawKey: string

	private HOSTNAME = "api.vip.uat.lobster.kraken.com"

	constructor(krakenApiKey?: string, krakenApiSecret?: string, krakenApiWithdrawKey?: string) {
		if (!krakenApiKey) throw new Error("Cannot find KRAKEN_API_KEY")
		if (!krakenApiSecret) throw new Error("Cannot find KRAKEN_API_SECRET")
		if (!krakenApiWithdrawKey) throw new Error("Cannot find KRAKEN_API_WITHDRAW_KEY")

		this.krakenApiKey = krakenApiKey
		this.krakenApiSecret = krakenApiSecret
		this.krakenApiWithdrawKey = krakenApiWithdrawKey
	}

	private async makeRequest({
		path,
		nonce,
		data
	}: {
		path: string
		nonce: string
		data: Record<string, string>
	}): Promise<string> {
		// Convert POST data to URL-encoded string
		const postData: string = querystring.stringify(data)

		// Create SHA-256 hash of nonce + POST data
		const api_sha256 = crypto.createHash("sha256")
		api_sha256.update(
			Buffer.concat([Buffer.from(nonce, "utf8"), Buffer.from(postData, "utf8")])
		)
		const api_sha256_digest: Buffer = api_sha256.digest()

		// Create HMAC using SHA-512
		const secretBuffer: Buffer = Buffer.from(this.krakenApiSecret, "base64")
		const api_hmac = crypto.createHmac("sha512", secretBuffer)
		api_hmac.update(Buffer.concat([Buffer.from(path, "utf8"), api_sha256_digest]))
		const api_signature: string = api_hmac.digest("base64")

		// HTTP request options
		const options = {
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

		const res = await makeRequest(options, postData)

		return res
	}

	private makeNonce() {
		return String(Date.now() * 1000)
	}

	public async addOrder(): Promise<void> {
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

		const res = await this.makeRequest({ path: path, nonce: nonce, data: data })
		console.log(res)
	}

	public async withdraw() {
		console.log(this.krakenApiWithdrawKey)

		const path = "/0/private/Withdraw"
		const nonce = this.makeNonce()
		const data = {
			nonce: nonce,
			asset: "XBT",
			key: this.krakenApiWithdrawKey,
			amount: "0.725"
			// address: "bc1kar0ssrr7xf3vy5l6d3lydnwkre5og2zz3f5ldq"
		}

		const res = await this.makeRequest({ path: path, nonce: nonce, data: data })
		console.log(res)
	}
}

export default KrakenService
