// API response structure

type KrakenResponse<T> = {
	result?: T
	error: string[]
}

// Result types

type KrakenAssetsResult = Record<
	string,
	{
		aclass: string
		altname: string
		decimals: number
		display_decimals: number
		collateral_value: number
		status: "enabled" | "deposit_only" | "withdrawal_only" | "funding_temporarily_disabled"
	}
>

type KrakenBalanceResult = Record<string, string>

type KrakenAddOrderResult = {
	descr: {
		order: string
		close?: string
	}
	txid: string[]
}

type KrakenWithdrawResult = {
	refid: string
}

export {
	type KrakenResponse,
	type KrakenAddOrderResult,
	type KrakenWithdrawResult,
	type KrakenBalanceResult,
	type KrakenAssetsResult
}
