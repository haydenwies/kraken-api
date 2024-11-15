class KrakenService {
	private krakenApiKey: string
	private krakenApiSecret: string

	constructor(krakenApiKey?: string, krakenApiSecret?: string) {
		if (!krakenApiKey) throw new Error("Cannot find KRAKEN_API_KEY")
		if (!krakenApiSecret) throw new Error("Cannot find KRAKEN_API_SECRET")

		this.krakenApiKey = krakenApiKey
		this.krakenApiSecret = krakenApiSecret
	}

	public async addOrder() {
		const res = await fetch("https://api.vip.uat.lobster.kraken.com/0/private/AddOrder", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"API-Key": this.krakenApiKey,
				"API-Sign": this.krakenApiSecret
			},
			body: JSON.stringify({
				nonce: 163245617,
				ordertype: "limit",
				type: "buy",
				volume: "1.25",
				pair: "XBTUSD",
				price: "27500",
				cl_ord_id: "6d1b345e-2821-40e2-ad83-4ecb18a06876"
			})
		})

		console.log(res)

		const body = decodeResponseBody(res.body)

		console.log(body)
	}
}

export default KrakenService
