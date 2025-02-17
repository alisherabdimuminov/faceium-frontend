export interface IData {
    longitude: number
    latitude: number
    handle: string
}

export interface IResponse {
    status: "success" | "error"
    code: string
    data: string
}
