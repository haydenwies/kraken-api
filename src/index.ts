import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import KrakenService from "./modules/kraken/kraken.service"

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.get("/", (req: Request, res: Response) => {
	const krakenService = new KrakenService(
		process.env.KRAKEN_API_KEY,
		process.env.KRAKEN_API_SECRET
	)

	krakenService.addOrder()

	res.send("Express + TypeScript Server hello")
})

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`)
})
