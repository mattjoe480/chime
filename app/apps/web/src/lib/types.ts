export interface SignInResponse {
    isError: boolean,
    fields:  (string | number)[] | undefined,
    error: string[] | undefined
}
