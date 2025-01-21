export interface SignInResponse {
    isError: boolean,
    isServerError: boolean,
    fields:  (string | number)[] | undefined,
    error: string[] | undefined
}
